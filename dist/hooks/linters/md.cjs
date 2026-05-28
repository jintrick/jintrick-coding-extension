// hooks/scripts/linters/md.cjs
var { spawn } = require("child_process");
var fs = require("fs");
var path = require("path");
var os = require("os");
module.exports = function(content, filePath, tool_name) {
  try {
    const tempDir = os.tmpdir();
    const fileName = path.basename(filePath);
    const tempFilePath = path.normalize(path.join(tempDir, `preview_${Date.now()}_${fileName}`));
    fs.writeFileSync(tempFilePath, content, "utf8");
    const platform = os.platform();
    const isWin = platform === "win32";
    const isMac = platform === "darwin";
    let cmd, args;
    const customEditor = process.env.EDITOR;
    if (customEditor) {
      if (isWin) {
        cmd = "cmd.exe";
        args = ["/c", "start", '""', customEditor, tempFilePath];
      } else {
        cmd = customEditor;
        args = [tempFilePath];
      }
    } else {
      if (isWin) {
        cmd = "cmd.exe";
        args = ["/c", "start", '""', "notepad", tempFilePath];
      } else if (isMac) {
        cmd = "open";
        args = [tempFilePath];
      } else {
        cmd = "xdg-open";
        args = [tempFilePath];
      }
    }
    process.stderr.write(`[Human Linter] Preview created: ${tempFilePath} (Command: ${cmd} ${args.join(" ")})
`);
    const child = spawn(cmd, args, {
      detached: true,
      stdio: "ignore",
      windowsHide: true,
      shell: !isWin && customEditor ? true : false
    });
    child.unref();
  } catch (error) {
    process.stderr.write(`[MD Linter] Fatal Error: ${error.message}
`);
  }
  return { valid: true };
};
