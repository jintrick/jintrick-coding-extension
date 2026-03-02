# Tech-Expert Agent & Plug-and-Play RAG Specification

本ドキュメントでは、Gemini CLI の拡張機能として実装される統合型ナレッジ・サブエージェント `tech-expert` と、その背後にあるプラグアンドプレイ型の RAG (Retrieval-Augmented Generation) アーキテクチャの仕様を定義する。

## 1. アーキテクチャの目的
従来の技術スタック（React, MUI, Python等）ごとに専用のサブエージェントを定義するアプローチは、管理コストの増大とコンテキストの断片化を招く。
本アーキテクチャの目的は、**単一のエージェント (`tech-expert`) が、プロジェクトの環境に応じて必要な知識を動的にロードする**「オンデマンド知識エンジン」を構築することである。

## 2. システム構成コンポーネント

システムは以下の 3 つの主要コンポーネントから構成される。

1. **ナレッジ・ソース** (`knowledge/*`)
2. **自動検知・周知フック** (`hooks/scripts/tech_stack_discovery_hook.cjs`)
3. **ナレッジ・ルーター・エージェント** (`agents/tech-expert.md`)

---

## 3. プラグアンドプレイ・モジュールの仕様 (Zero-config Skill Promotion)
新しい技術の知識を追加する際は、プロジェクトルートの `knowledge/` 配下にその技術名のディレクトリを作成し、リファレンスとなるドキュメントを配置するだけである。**マニュアルでの `manifest.json` の作成は非推奨であり、ビルド時に自動生成される。**

### ディレクトリ構造例
```text
knowledge/
├── react/
│   ├── SKILL.md       (任意: エージェントへの個別指示。ない場合は自動生成される)
│   └── architecture.md (任意: RAGとして読み込ませるドキュメント群)
```

ビルド時 (`npm run build`) に `tools/build.cjs` がスキャンを行い、`dist/skills/tech-expert-<stack>` を自動生成する。
検知ルール (`detectors`) は `knowledge/<stack>/` 内のファイル構成 (`package.json`, `requirements.txt` 等) に基づいて自動推論され、完全なプラグアンドプレイを実現している。

---

## 4. 自動検知・周知フック (`SessionStart`)
プロジェクト開始時（または `/clear` 時）に一度だけ実行され、環境をスキャンしてエージェントに利用可能な専門家を教え込む。

### ワークフロー
1. `dist/skills/tech-expert-*/manifest.json` を全走査する。
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
- 起動直後に `list_directory` を用いて `dist/skills/tech-expert-*/` をスキャンし、自身が「何の専門家になれるか」を把握する。
- ユーザー（メインエージェント）の質問内容と照らし合わせ、最も適切な技術の `SKILL.md` を `activate_skill` ツールでロードする。

### 動的スキルのロード
`activate_skill` を実行すると、その技術ディレクトリにある `SKILL.md` が読み込まれ、`tech-expert` のコンテキストが「その技術の専門家」として上書きされる。回答を終えてセッションが終了すると、その知識はリセットされ、メインエージェントのコンテキストを汚染しない。
