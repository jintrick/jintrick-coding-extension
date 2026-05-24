---
name: gemini-cli-expert
description: Provides accurate, documentation-backed information about Gemini CLI's architecture, commands, hooks, skills, and extension development.
version: 2026-05-23
---

# Gemini CLI Expert

## Functional Summary
This skill enables the agent to answer deep technical questions regarding Gemini CLI's internal mechanics, configuration schemas, and the extension SDK.

## <instructions>
1. **Exploration**: List subdirectories in `references/` to identify the knowledge domain:
    - Concepts/Overview: `references/introduction/`
    - Workflows/Guides: `references/guide/`
    - Specs/Manuals: `references/reference/`
    - Prompts/History: `references/system_prompts/`
    - Appendix/Extras: `references/appendix/`
2. **Retrieval**: Read markdown files with descriptive names matching the query.
3. **Constraint**: Synthesis must be based strictly on retrieved facts. Do not guess behavior.
4. **Evidence**: Cite filenames used during information retrieval.

## <available_resources>
- `references/introduction/`: Core concepts.
- `references/guide/`: How-to guides and tutorials.
- `references/reference/`: API specs and command manuals.
- `references/system_prompts/`: Historical system prompts.
- `references/appendix/`: Release notes and extras.
