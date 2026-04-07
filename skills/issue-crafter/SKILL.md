---
name: issue-crafter
description: 物理的事実に基づいた Issue テンプレートの提供。
---

# Issue Crafter

## 機能
`scripts/generate-template.cjs` を実行することで、現在の Git ブランチ、システム日付、package.json から `id`, `created`, `type` を自動抽出し、`references/TEMPLATE.md` に埋め込んだ「物理的正装」済みのテンプレートを生成する。

## ワークフロー
1. `scripts/generate-template.cjs` を実行し、解決済みのテンプレートを取得せよ。
2. 以降の設計はすべてこのテンプレートのフロントマターを Ground Truth とせよ。
