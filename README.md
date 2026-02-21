# jintrick-coding-extension
Linter、専門スキル、サブエージェントを統合し、Gemini CLI での IDD フローに基づいた作業を支援する拡張機能です。

## 主要機能
- **Hooks**: ファイル書き込み時の自動バリデーションと Windows 環境でのコマンド補完。
- **Skills**: Gemini CLI の仕様、設計、IDD プロセスに関する専門知識の提供。
- **Agents**: 設計（@issue-crafter）と検証（@code-reviewer）に特化したサブエージェント。

## 🛠️ トラブルシューティングとサポート (Support Guide)
動作に不具合がある場合、以下の手順で GitHub から最新安定版を再インストールしてください。

1. **既存の拡張機能をアンインストール**:
   ```bash
   gemini extensions uninstall jintrick-coding-extension
   ```
2. **最新安定版をインストール**:
   ```bash
   gemini extensions install https://github.com/jintrick/jintrick-coding-extension --consent
   ```
3. **CLI を完全に再起動**: 
   Hook の変更を反映させるには、現在のセッションを終了し、CLI を新しく立ち上げ直す必要があります。
