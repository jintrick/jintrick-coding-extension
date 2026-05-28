<!-- INTENT: git-expert 廃止に伴う Git 操作の完全自律化。AIが遵守すべき物理的拘束（Atomic, High-signal, Deterministic）を純粋な命令セットとして定義。 -->
# Git Workflow (Mandatory)

- **Context Preservation:** 履歴肥大化を防ぐため、`git status --short`, `git diff --stat`, `git log -n 10` を優先せよ。
- **English-Only:** コミットメッセージは英語のみ。2バイト文字は厳禁。
- **Explicit Referencing:** `checkout` や `reset` は相対指定（`HEAD~1`等）を避け、必ずコミットハッシュを明示せよ。
- **History Integrity:** ユーザーの指示なく `amend`, `rebase`, `reset --hard` 等の履歴改変を行うな。
- **Tool Harness:** PowerShell 5.1 のエスケープ失敗を防ぐため、シェルパイプ（`grep`, `sed`, `awk`）より専用ツール（`grep_search`, `replace`, `read_file`）を優先せよ。
