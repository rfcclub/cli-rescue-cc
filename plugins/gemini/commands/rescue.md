---
description: Delegate investigation or implementation to Gemini CLI (Vesta)
argument-hint: "[--background|--wait] [--resume|--fresh] [--model <name>] [task description]"
context: fork
allowed-tools: Bash(node:*), AskUserQuestion
---

Route this request to the `gemini:gemini-rescue` subagent.
The final user-visible response must be Gemini's output verbatim.

Raw user request:
$ARGUMENTS

Execution mode:
- If the request includes `--background`, run the subagent in the background.
- If the request includes `--wait`, run in the foreground.
- Default: foreground.

Resume logic:
- If `--resume` is present: do not ask, route with `--resume`.
- If `--fresh` is present: do not ask, route with `--fresh`.
- Otherwise, check for a resumable session:

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/gemini-companion.mjs" task-resume-candidate --json
```

- If `available: true` → use `AskUserQuestion` exactly once with:
  - `Continue current Gemini session`
  - `Start a new Gemini session`
  - Put "Continue" first if user seems to be following up; otherwise put "Start new" first.
- If `available: false` → route normally without asking.

Operating rules:
- The subagent makes one `Bash` call to `gemini-companion.mjs task ...` and returns stdout as-is.
- Do not paraphrase, summarize, or add commentary.
- If gemini is missing or unauthenticated, tell the user to run `/gemini:setup`.
- If the user did not supply a request, ask what Gemini should investigate or fix.
