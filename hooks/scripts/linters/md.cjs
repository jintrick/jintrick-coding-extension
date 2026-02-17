const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * Markdown "Human Linter" Module (v1.5.4)
 * 書き込み予定の内容を一時ファイルに出力し、VSCode で開いて目視確認を促す。
 * エージェントをブロックせず、非同期にプレビューを表示する。
 */
module.exports = function(content, filePath, tool_name) {
  try {
    // 一時ファイルのパスを作成
    const tempDir = os.tmpdir();
    const fileName = path.basename(filePath);
    // 重複を避けるためタイムスタンプを付与
    const tempFilePath = path.join(tempDir, `preview_${Date.now()}_${fileName}`);

    // 書き込み予定の内容（メモリ上のデータ）を一時ファイルに書き出す
    fs.writeFileSync(tempFilePath, content, 'utf8');

    // VSCode で一時ファイルを開く (spawn detached)
    // Windows: cmd /c start "" code "path"
    // Unix: code "path"
    let child;
    if (process.platform === 'win32') {
      child = spawn('cmd', ['/c', 'start', '""', 'code', `"${tempFilePath}"`], {
        detached: true,
        stdio: 'ignore',
        windowsVerbatimArguments: true
      });
    } else {
      child = spawn('code', [tempFilePath], {
        detached: true,
        stdio: 'ignore'
      });
    }
    child.unref();

    // デバッグ用ログ (hooks/best-practices.md: Use stderr for logs)
    process.stderr.write(`[Human Linter] Preview created: ${tempFilePath}
`);
  } catch (error) {
    process.stderr.write(`[MD Linter] Failed: ${error.message}
`);
  }

  // 常に valid: true を返して、処理自体は継続させる
  return { valid: true };
};
