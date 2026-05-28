---
name: jintrick-tools
description: 物理的事実に基づいた Issue テンプレートの提供およびバージョン管理。
---

# Jintrick Tools

このスキルは、jintrickの開発プロジェクトにおけるスクリプトツールのカタログを提供する。


## Issue テンプレート生成

`scripts/generate-template.cjs` を実行することで、現在の Git ブランチ、システム日付、package.json から `id`, `created`, `type` を自動抽出し、`references/TEMPLATE.md` に埋め込んだ「物理的正装」済みのテンプレートを生成できる

## バージョン推論

`scripts/infer-next-version.cjs` を通じ、次期バージョンを推論する。引数に現在のバージョンを指定できるほか、省略した場合は現在のプロジェクトの `package.json` から自動取得する。
