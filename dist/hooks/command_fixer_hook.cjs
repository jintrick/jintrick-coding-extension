#!/usr/bin/env node

// hooks/scripts/command_fixer_hook.cjs
var fs_module = require("fs");
function main(deps = {}) {
  const fs = deps.fs || fs_module;
  const proc = deps.process || process;
  const consoleLog = deps.consoleLog || console.log;
  function allow() {
    consoleLog(JSON.stringify({ decision: "allow" }));
    proc.exit(0);
  }
  let input;
  try {
    const rawInput = fs.readFileSync(0, "utf8");
    if (!rawInput) proc.exit(0);
    input = JSON.parse(rawInput);
  } catch (e) {
    proc.stderr.write(`[Debug] Failed to parse input JSON: ${e.message}
`);
    allow();
    return;
  }
  const { hook_event_name, tool_name, tool_input } = input;
  if (hook_event_name !== "BeforeTool" || tool_name !== "run_shell_command") {
    allow();
    return;
  }
  if (!tool_input || typeof tool_input.command !== "string") {
    allow();
    return;
  }
  const originalCommand = tool_input.command;
  const fixedCommand = originalCommand.replace(/ && /g, " ; ");
  if (fixedCommand !== originalCommand) {
    proc.stderr.write(`[Command Fixer] Replaced ' && ' with ' ; ' in command.
`);
    consoleLog(JSON.stringify({
      decision: "allow",
      hookSpecificOutput: {
        tool_input: {
          command: fixedCommand
        }
      }
    }));
    proc.exit(0);
    return;
  }
  allow();
}
if (require.main === module) {
  main();
}
module.exports = { main };
