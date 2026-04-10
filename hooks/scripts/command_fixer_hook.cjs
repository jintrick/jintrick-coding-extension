#!/usr/bin/env node
const fs_module = require('fs');

/**
 * Command Fixer Hook
 * PowerShell 7 compatibility: Dynamically converts common POSIX commands (rm, mkdir, cp, ls, which)
 * to their PowerShell equivalents. Leaves `&&` intact as it is supported in PowerShell 7.
 */

function replaceCommands(commandString) {
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let commands = [];
  let currentCmdStart = 0;

  // 1. Tokenize the command string, respecting single and double quotes
  for (let i = 0; i < commandString.length; i++) {
    const char = commandString[i];

    if (char === "'" && !inDoubleQuote) {
      inSingleQuote = !inSingleQuote;
    } else if (char === '"' && !inSingleQuote) {
      inDoubleQuote = !inDoubleQuote;
    } else if (!inSingleQuote && !inDoubleQuote) {
      // Unquoted context, look for shell separators
      let isSeparator = false;
      let sepLength = 1;

      if (char === ';') {
        isSeparator = true;
      } else if (char === '|') {
        if (commandString[i + 1] === '|') {
          isSeparator = true;
          sepLength = 2;
        } else {
          isSeparator = true;
        }
      } else if (char === '&') {
        if (commandString[i + 1] === '&') {
          isSeparator = true;
          sepLength = 2;
        } else {
          isSeparator = true;
        }
      }

      if (isSeparator) {
        // Push the preceding command
        commands.push(commandString.substring(currentCmdStart, i));
        // Push the separator itself
        commands.push(commandString.substring(i, i + sepLength));
        i += sepLength - 1;
        currentCmdStart = i + 1;
      }
    }
  }

  // Push the final segment
  if (currentCmdStart < commandString.length) {
    commands.push(commandString.substring(currentCmdStart));
  }

  // 2. Process each tokenized command (skip separators which are at odd indices)
  for (let i = 0; i < commands.length; i++) {
    if (i % 2 !== 0) continue;

    let cmdLine = commands[i];
    // Match leading whitespace and target command name
    const match = cmdLine.match(/^(\s*)(rm|mkdir|cp|ls|which)\b(.*)$/);
    if (match) {
      const prefix = match[1];
      const cmd = match[2];
      let args = match[3];

      let newCmd = cmd;
      if (cmd === 'rm') {
        newCmd = 'Remove-Item';
        args = args.replace(/\s-rf\b/g, ' -Recurse -Force')
                   .replace(/\s-fr\b/g, ' -Recurse -Force')
                   .replace(/\s-f\b/g, ' -Force')
                   .replace(/\s-r\b/g, ' -Recurse');
      } else if (cmd === 'mkdir') {
        newCmd = 'New-Item -ItemType Directory -Force';
        args = args.replace(/\s-p\b/g, ' -Path');
      } else if (cmd === 'cp') {
        newCmd = 'Copy-Item';
        args = args.replace(/\s-r\b/g, ' -Recurse');
      } else if (cmd === 'ls') {
        newCmd = 'Get-ChildItem';
        args = args.replace(/\s-la\b/g, '')
                   .replace(/\s-al\b/g, '')
                   .replace(/\s-l\b/g, '')
                   .replace(/\s-a\b/g, '');
      } else if (cmd === 'which') {
        newCmd = 'Get-Command';
      }

      commands[i] = prefix + newCmd + args;
    }
  }

  return commands.join('');
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
