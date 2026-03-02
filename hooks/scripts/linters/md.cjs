const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * Markdown "Human Linter" Module (v1.26.0 - Truly Independent via VBS)
 * Windows 環境でエディタを完全にデタッチして起動し、Gemini CLI をブロックしないようにする。
 */
module.exports = function(content, filePath, tool_name) {
  try {
    const tempDir = os.tmpdir();
    const fileName = path.basename(filePath);
    const tempFilePath = path.normalize(path.join(tempDir, `preview_${Date.now()}_${fileName}`));

    fs.writeFileSync(tempFilePath, content, 'utf8');

    const isWin = os.platform() === 'win32';
    const editor = process.env.EDITOR || (isWin ? 'notepad' : 'vi');

    if (isWin) {
      // Windows: VBScript を一時的に作成して、WScript.Shell.Run で完全にデタッチして起動
      // 第2引数 0 (ウィンドウ非表示だが、start コマンドが実際のウィンドウを表示する)、第3引数 False (待機しない)
      const vbsPath = path.join(tempDir, `launcher_${Date.now()}.vbs`);
      const vbsContent = `Set WshShell = CreateObject("WScript.Shell")\nWshShell.Run "cmd /c start """" ""${editor}"" ""${tempFilePath}""", 0, False`;
      
      fs.writeFileSync(vbsPath, vbsContent, 'utf16le');
      
      try {
        execSync(`wscript.exe //B "${vbsPath}"`, { stdio: 'ignore' });
      } catch (e) {
        // フォールバック: 直接の execSync
        execSync(`start "" "${editor}" "${tempFilePath}"`, { stdio: 'ignore' });
      }
    } else {
      const child = spawn(editor, [tempFilePath], {
        detached: true,
        stdio: 'ignore',
        shell: true
      });
      child.unref();
    }
  } catch (error) {
    process.stderr.write(`[MD Linter] Fatal Error: ${error.message}\n`);
  }

  return { valid: true };
};
