---
name: init-jintrick-project
description: Initialize a new project with jintrick's standard Gemini CLI configuration, including system prompts, agent rules, and basic package settings. Use this when starting a new project or standardizing an existing one for jintrick's workflow.
---

# Init Jintrick Project

This skill initializes a project directory with jintrick's standard Gemini CLI configuration and essential project files.

## Workflow
1.  **Environment Check**: Ensure you are in the root directory of the project to be initialized.
2.  **Execution**: Run the initialization script: `node ${extensionPath}/skills/init-jintrick-project/scripts/init_project.cjs`.
3.  **Conflict Handling**: If files already exist (e.g., `package.json`), the script will stop. Use `--force` to overwrite if jintrick explicitly approves.

## Deployed Assets
- `.gemini/system.md`: The base system prompt for Gemini CLI.
- `.agent/rules/`: Standard rules for Gemini CLI agents (comment preservation, no temp files in root).
- `package.json`: Baseline template with versioning and standard scripts.

## Usage
Execute the following via `run_shell_command`:
```powershell
node "${extensionPath}/skills/init-jintrick-project/scripts/init_project.cjs"
```
Or for forceful initialization:
```powershell
node "${extensionPath}/skills/init-jintrick-project/scripts/init_project.cjs" --force
```
