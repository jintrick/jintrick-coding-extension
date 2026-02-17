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

  // Check for interactive environment and VSCode availability
  const isTTY = _process.stdout.isTTY && _process.env.TERM !== 'dumb';

  let hasCode = false;
  try {
    const checkCommand = _process.platform === 'win32' ? 'where code' : 'which code';
    execSync(checkCommand, { stdio: 'ignore' });
    hasCode = true;
  } catch (e) {
    hasCode = false;
  }

  if (!isTTY || !hasCode) {
    console.error(`[Human Linter] Skipping manual review (TTY: ${!!isTTY}, code: ${hasCode})`);
    return { valid: true };
  }

  try {
    // 1. 先行書き込み (Pre-write)
    // ターゲットファイルに直接書き込む
    const dir = path.dirname(filePath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    writeFileSync(filePath, content, 'utf8');

    // 2. 編集待機 (Wait for User Edit)
    // VSCode でファイルを開き、ユーザーが閉じるのを待つ (-w / --wait)
    console.error(`[Human Linter] Opening ${filePath} in VSCode for manual review...`);
    execSync(`code -w "${filePath}"`);

    console.error(`[Human Linter] User closed the file. Returning deny to prevent overwrite.`);
    
    // 3. 上書き阻止 (Deny Overwrite)
    return {
      valid: false,
      reason: "User manually verified and edited the file.",
      systemMessage: "User manually verified and edited the file."
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
