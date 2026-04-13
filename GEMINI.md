# jintrick-coding-extension Developer Context

You are developing `jintrick-coding-extension`, a Gemini CLI extension that provides self-correcting capabilities (Linters) via Hooks.

まず最初に、次のガイドラインをよく読み、開発に関して深く理解すること：
@docs/reference/development-guide.md

## Development Workflow (IDD: Issue-Driven Development)
- 本プロジェクトは厳格な Issue-Driven Development に従って開発される。
- **Exceptions**: `jintrick.md` および `.gemini/system.md` の更新（システムプロンプトの洗練）は、迅速な試行錯誤（Trial & Error）が必要なため、Issue の起票およびコミットを免除する。直接編集と同期を許可する。
- 具体的な手順については `docs/reference/idd-flow.md` を参照し、そのプロセスを**遵守**すること。

### Strict Compliance
- **Deviations are Forbidden**: Do not perform any git operations (especially release/tagging) based on general assumptions. Follow the exact steps in `docs/reference/idd-flow.md`.
- **Release Automation**: Release tags are managed by CI/CD. Do NOT create tags manually.
- **Reference First**: Always read `docs/reference/idd-flow.md` before starting a task.

## Release & Versioning
- **Release Manager Skill**: バージョンの同期（`package.json` 等）から Git リリース操作（commit, push）までを一気通貫で実行するため、必ず `release-manager` スキル（`skills/release-manager/`）を使用してリリースを完遂すること。手動でのバージョン書き換えや Git 操作によるリリースは、整合性維持のため原則禁止とする。

## Documentation
- **CRITICAL**: Refer to `docs/reference/development-guide.md` for the extension's Build & Release process. This is REQUIRED reading.
- Refer to `docs/reference/hooks-spec.md` for complete Hook API specifications.
- Refer to `docs/reference/skills-spec.md` for Agent Skill development guidelines.

## System Prompt Maintenance (jintrick.md)
`jintrick.md` およびその同期プロセスにおいて、以下の制約を厳格に遵守すること。

- **Dynamic Placeholders:** システムプロンプト内の `${SubAgents}` や `${AgentSkills}` は CLI によって動的に展開される。サブエージェントの説明文（`description`）を変更したい場合は、`jintrick.md` ではなく、必ず `agents/*.md` のフロントマターを直接編集すること。
- **Originality Preservation:** `jintrick.md` は常に `original.md` の内容を完全に復元できる状態でなければならない。
- **Modification Ritual (ORIGINAL/INTENT):** すべての変更（削除、簡素化、統合）は、必ず以下の形式で `original.md` または以前のブロックをコメントとして残すこと。
    ```markdown
    <!-- ORIGINAL: [Exactly preserve the previous or original block of text]
         INTENT: [Explain the specific technical or behavioral reason for the change] -->
    [New simplified or modified version]
    ```
- **Minimal Diff:** 編集は `original.md` の構造をベースラインとし、差分を最小限に抑えること。
- **Synchronization:** 更新後は必ず `node tools/jintrick_to_system.cjs` を実行し、`.gemini/system.md` を同期すること。

## Deployment
- The `.geminiignore` file excludes source files and `node_modules`, only including `dist/` and configuration files.
- Users install via `gemini extensions install <url>` and get a ready-to-use bundled extension.

## Gemini CLIのGitHubリポジトリ
- google-gemini/gemini-cli 