# Gemini Skills API Reference

This document provides the complete API specification for developing Agent Skills in Gemini CLI extensions.

## 1. Skill Discovery & Structure

Skills are directories located in `skills/` within the extension root.
They are automatically discovered and loaded by the CLI.

### Directory Layout
```text
my-extension/
├── gemini-extension.json
└── skills/
    └── <skill-name>/        <-- MUST match the skill name
        ├── SKILL.md         <-- REQUIRED: Metadata & Instructions
        ├── scripts/         <-- Scripts used by the skill
        │   └── helper.js
        ├── references/      <-- Static documentation
        │   └── api.md
        └── assets/          <-- Templates, configs
            └── template.json
```

## 2. SKILL.md Specification

The `SKILL.md` file defines the skill's identity and behavior using YAML frontmatter and Markdown.

### Frontmatter (YAML)
```yaml
---
name: my-skill-name
description: >
  A short description (1-2 sentences) used by the model to decide WHEN to activate this skill.
  Example: "Use this skill to audit security vulnerabilities in Python code."
version: 1.0.0
---
```

- `name`: Must be unique and match the directory name. use kebab-case.
- `description`: Critical for activation. Be specific about the use case.
- `version`: Semantic versioning.

### Body (Markdown)
The body contains the instructions injected into the model's context upon activation.

```markdown
# Skill Title

You are an expert <role>. Your goal is to <objective>.

## <instructions>
Specific procedural guidance for the model.
1. Step 1...
2. Step 2...

## <available_resources>
List available scripts and docs.
- `scripts/helper.js`: Does X.
- `references/api.md`: API documentation.

## <activated_skill>
(Optional) XML tag wrapping for specialized instructions.
```

## 3. Skill Precedence

When multiple skills share the same name, the CLI loads them in this order (highest priority first):

1.  **Workspace Skills** (`.gemini/skills/` in project root)
2.  **User Skills** (`~/.gemini/skills/`)
3.  **Extension Skills** (Bundled in `extensions/`)

*Extension skills are effectively "defaults" that can be overridden by user/workspace configurations.*

## 4. Interaction with Tools

Skills can utilize standard tools (`run_shell_command`, `read_file`) and extension-specific tools.

- **File Access**: When activated, the skill's directory is added to the allowlist, granting read access to bundled assets.
- **Scripts**: Execute bundled scripts using relative paths or `${extensionPath}` if needed (though usually relative paths work within the skill context).

## 5. Best Practices

- **Self-Contained**: Bundle all necessary scripts and docs within the skill directory.
- **Stateless**: Skills should not rely on persistent state outside of the project files.
- **Dependencies**: Use `esbuild` to bundle dependencies if scripts use non-standard node modules.
