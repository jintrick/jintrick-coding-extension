# Gemini Skills Development Cheatsheet

Quick reference for developing Agent Skills within a Gemini CLI Extension.

## 1. Directory Structure
Skills are automatically discovered if placed in the `skills/` directory of the extension.

```text
my-extension/
├── gemini-extension.json
└── skills/
    └── my-skill-name/       <-- Skill Root Directory
        ├── SKILL.md         <-- REQUIRED: Metadata & Instructions
        ├── scripts/         <-- Recommended: Executable scripts
        │   └── util.js
        ├── references/      <-- Recommended: Static docs
        │   └── api-spec.md
        └── assets/          <-- Recommended: Templates, images
            └── config-template.json
```

## 2. SKILL.md Format
The `SKILL.md` file must start with YAML frontmatter.

```markdown
---
name: my-skill-name
description:
  A concise description of what this skill does and WHEN the model should use it.
  (e.g. "Use this skill to audit security vulnerabilities in Python code.")
version: 1.0.0
---

# Skill Title

Detailed instructions for the AI Agent go here.

## <instructions>
Specific procedural guidance.

## <available_resources>
List of available scripts and docs in the skill directory.
```

## 3. Discovery & Precedence
- **Extension Skills**: Loaded automatically from installed extensions.
- **Precedence Order**:
  1. **Workspace** (`.gemini/skills/` in current project) - *Highest*
  2. **User** (`~/.gemini/skills/`)
  3. **Extension** (`.../extensions/name/skills/`) - *Lowest*

## 4. Best Practices
- **Isolation**: Keep skill-specific logic (scripts) inside the skill directory, not in the extension's `hooks/` or global scripts.
- **Resources**: Refer to bundled scripts using relative paths from the skill root, or explain where they are in `<available_resources>`.
- **Dependencies**: If scripts require node modules, bundle them (using `esbuild` etc.) or use standard libraries, as `npm install` is not automatic for extensions.
