#!/usr/bin/env node

// hooks/scripts/linter_hook.cjs
var fs = require("fs");
var path = require("path");
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function main() {
  let input;
  try {
    const rawInput = fs.readFileSync(0, "utf8");
    if (!rawInput) process.exit(0);
    input = JSON.parse(rawInput);
  } catch (e) {
    process.stderr.write(`[Debug] Failed to parse input JSON: ${e.message}
`);
    process.exit(0);
  }
  const { hook_event_name, tool_name, tool_input } = input;
  if (!tool_input) {
    process.stderr.write(`[Debug] No tool_input found
`);
    allow();
  }
  const filePath = tool_input.file_path || "";
  if (!filePath) {
    process.stderr.write(`[Debug] No file_path in tool_input
`);
    allow();
  }
  if (hook_event_name !== "BeforeTool") {
    allow();
  }
  const ext = path.extname(filePath).toLowerCase();
  const supportedExtensions = [".js", ".cjs", ".mjs", ".ts", ".tsx", ".json", ".md", ".py"];
  if (!supportedExtensions.includes(ext)) {
    allow();
  }
  let contentToValidate = "";
  if (tool_name === "write_file") {
    contentToValidate = tool_input.content;
  } else if (tool_name === "replace") {
    try {
      if (!fs.existsSync(filePath)) {
        process.stderr.write(`[Debug] File not found for replace: ${filePath}
`);
        allow();
      }
      const currentContent = fs.readFileSync(filePath, "utf8");
      const { old_string, new_string, expected_replacements } = tool_input;
      if (old_string !== void 0 && new_string !== void 0) {
        const normalizedContent = currentContent.replace(/\r\n/g, "\n");
        const normalizedOld = old_string.replace(/\r\n/g, "\n");
        const normalizedNew = new_string.replace(/\r\n/g, "\n");
        if (expected_replacements !== void 0) {
          const regex = new RegExp(escapeRegExp(normalizedOld), "g");
          contentToValidate = normalizedContent.replace(regex, () => normalizedNew);
        } else {
          contentToValidate = normalizedContent.replace(normalizedOld, () => normalizedNew);
        }
      } else {
        process.stderr.write(`[Debug] old_string or new_string missing in replace
`);
        allow();
      }
    } catch (e) {
      process.stderr.write(`[Debug] Error reconstructing content for replace: ${e.message}
`);
      allow();
    }
  } else {
    process.stderr.write(`[Debug] Unsupported tool for linter: ${tool_name}
`);
    allow();
  }
  if (!contentToValidate) {
    process.stderr.write(`[Debug] No content to validate
`);
    allow();
  }
  const linterPath = path.join(__dirname, "linters", `${ext.slice(1)}.cjs`);
  process.stderr.write(`[Debug] Linter path: ${linterPath}
`);
  if (fs.existsSync(linterPath)) {
    try {
      const validate = require(linterPath);
      const result = validate(contentToValidate, filePath, tool_name);
      if (result.valid) {
        process.stderr.write(`[Debug] Linter result: valid
`);
        allow();
      } else {
        process.stderr.write(`[Debug] Linter result: invalid (${result.reason})
`);
        deny(result.reason, result.systemMessage);
      }
    } catch (e) {
      process.stderr.write(`[Debug] Failed to load or execute linter: ${e.message}
`);
      allow();
    }
  } else {
    process.stderr.write(`[Debug] Linter not found for: ${ext}
`);
    allow();
  }
}
function allow() {
  console.log(JSON.stringify({ decision: "allow" }));
  process.exit(0);
}
function deny(reason, systemMessage) {
  console.log(JSON.stringify({
    decision: "deny",
    reason,
    systemMessage
  }));
  process.exit(0);
}
main();
