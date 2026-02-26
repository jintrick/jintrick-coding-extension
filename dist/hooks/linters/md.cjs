// hooks/scripts/linters/md.cjs
var { spawn } = require("child_process");
var fs = require("fs");
var path = require("path");
var os = require("os");
module.exports = function(content, filePath, tool_name) {
  try {
    const tempDir = os.tmpdir();
    const fileName = path.basename(filePath);
    const tempFilePath = path.join(tempDir, `preview_${Date.now()}_${fileName}`);
    fs.writeFileSync(tempFilePath, content, "utf8");
    const editor = process.env.GEMINI_EDITOR || process.env.VISUAL || process.env.EDITOR || "antigravity";
    const child = spawn(editor, [tempFilePath], {
      detached: true,
      stdio: "ignore",
      shell: true
    });
    child.unref();
    process.stderr.write(`[Human Linter] Preview created: ${tempFilePath} (Editor: ${editor})
`);
  } catch (error) {
    process.stderr.write(`[MD Linter] Failed: ${error.message}
`);
  }
  return { valid: true };
};
