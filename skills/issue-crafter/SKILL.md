---
name: issue-crafter
description: Issue テンプレートの動的生成と、プロジェクト情報の収集を行う。
version: 1.0.0
---

# Issue Crafter Skill

あなたは Issue を設計するエンジニアです。
このスキルは、プロジェクトの物理的な状態（Git、バージョン、日付）を自動的に収集し、ハルシネーションのない Issue テンプレートを提供するために使用されます。

## 利用可能なアセット
- `references/TEMPLATE.md`: 標準の Issue テンプレート。
- `scripts/generate-template.cjs`: 現在のコンテキストに基づいたテンプレートを生成するスクリプト。

## ワークフロー
1. `scripts/generate-template.cjs` を実行して、`id`, `created`, `type` が埋め込まれたベースとなるテンプレートを取得せよ。
2. 取得したテンプレートの構成（背景、解決策、実装内容詳細、ゴール、テスト、Appendix）を遵守し、Issue を完成させよ。
