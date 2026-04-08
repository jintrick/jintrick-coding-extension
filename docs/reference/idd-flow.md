# IDD (Issue-Driven Development) 開発フロー

本プロジェクトにおける開発は、gemini 以外の実装用エージェント（Jules or Antigravity）を活用する。

## ステージ 1: 起草 (Drafting)
- `issue-crafter` サブエージェントを使用して Issue を起草する。
- この段階で実装コード（`.js`, `.cjs` 等）を書いてはならない。

## ステージ 2: 承認 (Review)
- jintrick に対し、Issue の内容の確認と承認を求める。明確な承認を得るまで次のステップへ進んではならない。

## ステージ 3: 確定 (Commit Plan)
- **Jules 使用時**: Issue 文書を `dev` ブランチにコミットする。
- **直接作業 (Antigravity/Gemini) 時**: `dev` から作業ブランチ `issue/vX.Y.Z` を作成し、Issue を配置する。

## ステージ 4: 実装 (Implementation)
- **Jules 使用時**: `/jules` コマンドで依頼し、自動生成される PR を待機する。
- **直接作業時**: 
  1. 作業ブランチ上でコードを修正し、`npm run build` でビルド成果物を更新する。
  2. コミット前に、Issue 文書 (`docs/issue/vX.Y.Z.md`) を最終化（ステータスを `completed` に変更、DoD にすべてチェック）し、実装成果物と同時にコミットする。

## ステージ 5: 検証 (Verification)
- **自動テスト**: `npm test` を実行し、全てのテストがパスすることを確認する。
- **実機検証**: ビルド成果物 (`dist/`) および生成スキル (`skills/`) が正しく動作するか確認する。
- **ユーザー確認**: 検証結果を報告し、最終的な合格（Go）を得る。

## ステージ 6: デプロイ (Deploy)
1. **統合**:
   - **PR 使用時**: `gh pr merge --merge --delete-branch` を実行。
   - **直接作業時**: `dev` ブランチへマージ（または直接プッシュ）し、作業ブランチを削除する。
2. **完了**: `dev` ブランチをリモートへプッシュする。これにより GitHub Actions が起動し、自動的に `main` へのデプロイとタグ付けが行われ、Issue は完結する。

## 禁止事項
- 承認を得る前のコード実装。
- `main` ブランチへの直接的なコミットまたはマージ。
- PowerShell 以外（bash等）のコマンド使用（Windows環境）。
- シェルコマンドでの `&&` の使用。
