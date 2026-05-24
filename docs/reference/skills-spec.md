# Gemini Skills Spec

This document provides the complete specification for developing Agent Skills in Gemini CLI extensions.

## 1. Skill Discovery & Structure

Skills are directories located in `skills/` within the extension root.
They are automatically discovered and loaded by the CLI.

> [!CAUTION]
> **`dist/skills/` is NOT a valid location for skills.**
> The Gemini CLI `activate_skill` tool only scans the `skills/` directory at the extension root. Placing skills within the build output directory (`dist/`) will result in them being ignored by the CLI.

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
The body contains the instructions injected into the model's context upon activation. Modern skills avoid role-play ("You are an expert") in favor of direct objective and procedural logic.

```markdown
# Skill Title

## Functional Summary
This skill provides capabilities to <objective> by <method>.

## <instructions>
Specific procedural guidance for the model, emphasizing decision logic.
1. **Context Discovery**: Analyze X to determine the current state.
2. **Decision Logic**:
   - If A, use `scripts/task_a.js`.
   - If B, refer to `references/policy_b.md`.
3. **Execution**: Perform Y and verify result using Z.

## <available_resources>
List available scripts and docs.
- `scripts/helper.js`: Does X. Run with `--help` for interface details.
- `references/api.md`: API documentation.
```

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

- **Discovery-First Design**: The frontmatter `description` is the ONLY information the model sees before activation. Use **third-person** and include specific **keywords** (e.g., "audit", "refactor", "lint") to ensure the model chooses this skill correctly.
- **No Personas**: Avoid "You are an expert..." role-play. Modern LLMs are more efficient with direct **Responsibilities** and **Constraints**. Focus on what the agent *must do*, not who it *is*.
- **Decision Trees Over Prose**: Structure instructions as logical branches (e.g., "If file exists, do X; else do Y"). This prevents the agent from losing focus during complex tasks.
- **Scripts as Black Boxes**: Don't force the agent to read source code. Instruct it to run scripts with `--help` or `--version` to understand the interface, saving context window space.
- **Self-Contained**: Bundle all necessary scripts and docs within the skill directory.
- **Stateless**: Skills should not rely on persistent state outside of the project files.

## 6. Critical Warnings (Avoid the v1.28.0 Pitfall)

- **Location Restriction**: Always place skills in the root `skills/` directory. Unlike Linter Hooks, skills do not have a path redirection mechanism (like `hooks.json`).
- **Discovery Mechanism**: There is no way to load skills from arbitrary paths. The CLI relies strictly on the standard Auto Discovery from the extension's root `skills/` folder.
- **Git Inclusion**: While `dist/` is typically ignored, the `skills/` directory must be included in version control as part of the extension's functional distribution.
