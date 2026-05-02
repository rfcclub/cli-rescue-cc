---
description: Run a code review via Qwen Code
argument-hint: "[--model <name>] [focus area or file path]"
allowed-tools: Bash(node:*)
---

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/qwen-companion.mjs" review $ARGUMENTS
```
