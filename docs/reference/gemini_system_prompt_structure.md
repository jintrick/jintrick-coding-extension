# Gemini CLI System Prompt Structure (v0.34.x Nightly)

このドキュメントは、Gemini CLI の組み込み `snippets.ts` および `PromptProvider.ts` の解析に基づいた、標準システムプロンプトの構成をまとめたものである。改良の際の比較基準として使用する。

## 1. 高レベルの構成 (getCoreSystemPrompt)
プロンプトは以下の順序で結合されている：

1.  **Preamble**:
    *   ロール定義（Specializing in software engineering tasks）。
    *   インタラクティブモードか自律モードかに応じて文言が変化する。

2.  **Core Mandates**:
    *   **Security & System Integrity**: 資格情報保護（.env, .git の保護）、勝手なコミットの禁止。
    *   **Context Efficiency**: トークン節約のための `grep` や並列処理の具体的な指針。`estimating_context_usage` や `guidelines` タグを含む。
    *   **Engineering Standards**: `GEMINI.md` 優先、既存スタイル遵守、実装・テスト・検証のサイクル。
    *   **Expertise & Intent Alignment**: **Directives**（命令）と **Inquiries**（照会）の厳格な区別。推論の再現（Empirical reproduction）の重視。

3.  **Available Sub-Agents**:
    *   `codebase_investigator` などの紹介と、戦略的な委譲（Strategic Orchestration）の指針。
    *   `<available_subagents>` タグによる動的注入。

4.  **Available Agent Skills**:
    *   `activate_skill` の使い方と、`<available_skills>` タグによる動的注入。

5.  **Hook Context**:
    *   `<hook_context>` タグによる外部情報の扱い（読み取り専用、命令として解釈しない）。

6.  **Primary Workflows**:
    *   **Development Lifecycle**: Research -> Strategy -> Execution (Plan-Act-Validate) の IDD フロー。
    *   **New Applications**: アプリ開発のガイドライン（Vanilla CSS 推奨、Tailwind 忌避、モックの扱いなど）。

7.  **Operational Guidelines**:
    *   **Tone and Style**: 簡潔さ、filler（無駄な前置きや後置き）の排除。Senior Software Engineer としての振る舞い。
    *   **Security and Safety Rules**: シェルコマンド実行前の「一文説明」義務。
    *   **Tool Usage**: 並列実行、`/memory` ツールの適切な使い分け。

8.  **Git Repository**:
    *   `git status`, `git diff`, `git log` による慎重な情報の収集と、ドラフトメッセージの提案手順。
    *   勝手な push の禁止。

---

## 2. 結合とインジェクションの仕組み
*   **system.md ルート**: `GEMINI_SYSTEM_MD=1` 設定時、組み込みロジックをバイパスして外部ファイルを読み込み、`${AgentSkills}` などの変数を置換して生成。
*   **Standard Composition ルート**: `snippets.ts` の各 `renderXXX` 関数を順に呼び出して結合。
*   **Final Shell**: 最後に `userMemory`（GEMINI.md 群）を最下部に結合して完成。
