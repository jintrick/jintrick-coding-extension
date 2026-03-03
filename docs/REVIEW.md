# Code Review Guide: jintrick-coding-extension

本プロジェクトのレビューでは、エージェントによる「自動生成・自動修正」が安全かつ確実に機能することを最優先とする。
レビュアー（およびサブエージェント）は、以下のチェックリストに基づき、厳格かつ批判的にコードを評価せよ。すべての項目が [x] になるまで承認してはならない。

## 構文と実行の安全性 (Syntax & Safety)
- [ ] **パーサ設定の整合**: 新しい Linter の追加時、acorn や typescript などのパーサが対象ファイルの言語仕様（ESM/CJS, TS version等）と一致しているか。
- [ ] **エラーハンドリングの極性**: パース失敗やファイル欠落時の挙動が、意図通り「安全側に倒れて（allow）」いるか、あるいは「危険を止めて（deny）」いるか。

## IDD (Issue-Driven Development) プロセスの遵守
- [ ] **ビルド成果物の同期**: `dist/` 内の成果物が `npm run build` によって更新されており、ソースコードの変更内容と 100% 一致しているか。
- [ ] **バージョン同期の自動化**: `package.json` のバージョン変更が、`gemini-extension.json` にも漏れなく反映されているか。

## 拡張機能マニフェストと自動発見 (Manifest & Auto Discovery)
- [ ] **マニフェストの最小化**: `gemini-extension.json` に `commands`, `skills`, `agents`, `hooks` が手動で列挙されていないか（Auto Discovery 機能を阻害していないか）。
- [ ] **ディレクトリ構造の正当性**: 各コンポーネントが、以下の規定通りのディレクトリに配置されているか。
    - Commands: `commands/*.toml`
    - Skills: `skills/*/SKILL.md`
    - Agents: `agents/*.md`
    - Hooks: `hooks/hooks.json`

## スキル定義の整合性 (Skill Definitions)
- [ ] **要件の完全充足**: **skillが、docs/reference/skills-spec.md の要件を満たしているか。**
- [ ] **配置場所の絶対規約**: スキルが拡張機能ルートの `skills/` 直下に配置されているか。**`dist/skills/` への配置は「無効」として即座に却下せよ。**
- [ ] **YAML フロントマターの存在**: すべての `SKILL.md` の冒頭に、正しい形式の YAML フロントマター（`name`, `description`, `version`）が含まれているか。
- [ ] **エンコーディングの遵守**: `SKILL.md` およびすべての設定ファイルが UTF-8 (BOMなし) で保存されているか。

## パフォーマンスとトークン効率
- [ ] **Hook の低遅延実行**: ツール実行ごとに呼び出される Hook 内で、不要なディスク I/O や重い同期処理、ループ処理が実行されていないか。
- [ ] **プロンプトの汎用設計**: サブエージェントのプロンプトが、特定のプロジェクト構造に依存せず、専門家としての「汎用的思考エンジン」として記述されているか。

## 検証手順 (Verification Steps)
レビュアーは、承認前に必ず以下の操作を実行し、その結果を事実として確認すること。
- [ ] `npm install` がエラーなく完了することを確認した。
- [ ] `npm run build` が正常に終了し、ビルドエラーが発生しないことを確認した。
- [ ] `npm test` を実行し、既存のテストおよび新規追加されたテストがすべてパスすることを確認した。
- [ ] `npm run lint` および `tsc` (型チェック) が警告なしで終了することを確認した。
