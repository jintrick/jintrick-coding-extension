#!/usr/bin/env node
const fs_module = require('fs');

/**
 * Command Fixer Hook
 * PowerShell 7 compatibility: Dynamically converts common POSIX commands (rm, mkdir, cp, ls, which)
 * to their PowerShell equivalents. Leaves `&&` intact as it is supported in PowerShell 7.
 */

function replaceCommands(commandString) {
  // Matches commands at the start of the string or immediately after a shell separator
  const regex = /((?:^|[;&|])\s*)(rm|mkdir|cp|ls|which)\b(\s+.*?(?=[;&|]|$))/g;

  return commandString.replace(regex, (match, prefix, cmd, args) => {
    let newCmd = cmd;
    let newArgs = args;

    if (cmd === 'rm') {
      newCmd = 'Remove-Item';
      newArgs = newArgs.replace(/\s-rf\b/g, ' -Recurse -Force')
                       .replace(/\s-fr\b/g, ' -Recurse -Force')
                       .replace(/\s-f\b/g, ' -Force')
                       .replace(/\s-r\b/g, ' -Recurse');
    } else if (cmd === 'mkdir') {
      newCmd = 'New-Item -ItemType Directory -Force';
      // -p map to -Path, or remove if we just want positional
      // We map -p to -Path as New-Item -ItemType Directory -Force implicitly handles parent creation
      newArgs = newArgs.replace(/\s-p\b/g, ' -Path');
    } else if (cmd === 'cp') {
      newCmd = 'Copy-Item';
      newArgs = newArgs.replace(/\s-r\b/g, ' -Recurse');
    } else if (cmd === 'ls') {
      newCmd = 'Get-ChildItem';
      newArgs = newArgs.replace(/\s-la\b/g, '')
                       .replace(/\s-al\b/g, '')
                       .replace(/\s-l\b/g, '')
                       .replace(/\s-a\b/g, '');
    } else if (cmd === 'which') {
      newCmd = 'Get-Command';
    }

    return `${prefix}${newCmd}${newArgs}`;
  });
}

function main(deps = {}) {
  const fs = deps.fs || fs_module;
  const proc = deps.process || process;
  const consoleLog = deps.consoleLog || console.log;

  function allow() {
    consoleLog(JSON.stringify({ decision: 'allow' }));
    proc.exit(0);
  }

  let input;
  try {
    // Read from stdin (file descriptor 0)
    const rawInput = fs.readFileSync(0, 'utf8');
    if (!rawInput) proc.exit(0);
    input = JSON.parse(rawInput);
  } catch (e) {
    // If input is invalid, just allow
    proc.stderr.write(`[Debug] Failed to parse input JSON: ${e.message}\n`);
    allow();
    return; // Ensure we stop here if allow() returns (in tests)
  }

  const { hook_event_name, tool_name, tool_input } = input;

  // Only handle BeforeTool for run_shell_command
  if (hook_event_name !== 'BeforeTool' || tool_name !== 'run_shell_command') {
    allow();
    return;
  }

  if (!tool_input || typeof tool_input.command !== 'string') {
    allow();
    return;
  }

  const originalCommand = tool_input.command;

  // Replace POSIX commands with PowerShell equivalents
  const fixedCommand = replaceCommands(originalCommand);

  if (fixedCommand !== originalCommand) {
    proc.stderr.write(`[Command Fixer] Applied POSIX to PowerShell command substitutions.\n`);

    consoleLog(JSON.stringify({
      decision: 'allow',
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

module.exports = { main, replaceCommands };
