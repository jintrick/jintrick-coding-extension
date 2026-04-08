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
    if (tool_name !== "replace") {
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
    let modifiedFiles = [];
    if (fs.existsSync(cacheFile)) {
      try {
        modifiedFiles = JSON.parse(fs.readFileSync(cacheFile, "utf8"));
      } catch (e) {
        modifiedFiles = [];
      }
    }
    const waitForPrevious = tool_input && tool_input.wait_for_previous === true;
    if (modifiedFiles.includes(filePath) && !waitForPrevious) {
      deny(
        "Duplicate file edit. Set 'wait_for_previous: true' to edit the same file multiple times in one turn.",
        "\u540C\u4E00\u30BF\u30FC\u30F3\u5185\u3067\u306E\u540C\u4E00\u30D5\u30A1\u30A4\u30EB\u306B\u5BFE\u3059\u308B\u4E26\u5217\u3057\u305F\u8907\u6570\u56DE\u306E\u5916\u79D1\u7684\u7DE8\u96C6\uFF08replace\uFF09\u306F\u7981\u6B62\u3055\u308C\u3066\u3044\u307E\u3059\u3002\u5916\u79D1\u7684\u7DE8\u96C6\u306F\u30D5\u30A1\u30A4\u30EB\u306E\u72B6\u614B\u3092\u5909\u5316\u3055\u305B\u308B\u305F\u3081\u3001\u8907\u6570\u306E\u7DE8\u96C6\u304C\u5FC5\u8981\u306A\u5834\u5408\u306F `wait_for_previous: true` \u3092\u6307\u5B9A\u3057\u3066\u9806\u6B21\u5B9F\u884C\u3057\u3066\u304F\u3060\u3055\u3044\u3002"
      );
    } else {
      if (!modifiedFiles.includes(filePath)) {
        modifiedFiles.push(filePath);
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
