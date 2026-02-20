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
具体的な手順については `docs/reference/idd-flow.md` を参照し、そのプロセスを**完全に遵守**すること。

### Strict Compliance
- **Deviations are Forbidden**: Do not perform any git operations (especially release/tagging) based on general assumptions. Follow the exact steps in `docs/reference/idd-flow.md`.
- **Release Automation**: Release tags are managed by CI/CD. Do NOT create tags manually.
- **Reference First**: Always read `docs/reference/idd-flow.md` before starting a task.

## Documentation
- **CRITICAL**: Refer to `docs/reference/development-guide.md` for the extension's Build & Release process. This is REQUIRED reading.
- Refer to `docs/reference/hooks-api-reference.md` for complete Hook API specifications.
- Refer to `docs/reference/skills-api-reference.md` for Agent Skill development guidelines.

## Deployment
- The `.geminiignore` file excludes source files and `node_modules`, only including `dist/` and configuration files.
- Users install via `gemini extensions install <url>` and get a ready-to-use bundled extension.
