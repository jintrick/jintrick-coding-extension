#!/usr/bin/env node

// hooks/scripts/single_edit_per_turn_hook.cjs
var fs = require("fs");
var path = require("path");
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
  const cacheDir = path.resolve(__dirname, "..", "..", "hooks", "cache");
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }
  const cacheFile = path.join(cacheDir, `modified_${session_id}.json`);
  if (hook_event_name === "BeforeTool") {
    if (tool_name !== "write_file" && tool_name !== "replace") {
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
    if (modifiedFiles.includes(filePath)) {
      deny(
        "Duplicate file edit in a single turn",
        "\u540C\u4E00\u30BF\u30FC\u30F3\u5185\u3067\u306E\u540C\u4E00\u30D5\u30A1\u30A4\u30EB\u306B\u5BFE\u3059\u308B\u8907\u6570\u56DE\u306E\u7DE8\u96C6\uFF08replace/write_file\uFF09\u306F\u7981\u6B62\u3055\u308C\u3066\u3044\u307E\u3059\u3002\u3059\u3079\u3066\u306E\u5909\u66F4\u30921\u3064\u306E write_file \u306B\u307E\u3068\u3081\u308B\u304B\u3001\u4E00\u65E6\u601D\u8003\u3092\u6B62\u3081\u3066\u30E6\u30FC\u30B6\u30FC\u306B\u5831\u544A\u3057\u3001\u6B21\u306E\u30BF\u30FC\u30F3\u3067\u6B8B\u308A\u306E\u7DE8\u96C6\u3092\u884C\u3063\u3066\u304F\u3060\u3055\u3044\u3002"
      );
    } else {
      modifiedFiles.push(filePath);
      fs.writeFileSync(cacheFile, JSON.stringify(modifiedFiles));
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
