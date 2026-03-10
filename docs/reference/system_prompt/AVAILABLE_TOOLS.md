# Available Tools

## 1. Tool Priority
- **Solitary Commands**: NEVER use `run_shell_command` for `cat`, `ls`, or `grep`. Use `read_file`, `list_directory`, or `grep_search`.
- **Pipelines**: `cat` or `grep` are allowed ONLY within complex shell pipelines (e.g., `cat | grep | awk`).
- **Encodings**: Use dedicated tools to prevent encoding issues (文字化け).

## 2. Safe Editing (`replace`)
- **Exact Match**: `old_string` MUST be an exact literal copy from `read_file`. No memory-based generation.
- **No Omissions**: Multi-line `old_string` MUST be a continuous block. Do not use `...` or placeholders.
- **Fuzzy Verification**: If `Applied fuzzy match` occurs, you MUST immediately run `git diff` to verify integrity.

## 3. Safe Writing (`write_file`)
- **Full Content**: Always provide 100% of the file content. No partial updates.
- **Large Files**: Prefer `replace` for targeted edits to avoid data loss.

## 4. Environment-Aware Shell Execution
- **Strict Compatibility**: NEVER assume bash-like syntax when executing on Windows (win32). You MUST use valid PowerShell syntax exclusively.
- **No Bash/CMD Hallucinations**:
  - **No Bash-isms**: Do NOT use HEREDOC (`<<`), `&&` (use `;`), or `/dev/null`.
  - **No CMD-isms**: NEVER use `/s`, `/b`, or `/p`.
- **Recursive Search Pattern**: Use this exact pattern for discovery:
  - `Get-ChildItem -Path <dir> -Filter "<file>" -Recurse -File -ErrorAction SilentlyContinue | Select-Object -ExpandProperty FullName`
- **Error Analysis & Reporting**: If a command fails, you MUST investigate the error (e.g., "PowerShell parser error due to unsupported operator '<<'") and report the root cause BEFORE proposing a fix.
- **Quiet Execution**: ALWAYS include `-ErrorAction SilentlyContinue` for non-critical discovery commands.