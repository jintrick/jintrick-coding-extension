// hooks/scripts/coding_rules_hook.cjs
var fs = require("fs");
var path = require("path");
function readStdin() {
  return new Promise((resolve, reject) => {
    let rawData = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => rawData += chunk);
    process.stdin.on("end", () => {
      try {
        if (!rawData) {
          resolve(null);
          return;
        }
        resolve(JSON.parse(rawData));
      } catch (e) {
        reject(e);
      }
    });
    process.stdin.on("error", reject);
  });
}
function matchGlob(filePath, glob) {
  const normalizedPath = filePath.replace(/\\/g, "/");
  let escaped = glob.replace(/[.+^${}()|[\]\\]/g, "\\$&");
  escaped = escaped.replace(/\/\*\*\//g, "");
  escaped = escaped.replace(/\*\*/g, "");
  escaped = escaped.replace(/\*/g, "[^/]*");
  escaped = escaped.replace(/\?/g, ".");
  escaped = escaped.replace(/^\u0002\//, "(?:.*/)?");
  escaped = escaped.replace(/\u0001/g, "(?:/|/.*/)");
  escaped = escaped.replace(/\u0002/g, ".*");
  const regex = new RegExp((glob.includes("/") ? "^" : "(^|/)") + escaped + "$");
  return regex.test(normalizedPath);
}
function parseFrontmatter(content) {
  const frontmatterRegex = /^---(?:\r?\n)([\s\S]*?)(?:\r?\n)---(?:\r?\n)?([\s\S]*)$/;
  const match = content.match(frontmatterRegex);
  if (!match) return { frontmatter: {}, body: content };
  const frontmatterStr = match[1];
  const body = match[2];
  const frontmatter = {};
  const lines = frontmatterStr.split(/\r?\n/);
  let currentKey = null;
  for (const line of lines) {
    const kvMatch = line.match(/^([a-zA-Z0-9_-]+):\s*(.*)$/);
    if (kvMatch) {
      currentKey = kvMatch[1];
      const val = kvMatch[2].trim().replace(/^["'](.*)["']$/, "$1");
      if (val === "") {
        frontmatter[currentKey] = [];
      } else {
        frontmatter[currentKey] = val;
      }
    } else if (currentKey && line.trim().startsWith("- ")) {
      if (!Array.isArray(frontmatter[currentKey])) {
        const existingVal = frontmatter[currentKey];
        frontmatter[currentKey] = existingVal ? [existingVal] : [];
      }
      frontmatter[currentKey].push(line.replace(/^\s*-\s*/, "").trim().replace(/^["'](.*)["']$/, "$1"));
    }
  }
  return { frontmatter, body };
}
async function main() {
  try {
    const input = await readStdin();
    if (!input) process.exit(0);
    if (input.hook_event_name !== "BeforeTool") {
      console.log(JSON.stringify({ decision: "allow" }));
      process.exit(0);
    }
    if (!["read_file", "write_file", "replace"].includes(input.tool_name)) {
      console.log(JSON.stringify({ decision: "allow" }));
      process.exit(0);
    }
    let filePath = input.tool_input && (input.tool_input.file_path || input.tool_input.path);
    const cwd = input.cwd;
    if (!filePath || !cwd) {
      console.log(JSON.stringify({ decision: "allow" }));
      process.exit(0);
    }
    filePath = path.relative(cwd, path.resolve(cwd, filePath));
    const rulesDir = path.join(cwd, ".agent", "rules");
    if (!fs.existsSync(rulesDir)) {
      console.log(JSON.stringify({ decision: "allow" }));
      process.exit(0);
    }
    const files = fs.readdirSync(rulesDir);
    let additionalContext = "";
    for (const file of files) {
      if (!file.endsWith(".md")) continue;
      const rulePath = path.join(rulesDir, file);
      const content = fs.readFileSync(rulePath, "utf8");
      const { frontmatter, body } = parseFrontmatter(content);
      if (frontmatter.trigger !== "glob") {
        continue;
      }
      let globs = [];
      if (Array.isArray(frontmatter.globs)) {
        globs = frontmatter.globs;
      } else if (typeof frontmatter.globs === "string") {
        globs = [frontmatter.globs];
      }
      let matched = false;
      for (const glob of globs) {
        if (matchGlob(filePath, glob)) {
          matched = true;
          break;
        }
      }
      if (matched) {
        additionalContext += `
[RULE APPLIED: ${file}]
${body}
`;
      }
    }
    const output = { decision: "allow" };
    if (additionalContext) {
      output.hookSpecificOutput = {
        systemMessage: `
<coding_rules>
${additionalContext.trim()}
</coding_rules>
`
      };
    }
    console.log(JSON.stringify(output));
  } catch (error) {
    console.error(error);
    console.log(JSON.stringify({ decision: "allow" }));
    process.exit(0);
  }
}
main();
