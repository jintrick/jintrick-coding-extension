# フェーズ 2 詳細仕様：コンテキスト・インジェクション (BeforeModel Hook)

## 1. 概要 (Overview)
フェーズ 1 で抽出された「有効なルール（active_rules）」および Claude Code (v2.1.69) 由来のエンジニアリング思想を、Gemini CLI の `llm_request` に動的に合成する。これにより、モデルがプロジェクト固有の規約と、高度なソフトウェアエンジニアリング手法を遵守するように誘導する。

## 2. 実装対象 (Deliverables)
- `synthesizer.js`: `BeforeModel` フック内でプロンプトを合成・注入するロジックの実装。
- `docs/logic/context-budgeting.md`: (オプション) トークン管理アルゴリズムの解説。

## 3. 入力データ (Input)
- **llm_request**: Gemini CLI から渡される JSON オブジェクト。
  - `llm_request.messages`: 会話履歴（`messages[0]` が System Message）。
- **Active Rules**: フェーズ 1 でパースされたルールの配列。
  ```json
  [
    { "id": "RULE_ID", "content": "Markdown...", "metadata": { "activation": "glob", "priority": 10 } }
  ]
  ```

## 4. 詳細ロジック (Logic Requirements)

### A. プロンプト部品の組み立て (Prompt Assembly)
以下の 4 つのブロックを定義された順序で合成する。各ブロック間には空行（`\n\n`）を挿入すること。

1.  **[Core Identity]**:
    - 出典: `system-prompt-doing-tasks-software-engineering-focus.md`
    - 内容: 「あなたはソフトウェアエンジニアリングタスクを実行するプロフェッショナルである。指示をカレントディレクトリの文脈で解釈せよ」という宣言。
2.  **[Engineering Philosophy]**:
    - 出典: `docs/research/claude-philosophy.md` (v2.1.69 抽出)
    - 内容: 「過剰設計の排除（Radical Simplicity）」「抽象化の禁止」「慎重なアクション実行」などの基本原則。
3.  **[Security]**:
    - 出典: `system-prompt-doing-tasks-security.md`
    - 内容: OWASP Top 10 やコマンドインジェクションの防止、セキュアなコードの優先。
4.  **[Active Workspace Rules]**:
    - フェーズ 1 で特定された `active_rules` の `content` を連結したもの。

### B. コンテキスト予算管理 (Token Budgeting)
合成後の System Message が肥大化してモデルの推論能力を低下させるのを防ぐため、以下の予算管理を行う。
- **閾値**: 合計文字数 16,000 文字（約 4,000 トークン相当）を超えないこと。
- **パージ順序**: 閾値を超える場合、以下の優先度の低い順に `Active Workspace Rules` からルールを除外する。
    1.  `activation: glob` (ファイルパス一致) - 最も優先度が低い
    2.  `activation: always` (常に有効)
    3.  `activation: manual` (明示的なメンション `@id`) - 最も優先度が高い
- **注記**: Core Identity, Engineering Philosophy, Security は原則としてパージ対象外とする。

### C. Markdown 正規化と合成 (Normalization & Synthesis)
- **見出しレベルの調整**: 注入される各ブロックの見出しレベル（`#`）を、System Message の構造に合わせて 1 段階下げる（例: `#` -> `##`）。
- **出典の明記**: 注入ブロックの冒頭に `> [!NOTE] Compiled with dynamic context from Claude Code v2.1.69 resources.` という引用を挿入する。
- **最終出力**: `llm_request.messages[0].content` の末尾に、合成された全プロンプトを連結して上書きする。

## 5. 出力 (Output/Verification)
`synthesizer.js` は、修正された `llm_request` を JSON 形式で標準出力（stdout）に返し、Gemini CLI の次工程へ渡す。
デバッグ用として、注入されたルールの ID リストと最終的な文字数を `stderr` に出力すること。

## 6. 制約事項 (Constraints)
- **非破壊的変更**: 既存の `llm_request.messages[0]` に元から存在する内容は一切削除・変更せず、末尾への追記のみを行うこと。
- **文字カウント**: 依存ライブラリがない場合、`string.length` による単純な文字数カウントで代用してよい。
- **エラーハンドリング**: ルールの読み込みに失敗した場合でも、フック自体がエラーで停止して LLM 呼び出しを妨げることがないよう、`try-catch` で保護し、失敗時は注入なしで続行すること。

---
*Generated for External Implementation Agents.*
