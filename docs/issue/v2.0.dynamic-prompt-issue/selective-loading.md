# 詳細仕様：アクティベーションと選択的ロード・ロジック

本ドキュメントでは、Antigravity 互換のルール適用ロジックおよび、コンテキスト・オーバーフローを回避するための「選択的ロード」アルゴリズムを定義する。

## 1. ルール・アクティベーション条件 (Activation Conditions)
Markdown ファイル（`.agent/rules/*.md`）のフロントマターを解析し、以下の基準で「現在有効なルール」を選定する。

*   **Always On**: 
    - 無条件で全ターンに注入。
    - 用途: ペルソナ、セキュリティ、基本的なエンジニアリング哲学。
*   **Glob (Contextual)**: 
    - `llm_request` で操作対象（`read_file`, `write_file` 等）となっているファイルパスが、定義されたパターン（例: `src/**/*.ts`）に一致する場合のみ注入。
*   **Manual (On-demand)**: 
    - プロンプト内に `@ルール名` が含まれている場合のみ、そのターンで有効化。

## 2. 選択的ロード・アルゴリズム (Selective Loading)
トークン予算（Token Budget）を管理し、モデルの Attention を最適化する。

1.  **スコアリング**: 
    - `Critical`: Always On (Security, Identity)
    - `High`: 現在の操作ファイルに一致する Glob ルール
    - `Normal`: ツールに関連する説明（`tool-description-*`）
2.  **予算管理**: 
    - 合計文字数を計算し、閾値（例: 4000トークン）を超える場合は `Normal` 以下の断片をパージする。
3.  **注入場所の最適化**:
    - 基本ルールはシステムプロンプト（履歴の先頭）へ。
    - 緊急性の高い「リマインダー」は、ユーザー発言の直前（履歴の末尾）へ。

---
*Status: Finalized Architecture.*
