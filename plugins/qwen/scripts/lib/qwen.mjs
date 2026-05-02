import { execFile, spawn } from "node:child_process";
import { readdir, readFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const QWEN_HOME = join(homedir(), ".qwen");

function qwenProjectSlug(cwd) {
  return cwd.replaceAll("/", "-").replace(/^-/, "");
}

function qwenArgs(prompt, opts = {}) {
  const args = ["-p", prompt];
  if (opts.resume) args.push("--continue");
  if (opts.model) args.push("--model", opts.model);
  return args;
}

function expiryMs(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : Date.parse(value);
}

export async function getQwenAvailability() {
  try {
    const { stdout } = await execFileAsync("qwen", ["--version"]);
    return { available: true, detail: stdout.trim() };
  } catch (err) {
    return { available: false, detail: err.message };
  }
}

export async function getQwenAuthStatus() {
  try {
    const path = join(QWEN_HOME, "oauth_creds.json");
    const creds = JSON.parse(await readFile(path, "utf8"));
    const loggedIn = expiryMs(creds.expiry_date) > Date.now();
    return { loggedIn, detail: loggedIn ? "OAuth credentials are valid" : "OAuth credentials expired" };
  } catch (err) {
    return { loggedIn: false, detail: err.code === "ENOENT" ? "OAuth credentials not found" : err.message };
  }
}

export async function getSessionResumeCandidate(cwd) {
  try {
    const dir = join(QWEN_HOME, "projects", qwenProjectSlug(cwd));
    const files = await readdir(dir);
    return { available: files.length > 0 };
  } catch {
    return { available: false };
  }
}

export function spawnQwenTask(prompt, opts = {}) {
  const cwd = opts.cwd ?? process.cwd();
  const args = [...qwenArgs(prompt, opts), "--yolo", "--output-format", "stream-json"];
  const child = spawn("qwen", args, { cwd, stdio: "inherit" });
  return new Promise((resolve) => {
    child.on("error", () => resolve(1));
    child.on("close", (code) => resolve(code ?? 1));
  });
}

export function spawnQwenReview(prompt, opts = {}) {
  const cwd = opts.cwd ?? process.cwd();
  const args = [...qwenArgs(prompt), "--approval-mode", "plan", "--output-format", "json"];
  const child = spawn("qwen", args, { cwd, stdio: ["inherit", "pipe", "inherit"] });
  let stdout = "";
  child.stdout.on("data", (chunk) => { stdout += chunk; });
  return new Promise((resolve) => {
    child.on("error", () => resolve({ stdout, exitCode: 1 }));
    child.on("close", (code) => resolve({ stdout, exitCode: code ?? 1 }));
  });
}
