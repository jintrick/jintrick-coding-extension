/**
 * JSON Linter Module
 */
module.exports = function(content, filePath, tool_name) {
  try {
    JSON.parse(content);
    return { valid: true };
  } catch (e) {
    return {
      valid: false,
      reason: `JSON syntax error after ${tool_name} in '${filePath}': ${e.message}`,
      systemMessage: `❌ JSON Lint Error: ${tool_name} 後の ${filePath} の構文が不正です。`
    };
  }
};
