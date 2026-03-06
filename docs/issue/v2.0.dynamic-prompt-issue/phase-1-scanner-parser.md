# フェーズ 1 詳細仕様：ワークスペース・ルール・スキャナー & YAML パーサー

## 1. 概要 (Overview)
本タスクの目的は、`synthesizer_hook.cjs` の基盤となる「ルール発見・解析エンジン」を構築することである。Antigravity 互換の `.agent/rules/*.md` を探索し、YAML フロントマターを正確にパースして、現在有効なルールのリストを抽出する。

## 2. 実装対象 (Deliverables)
- `hooks/scripts/synthesizer_hook.cjs`: 下記ロジックを実装した Node.js スクリプト。
- `hooks/hooks.json`: `BeforeModel` イベントでの実行設定。

## 3. 入力データ (Input)
- **stdin**: `llm_request` を含む JSON オブジェクト。

## 4. 詳細ロジック (Logic Requirements)

### A. ディレクトリ探索 (Discovery)
1. 実行環境の **Workspace Root** および **Git Root** を特定。
2. 上記ルート直下の `.agent/rules/` ディレクトリを走査し、全ての `.md` ファイルをリストアップ。

### B. インクリメンタル・キャッシュ戦略 (Critical)
Hooks は実行のたびにプロセスが終了する（ステートレス）ため、以下のファイルベース・キャッシュを実装すること。
1. **キャッシュ・インデックス**: `./.gemini/cache/rules_index.json` 等に、`path`, `id`, `activation`, `mtime` を保存。
2. **高速バリデーション**:
   - 起動時、まずインデックスを読み込む。
   - 各ファイルの現在の `mtime` をチェック。
   - `mtime` がキャッシュと一致していれば、再パースせずキャッシュ内の `id` と `activation` を再利用。
   - 不一致（更新あり）または新規ファイルの場合のみ、YAML フロントマターをパースし、キャッシュを更新。

### C. YAML フロントマターのパース
- 各 Markdown ファイルの `---` で囲まれたブロックをパース。
- **`id`**, **`activation`** (always/glob/manual) を抽出。
- 外部依存（js-yaml 等）がない環境を想定し、正規表現による堅牢な抽出ロジックを推奨。

## 5. アクティベーション判定 (Activation Evaluation)
現在のターンでどのルールを適用するかを判定する。
1. **Always On**: キャッシュから即座に抽出。
2. **Glob Check**: 操作中のファイルパスをパターンと照合。
3. **Manual Check**: `llm_request.messages` 内の `@id` メンションをスキャン。

## 6. パフォーマンス目標
- フック全体の実行時間を **100ms 以下**（理想は 50ms）に抑えること。
- ファイル本文（Content）の読み込みは、そのルールが「適用」と判断されるまで遅延（Lazy Load）させること。

---
*Verified for Stateless Runtime Hooks environment.*
