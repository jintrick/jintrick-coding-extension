# Release Process Guide

バージョン同期（`release-manager` スキル実行）完了後の手順は、現在のブランチに応じて以下のいずれかを選択する。

## A. 標準フロー (Feature ブランチでの作業時)
PR を作成し、レビューを経て `dev` に統合する場合。

1.  **ステージングとコミット**:
    ```bash
    git add .
    git commit -m "v<Version>: release"
    ```

2.  **プッシュ**:
    ```bash
    git push origin HEAD
    ```

3.  **マージとクリーンアップ**:
    ```bash
    gh pr merge --merge --delete-branch
    git checkout dev
    git pull origin dev
    ```

## B. 軽量フロー (`dev` ブランチでの作業時)
軽微な修正や、直接 `dev` にプッシュしてリリースを確定させる場合。

1.  **ステージングとコミット**:
    ```bash
    git add .
    git commit -m "v<Version>: release"
    ```

2.  **プッシュ**:
    ```bash
    git push origin dev
    ```

3.  **同期**:
    （ローカルとリモートが一致していることを確認）
    ```bash
    git status
    ```
