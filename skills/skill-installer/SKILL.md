---
name: skill-installer
description: Install, package, unpack, and uninstall Gemini CLI skills. Use this to manage .skill files on Windows, package directories into skills, or extract skills for development and inspection.
version: 1.1.0
---

# Skill Installer

This skill provides robust commands to manage Gemini CLI skills, especially on Windows where standard zip utilities might encounter issues with the .skill format.

## Workflows

### 1. Package a Skill
Create a distributable `.skill` file from a skill directory.

```bash
node scripts/manager.cjs package <path/to/skill-folder>
```

### 2. Install a Skill
Install a `.skill` file to the appropriate Gemini CLI skills directory (user or workspace scope).

```bash
node scripts/manager.cjs install <path/to/skill-file> [user|workspace]
```

### 3. Unpack a Skill
Extract a `.skill` file into a specific directory. This is useful for inspecting the contents of a skill or during the development process.

```bash
node scripts/manager.cjs unpack <path/to/skill-file> [destination-directory]
```

### 4. Uninstall a Skill
Remove an installed skill from the user or workspace scope.

```bash
node scripts/manager.cjs uninstall <skill-name> [user|workspace]
```

## Internal Scripts
- `scripts/manager.cjs`: The core logic for cross-platform packaging, installation, extraction, and uninstallation.