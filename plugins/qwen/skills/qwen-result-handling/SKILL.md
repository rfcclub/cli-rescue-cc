---
name: qwen-result-handling
description: Internal guidance for presenting qwen output back to the user
user-invocable: false
---

# Qwen Result Handling

When qwen-companion returns output:
- Preserve the structure of findings, summaries, and next steps.
- For review output, present findings ordered by severity.
- Use file paths and line numbers exactly as reported.
- If qwen found no issues, say so explicitly.
- If qwen made edits, list the touched files.

Critical rules:
- After presenting review findings, STOP. Do not make any code changes.
- Do not fix issues from a review without explicit user instruction.
- If qwen failed or was never invoked, report the failure and stop — do not substitute a Claude implementation.
- If qwen reports auth or setup issues, direct the user to `/qwen:setup`.
- Do not paraphrase, summarize, or rewrite qwen's output beyond formatting.
