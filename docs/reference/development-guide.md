# Gemini Extension 開発ガイド (jintrick-coding-extension)

本ドキュメントでは、本拡張機能の構造、開発、およびリリースプロセスについて解説する。
**コードを変更する前に必ず一読すること。**

---

## パート I: 構造と仕様 (Architecture & Components)

### 1. アーキテクチャの概要
本プロジェクトは、依存関係をバンドルする**ビルドステップ**を前提としている。
開発者はソースコードを編集し、ビルド成果物を Gemini CLI に読み込ませる。

- **メインマニフェスト**: `gemini-extension.json`（メタデータとグローバル設定）
- **ビルド成果物**: `dist/`（CLI が実際に実行するファイル群。直接編集禁止）
- **三大コンポーネント**: Hooks, Skills, Agents（詳細は Section 3 参照）

### 2. 設定ファイル (Configuration)
拡張機能の挙動を定義する 2 つの JSON ファイル。

#### gemini-extension.json (ルートディレクトリ)
拡張機能の基本情報、カスタムコマンド、スキル、MCP サーバを定義する。
- **バリデーション**: `gemini-extension.schema.json` を使用して、エディタ上で検証を行うこと。

#### hooks/hooks.json
どのツールやイベントでどのスクリプトを起動するかを定義する。
- **重要**: CLI はこのファイルを直接探しに行く。`${extensionPath}` 変数を使用して、`dist/` 内の成果物を指定する。

### 3. 三大コンポーネント (Hooks, Skills, Agents)
本拡張機能の機能を支える三本柱。

- **Hooks (インターセプター)**: ツールの実行前後に介入する同期スクリプト。
- **Agent Skills (専門知識)**: 特定のタスクに特化した指示書 (`SKILL.md`) とリソースのパッケージ。
- **Sub-agents (自律エージェント)**: 特定の役割（設計、レビュー等）を持つ専門エージェントの定義。

---

## パート II: 開発ワークフロー (Development Workflow)

### 4. 開発環境のセットアップ (Symbolic Link)
本プロジェクトでは、開発中の変更を即座に反映させるため **シンボリックリンク (`link`)** 方式を標準としている。

```bash
# プロジェクトルートで実行
gemini extensions link .
```

これにより、`~/.gemini/extensions/` 内に本ディレクトリへのリンクが作成される。以後は `npm run build` を実行するだけで CLI 側の挙動が更新される。

**重要 (サブエージェントの有効化)**:
サブエージェント（`agents/`）を動作させるには、`settings.json` で `"experimental": { "enableAgents": true }` の設定が必要である。動作しない場合は、`/settings` からこの項目（実験的機能）を確認すること。

### 5. 各コンポーネントの開発手順

#### 5.1 Hook (Linter 等) の開発
- **詳細仕様**: `docs/reference/hooks-spec.md` を参照。
- **手順**:
  1. `hooks/scripts/` 内に `.cjs` ソースを作成。
  2. `npm run build` で `dist/hooks/` へビルド。
  3. `hooks/hooks.json` でイベントとマッチャーを設定。
- **注意**: Hook の定義（`hooks.json`）を変更した場合は、CLI の再起動が必要。

#### 5.2 スキル (Skills) の作成
- **詳細仕様**: `docs/reference/skills-spec.md` を参照。
- **手順**:
  1. `skills/` 内にディレクトリを作成（名前はスキル名と一致させる）。
  2. `SKILL.md` に YAML フロントマターとエージェントへの指示を記述。
  3. `scripts/` や `references/` に必要な知識やコードを同梱。

#### 6.3 サブエージェント (Agents) の定義
- **詳細仕様**: `docs/reference/agents-spec.md` を参照。
- **手順**:
  1. `agents/` 内に `.md` ファイルを作成。
  2. フロントマターで `name`, `description`, `tools` を定義。
  3. プロンプト本文にペルソナとワークフローを記述。

### 6. ビルドとテスト
- **ビルド**: `npm run build`。ビルドを忘れると、CLI は `dist/` 内の古い成果物を実行し続ける。
- **テスト**: `npm test`。命名規則は `[対象ファイル名].test.js` とし、データは `tests/fixtures/` に隔離する。

### 7. CI/CD と自動リリース (GitHub Actions)
`dev` ブランチへのプッシュにより、`main` ブランチへの自動デプロイとタグ付けが行われる。
- **マニフェスト同期**: `git commit -m "vX.Y.Z"` 実行時に `IDD Sync Hook` によりバージョンが自動同期・追加ステージングされる。
- **配布専用ブランチ**: `main` は配布専用であり、ソースコードを含まないクリーンな構成で運用される。

---

## 8. 配布と同梱設定 (.geminiignore)
インストール時にコピーされるファイルの制御。
- **同梱**: `dist/`, `hooks/hooks.json`, `gemini-extension.json`, `skills/`, `agents/`, `README.md`
- **除外**: `hooks/scripts/` (ソース), `tests/`, `node_modules/`, `tools/`
