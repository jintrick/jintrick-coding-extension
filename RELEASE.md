# Release Process Guide

**バージョン同期完了後の手順**

`release-manager` スキルによるバージョン更新が完了したら、以下の手順でリリースを確定させ、PR をクローズすること。

1.  **ステージングとコミット**:
    作業ブランチで変更をコミットする。
    ```bash
    git add .
    git commit -m "v<Version>: release"
    ```

2.  **プッシュ**:
    PR ブランチをリモートへプッシュする。
    ```bash
    git push origin HEAD
    ```

3.  **マージとクリーンアップ**:
    PR を `dev` ブランチへマージし、作業ブランチを削除して `dev` に戻る。
    ```bash
    gh pr merge --merge --delete-branch
    git checkout dev
    git pull origin dev
    ```
