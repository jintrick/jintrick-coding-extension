# 技術設計書：Antigravity 互換・動的プロンプト・コンパイラの構築 (v2.1)

## 1. 目的 (Objective)
Gemini CLI の **「Runtime Hooks (BeforeModel)」** を活用し、Antigravity 共通の「法典」である **`.agent/rules/*.md`** および Claude Code 由来の指示断片を、実行コンテキストに応じて動的に注入する。これにより、ツール間で同一のプロジェクト知性を共有し、指示の精度と一貫性を担保する。

## 2. 調査と設計根拠 (Research & Rationale)
本設計は、Claude Code の詳細な分析と Gemini CLI との構造的比較に基づいている。
*   [Claude Code エンジニアリング思想](claude-philosophy.md)
*   [アーキテクチャ比較：Claude Code vs. Gemini CLI](architecture-comparison.md)

## 3. 参照リソースと出典 (References)
*   **Prompt Library**: `claude_code_prompts/system-prompts/` (Claude Code v2.1.69 抽出リソース)
*   **Activation Spec**: `cache/rules-workflows.md` (Antigravity 互換仕様)

## 4. システムアーキテクチャ (Architecture)
「固定システムプロンプト」を、実行時の状況に応じて合成する **Prompt Synthesizer** (BeforeModel Hook) へと移行する。

*   **詳細設計**: [selective-loading.md](selective-loading.md)

## 5. ディレクトリ構成と役割 (Directory Structure & Roles)

本アーキテクチャでは、指示を受ける「プロジェクト」と、指示を処理する「拡張機能」を明確に分離する。

### A. ターゲット・プロジェクト (Target Workspace Root)
ユーザーが作業を行い、エージェントが操作するディレクトリ。
```text
Project Root/
└── .agent/
    └── rules/             <-- プロジェクト固有の法典 (Antigravity 共通)
```

### B. Gemini 拡張機能 (Extension Directory)
プロンプトの動的合成ロジックとグローバルな指示断片を保持する。
```text
jintrick-coding-extension/
├── hooks/
│   ├── scripts/
│   │   └── synthesizer_hook.cjs  <-- プロンプト・コンパイラ本体
│   └── hooks.json                <-- Runtime Hook 定義 (BeforeModel)
├── claude_code_prompts/          <-- 外部指示断片 (Global Library)
└── gemini-extension.json         <-- 拡張機能マニフェスト
```

## 6. 実装フェーズとマイルストーン (Implementation Phases)

### フェーズ 1: 聖典探索とメタデータ・パーサーの構築
Antigravity の仕様に基づき、`.agent/rules/` 内の Markdown ファイルを解析し、適用条件（Glob/Always On/Manual）を抽出するエンジンを実装する。
*   **詳細実装仕様**: [phase-1-scanner-parser.md](phase-1-scanner-parser.md)
*   **重要課題**: YAML フロントマターのパースによる ID および Activation 条件の抽出。
*   **成果物**: `synthesizer.js` (初期版)
*   **完了の定義**: `.agent/rules/` 内の適用条件を正しく解析し、注入候補を特定できる。

### フェーズ 2: コンテキスト・インジェクション (BeforeModel)
特定されたルールと、基本指示（Claude 由来の哲学）を `llm_request.messages` に動的マージする。
*   **詳細実装仕様**: [phase-2-context-injection.md](phase-2-context-injection.md)
*   **成果物**: `synthesizer.js` (合成版)、`hooks.json`
*   **完了の定義**: 
    - Always On ルールが履歴先頭に注入される。
    - 4,000 トークンの予算管理に基づき、優先度の低いルールが適切にパージされる。

### フェーズ 3: 状況依存型リマインダーと変数置換
現在の進捗（計画/実装）や操作ファイルに応じ、リマインダーを履歴の末尾へ注入し、`${CWD}` 等のプレースホルダーを解決する。
*   **詳細実装仕様**: [phase-3-reminders-variables.md](phase-3-reminders-variables.md)
*   **成果物**: `synthesizer.js` (完成版)
*   **完了の定義**: 
    - リマインダーが最新 User メッセージの直前に注入され、モデルの Attention が制御される。
    - `${CWD}`, `${AvailableTools}` 等の変数が実数値で置換される。

## 7. パス解決ルール (Path Resolution)
ルール内の `@path/to/file` は以下の優先順位で解決する。
1. 相対パス (ルールファイル起点)
2. 絶対パス
3. リポジトリ内参照 (Workspace/Git Root 起点)

## 8. リスク管理 (Risk Management)
*   **Token Budget**: 優先順位ベースの「選択的ロード」によりトークンを節約する。
*   **Latency**: ファイル監視（Cache）を導入し、フック実行を 100ms 以内に抑制する。

---
*Created with Prompt Crafter principles - Verified against Antigravity spec.*
