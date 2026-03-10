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

## 4. PowerShell Syntax
- **No CMD Flags**: NEVER use `/s`, `/b`, or `/p`.
- **Recursive Search**: Use this exact pattern:
  - `Get-ChildItem -Path <dir> -Filter "<file>" -Recurse -File -ErrorAction SilentlyContinue | Select-Object -ExpandProperty FullName`
- **Error Handling**: ALWAYS include `-ErrorAction SilentlyContinue`.