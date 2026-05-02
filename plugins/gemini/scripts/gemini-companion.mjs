#!/usr/bin/env node
/**
 * gemini-companion.mjs — thin wrapper around the gemini CLI for Claude Code plugin
 *
 * Usage:
 *   node gemini-companion.mjs setup [--json]
 *   node gemini-companion.mjs task [--resume|--fresh] [--model <name>] <prompt>
 *   node gemini-companion.mjs task-resume-candidate [--json]
 */

import { parseArgs } from "./lib/args.mjs";
import {
  getGeminiAvailability,
  getGeminiAuthStatus,
  getSessionResumeCandidate,
  spawnGeminiTask,
} from "./lib/gemini.mjs";
import { renderSetupReport } from "./lib/render.mjs";

const { command, flags, rest } = parseArgs();

function out(value, asJson) {
  if (asJson) {
    process.stdout.write(JSON.stringify(value, null, 2) + "\n");
  } else {
    process.stdout.write(typeof value === "string" ? value + "\n" : JSON.stringify(value, null, 2) + "\n");
  }
}

async function cmdSetup() {
  const availability = await getGeminiAvailability();
  const auth = await getGeminiAuthStatus();
  const ready = availability.available && auth.loggedIn;
  const status = { ready, availability, auth };

  if (flags.json) {
    out(status, true);
  } else {
    out(renderSetupReport(status), false);
  }
  process.exit(ready ? 0 : 1);
}

async function cmdTaskResumeCandidate() {
  const result = await getSessionResumeCandidate(process.cwd());
  if (flags.json) {
    out(result, true);
  } else {
    out(result.available ? "available: true" : "available: false", false);
  }
}

async function cmdTask() {
  const prompt = rest;
  if (!prompt) {
    process.stderr.write("Error: prompt required for task\n");
    process.exit(1);
  }

  const avail = await getGeminiAvailability();
  if (!avail.available) {
    process.stderr.write(`Gemini CLI not found. Install with: npm install -g @anthropic-ai/gemini-cli\n`);
    process.exit(1);
  }
  const auth = await getGeminiAuthStatus();
  if (!auth.loggedIn) {
    process.stderr.write(`Gemini not authenticated. Run: gemini auth\n`);
    process.exit(1);
  }

  const exitCode = await spawnGeminiTask(prompt, {
    resume: flags.resume,
    model: flags.model ?? null,
    cwd: process.cwd(),
  });
  process.exit(exitCode);
}

switch (command) {
  case "setup":               await cmdSetup(); break;
  case "task-resume-candidate": await cmdTaskResumeCandidate(); break;
  case "task":                await cmdTask(); break;
  default:
    process.stderr.write("Usage: gemini-companion.mjs <setup|task|task-resume-candidate> [...args]\n");
    process.exit(1);
}
