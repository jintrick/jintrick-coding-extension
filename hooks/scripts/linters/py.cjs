const { spawnSync } = require('child_process');

module.exports = function(content, filePath, tool_name) {
  try {
    const runPython = (cmd) => {
      // Use python -c to compile from stdin without creating .pyc files
      // This validates syntax effectively.
      return spawnSync(cmd, ['-c', "import sys; compile(sys.stdin.read(), '<string>', 'exec')"], {
        input: content,
        encoding: 'utf8',
        timeout: 5000,
        shell: false
      });
    };

    let result = runPython('python');

    if (result.error && result.error.code === 'ENOENT') {
      result = runPython('python3');
    }

    if (result.error && result.error.code === 'ENOENT') {
      process.stderr.write(`[Debug] Python not found, skipping validation for ${filePath}\n`);
      return { valid: true };
    }

    if (result.status !== 0) {
      return {
        valid: false,
        reason: 'Python Syntax Error',
        systemMessage: `🚫 Python Syntax Error: ${tool_name} で書き込もうとした ${filePath} に構文エラーがあります。
${result.stderr}`
      };
    }

    return { valid: true };
  } catch (e) {
    return {
      valid: false,
      reason: `Linter Error: ${e.message}`,
      systemMessage: `🚫 Python Linter Error: 予期せぬエラーが発生しました。
${e.message}`
    };
  }
};
