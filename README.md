# jintrick-coding-extension

Gemini CLI でのコーディング体験を劇的に向上させるための、フックとスキルの統合エクステンションです。

## 概要

このエクステンションは、ファイルの書き込み前の自動バリデーション（リンター）や、スキルの自動更新管理、および高度なコーディング支援・管理用スキルを一つにパッケージ化したものです。

## 主要機能

### 1. インテリジェント・フック (Hooks)

`hooks/hooks.json` で定義されており、Gemini CLI の特定の動作に介入します。

*   **linter-hook**: 
    *   `write_file` または `replace` ツールが実行される直前に動作します。
    *   書き込み内容に構文エラーがないかチェックし、エラーがある場合は書き込みをブロックして修正を促します。
    *   サポート言語: JSON, Markdown, JavaScript (.js, .cjs, .mjs), TypeScript (.ts)

### 2. 特化型スキル (Agent Skills)

`skills/` ディレクトリ配下に、特定のタスクに特化したエージェント・スキルが含まれています。

*   **gemini-cli-expert**: Gemini CLI の仕様、設計、開発に関する専門知識を提供します。
*   **jules-client**: Jules API を介して AI コーディングセッションを管理します。
*   **rag-installer**: 任意のディレクトリに対して RAG 知識ベースをインストールします。
*   **skill-installer**: `.skill` ファイルのパッケージ化、インストール、管理を行います。

## ディレクトリ構成

```text
jintrick-coding-extension/
├── gemini-extension.json      # エクステンション定義
├── README.md                  # 本ドキュメント
├── hooks/
│   ├── hooks.json             # フック設定
│   └── scripts/               # フックスクリプト本体
│       ├── linter_hook.cjs
│       └── linters/           # 各言語用リンター
└── skills/                    # 各種エージェント・スキル
    ├── gemini-cli-expert/
    ├── jules-client/
    ├── rag-installer/
    └── skill-installer/
```

## インストール方法

### 開発用リンク (推奨)

リポジトリのルートディレクトリで以下のコマンドを実行することで、シンボリックリンクとしてインストールできます。これにより、開発中の変更が即座に反映されます。

```bash
gemini extensions link .
```

### Git からのインストール

```bash
gemini extensions install https://github.com/jintrick/jintrick-coding-extension
```

## 使い方

エクステンションをインストール・有効化すると、フックは自動的に動作を開始します。スキルは必要に応じて Gemini が自動的にアクティベートするか、`/skills activate <name>` で手動で有効化できます。

## 開発と拡張

新しいリンターを追加する場合は `hooks/scripts/linters/` に `[拡張子].cjs` を作成してください。新しいスキルを追加する場合は `skills/` ディレクトリに配置し、`gemini-extension.json` の設定を確認してください。
