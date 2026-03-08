# Git Repository Control Protocol

## Fact
- **F1**: This directory is managed by a git repository.

## Safety & Logical Constraints (Ported from Claude Code)
- **C1 (Authorization)**: NEVER stage or commit changes without explicit instruction.
- **C2 (Config)**: DO NOT update git config.
- **C3 (Destructive)**: Forbidden commands: `reset --hard`, `clean -f`, `push --force`, `checkout .`, `restore .`, `branch -D`.
- **C4 (Hooks)**: DO NOT skip hooks (`--no-verify`). 
- **C5 (No Amend)**: If a hook fails, create a **NEW commit**. NEVER use `--amend` to protect previous history.
- **C6 (Interactive)**: DO NOT use interactive flags (`-i`, `-e`, `rebase -i`, `add -i`).
- **C7 (Invalid Flags)**: DO NOT use `--no-edit` with `git rebase`.
- **C8 (Secrets)**: NEVER commit sensitive files (`.env`, `credentials`, etc.). Warn the user if requested.
- **C9 (Specific Staging)**: DO NOT use `git add .` or `git add -A`. Add specific files by name.
- **C10 (No Empty)**: DO NOT create empty commits if there are no modifications.
- **C11 (Discovery)**: Gather facts via `git status`, `git diff`, and `git log`.
- **C12 (Memory)**: Never use `-uall` flag to prevent memory issues.
- **C13 (Analysis)**: Categorize changes (feat, fix, refactor, etc.) before drafting.
- **C14 (Rationale)**: Focus on **WHY** (technical intent/rationale).
- **C15 (Accuracy)**: Use precise verbs: "add" (new), "update" (enhancement), "fix" (bug fix).
- **C16 (Drafting)**: Always provide a full draft; do not ask the user to write it.
- **C17 (PR History)**: Review `base...HEAD` to understand FULL history before PR creation.
- **C18 (HEREDOC)**: ALWAYS use HEREDOC for `git commit` and `gh pr create` body.

## Engineering Extensions (Gemini Specific)
- **G1 (Branch Safety)**: Verify branch via `git branch --show-current`. NO direct commits to `main` or `master`.
- **G2 (Single Turn)**: Combine fact-gathering in one turn using `;` for PowerShell efficiency.
- **G3 (Volume Stat)**: Use `git diff --stat HEAD` to assess change volume before full diff.
- **G4 (Context Protection)**: If diff > 200 lines, review file-by-file to prevent context overflow.
- **G5 (Atomic Split)**: Propose splitting if staged changes contain unrelated logical units.

## Execution Pattern (HEREDOC)
```bash
git commit -m "$(cat <<'EOF'
<type>: <subject>

<body>
EOF
)"
```

## Validation
- Run `git status` and `git log -n 1` after each commit.
- On failure, output the exact error and STOP. No automated workarounds.
