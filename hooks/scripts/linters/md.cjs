const cp = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Markdown "Human Linter" Module
 * 書き込み予定の内容を実ファイルに先行書き込みし、VSCode で開いて目視確認を促す。
 * ユーザーが編集・保存してタブを閉じたら、その内容が確定する。
 * エージェント側には deny を返し、自動上書きを阻止する。
 * 
 * Update v1.3.1: Check for interactive environment and VSCode availability.
 */
function mdLinter(content, filePath, tool_name) {
  // Dependency Injection for testing
  const execSync = mdLinter.execSync || cp.execSync;
  const writeFileSync = mdLinter.writeFileSync || fs.writeFileSync;
  const existsSync = mdLinter.existsSync || fs.existsSync;
  const mkdirSync = mdLinter.mkdirSync || fs.mkdirSync;
  const _process = mdLinter.process || process;

  // Check for CI environment and VSCode availability
  const isCI = !!_process.env.CI || _process.env.TERM === 'dumb';
  
  let hasCode = false;
  try {
    const checkCommand = _process.platform === 'win32' ? 'where code' : 'which code';
    execSync(checkCommand, { stdio: 'ignore' });
    hasCode = true;
  } catch (e) {
    hasCode = false;
  }

  if (isCI || !hasCode) {
    console.error(`[Human Linter] Skipping manual review (CI: ${isCI}, code: ${hasCode})`);
    return { valid: true };
  }

  try {
    // 1. 編集待機 (Wait for User Edit)
    // 本体による書き込みは既に完了しているため、そのまま VSCode で開く
    console.error(`[Human Linter] Opening ${filePath} in VSCode for manual review...`);
    execSync(`code -w "${filePath}"`);

    console.error(`[Human Linter] User closed the file. Returning feedback to agent.`);
    
    // 2. フィードバック (Feedback to Agent)
    // valid: false を返しつつ、結果を置換して additionalContext を付与する
    return {
      valid: false,
      reason: "User has manually verified and edited the content in VSCode. This content is now final.",
      systemMessage: "User has manually verified and edited the content in VSCode.",
      hookSpecificOutput: {
        additionalContext: "The user has reviewed your proposed markdown changes and made manual adjustments in VSCode. The file on disk now contains the final version approved by the user. Please proceed to the next task based on this fact."
      }
    };

  } catch (error) {
    console.error(`[MD Linter] Failed: ${error.message}`);
    return {
      valid: false,
      reason: `Linter failed: ${error.message}`,
      systemMessage: `Linter failed: ${error.message}`
    };
  }
}

module.exports = mdLinter;
