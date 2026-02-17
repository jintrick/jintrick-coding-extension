# Gemini Extension Development Guide (jintrick-coding-extension)

This document explains the development, build, and release process for this extension.
**Read this before modifying any code.**

## 1. Architecture Overview

This project uses a **Build Step** to bundle dependencies (`acorn`, `typescript`) into standalone scripts.
This ensures users can install the extension without running `npm install`.

- **Source Code**: `hooks/scripts/` (Edit these files)
- **Distribution**: `dist/` (Do NOT edit these files)
- **Configuration**: `hooks/hooks.json` points to the `dist/` scripts.

## 2. The Build Process (`esbuild`)

We use `esbuild` to bundle the source code into the `dist/` directory.

### Why?
Gemini CLI extensions do not automatically run `npm install` on the user's machine.
Therefore, all external dependencies (like `acorn`) must be bundled into the script files.

### How to Build
After making ANY change to `hooks/scripts/` or `linters/`:

```bash
npm run build
```

This command executes `build.js`, which:
1. Bundles `linter_hook.cjs` -> `dist/hooks/linter_hook.cjs`
2. Bundles all linters (`js.cjs`, `ts.cjs`, etc.) -> `dist/hooks/linters/`

**CRITICAL**: If you forget to run build, your changes will NOT be reflected in the extension behavior (because `hooks.json` points to `dist/`).

## 3. Dynamic Loading & Bundling
The `linter_hook.cjs` dynamically loads linters based on file extension:

```javascript
// hooks/scripts/linter_hook.cjs
const linterPath = path.join(__dirname, 'linters', `${ext.slice(1)}.cjs`);
require(linterPath);
```

To support this in the bundled version:
- `build.js` treats `./linters/*` as **external** in `linter_hook` build.
- `build.js` builds each linter script individually into the `dist/hooks/linters/` directory.
- This preserves the relative path structure in `dist/`, allowing dynamic `require` to work.

## 4. Testing Strategy
Tests are located in `tests/`.

```bash
npm test
```

The tests (e.g., `tests/hooks/linter_hook.test.js`) are configured to execute the **BUNDLED** scripts in `dist/`.
This ensures we are testing exactly what the user will run.

**Workflow:**
1. Edit `hooks/scripts/linter_hook.cjs`.
2. Run `npm run build`.
3. Run `npm test`. (If it fails, fix source and repeat).

## 5. Release & Installation

### .geminiignore
The `.geminiignore` file is configured to:
- **Exclude**: `hooks/scripts/`, `tests/`, `node_modules/`, `build.js`
- **Include**: `dist/`, `hooks/hooks.json`, `gemini-extension.json`, `README.md`

### Installing
Users install via Git URL. The CLI downloads the repo but ignores files listed in `.geminiignore`.

```bash
gemini extensions install https://github.com/jintrick/jintrick-coding-extension
```

### Updating
To update locally installed extension during development:

```bash
gemini extensions update jintrick-coding-extension
```
