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
1. **Issue Drafting**: Create a task in `docs/issue/` and solidify the design.
2. **Approval (Review)**: User (jintrick) reviews and approves the Issue content. **Do not write implementation code until approved.**
3. **Commit Plan**: Commit the approved Issue document and any related planning files (e.g., `hooks.json`).
4. **Implementation**: Implement based on the approved Issue.
5. **Source Code**:
   - Hooks logic is in `hooks/scripts/`.
   - Linters are in `hooks/scripts/linters/`.
   - Tools and maintenance scripts are in `tools/`.
6. **Build Process (CRITICAL)**:
   - This project uses `esbuild` to bundle dependencies (`acorn`, `typescript`) into `dist/`.
   - **AFTER EDITING ANY SCRIPT**, you must run:
     ```bash
     npm run build
     ```
   - The `hooks/hooks.json` points to the `dist/` files.
7. **Testing**:
   - Run unit/integration tests with:
     ```bash
     npm test
     ```
   - Tests verify the bundled scripts in `dist/`.

## Documentation
- **CRITICAL**: Refer to `docs/reference/development-guide.md` for the extension's Build & Release process. This is REQUIRED reading.
- Refer to `docs/reference/hooks-api-reference.md` for complete Hook API specifications.
- Refer to `docs/reference/skills-api-reference.md` for Agent Skill development guidelines.

## Deployment
- The `.geminiignore` file excludes source files and `node_modules`, only including `dist/` and configuration files.
- Users install via `gemini extensions install <url>` and get a ready-to-use bundled extension.
