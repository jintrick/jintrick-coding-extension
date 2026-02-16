// hooks/scripts/expert_docs_hook.cjs
var fs = require("fs");
var path = require("path");
var { execSync } = require("child_process");
var os = require("os");
async function main() {
  const input = JSON.parse(fs.readFileSync(0, "utf-8"));
  const toolInput = input.tool_input || {};
  if (toolInput.name !== "gemini-cli-expert") {
    console.log(JSON.stringify({ decision: "allow" }));
    return;
  }
  const message = "[expert-docs-hook] Detected gemini-cli-expert activation. Updating docs...";
  console.error(message);
  console.log(JSON.stringify({
    decision: "allow",
    systemMessage: message
  }));
}
main().catch((err) => {
  console.error(err);
  console.log(JSON.stringify({ decision: "allow" }));
});
