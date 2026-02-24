const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * Markdown "Human Linter" Module (v1.17.0 - Non-blocking Safe Spawn)
 * 書き込み予定の内容を一時ファイルに出力し、エディタで開いて目視確認を促す。
 * エージェントをブロックせず、Windows での cmd.exe 暴走を防ぐため、
 * start コマンドではなく spawn(editor, { shell: true }) を使用する。
 */
module.exports = function(content, filePath, tool_name) {
  try {
    // 一時ファイルのパスを作成
    const tempDir = os.tmpdir();
    const fileName = path.basename(filePath);
    const tempFilePath = path.join(tempDir, `preview_${Date.now()}_${fileName}`);

    fs.writeFileSync(tempFilePath, content, 'utf8');

    // エディタコマンドの決定 (優先順位: GEMINI_EDITOR > VISUAL > EDITOR > antigravity)
    const editor = process.env.GEMINI_EDITOR || process.env.VISUAL || process.env.EDITOR || 'antigravity';

    // エディタで一時ファイルを開く (spawn detached)
    // Windows/Unix 共通で shell: true を使用
    const child = spawn(editor, [tempFilePath], {
      detached: true,
      stdio: 'ignore',
      shell: true
    });
    child.unref();

    process.stderr.write(`[Human Linter] Preview created: ${tempFilePath} (Editor: ${editor})\n`);
  } catch (error) {
    process.stderr.write(`[MD Linter] Failed: ${error.message}\n`);
  }

  // 常に valid: true を返して、処理自体は継続させる
  return { valid: true };
};
