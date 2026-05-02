---
name: gemini-result-handling
description: Internal guidance for presenting gemini output back to the user
user-invocable: false
---

# Gemini Result Handling

When gemini-companion returns output:
- Preserve the structure of findings, summaries, and next steps.
- Use file paths and line numbers exactly as reported.
- If gemini found no issues, say so explicitly.
- If gemini made edits, list the touched files.

Critical rules:
- After presenting findings, STOP. Do not make any code changes.
- Do not fix issues from a review without explicit user instruction.
- If gemini failed or was never invoked, report the failure and stop — do not substitute a Claude implementation.
- If gemini reports auth or setup issues, direct the user to `/gemini:setup`.
- Do not paraphrase, summarize, or rewrite gemini's output beyond formatting.
