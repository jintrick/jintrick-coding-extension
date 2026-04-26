const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * Markdown "Human Linter" Module (v2.18.0)
 * 各 OS の標準オープナーを使用してエディタを完全にデタッチして起動し、Gemini CLI をブロックしないようにする。
 */
module.exports = function(content, filePath, tool_name) {
  try {
    const tempDir = os.tmpdir();
    const fileName = path.basename(filePath);
    const tempFilePath = path.normalize(path.join(tempDir, `preview_${Date.now()}_${fileName}`));

    fs.writeFileSync(tempFilePath, content, 'utf8');

    const platform = os.platform();
    const isWin = platform === 'win32';
    const isMac = platform === 'darwin';
    
    let cmd, args;
    const customEditor = process.env.EDITOR;

    if (customEditor) {
      if (isWin) {
        cmd = 'cmd.exe';
        args = ['/c', 'start', '""', customEditor, tempFilePath];
      } else {
        cmd = customEditor;
        args = [tempFilePath];
      }
    } else {
      if (isWin) {
        cmd = 'cmd.exe';
        args = ['/c', 'start', '""', 'notepad', tempFilePath];
      } else if (isMac) {
        cmd = 'open';
        args = [tempFilePath];
      } else {
        cmd = 'xdg-open';
        args = [tempFilePath];
      }
    }

    process.stderr.write(`[Human Linter] Preview created: ${tempFilePath} (Command: ${cmd} ${args.join(' ')})\n`);

    /**
     * 【完全デタッチのための条件】
     * 1. detached: true -> 子プロセスを独立したプロセスグループにする
     * 2. stdio: 'ignore' -> 親プロセスの入出力ハンドルを継承しない（CLIブロッキング防止）
     * 3. windowsHide: true -> Windows における不要なコンソールウィンドウのフラッシュを防ぐ
     */
    const child = spawn(cmd, args, {
      detached: true,
      stdio: 'ignore',
      windowsHide: true,
      shell: (!isWin && customEditor) ? true : false
    });

    child.unref();

  } catch (error) {
    process.stderr.write(`[MD Linter] Fatal Error: ${error.message}\n`);
  }

  return { valid: true };
};
