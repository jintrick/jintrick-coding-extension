# フェーズ 3 詳細仕様：状況依存型リマインダーと変数置換

## 1. 概要 (Overview)
セッションの状態（計画中/実装中）に応じたリマインダーを履歴の末尾（最新の User メッセージの直前）に動的に注入し、プロンプト内のプレースホルダー（`${CWD}`, `${AvailableTools}` 等）を最新の環境情報で置換する。これにより、モデルが現在の文脈を正確に把握し、Attention を直近の指示に集中させる。

## 2. 実装対象 (Deliverables)
- `synthesizer.js`: リマインダー注入と変数置換ロジックの追加（既存の `BeforeModel` フックを拡張）。
- `system-reminder-*.md`: 出典元（v2.1.69）のリマインダー部品。

## 3. 入力データ (Input)
- **llm_request**:
  - `llm_request.messages`: 会話履歴。ツール呼び出し（`enter_plan_mode` 等）の状態を含む。
  - `llm_request.tools`: 利用可能なツールの配列。
- **Environment Context**:
  - `process.cwd()`: カレントディレクトリ。
  - `git rev-parse --abbrev-ref HEAD`: 現在のブランチ。
  - `process.platform`: OS 情報。

## 4. 詳細ロジック (Logic Requirements)

### A. フェーズ判定 (Mode Detection)
`llm_request.messages` を過去から順に走査し、最後に呼び出されたモード変更ツールに基づき現在の状態を判定する。
- **`PLANNING`**: `enter_plan_mode` のツール呼び出しが存在し、その後に `exit_plan_mode` が呼び出されていない場合。
- **`IMPLEMENTATION`**: 上記以外（初期状態、または `exit_plan_mode` 呼び出し後）。

### B. リマインダーの選択と注入 (Reminder Injection)
判定された状態に基づき、以下のファイルを読み込み、`llm_request.messages` の末尾（最後のメッセージが `user` であればその直前）に `system` ロールとして挿入する。

| フェーズ | リマインダーファイル |
| :--- | :--- |
| `PLANNING` | `system-reminder-plan-mode-is-active-iterative.md` |
| `IMPLEMENTATION` | `system-reminder-exited-plan-mode.md` |

- **挿入位置**: `llm_request.messages.splice(messages.length - 1, 0, reminderMessage)`
- **注意**: 既に同一のリマインダーが直近の履歴（過去 2 ターン以内）に存在する場合は、重複注入を避けるためスキップすること。

### C. 変数置換 (Variable Resolver)
注入されるリマインダー、および System Message 全体に対して、以下のプレースホルダーを置換する。

| 変数名 | 置換内容 (Source) | 形式例 |
| :--- | :--- | :--- |
| `${CWD}` | `process.cwd()` | `/Users/username/project` |
| `${OS}` | `process.platform` | `darwin`, `win32` |
| `${AvailableTools}` | `llm_request.tools` から抽出 | `read_file, write_file, grep_search` |
| `${CURRENT_BRANCH}` | `git` コマンド実行結果 | `main`, `feature/issue-123` |

- **`${AvailableTools}` の生成ロジック**:
  - `llm_request.tools[].function_declarations[].name` をすべて抽出し、カンマ区切りの文字列を生成する。

### D. Attention 制御とトークン管理
- リマインダーはモデルの「忘却」を防ぐため、履歴の末尾に近い位置に配置する。
- 合成後のメッセージ（System + Reminders）の合計文字数が 16,000 文字を超える場合は、フェーズ 2 で定義された優先度に基づきルールをパージし、リマインダー自体のサイズは維持する。

## 5. 出力 (Output/Verification)
`synthesizer.js` は、修正された `llm_request` を JSON で返し、`stderr` に以下のデバッグ情報を出力する。
- `[Phase 3] Current Mode: PLANNING`
- `[Phase 3] Injected Reminder: system-reminder-plan-mode-is-active-iterative.md`
- `[Phase 3] Resolved Variables: ${CWD}, ${AvailableTools}`

## 6. 制約事項 (Constraints)
- **出典の明記**: 注入されるリマインダーの冒頭に `> [!IMPORTANT] Contextual Reminder (v2.1.69)` というヘッダーを付与すること。
- **パス解決**: リマインダー内の `@path/to/file` 形式の解決は、`CLAUDE_DYNAMIC_PROMPT_PLAN.md` の第 7 節に準拠し、Workspace Root 起点で解決を試みること。
- **同期実行**: 変数置換のための `git` コマンド呼び出しは `child_process.execSync` を使用し、タイムアウトを 500ms に設定すること。

---
*Generated for External Implementation Agents.*
