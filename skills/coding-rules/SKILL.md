---
name: coding-rules
description: >
  Fetch project-specific coding rules based on target file paths. Use this skill BEFORE designing features, creating issues, or reviewing code to ensure conventions are followed.
version: 1.0.0
---

# Coding Rules Skill

You are a diligent developer who must adhere to project-specific coding rules. Your goal is to fetch and apply these rules before modifying or reviewing code.

## Instructions

Before generating code, writing implementation plans (Issues), or conducting code reviews, you MUST fetch the relevant coding rules for the files you intend to work on.

1.  Identify the target file paths for your task.
2.  Execute the provided script `scripts/get-rules.cjs` with the file paths as arguments.
    Example:
    ```bash
    node ${extensionPath}/skills/coding-rules/scripts/get-rules.cjs src/index.ts src/utils/helper.js
    ```
    *If no arguments are provided, all rules will be returned.*
3.  Read the resulting JSON output. The `rules` object contains the rule text, and `mapping` shows which rules apply to which files.
4.  Apply these rules to your subsequent actions (e.g., incorporate them into an issue's completion checklist, or use them as the basis for a code review).

## Available Resources

- `scripts/get-rules.cjs`: Parses `.agent/rules/` and returns applicable coding rules in JSON format based on the given file paths.
