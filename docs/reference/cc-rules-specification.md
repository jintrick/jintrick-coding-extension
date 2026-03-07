# Claude Code Rules Specification (.claude/rules)

本ドキュメントは、Claude Code (以下 cc) におけるプロジェクト固有のルール管理システムである `.claude/rules/` の仕様と、その Gemini CLI への移植指針を定義する。

---

## 1. 概要 (Overview)

cc は、プロジェクト全体に適用される `CLAUDE.md` に加え、より細分化された規約を管理するために `.claude/rules/` ディレクトリを使用する。
従来の単一ファイルによる「全域統治」から、ディレクトリ階層やファイル形式に応じた「分散型ガバナンス」への進化を目的としている。

## 2. ディレクトリ構造 (Directory Structure)

ルールはプロジェクトの任意の階層に配置された `.claude/rules/` ディレクトリ内の Markdown ファイルとして定義される。

- **Root Rules**: `[Project Root]/.claude/rules/`
- **Scoped Rules**: `[Sub Directory]/.claude/rules/`（より深い階層のルールが上位をオーバーライドする）

## 3. フロントマター・スキーマ (Frontmatter Schema)

各ルールファイルは、以下の YAML フロントマターを持つ。

```yaml
---
# ルールの有効化条件（必須）
# always_on: 常にプロンプトに注入
# glob: globs フィールドに合致するファイル操作時に注入
# manual: ユーザーが明示的に指定した場合に有効化
# model_decision: モデルが「このルールが必要だ」と判断した際にロード
trigger: glob | always_on | manual | model_decision

# ルールの概要（推奨）
# モデルがこのルールを読み込むべきか判断するための材料
description: "React コンポーネントの命名規則とディレクトリ構成"

# 適用対象のパスパターン（trigger: glob の場合に必須）
# minimatch 互換の glob パターン（配列または単一文字列）
globs: 
  - "src/**/*.tsx"
  - "src/**/*.ts"
---
```

## 4. 統合メカニズム (Integration Logic)

### A. 起動時のインデックス化 (Discovery)
システムは起動時に全ディレクトリをスキャンし、`.claude/rules/*.md` のメタデータ（trigger, globs, description）をインデックス化する。

### B. 動的なプロンプト合成 (Synthesis)
1. **静的注入**: `always_on` ルールはセッション開始時からシステムプロンプトに常駐する。
2. **状況的注入 (JIT)**:
   - ファイルの読み書き (`read_file`, `write_file`, `edit`) 時に、対象パスを `globs` と照合。
   - マッチしたルールの**概要 (Description)** または **本文 (Content)** を動的にコンテキストへ追加する。

## 5. モデルへの指示 (Agent Instructions)

cc は、モデルに対し以下の作法を要求する。

- **自律的参照**: 「関連する規約が `.claude/rules/` にある場合は、自ら `read_file` して詳細を確認せよ」。
- **最小限の常駐**: プロンプトの肥大化を防ぐため、常に全てのルールを注入するのではなく、必要に応じて「脳内の短期記憶」に読み込ませる。

---

## 6. Gemini CLI への移植指針

本プロジェクトでは、この仕様を Gemini CLI の `Hooks` を用いて再現する。

1. **Indexer (SessionStart)**: ルールのメタデータをキャッシュし、CWD ごとに管理する。
2. **Injector (BeforeModel)**: `always_on` ルールの注入と、現在のコンテキストに基づいたルールの「ヒント」を注入する。
3. **Linter Connection**: ルールに記載された具体的制約（例: `npm test を通せ`）を、フックが物理的なバリデーションコマンドとして実行し、違反をブロックする。
