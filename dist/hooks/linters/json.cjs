// hooks/scripts/linters/json.cjs
module.exports = function(content, filePath, tool_name) {
  try {
    JSON.parse(content);
    return { valid: true };
  } catch (e) {
    return {
      valid: false,
      reason: `JSON syntax error after ${tool_name} in '${filePath}': ${e.message}`,
      systemMessage: `\u274C JSON Lint Error: ${tool_name} \u5F8C\u306E ${filePath} \u306E\u69CB\u6587\u304C\u4E0D\u6B63\u3067\u3059\u3002`
    };
  }
};
