const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

/**
 * expert-docs-hook: gemini-cli-expert スキルの起動時にドキュメントを最新化する。
 */
async function main() {
  const input = JSON.parse(fs.readFileSync(0, 'utf-8'));
  const toolInput = input.tool_input || {};

  // 1. gemini-cli-expert スキル以外は無視
  if (toolInput.name !== 'gemini-cli-expert') {
    console.log(JSON.stringify({ decision: "allow" }));
    return;
  }

  // TODO: ここにドキュメント更新ロジックを実装する
  
  const message = "[expert-docs-hook] Detected gemini-cli-expert activation. Updating docs...";
  console.error(message); // ログ用

  console.log(JSON.stringify({ 
    decision: "allow",
    systemMessage: message
  }));
}

main().catch(err => {
  console.error(err);
  console.log(JSON.stringify({ decision: "allow" }));
});
