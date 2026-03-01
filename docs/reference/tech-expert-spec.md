# Tech-Expert Agent & Plug-and-Play RAG Specification

本ドキュメントでは、Gemini CLI の拡張機能として実装される統合型ナレッジ・サブエージェント `tech-expert` と、その背後にあるプラグアンドプレイ型の RAG (Retrieval-Augmented Generation) アーキテクチャの仕様を定義する。

## 1. アーキテクチャの目的
従来の技術スタック（React, MUI, Python等）ごとに専用のサブエージェントを定義するアプローチは、管理コストの増大とコンテキストの断片化を招く。
本アーキテクチャの目的は、**単一のエージェント (`tech-expert`) が、プロジェクトの環境に応じて必要な知識を動的にロードする**「オンデマンド知識エンジン」を構築することである。

## 2. システム構成コンポーネント

システムは以下の 3 つの主要コンポーネントから構成される。

1. **プラグアンドプレイ・モジュール群** (`skills/tech-expert/*`)
2. **自動検知・周知フック** (`hooks/scripts/tech_stack_discovery_hook.cjs`)
3. **ナレッジ・ルーター・エージェント** (`agents/tech-expert.md`)

---

## 3. プラグアンドプレイ・モジュールの仕様
新しい技術の知識を追加する際は、`skills/` 配下に `tech-expert-` というプレフィックスを持つディレクトリを作成し、以下の 3 つの要素を配置する。**コードの修正は一切不要である。**

### ディレクトリ構造例
```text
skills/
├── tech-expert-react/
│   ├── manifest.json  (必須: 検知条件とメタデータ)
│   ├── SKILL.md       (必須: エージェントへの個別指示)
│   └── references/    (任意: RAGとして読み込ませるドキュメント群)
```

### `manifest.json` のスキーマ
フックやエージェントが、その技術を「いつ、どのように使うべきか」を判断するためのメタデータ。

```json
{
  "id": "tech-expert-react",
  "name": "React v19 Expert",
  "description": "React のコンポーネント設計、Hooks の仕様に関する専門知識。",
  "detectors": [
    {
      "type": "file_contains",
      "file": "package.json",
      "pattern": "\"react\""
    },
    {
      "type": "file_exists",
      "file": "next.config.js"
    }
  ]
}
```
- `id`: スキルディレクトリ名と完全に一致させる。
- `detectors`: このモジュールをアクティブにするための条件リスト（OR条件）。

---

## 4. 自動検知・周知フック (`SessionStart`)
プロジェクト開始時（または `/clear` 時）に一度だけ実行され、環境をスキャンしてエージェントに利用可能な専門家を教え込む。

### ワークフロー
1. `skills/tech-expert-*/manifest.json` を全走査する。
2. カレントディレクトリ（プロジェクトルート）のファイルと `detectors` の条件を照合する。
3. マッチした技術スタックのリストを抽出する（例：`["react", "mui"]`）。
4. **コンテキスト注入**: `hookSpecificOutput.additionalContext` を介して、以下の「命令」をセッション履歴の先頭ターンに書き込む。

**注入される命令（例）:**
> [SYSTEM NOTIFICATION: TECHNICAL CONTEXT FOUND]
> 本プロジェクトにおいて以下の技術スタックが検出されました: React v19 Expert, Material UI
> エージェントは、これらの技術に関する設計、実装、エラー解決の要求を受けた場合、推測による回答を禁じます。必ず `tech-expert` サブエージェントを呼び出し、正確な仕様を確認した上で回答してください。

---

## 5. ナレッジ・ルーター・エージェント (`tech-expert`)
メインエージェントから呼び出された際に起動する、一時的（トランザクショナル）なサブエージェント。

### ペルソナと役割
- 自身は最初から特定の技術を知っているわけではない。
- 起動直後に `list_directory` を用いて `skills/tech-expert/` をスキャンし、自身が「何の専門家になれるか」を把握する。
- ユーザー（メインエージェント）の質問内容と照らし合わせ、最も適切な技術の `SKILL.md` を `activate_skill` ツールでロードする。

### 動的スキルのロード
`activate_skill` を実行すると、その技術ディレクトリにある `SKILL.md` が読み込まれ、`tech-expert` のコンテキストが「その技術の専門家」として上書きされる。回答を終えてセッションが終了すると、その知識はリセットされ、メインエージェントのコンテキストを汚染しない。
