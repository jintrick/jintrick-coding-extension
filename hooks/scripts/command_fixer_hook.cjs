#!/usr/bin/env node
const fs_module = require('fs');

/**
 * Command Fixer Hook
 * PowerShell 7 compatibility: Dynamically converts common POSIX commands (rm, mkdir, cp, ls, which)
 * to their PowerShell equivalents.
 */

function replaceCommands(commandString) {
  let statements = [];
  let currentStatement = '';
  let separators = [];
  let inSingleQuote = false;
  let inDoubleQuote = false;

  // Tokenize the command string into statements separated by ;, &&, ||, |, and &
  // Respecting single and double quotes
  for (let i = 0; i < commandString.length; i++) {
    let char = commandString[i];
    if (char === "'" && !inDoubleQuote) {
      inSingleQuote = !inSingleQuote;
      currentStatement += char;
    } else if (char === '"' && !inSingleQuote) {
      inDoubleQuote = !inDoubleQuote;
      currentStatement += char;
    } else if (!inSingleQuote && !inDoubleQuote && (char === ';' || char === '&' || char === '|')) {
      let sep = char;
      if (char === '&') {
        if (commandString[i+1] === '&') {
          sep = '&&';
          i++;
        } else {
          // Check if it's part of a redirection like >&2 or 2>&1
          let prevChar = i > 0 ? commandString[i-1] : '';
          if (prevChar === '>' || prevChar === '<') {
            // It's a redirection, NOT a separator
            currentStatement += char;
            continue; // Skip separation logic
          }
          // Otherwise, it's a background operator '&', treat as separator
        }
      } else if (char === '|') {
        if (commandString[i+1] === '|') {
          sep = '||';
          i++;
        }
      }
      
      statements.push(currentStatement);
      currentStatement = '';
      separators.push(sep);
    } else {
      currentStatement += char;
    }
  }
  statements.push(currentStatement);

  // Process each statement to replace target POSIX commands
  for (let i = 0; i < statements.length; i++) {
    statements[i] = processStatement(statements[i]);
  }

  // Reassemble the command string
  let result = '';
  for (let i = 0; i < statements.length; i++) {
    result += statements[i];
    if (i < separators.length) {
      result += separators[i];
    }
  }
  return result;
}

