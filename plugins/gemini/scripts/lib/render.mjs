/**
 * Output rendering helpers for gemini-companion
 */

export function renderSetupReport(status) {
  const lines = ["# Gemini Setup\n"];
  const ok = (s) => `✓ ${s}`;
  const fail = (s) => `✗ ${s}`;

  lines.push(status.availability.available
    ? ok(`Gemini CLI available: ${status.availability.detail}`)
    : fail(`Gemini CLI not found: ${status.availability.detail}`));

  lines.push(status.auth.loggedIn
    ? ok(`Authenticated: ${status.auth.detail}`)
    : fail(`Not authenticated: ${status.auth.detail}`));

  if (!status.availability.available) {
    lines.push("\nInstall with: npm install -g @anthropic-ai/gemini-cli");
  } else if (!status.auth.loggedIn) {
    lines.push("\nRun `!gemini auth` to authenticate with Google OAuth.");
  } else {
    lines.push("\nGemini is ready. Use /gemini:rescue to delegate tasks.");
  }

  return lines.join("\n");
}
