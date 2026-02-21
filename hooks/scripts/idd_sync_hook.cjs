const fs = require('fs');
const { syncVersions } = require('./idd_sync/sync.cjs');

async function main(deps = { fs, syncVersions }) {
  let parsedInput;
  try {
    // Read from stdin (fd 0)
    const input = deps.fs.readFileSync(0, 'utf8');
    // If input is empty, just exit/allow
    if (!input.trim()) {
      console.log(JSON.stringify({ decision: 'allow' }));
      return;
    }
    parsedInput = JSON.parse(input);
  } catch (e) {
    // If not valid JSON, just allow (or log error to stderr if needed)
    console.log(JSON.stringify({ decision: 'allow' }));
    return;
  }

  const { hook_event_name, tool_name, tool_input } = parsedInput;

  // We are only interested in run_shell_command
  // But strict check might not be needed if hooks.json filters it, but good to have.
  if (tool_name !== 'run_shell_command' || !tool_input) {
      console.log(JSON.stringify({ decision: 'allow' }));
      return;
  }

  const command = tool_input.command || '';

  // Check if it's a git commit command
  if (!command.includes('git commit')) {
    console.log(JSON.stringify({ decision: 'allow' }));
    return;
  }

  // Check for vX.Y.Z pattern in the command (including pre-releases like v1.15.0-rc.1)
  // We look for v<digit>.<digit>.<digit>[-<suffix>] preceded by a quote or space
  const versionMatch = command.match(/["'\s](v\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?)["'\s]?/);

  let targetVersionString = null;
  if (versionMatch) {
    targetVersionString = versionMatch[1];
  }

  if (!targetVersionString) {
    console.log(JSON.stringify({ decision: 'allow' }));
    return;
  }

  const targetVersion = targetVersionString.startsWith('v') ? targetVersionString.substring(1) : targetVersionString;

  // Perform sync
  const updatedFiles = deps.syncVersions(targetVersion);

  if (updatedFiles.length > 0) {
    // Rewrite command using ';' for PowerShell compatibility and project compliance
    const newCommand = `git add ${updatedFiles.join(' ')} ; ${command}`;
    console.log(JSON.stringify({
      decision: 'allow',
      hookSpecificOutput: {
        tool_input: {
          ...tool_input,
          command: newCommand
        }
      }
    }));
  } else {
      console.log(JSON.stringify({ decision: 'allow' }));
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };
