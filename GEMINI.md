# jintrick-coding-extension Developer Context

You are developing `jintrick-coding-extension`, a Gemini CLI extension that provides self-correcting capabilities (Linters) via Hooks.

## Core Features
- **Linter Hook**: Intercepts `write_file` / `replace` tools to validate syntax before writing to disk.
- **Supported Languages**:
  - JavaScript (`.js`, `.cjs`, `.mjs`) via `acorn`
  - TypeScript (`.ts`) via `typescript`
  - JSON (`.json`)
  - Markdown (`.md`)

## Development Workflow (IDD: Issue-Driven Development)
本プロジェクトは厳格な Issue-Driven Development に従って開発される。
具体的な手順については `docs/reference/idd-flow.md` を参照し、そのプロセスを遵守すること。
承認を得るまで実装コードを書いてはならない。

## Documentation
- **CRITICAL**: Refer to `docs/reference/development-guide.md` for the extension's Build & Release process. This is REQUIRED reading.
- Refer to `docs/reference/hooks-api-reference.md` for complete Hook API specifications.
- Refer to `docs/reference/skills-api-reference.md` for Agent Skill development guidelines.

## Deployment
- The `.geminiignore` file excludes source files and `node_modules`, only including `dist/` and configuration files.
- Users install via `gemini extensions install <url>` and get a ready-to-use bundled extension.
