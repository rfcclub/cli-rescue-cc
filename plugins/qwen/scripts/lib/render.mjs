/**
 * Output rendering helpers for qwen-companion
 */

export function renderSetupReport(status) {
  const lines = ["# Qwen Setup\n"];
  const ok = (s) => `✓ ${s}`;
  const fail = (s) => `✗ ${s}`;

  lines.push(status.availability.available
    ? ok(`Qwen CLI available: ${status.availability.detail}`)
    : fail(`Qwen CLI not found: ${status.availability.detail}`));

  lines.push(status.auth.loggedIn
    ? ok(`Authenticated: ${status.auth.detail}`)
    : fail(`Not authenticated: ${status.auth.detail}`));

  if (!status.availability.available) {
    lines.push("\nInstall with: npm install -g @qwen-code/qwen-code");
  } else if (!status.auth.loggedIn) {
    lines.push("\nRun `!qwen auth` to authenticate with Alibaba Cloud OAuth.");
  } else {
    lines.push("\nQwen is ready. Use /qwen:rescue to delegate tasks.");
  }

  return lines.join("\n");
}

export function renderReviewResult(rawOutput) {
  let parsed;
  try {
    parsed = JSON.parse(rawOutput);
  } catch {
    return rawOutput;
  }

  const response = parsed?.response ?? parsed?.content ?? rawOutput;
  return `# Qwen Review\n\n${response}`;
}
