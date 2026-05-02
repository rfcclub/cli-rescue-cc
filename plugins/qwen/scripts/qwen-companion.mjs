#!/usr/bin/env node
/**
 * qwen-companion.mjs — thin wrapper around the qwen CLI for Claude Code plugin
 *
 * Usage:
 *   node qwen-companion.mjs setup [--json]
 *   node qwen-companion.mjs task [--resume|--fresh] [--model <name>] <prompt>
 *   node qwen-companion.mjs review [--base <ref>] [<focus>]
 *   node qwen-companion.mjs task-resume-candidate [--json]
 */

import { parseArgs } from "./lib/args.mjs";
import {
  getQwenAvailability,
  getQwenAuthStatus,
  getSessionResumeCandidate,
  spawnQwenTask,
  spawnQwenReview,
} from "./lib/qwen.mjs";
import { renderSetupReport, renderReviewResult } from "./lib/render.mjs";

const { command, flags, rest } = parseArgs();

function out(value, asJson) {
  if (asJson) {
    process.stdout.write(JSON.stringify(value, null, 2) + "\n");
  } else {
    process.stdout.write(typeof value === "string" ? value + "\n" : JSON.stringify(value, null, 2) + "\n");
  }
}

async function cmdSetup() {
  const availability = await getQwenAvailability();
  const auth = await getQwenAuthStatus();
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

  const avail = await getQwenAvailability();
  if (!avail.available) {
    process.stderr.write(`Qwen CLI not found. Install with: npm install -g @qwen-code/qwen-code\n`);
    process.exit(1);
  }
  const auth = await getQwenAuthStatus();
  if (!auth.loggedIn) {
    process.stderr.write(`Qwen not authenticated. Run: qwen auth\n`);
    process.exit(1);
  }

  const exitCode = await spawnQwenTask(prompt, {
    resume: flags.resume,
    model: flags.model ?? null,
    cwd: process.cwd(),
  });
  process.exit(exitCode);
}

async function cmdReview() {
  const focus = rest ? ` Focus on: ${rest}` : "";
  const prompt = `Review the current working state of this repository and report issues by severity. Do not make any edits.${focus}`;

  const avail = await getQwenAvailability();
  if (!avail.available) {
    process.stderr.write(`Qwen CLI not found. Install with: npm install -g @qwen-code/qwen-code\n`);
    process.exit(1);
  }

  const { stdout, exitCode } = await spawnQwenReview(prompt, { cwd: process.cwd() });
  process.stdout.write(renderReviewResult(stdout) + "\n");
  process.exit(exitCode);
}

switch (command) {
  case "setup":               await cmdSetup(); break;
  case "task-resume-candidate": await cmdTaskResumeCandidate(); break;
  case "task":                await cmdTask(); break;
  case "review":              await cmdReview(); break;
  default:
    process.stderr.write("Usage: qwen-companion.mjs <setup|task|review|task-resume-candidate> [...args]\n");
    process.exit(1);
}
