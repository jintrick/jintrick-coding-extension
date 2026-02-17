// hooks/scripts/linters/md.cjs
var { execSync } = require("child_process");
var fs = require("fs");
var path = require("path");
module.exports = function(content, filePath, tool_name) {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, content, "utf8");
    console.error(`[Human Linter] Opening ${filePath} in VSCode for manual review...`);
    execSync(`code -w "${filePath}"`);
    console.error(`[Human Linter] User closed the file. Returning deny to prevent overwrite.`);
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
