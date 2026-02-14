# Gemini Hooks Development Cheatsheet

Quick reference for developing Hooks in Gemini CLI extensions.

## 1. Magic Strings (Variable Substitution)
Used in `hooks/hooks.json` and `gemini-extension.json`.

| Variable | Description | Example Value |
| :--- | :--- | :--- |
| `${extensionPath}` | Absolute path to the extension root. | `C:\Users\User\.gemini\extensions\my-ext` |
| `${workspacePath}` | Absolute path to the current project root. | `C:\Projects\my-project` |
| `${/}` | OS-specific path separator. | `` (Windows) or `/` (Linux/macOS) |

**Example in `hooks.json`:**
```json
"command": "node "${extensionPath}${/}dist${/}hooks${/}my_hook.js""
```

## 2. Hook Input (Stdin)
Hooks receive a JSON object via Standard Input (stdin).

```json
{
  "hook_event_name": "BeforeTool",
  "tool_name": "write_file",
  "tool_input": {
    "file_path": "src/main.ts",
    "content": "..."
  },
  "cwd": "C:\Projects\my-project",
  "session_id": "..."
}
```

## 3. Hook Output (Stdout)
Hooks must output a single JSON object to Standard Output (stdout).
Logs/Debug info must go to **Stderr**.

### Allow Action
```json
{ "decision": "allow" }
```

### Deny/Block Action
```json
{
  "decision": "deny",
  "reason": "Internal log reason (not shown to user)",
  "systemMessage": "Message shown to the Gemini Model/User explaining why it was blocked."
}
```

## 4. Environment Variables
Available to the hook process.

- `GEMINI_PROJECT_DIR`: Path to the current workspace (same as `${workspacePath}`).
- `GEMINI_SESSION_ID`: Current session ID.
- Standard env vars (`PATH`, `HOME`, etc.)

## 5. Exit Codes
- **0**: Success (CLI parses stdout JSON).
- **1**: Error (CLI ignores output, assumes allow? Check docs).
- **2**: System Block (Critical failure, aborts action).
