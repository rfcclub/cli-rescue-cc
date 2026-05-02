---
name: gemini-cli-runtime
description: Internal contract for calling gemini-companion from the gemini-rescue subagent
user-invocable: false
---

# Gemini Runtime

Use this skill only inside the `gemini:gemini-rescue` subagent.

Primary helper:
- `node "${CLAUDE_PLUGIN_ROOT}/scripts/gemini-companion.mjs" task "<prompt>"`

Execution rules:
- The rescue subagent is a forwarder, not an orchestrator. Its only job is to invoke `task` once and return stdout unchanged.
- Do not call `setup` or `task-resume-candidate` from `gemini:gemini-rescue`.
- Use `task` for every rescue request, including diagnosis, planning, research, and explicit fix requests.

Resume rules:
- Add `--resume` when user says "continue", "keep going", "resume", or "apply the fix".
- Add `--fresh` when the task is clearly unrelated to any prior work.
- Default (neither): use `--fresh` to avoid accidental session carryover.

Execution mode:
- Prefer foreground for small, clearly bounded tasks.
- Prefer background (Bash run_in_background) for large, open-ended, or multi-step tasks.
- Leave `--model` unset unless the user explicitly asks for a specific model.

Safety:
- Return the stdout of `task` exactly as-is.
- Do not inspect the repo, solve the task yourself, or add independent analysis.
- If gemini is missing or unauthenticated, tell the user to run `/gemini:setup`.
