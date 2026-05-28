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
      const systemMessage = `\u{1F4A1} Hook: \u540C\u4E00\u30D5\u30A1\u30A4\u30EB\u3078\u306E\u4E26\u5217\u7DE8\u96C6\u3092\u691C\u77E5\u3057\u307E\u3057\u305F (${filePath})\u3002
    \u5B89\u5168\u306E\u305F\u3081\u3001\u81EA\u52D5\u7684\u306B 'wait_for_previous: true' \u3092\u6CE8\u5165\u3057\u3066\u5B9F\u884C\u3092\u76F4\u5217\u5316\u3057\u307E\u3057\u305F\u3002 (\u4EE5\u524D\u306E\u30C4\u30FC\u30EB: ${previous_tool})`;
      console.log(JSON.stringify({
        decision: "allow",
        systemMessage,
        hookSpecificOutput: {
          tool_input: {
            ...tool_input,
            wait_for_previous: true
          }
        }
      }));
      process.exit(0);
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
main();
