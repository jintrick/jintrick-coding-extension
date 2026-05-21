# Gemini CLI Lessons Learned

- **[Hooks]** `SessionStart` イベントで `systemMessage` を返すと、CLI の仕様（Hook Executor と Session Manager の重複処理）によりメッセージが 2 回表示される。これはフック側の実装では回避不能な CLI 側の挙動である。
- **[Jules]** `jules-client` スキルを使用する前に、必ず `commands/jules.toml` を参照せよ。プロジェクト固有の必須ワークフローを遵守するためである。
- **[IDD Flow / Jules]** IDDフロー（`docs/reference/idd-flow.md`）にはステージ4でJulesを使用するとあるが、そのIssue文書内にJulesへの移譲が明記されていない限り、ユーザーが現在のセッションで私（Gemini）に直接実装を求めている可能性がある。機械的にJulesを呼び出さず、要件や暗黙の前提が不明確な場合はどちらが実装するかユーザーに確認を取るか、自身で実装を進めること。
