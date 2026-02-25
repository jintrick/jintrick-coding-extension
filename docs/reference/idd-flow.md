# IDD (Issue-Driven Development) 開発フロー

本プロジェクトにおける開発は、AI エージェント (Jules) を活用した以下の簡素化された手順に従って進行する。

## ステージ 1: 起草 (Drafting)
1.  **Issue作成**: `docs/issue/vX.Y.Z.md` を作成する。
2.  **テンプレート遵守**: `docs/issue/TEMPLATE.md` の構成に従って記述する。
3.  **実装の禁止**: この段階で実装コード（`.js`, `.cjs` 等）を書いてはならない。

## ステージ 2: 承認 (Review)
1.  **レビュー依頼**: jintrick に対し、Issue の内容の確認と承認を求める。
2.  **待機**: jintrick から明確な承認（「Go」「OK」等）を得るまで、次のステップへ進んではならない。

## ステージ 3: 確定 (Commit Plan)
1.  **ステータス更新**: Issue のステータスを進行中 (`in-progress`) に変更する。
2.  **計画のコミット**: 承認された Issue 文書を `dev` ブランチにコミットする。
    ```bash
    git add docs/issue/vX.Y.Z.md
    git commit -m "docs: start issue vX.Y.Z"
    ```

## ステージ 4: 実装 (Implementation with Jules)
1.  **Jules への依頼**: `jules-client` スキルを使用し、`dev` ブランチをベースに実装を依頼する。
    ```bash
    # コマンド例
    /jules "Implement docs/issue/vX.Y.Z.md" --branch dev
    ```
2.  **PR 作成**: Jules が自動的に PR を作成するのを待つ。

## ステージ 5: 検証 (Verification)
1.  **PR チェックアウト**: 作成された PR をローカルにチェックアウトする。
2.  **自動テスト**: `npm test` を実行し、全てのテストがパスすることを確認する。
3.  **実機検証**: ビルド成果物 (`dist/`) が正しく動作するか確認する。
    *   `npm run build` で `dist/` を更新。
    *   `/extensions restart` (Skills/Commands反映) または CLI 再起動 (Hooks反映) を行う。

## ステージ 6: 事後処理 (Closure Preparation)
1.  **Issue更新**: ステータスを `completed` に変更し、解決コミット等のメタデータを記入する。
2.  **最終コミット**: 実装成果と更新した Issue を PR ブランチにコミットする。

## ステージ 7: リリースと最終完了 (Release & Final Completion)
1.  **リリース準備**: PR ブランチ上で `/done vX.Y.Z` コマンドを実行する。
    *   `release-manager` スキルによりバージョンが同期される。
    *   `RELEASE.md` に基づき、コミット等の後続作業を行う。
2.  **マージ**: PR を `dev` ブランチへマージする。
    ```bash
    gh pr merge --merge --delete-branch
    ```
3.  **デプロイ**: `dev` ブランチをリモートへプッシュする。これにより GitHub Actions が起動し、自動的に `main` へのデプロイとタグ付けが行われる。
    ```bash
    git checkout dev
    git pull origin dev
    git push origin dev
    ```
4.  **フロー完了**: ここで全ての IDD フローが完了したとみなす。

## 禁止事項
- 承認を得る前のコード実装。
- `main` ブランチへの直接的なコミットまたはマージ。
- PowerShell 以外（bash等）のコマンド使用。
- シェルコマンドでの `&&` の使用。
