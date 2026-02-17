const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Markdown "Human Linter" Module
 * 書き込み予定の内容を実ファイルに先行書き込みし、VSCode で開いて目視確認を促す。
 * ユーザーが編集・保存してタブを閉じたら、その内容が確定する。
 * エージェント側には deny を返し、自動上書きを阻止する。
 */
module.exports = function(content, filePath, tool_name) {
  try {
    // 1. 先行書き込み (Pre-write)
    // ターゲットファイルに直接書き込む
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, content, 'utf8');

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
};