function processStatement(stmt) {
  // Only match if the command is at the beginning of the statement (ignoring leading whitespace)
  const match = stmt.match(/^(\s*)(rm|mkdir|cp|ls|which)\b(.*)$/);
  if (!match) return stmt;
  
  const prefix = match[1];
  const cmd = match[2];
  let rest = match[3];

  const trailingMatch = rest.match(/(\s*)$/);
  const trailing = trailingMatch ? trailingMatch[1] : '';
  rest = rest.substring(0, rest.length - trailing.length);
  
  let rawArgs = [];
  let currentArg = '';
  let inSingleQuote = false;
  let inDoubleQuote = false;
  
  // Safely parse arguments to avoid modifying flags inside quoted strings
  for (let i = 0; i < rest.length; i++) {
    let char = rest[i];
    if (char === "'" && !inDoubleQuote) {
      inSingleQuote = !inSingleQuote;
      currentArg += char;
    } else if (char === '"' && !inSingleQuote) {
      inDoubleQuote = !inDoubleQuote;
      currentArg += char;
    } else if (!inSingleQuote && !inDoubleQuote && /\s/.test(char)) {
      if (currentArg.length > 0) {
        rawArgs.push(currentArg);
        currentArg = '';
      }
    } else {
      currentArg += char;
    }
  }
  if (currentArg.length > 0) {
    rawArgs.push(currentArg);
  }

  let extraFlags = [];
  let positionals = [];
  let redirections = [];
  let skipNextAsRedirectTarget = false;

  for (let i = 0; i < rawArgs.length; i++) {
    let arg = rawArgs[i];
    
    if (skipNextAsRedirectTarget) {
      redirections.push(arg);
      skipNextAsRedirectTarget = false;
      continue;
    }

    // Identify redirections (e.g. >, >>, 2>&1, <)
    if (/^[0-2]?(?:>>|>|<)$/.test(arg)) {
      redirections.push(arg);
      skipNextAsRedirectTarget = true;
      continue;
    }
    if (arg === '2>&1' || arg === '>&2' || arg === '>&1') { // Note: single '&' is now handled by tokenizer
      redirections.push(arg);
      continue;
    }
    if (/^[0-2]?(?:>>|>|<)[^\s]+/.test(arg)) {
      redirections.push(arg);
      continue;
    }

    if (arg.startsWith('-')) {
      if (cmd === 'rm') {
        if (arg === '-rf' || arg === '-fr') { extraFlags.push('-Recurse', '-Force'); }
        else if (arg === '-r' || arg === '-R') { extraFlags.push('-Recurse'); }
        else if (arg === '-f') { extraFlags.push('-Force'); }
        else { extraFlags.push(arg); } // Unknown flag, keep as is
      } else if (cmd === 'mkdir') {
        if (arg === '-p') { /* ignore */ }
        else { extraFlags.push(arg); }
      } else if (cmd === 'cp') {
        if (arg === '-r' || arg === '-R') { extraFlags.push('-Recurse'); }
        else { extraFlags.push(arg); }
      } else if (cmd === 'ls') {
        if (/^-[la]+$/.test(arg)) {
          if (arg.includes('a')) extraFlags.push('-Force');
        } else { extraFlags.push(arg); }
      } else {
        extraFlags.push(arg);
      }
    } else {
      positionals.push(arg);
    }
  }

  let newCmd = cmd;
  if (cmd === 'rm') newCmd = 'Remove-Item';
  if (cmd === 'mkdir') { newCmd = 'New-Item'; extraFlags.push('-ItemType', 'Directory', '-Force'); }
  if (cmd === 'cp') newCmd = 'Copy-Item';
  if (cmd === 'ls') newCmd = 'Get-ChildItem';
  if (cmd === 'which') newCmd = 'Get-Command';

  // Deduplicate known flags but preserve order
  let uniqueExtraFlags = [];
  extraFlags.forEach(f => {
    if (!uniqueExtraFlags.includes(f)) uniqueExtraFlags.push(f);
  });
  extraFlags = uniqueExtraFlags;

  let finalArgs = [];
  
  if (cmd === 'cp' && positionals.length >= 3) {
    // Multi-source cp -> Copy-Item -Path a, b -Destination dest
    let dest = positionals.pop();
    finalArgs.push('-Path', positionals.join(', '));
    finalArgs.push('-Destination', dest);
  } else if (positionals.length > 0) {
    if (cmd === 'rm' || cmd === 'mkdir' || cmd === 'ls') {
      finalArgs.push(positionals.join(', '));
    } else {
      finalArgs.push(positionals.join(' '));
    }
  }

  if (extraFlags.length > 0) {
    finalArgs.push(extraFlags.join(' '));
  }
  if (redirections.length > 0) {
    finalArgs.push(redirections.join(' '));
  }

  let newRest = finalArgs.join(' ');
  return prefix + newCmd + (newRest ? ' ' + newRest : '') + trailing;
}

function main(deps = {}) {
  const fs = deps.fs || fs_module;
  const proc = deps.process || process;
  const consoleLog = deps.consoleLog || console.log;

  function allow() {
    consoleLog(JSON.stringify({ decision: 'allow' }));
    proc.exit(0);
  }

  // Only apply command conversion on Windows platforms where PowerShell is the default shell.
  // On POSIX systems (Linux, Darwin), native commands should be preserved as-is.
  if (proc.platform !== 'win32') {
    allow();
    return;
  }

  let input;
  try {
    const rawInput = fs.readFileSync(0, 'utf8');
    if (!rawInput) proc.exit(0);
    input = JSON.parse(rawInput);
  } catch (e) {
    proc.stderr.write(`[Debug] Failed to parse input JSON: ${e.message}\n`);
    allow();
    return;
  }

  const { hook_event_name, tool_name, tool_input } = input;

  if (hook_event_name !== 'BeforeTool' || tool_name !== 'run_shell_command') {
    allow();
    return;
  }

  if (!tool_input || typeof tool_input.command !== 'string') {
    allow();
    return;
  }

  const originalCommand = tool_input.command;
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
