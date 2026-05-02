const COMMANDS = new Set(["setup", "task", "review", "task-resume-candidate"]);
const BOOLEAN_FLAGS = new Set(["json", "resume", "fresh", "background", "wait"]);
const VALUE_FLAGS = new Set(["model", "effort", "base"]);

/**
 * parseArgs(argv) → { command, flags, rest }
 *
 * command — first positional that matches a known command name, or undefined
 * flags   — parsed --flag / --flag=value options
 * rest    — remaining positionals joined as a single string (the prompt)
 */
export function parseArgs(argv = process.argv.slice(2)) {
  const flags = {};
  const positionals = [];
  let passthrough = false;

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];

    if (passthrough || !token.startsWith("-") || token === "-") {
      positionals.push(token);
      continue;
    }

    if (token === "--") {
      passthrough = true;
      continue;
    }

    if (!token.startsWith("--")) {
      positionals.push(token);
      continue;
    }

    const [rawKey, inlineValue] = token.slice(2).split("=", 2);

    if (BOOLEAN_FLAGS.has(rawKey)) {
      flags[rawKey] = inlineValue === undefined ? true : inlineValue !== "false";
      continue;
    }

    if (VALUE_FLAGS.has(rawKey)) {
      const val = inlineValue ?? argv[i + 1];
      if (val === undefined) throw new Error(`Missing value for --${rawKey}`);
      flags[rawKey] = val;
      if (inlineValue === undefined) i += 1;
      continue;
    }

    positionals.push(token);
  }

  const command = COMMANDS.has(positionals[0]) ? positionals.shift() : undefined;
  return { command, flags, rest: positionals.join(" ") };
}
