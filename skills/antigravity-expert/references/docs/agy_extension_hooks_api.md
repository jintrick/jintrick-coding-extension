# Antigravity Hooks Specification

Hooks allow running custom scripts or shell commands at specific lifecycle points of the agent's execution loop. They are powerful for enforcing rules, running linters, or capturing diagnostics.

## Configuration (`hooks.json`)
Hooks are defined in a `hooks.json` file located in:
- Workspace: `<workspace-root>/.agents/hooks.json`
- Global: `~/.gemini/config/hooks.json`

### `hooks.json` Schema
```json
{
  "hook-name": {
    "enabled": true,
    "PreToolUse": [
      {
        "matcher": "run_command",
        "hooks": [{ "command": "./lint.sh", "timeout": 10 }]
      }
    ]
  }
}
```

## Supported Events & Matchers
- **`PreToolUse`**: Before tool execution. (Uses `matcher` regex against tool name).
- **`PostToolUse`**: After tool completes. (Uses `matcher` regex).
- **`PreInvocation`**: Before model call. (`matcher` ignored).
- **`PostInvocation`**: After tool calls finish. (`matcher` ignored).
- **`Stop`**: When execution loop terminates. (`matcher` ignored).

## I/O Protocol (JSON via stdin/stdout)
All hooks receive common metadata: `conversationId`, `workspacePaths`, `transcriptPath`, `artifactDirectoryPath`.

### Event-Specific I/O
#### PreToolUse
- **Input**: `toolCall` (name, args), `stepIdx`.
- **Output**: `decision` (`"allow"`, `"deny"`, `"ask"`, `"force_ask"`), `reason`, `permissionOverrides`.

#### PostToolUse
- **Input**: `stepIdx`, `error` (if any).
- **Output**: Empty object `{}`.

#### Pre/PostInvocation
- **Input**: `invocationNum`, `initialNumSteps`.
- **Output**: `injectSteps` (array of `toolCall`, `userMessage`, or `ephemeralMessage`). `PostInvocation` also supports `terminationBehavior` (`"force_continue"`, `"terminate"`).

#### Stop
- **Input**: `executionNum`, `terminationReason`, `error`, `fullyIdle`.
- **Output**: `decision` (`"continue"` to re-enter loop), `reason`.

## Supported Tools for Matchers
- **File**: `view_file`, `write_to_file`, `replace_file_content`, `multi_replace_file_content`, `list_dir`, `find_by_name`.
- **Search**: `grep_search`, `search_web`, `read_url_content`.
- **System**: `run_command`, `manage_task`, `schedule`, `list_permissions`, `ask_permission`.
- **Agent**: `invoke_subagent`, `define_subagent`, `send_message`, `manage_subagents`.
- **Interaction**: `ask_question`, `generate_image`.
