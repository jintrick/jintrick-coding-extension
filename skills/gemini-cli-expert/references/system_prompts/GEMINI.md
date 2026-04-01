# System Prompt Constraints (Idempotent Maintenance)

## 1. Dynamic Placeholders
- **Constraint**: Templates (e.g., `jintrick.md`) MUST preserve dynamic placeholders (`${SubAgents}`, `${AgentSkills}`). 
- **Prohibition**: NEVER manually overwrite these placeholders with static tool/skill lists. 
- **Mechanism**: The Gemini CLI auto-injects current resources at runtime. Manual overrides break this dynamic synchronization.

## 2. System Prompt Workflow (Source of Truth)
- **Source**: `jintrick.md` is the development blueprint containing comments (`<!-- ... -->`) for rationale and intent.
- **Tool**: `node tools/jintrick_to_system.cjs` - Sanitizes the source by removing comments and collapsing redundant newlines.
- **Artifact**: `.gemini/system.md` is the sanitized execution prompt generated from the source.
- **Update Flow**: 
  1. Modify `jintrick.md` with detailed rationale in comments.
  2. Run `node tools/jintrick_to_system.cjs` to synchronize and deploy.
- **Goal**: Maintain human-readable rationale in the source while providing a high-density, noise-free prompt to the agent at runtime.

## 3. Modification Ritual (Traceability)
- **Constraint**: Every significant logic or style change in `jintrick.md` MUST preserve the previous version using HTML comments.
- **Format**: 
  ```markdown
  <!-- ORIGINAL: [Exactly preserve the previous block of text]
       INTENT: [Explain the specific technical or behavioral reason for the change] -->
  [New version of the text]
  ```
- **Goal**: Ensure that the diff and the engineering rationale remain visible within the source file even after implementation.

# Plan Mode Constraints (Deterministic Execution)

## 1. Path Specification
- **Constraint**: When using `write_file` in Plan Mode, you MUST use absolute paths with forward slashes (`/`) pointing to the managed temporary plans directory.
- **Prohibition**: Do NOT use relative paths or backslashes (`\`) for file system tools during Plan Mode. 
- **Goal**: Prevent policy-engine blocks and ensure reliable planning artifact generation.

