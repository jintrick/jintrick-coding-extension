# Release Manager Skill

## 概要
リリース準備作業（バージョンの同期、RELEASE.mdに基づく後続作業の案内）を決定論的に実行するスキル。

## ワークフロー

1.  **バージョンの同期と検証**:
    - `run_shell_command` で `node skills/release-manager/scripts/update_version.cjs <version>` を実行する。
    - **検証**: 指定されたバージョンが SemVer 形式（例: `1.0.0`, `v1.2.3`）であるか自動的に検証される。不正な形式の場合はエラーとなり処理は中断される。
    - **同期**: 検証を通過した場合、プロジェクト内のマニフェストファイル（`package.json`, `pyproject.toml`, `Cargo.toml` 等）を自動検出し、バージョンを更新する。

2.  **リリース手順の確認**:
    - `read_file` で `RELEASE.md` の内容を確認する。

3.  **後続アクションの案内**:
    - **`RELEASE.md` が存在する場合**:
        - その内容に従い、必要なステージング、コミットコマンドの提示、または追加の検証手順を案内する。
    - **`RELEASE.md` が存在しない場合**:
        - 標準的なプロジェクト規約（`docs/reference/idd-flow.md` 等）に従い、リリース完了に向けた作業（git add, git commit, git pushなど）を案内する。
