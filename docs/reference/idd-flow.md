# IDD (Issue-Driven Development) 開発フロー

本プロジェクトにおける開発は、gemini 以外の実装用エージェント（Jules or Antigravity）を活用する。

## ステージ 1: 起草 (Drafting)
- `issue-crafter` サブエージェントを使用して Issue を起草する。
- この段階で実装コード（`.js`, `.cjs` 等）を書いてはならない。

## ステージ 2: 承認 (Review)
- jintrick に対し、Issue の内容の確認と承認を求める。明確な承認を得るまで次のステップへ進んではならない。

## ステージ 3: 確定 (Commit Plan)
- **Jules 使用時**: Issue 文書が作業ブランチにコミットされていることを確認する。
- **直接作業 (Antigravity/Gemini) 時**: すでに `issue-crafter` によって作成された作業ブランチ上で作業を継続する。

## ステージ 4: 実装 (Implementation)
- **Jules 使用時**: `/jules` コマンドで依頼し、自動生成される PR を待機する。
- **直接作業時**: 
  1. 作業ブランチ上でコードを修正し、`npm run build` でビルド成果物を更新する。
  2. 実装が完了したら、Issue 文書 (`docs/issue/vX.Y.Z.md`) を最終化（ステータスを `completed` に変更、DoD にすべてチェック）する。
  - **重要**: この段階で手動の `git commit` を実行してはならない。

## ステージ 5: 検証と最終化 (Verification & Finalization)
- **自動テスト**: `npm test` を実行し、全てのテストがパスすることを確認する。
- **実機検証**: ビルド成果物 (`dist/`) および生成スキル (`skills/`) が正しく動作するか確認する。
- **ユーザー確認**: 検証結果を報告し、最終的な合格（Go）を得る。
  - **Jules 使用時**: `/review` コマンドによる詳細レビューがすべて合格した後に `issue-closer` を起動する。
- **最終化**: `issue-closer` サブエージェントを起動し、コミット、バージョン同期、およびブランチ統合の全行程を一任する。
  - `issue-closer` はブランチ名から自動的に直接作業ケース（`vX.Y.Z` 等）か Jules 実装ケースかを判別し、Jules 使用時はマージ前のバージョン同期コミットや `gh pr merge --squash` 等の専用クローズ処理を実行する。

## ステージ 6: デプロイ (Deploy)
- **自動化**: `issue-closer` が統合を完了し、リモートの `dev` ブランチへプッシュを行う。
- これにより GitHub Actions が起動し、自動的に `main` へのデプロイとタグ付けが行われ、Issue は完結する。

## 禁止事項
- 承認を得る前のコード実装。
- `main` ブランチへの直接的なコミットまたはマージ。
- PowerShell 以外（bash等）のコマンド使用（Windows環境）。
