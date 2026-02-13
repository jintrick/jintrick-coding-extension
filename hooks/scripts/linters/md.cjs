const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * Markdown "Human Linter" Module
 * 書き込み予定の内容を一時ファイルに出力し、VSCode で開いて目視確認を促す。
 */
module.exports = function(content, filePath, tool_name) {
  try {
    // 一時ファイルのパスを作成
    const tempDir = os.tmpdir();
    const fileName = path.basename(filePath);
    const tempFilePath = path.join(tempDir, `preview_${fileName}`);

    // 書き込み予定の内容（メモリ上のデータ）を一時ファイルに書き出す
    fs.writeFileSync(tempFilePath, content, 'utf8');

    // VSCode で一時ファイルを開く
    // code -w を使うと、VSCode のタブを閉じるまで戻ってこないようにすることも可能ですが、
    // まずは単純に開きます。
    execSync(`code "${tempFilePath}"`);
    
    console.error(`[Human Linter] 検閲用プレビューを表示しました: ${tempFilePath}`);
  } catch (error) {
    console.error(`[MD Linter] Failed: ${error.message}`);
  }

  // 常に valid: true を返して、処理自体は継続させる
  return { valid: true };
};
