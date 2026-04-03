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

## 3. Modification Ritual (Bit-perfect Restorability)
- **Restoration Point**: `jintrick.md` の HTML コメント（`ORIGINAL` ブロック）は、単なる履歴ではない。これは **Bit-perfect Restoration Point** であり、`jintrick.md` を過去の任意の時点（`original.md`）へ、一字一句の狂いもなく機械的に復元することを保証する唯一の手段である。
- **Constraint**: 重要なロジックやスタイルの変更を行う際は、直前のテキストブロックを `ORIGINAL` 内に **Exactly preserve（完全保存）** せよ。改行や空白に至るまで、一切の改変を禁ずる。
- **Intent Binding**: 変更理由（`INTENT`）は、現在の実装と過去の `ORIGINAL` を繋ぐ論理的楔（くさび）である。これが欠落した変更は「根拠なき改変」と見なされる。
- **Strict Scope**: この儀式は **jintrick.md 専用**である。他の一切のファイルに適用してはならない。

- **Format**: 
  ```markdown
  <!-- ORIGINAL: [Exactly preserve the previous block of text]
       INTENT: [Explain the specific technical or behavioral reason for the change] -->
  [New version of the text]
  ```
- **Goal**: システムプロンプトの進化における「不可逆性」を物理的に排除し、完全な決定論的復帰（Deterministic Revert）を可能にする。

