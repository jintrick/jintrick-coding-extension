// hooks/scripts/linters/py.cjs
var { spawnSync } = require("child_process");
module.exports = function(content, filePath, tool_name) {
  try {
    const runPython = (cmd) => {
      return spawnSync(cmd, ["-c", "import sys; compile(sys.stdin.read(), '<string>', 'exec')"], {
        input: content,
        encoding: "utf8",
        timeout: 5e3,
        shell: false
      });
    };
    let result = runPython("python");
    if (result.error && result.error.code === "ENOENT") {
      result = runPython("python3");
    }
    if (result.error && result.error.code === "ENOENT") {
      process.stderr.write(`[Debug] Python not found, skipping validation for ${filePath}
`);
      return { valid: true };
    }
    if (result.status !== 0) {
      return {
        valid: false,
        reason: "Python Syntax Error",
        systemMessage: `\u{1F6AB} Python Syntax Error: ${tool_name} \u3067\u66F8\u304D\u8FBC\u3082\u3046\u3068\u3057\u305F ${filePath} \u306B\u69CB\u6587\u30A8\u30E9\u30FC\u304C\u3042\u308A\u307E\u3059\u3002
${result.stderr}`
      };
    }
    return { valid: true };
  } catch (e) {
    return {
      valid: false,
      reason: `Linter Error: ${e.message}`,
      systemMessage: `\u{1F6AB} Python Linter Error: \u4E88\u671F\u305B\u306C\u30A8\u30E9\u30FC\u304C\u767A\u751F\u3057\u307E\u3057\u305F\u3002
${e.message}`
    };
  }
};
