# Code Review Guide: jintrick-coding-extension

本プロジェクトのレビューでは、エージェントによる「自動生成・自動修正」が安全かつ確実に機能することを最優先とする。
レビュアー（およびサブエージェント）は、以下の基準に基づき、厳格かつ批判的にコードを評価せよ。

## 構文と実行の安全性
- 新しい Linter の追加時、acorn や typescript などのパーサが正しく設定されているか。
- エラーハンドリング: パース失敗やファイル欠落時に allow（安全側に倒す）か deny（危険を止める）かが意図通りか。

## IDD (Issue-Driven Development) プロセスの遵守
- ビルドの明示: dist/ 成果物が npm run build によって更新されており、ソースコードとの整合性が保たれているか。
- バージョン同期: `git commit -m "vX.Y.Z"` 実行時に `IDD Sync Hook` によって package.json と gemini-extension.json のバージョンが 自動的に同期されているか。

## 拡張機能マニフェストと自動発見 (Manifest & Auto Discovery)
- **マニフェストの最小化**: `gemini-extension.json` に `commands`, `skills`, `agents`, `hooks` を明示的に列挙してはならない。これらは Auto Discovery によって解決されるべきである。
- **配置の正当性**: 各コンポーネントが正しいディレクトリ（`commands/*.toml`, `skills/*/SKILL.md`, `agents/*.md`, `hooks/hooks.json`）に配置されているか。

## スキル定義の整合性 (Skill Definitions)
- **YAML フロントマターの必須**: すべての `SKILL.md` の冒頭に、正しい形式の YAML フロントマター（`---` で囲まれた `name`, `description`, `version`）が含まれているか。これが欠落していると、CLI の Auto Discovery によってスキルが認識されない。
- **エンコーディング**: `SKILL.md` および設定ファイルが UTF-8 (BOMなし) で保存されており、文字化けが発生していないか。

## パフォーマンスとトークン効率
- 低遅延 Hook: ツール実行ごとに呼ばれる Hook は極めて高速である必要がある。不要なディスク I/O や重い処理が含まれていないか。
- サブエージェント設計: サブエージェントのプロンプトは、プロジェクトに依存しない「汎用的エンジン」として設計されているか。

## 検証手順 (Verification Steps)
レビューにあたっては、必ず以下の手順で実装内容を検証すること。
1. **依存関係の同期**: `npm install` を実行し、パッケージを最新にする。
2. **ビルド**: `npm run build` を実行し、`dist/` 成果物が正しく生成されるか確認する。
3. **テスト**: `npm test` を実行し、全テストがパスすることを確認する。
4. **型チェック/静的解析**: `npm run lint` や型チェックが通ることを確認する。

