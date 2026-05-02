import { execFile, spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const GEMINI_HOME = join(homedir(), ".gemini");

function geminiArgs(prompt, opts = {}) {
  const args = ["-p", prompt, "-y", "--output-format", "stream-json"];
  if (opts.resume) args.push("--resume", "latest");
  if (opts.model) args.push("--model", opts.model);
  return args;
}

function expiryMs(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : Date.parse(value);
}

export async function getGeminiAvailability() {
  try {
    const { stdout } = await execFileAsync("gemini", ["--version"]);
    return { available: true, detail: stdout.trim() };
  } catch (err) {
    return { available: false, detail: err.message };
  }
}

export async function getGeminiAuthStatus() {
  try {
    const path = join(GEMINI_HOME, "gemini-credentials.json");
    const creds = JSON.parse(await readFile(path, "utf8"));
    const loggedIn = expiryMs(creds.expiry_date) > Date.now();
    return { loggedIn, detail: loggedIn ? "OAuth credentials are valid" : "OAuth credentials expired" };
  } catch (err) {
    return { loggedIn: false, detail: err.code === "ENOENT" ? "OAuth credentials not found" : err.message };
  }
}

export async function getSessionResumeCandidate(cwd) {
  try {
    const { stdout } = await execFileAsync("gemini", ["--list-sessions"], { cwd });
    const lines = stdout.trim().split("\n").filter(Boolean);
    return { available: lines.length > 0, detail: `${lines.length} session(s)` };
  } catch {
    return { available: false, detail: "No sessions found" };
  }
}

export function spawnGeminiTask(prompt, opts = {}) {
  const cwd = opts.cwd ?? process.cwd();
  const args = geminiArgs(prompt, opts);
  const child = spawn("gemini", args, { cwd, stdio: "inherit" });
  return new Promise((resolve) => {
    child.on("error", () => resolve(1));
    child.on("close", (code) => resolve(code ?? 1));
  });
}
