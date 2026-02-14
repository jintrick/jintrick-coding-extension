# Gemini Hooks API Reference

This document provides the complete API specification for developing Hooks in Gemini CLI extensions.
Hooks are synchronous scripts executed by the CLI at specific lifecycle events.

## 1. Configuration (`hooks/hooks.json`)

Hooks are defined in `hooks/hooks.json` within the extension root.

```json
{
  "hooks": {
    "BeforeTool": [
      {
        "matcher": "write_file|replace",  // Regex to match tool names
        "hooks": [
          {
            "name": "my-hook",
            "type": "command",
            "command": "node \"${extensionPath}${/}dist${/}hooks${/}my_hook.js\"",
            "timeout": 5000  // Optional: Timeout in ms (default: 60000)
          }
        ]
      }
    ]
  }
}
```

### Supported Event Types
- `BeforeTool`: Triggered before tool execution. Can block/modify.
- `AfterTool`: Triggered after tool execution. (Log only)
- `BeforeModel`: Triggered before sending prompt to model. (Log/Block)
- `AfterModel`: Triggered after model response (streaming). (Redact/Log)
- `AfterAgent`: Triggered at the end of a turn. (Retry logic)

### Magic Strings (Variable Substitution)
Use these variables in the `command` string.

| Variable | Description |
| :--- | :--- |
| `${extensionPath}` | Absolute path to the extension root. |
| `${workspacePath}` | Absolute path to the current project root. |
| `${/}` | OS-specific path separator (`\` or `/`). |

## 2. Runtime Protocol

Hooks communicate with the CLI via Standard Streams.

### Input (Stdin)
The CLI sends a single JSON object to the hook's standard input.

#### Common Fields (All Events)
```json
{
  "hook_event_name": "BeforeTool",  // Event type
  "cwd": "/path/to/project",        // Current working directory
  "session_id": "uuid-v4",          // Unique session ID
  ... event specific fields ...
}
```

### Output (Stdout)
The hook MUST write a single JSON object to standard output.
Any other output (logs, debug info) MUST be written to **Stderr**.

#### Allow (Proceed)
```json
{ "decision": "allow" }
```

#### Deny (Block)
```json
{
  "decision": "deny",
  "reason": "Internal reason for logs (e.g. 'Syntax Error')",
  "systemMessage": "Message shown to the user/model explaining the block."
}
```

### Exit Codes
- **0**: Success. CLI parses stdout JSON for the decision.
- **1**: Error. CLI logs stderr and proceeds (fails open) or blocks depending on config.
- **2**: System Block. CLI aborts the action immediately and shows stderr to user.

## 3. Event Specifications

### `BeforeTool`
Triggered when the model calls a tool.

**Input JSON:**
```json
{
  "hook_event_name": "BeforeTool",
  "tool_name": "write_file",  // Name of the tool being called
  "tool_input": {             // Arguments passed to the tool
    "file_path": "src/main.ts",
    "content": "..."
  }
}
```

### `AfterModel`
Triggered when the model generates a response (streaming chunks).

**Input JSON:**
```json
{
  "hook_event_name": "AfterModel",
  "content": "The generated text chunk...",
  "full_content": "The accumulated text so far..."
}
```

**Output JSON (Redaction):**
```json
{
  "decision": "allow",
  "content": "Redacted content" // Optional: Replace content
}
```

## 4. Core Tool Schemas (`tool_input`)

When validating tools in `BeforeTool`, rely on these input structures.

### `write_file`
Writes content to a file.
```json
{
  "file_path": "path/to/file.ext",
  "content": "File content string"
}
```

### `replace`
Replaces text in a file.
```json
{
  "file_path": "path/to/file.ext",
  "old_string": "Text to replace",
  "new_string": "New text",
  "instruction": "Description of change"
}
```

### `run_shell_command`
Executes a shell command.
```json
{
  "command": "npm test",
  "description": "Run tests",
  "is_background": false  // boolean
}
```

### `activate_skill`
Activates an agent skill.
```json
{
  "name": "skill-name"
}
```

## 5. Environment Variables
The hook process inherits the CLI's environment, plus:

- `GEMINI_PROJECT_DIR`: Path to the current workspace.
- `GEMINI_SESSION_ID`: Current session ID.
- Extension Settings (defined in `gemini-extension.json`) are injected as env vars (e.g. `MY_API_KEY`).
