#!/usr/bin/env node

// hooks/scripts/single_edit_per_turn_hook.cjs
var fs = require("fs");
var path = require("path");
var os = require("os");
function main() {
  let input;
  try {
    const rawInput = fs.readFileSync(0, "utf8");
    if (!rawInput) process.exit(0);
    input = JSON.parse(rawInput);
  } catch (e) {
    process.exit(0);
  }
  const { hook_event_name, tool_name, tool_input, session_id } = input;
  if (!session_id) {
    allow();
  }
  const cacheFile = path.join(os.tmpdir(), `gemini_cli_modified_${session_id}.json`);
  if (hook_event_name === "BeforeAgent") {
    try {
      if (fs.existsSync(cacheFile)) {
        fs.unlinkSync(cacheFile);
      }
    } catch (e) {
    }
    allow();
  } else if (hook_event_name === "BeforeTool") {
    if (!["replace", "write_file"].includes(tool_name)) {
      allow();
    }
    const filePath = tool_input && tool_input.file_path;
    if (!filePath) {
      allow();
    }
    if (fs.existsSync(cacheFile)) {
      try {
        const stats = fs.statSync(cacheFile);
        if (Date.now() - stats.mtimeMs > 3e5) {
          fs.unlinkSync(cacheFile);
        }
      } catch (e) {
      }
    }
    let modifiedFiles = {};
    if (fs.existsSync(cacheFile)) {
      try {
        modifiedFiles = JSON.parse(fs.readFileSync(cacheFile, "utf8"));
        if (Array.isArray(modifiedFiles)) {
          modifiedFiles = {};
        }
      } catch (e) {
        modifiedFiles = {};
      }
    }
    const waitForPrevious = tool_input && tool_input.wait_for_previous === true;
    if (modifiedFiles[filePath] && !waitForPrevious) {
      const previous_tool = modifiedFiles[filePath];
      const reason = `[PHYSICAL CONCURRENCY ERROR] File is LOCKED: ${filePath}`;
      const systemMessage = `\u3010\u7269\u7406\u7684\u4E26\u5217\u5B9F\u884C\u30A8\u30E9\u30FC\u3011\u5BFE\u8C61\u30D5\u30A1\u30A4\u30EB\u306F\u73FE\u5728\u30ED\u30C3\u30AF\u3055\u308C\u3066\u3044\u307E\u3059\u3002
\u540C\u4E00\u30BF\u30FC\u30F3\u5185\u306B\u540C\u4E00\u30D5\u30A1\u30A4\u30EB\u306B\u5BFE\u3057\u3066\u8907\u6570\u306E\u7DE8\u96C6\u30C4\u30FC\u30EB\uFF08replace, write_file \u7B49\uFF09\u3092\u4E26\u5217\u306B\u30D7\u30E9\u30F3\u30CB\u30F3\u30B0\u3059\u308B\u3053\u3068\u306F\u7269\u7406\u7684\u306B\u4E0D\u53EF\u80FD\u3067\u3059\u3002
\u30C4\u30FC\u30EB\u3092\u5909\u66F4\uFF08\u4F8B: replace \u304B\u3089 write_file \u3078\uFF09\u3057\u3066\u3082\u3001\u540C\u4E00\u30D5\u30A1\u30A4\u30EB\u3078\u306E\u4E26\u5217\u30A2\u30AF\u30BB\u30B9\u3067\u3042\u308B\u9650\u308A\u3001\u3053\u306E\u30A8\u30E9\u30FC\u306F\u56DE\u907F\u3067\u304D\u307E\u305B\u3093\u3002

\u539F\u56E0: \u3042\u306A\u305F\u306E\u73FE\u5728\u306E\u5B9F\u884C\u30D7\u30E9\u30F3\u306F\u3001\u7269\u7406\u7684\u306A\u4E0D\u6574\u5408\uFF08Race Condition\uFF09\u3092\u5F15\u304D\u8D77\u3053\u3059\u69CB\u6210\u306B\u306A\u3063\u3066\u3044\u307E\u3059\u3002
\u89E3\u6C7A\u7B56:
1. \u30D7\u30E9\u30F3\u3092\u4FEE\u6B63\u3057\u3001\u540C\u4E00\u30D5\u30A1\u30A4\u30EB\u3078\u306E\u64CD\u4F5C\u306B\u306F 'wait_for_previous: true' \u3092\u4ED8\u4E0E\u3057\u3066\u76F4\u5217\u5316\u3057\u3066\u304F\u3060\u3055\u3044\u3002
2. \u307E\u305F\u306F\u3001\u8907\u6570\u306E\u5909\u66F4\u30921\u3064\u306E\u30C4\u30FC\u30EB\u547C\u3073\u51FA\u3057\u306B\u96C6\u7D04\u3057\u3066\u304F\u3060\u3055\u3044\u3002

\u7AF6\u5408\u30C4\u30FC\u30EB: ${tool_name} (\u73FE\u5728) vs ${previous_tool} (\u5B9F\u884C\u5F85\u3061)`;
      deny(reason, systemMessage);
    } else {
      if (!modifiedFiles[filePath]) {
        modifiedFiles[filePath] = tool_name;
        fs.writeFileSync(cacheFile, JSON.stringify(modifiedFiles));
      }
      allow();
    }
  } else if (hook_event_name === "AfterAgent") {
    try {
      if (fs.existsSync(cacheFile)) {
        fs.unlinkSync(cacheFile);
      }
    } catch (e) {
    }
    allow();
  } else {
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
