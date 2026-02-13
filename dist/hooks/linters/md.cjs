// hooks/scripts/linters/md.cjs
var { execSync } = require("child_process");
var fs = require("fs");
var path = require("path");
var os = require("os");
module.exports = function(content, filePath, tool_name) {
  try {
    const tempDir = os.tmpdir();
    const fileName = path.basename(filePath);
    const tempFilePath = path.join(tempDir, `preview_${fileName}`);
    fs.writeFileSync(tempFilePath, content, "utf8");
    execSync(`code "${tempFilePath}"`);
    console.error(`[Human Linter] \u691C\u95B2\u7528\u30D7\u30EC\u30D3\u30E5\u30FC\u3092\u8868\u793A\u3057\u307E\u3057\u305F: ${tempFilePath}`);
  } catch (error) {
    console.error(`[MD Linter] Failed: ${error.message}`);
  }
  return { valid: true };
};
