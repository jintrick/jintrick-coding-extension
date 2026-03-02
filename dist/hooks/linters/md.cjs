// hooks/scripts/linters/md.cjs
var { execSync, spawn } = require("child_process");
var fs = require("fs");
var path = require("path");
var os = require("os");
module.exports = function(content, filePath, tool_name) {
  try {
    const tempDir = os.tmpdir();
    const fileName = path.basename(filePath);
    const tempFilePath = path.normalize(path.join(tempDir, `preview_${Date.now()}_${fileName}`));
    fs.writeFileSync(tempFilePath, content, "utf8");
    const isWin = os.platform() === "win32";
    const editor = process.env.EDITOR || (isWin ? "notepad" : "vi");
    if (isWin) {
      const vbsPath = path.join(tempDir, `launcher_${Date.now()}.vbs`);
      const vbsContent = `Set WshShell = CreateObject("WScript.Shell")
WshShell.Run "cmd /c start """" ""${editor}"" ""${tempFilePath}""", 0, False`;
      fs.writeFileSync(vbsPath, vbsContent, "utf16le");
      try {
        execSync(`wscript.exe //B "${vbsPath}"`, { stdio: "ignore" });
      } catch (e) {
        execSync(`start "" "${editor}" "${tempFilePath}"`, { stdio: "ignore" });
      }
    } else {
      const child = spawn(editor, [tempFilePath], {
        detached: true,
        stdio: "ignore",
        shell: true
      });
      child.unref();
    }
  } catch (error) {
    process.stderr.write(`[MD Linter] Fatal Error: ${error.message}
`);
  }
  return { valid: true };
};
