// hooks/scripts/linters/md.cjs
var cp = require("child_process");
var fs = require("fs");
var path = require("path");
function mdLinter(content, filePath, tool_name) {
  const execSync = mdLinter.execSync || cp.execSync;
  const writeFileSync = mdLinter.writeFileSync || fs.writeFileSync;
  const existsSync = mdLinter.existsSync || fs.existsSync;
  const mkdirSync = mdLinter.mkdirSync || fs.mkdirSync;
  const _process = mdLinter.process || process;
  const isTTY = _process.stdout.isTTY && _process.env.TERM !== "dumb";
  let hasCode = false;
  try {
    const checkCommand = _process.platform === "win32" ? "where code" : "which code";
    execSync(checkCommand, { stdio: "ignore" });
    hasCode = true;
  } catch (e) {
    hasCode = false;
  }
  if (!isTTY || !hasCode) {
    console.error(`[Human Linter] Skipping manual review (TTY: ${!!isTTY}, code: ${hasCode})`);
    return { valid: true };
  }
  try {
    const dir = path.dirname(filePath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    writeFileSync(filePath, content, "utf8");
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
}
module.exports = mdLinter;
