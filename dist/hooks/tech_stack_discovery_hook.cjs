// hooks/scripts/tech_stack_discovery_hook.cjs
var fs = require("fs");
var path = require("path");
async function main() {
  const inputData = fs.readFileSync(0, "utf-8");
  const input = JSON.parse(inputData);
  const eventName = input.hook_event_name;
  const cwd = input.cwd;
  if (eventName !== "SessionStart") {
    process.stdout.write(JSON.stringify({ decision: "allow" }));
    return;
  }
  const extensionRoot = path.resolve(__dirname, "../../");
  const skillsDir = path.join(extensionRoot, "skills");
  if (!fs.existsSync(skillsDir)) {
    process.stdout.write(JSON.stringify({ decision: "allow" }));
    return;
  }
  const IGNORE_DIRS = ["node_modules", ".git", "dist", "build", "out", "coverage", ".next", ".nuxt", "venv", ".venv"];
  const MAX_DEPTH = 3;
  function getDirectoriesToScan(baseDir) {
    const dirs = [baseDir];
    function scan(currentDir, depth) {
      if (depth >= MAX_DEPTH) return;
      let dirEntries = [];
      try {
        dirEntries = fs.readdirSync(currentDir, { withFileTypes: true });
      } catch (e) {
        console.error(`[tech-stack-discovery] Failed to scan ${currentDir}: ${e.message}`);
        return;
      }
      for (const dirent of dirEntries) {
        if (dirent.isDirectory()) {
          if (IGNORE_DIRS.includes(dirent.name)) {
            continue;
          }
          const fullPath = path.join(currentDir, dirent.name);
          dirs.push(fullPath);
          scan(fullPath, depth + 1);
        }
      }
    }
    scan(baseDir, 0);
    return dirs;
  }
  const detectedStacks = [];
  let entries = [];
  try {
    entries = fs.readdirSync(skillsDir, { withFileTypes: true });
  } catch (e) {
    process.stdout.write(JSON.stringify({ decision: "allow" }));
    return;
  }
  const directoriesToScan = getDirectoriesToScan(cwd);
  for (const entry of entries) {
    if (entry.isDirectory() && entry.name.startsWith("tech-expert-")) {
      const manifestPath = path.join(skillsDir, entry.name, "manifest.json");
      if (fs.existsSync(manifestPath)) {
        try {
          const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
          if (manifest.detectors && Array.isArray(manifest.detectors)) {
            let matched = false;
            for (const scanDir of directoriesToScan) {
              if (matched) break;
              for (const detector of manifest.detectors) {
                if (detector.type === "file_exists") {
                  if (fs.existsSync(path.join(scanDir, detector.file))) {
                    matched = true;
                    break;
                  }
                } else if (detector.type === "file_contains") {
                  const targetFile = path.join(scanDir, detector.file);
                  if (fs.existsSync(targetFile)) {
                    const content = fs.readFileSync(targetFile, "utf8");
                    if (content.includes(detector.pattern)) {
                      matched = true;
                      break;
                    }
                  }
                }
              }
            }
            if (matched) {
              detectedStacks.push(manifest.name);
            }
          }
        } catch (e) {
          console.error(`[tech-stack-discovery] Error parsing ${manifestPath}: ${e.message}`);
        }
      }
    }
  }
  if (detectedStacks.length > 0) {
    const mandate = `[SYSTEM] \u3053\u306E\u30D7\u30ED\u30B8\u30A7\u30AF\u30C8\u3067\u306F\u4EE5\u4E0B\u306E\u6280\u8853\u30B9\u30BF\u30C3\u30AF\u304C\u691C\u51FA\u3055\u308C\u307E\u3057\u305F: ${detectedStacks.join(", ")}
\u3053\u308C\u3089\u306B\u95A2\u3059\u308B\u516C\u5F0F\u4ED5\u69D8\u3001\u30D9\u30B9\u30C8\u30D7\u30E9\u30AF\u30C6\u30A3\u30B9\u3001\u65E2\u77E5\u306E\u30A8\u30E9\u30FC\u30D1\u30BF\u30FC\u30F3\u3001\u307E\u305F\u306F\u30A2\u30FC\u30AD\u30C6\u30AF\u30C1\u30E3\u306E\u6A19\u6E96\u7684\u306A\u5B9F\u88C5\u65B9\u6CD5\u306B\u3064\u3044\u3066\u8ABF\u67FB\u304C\u5FC5\u8981\u306A\u5834\u5408\u306F\u3001\`tech-expert\` \u30B5\u30D6\u30A8\u30FC\u30B8\u30A7\u30F3\u30C8\u3092\u5229\u7528\u3057\u3066\u6B63\u78BA\u306A\u60C5\u5831\u3092\u53D6\u5F97\u305B\u3088\u3002\u8AD6\u7406\u7684\u306A\u30D0\u30B0\u4FEE\u6B63\u3084\u30D7\u30ED\u30B8\u30A7\u30AF\u30C8\u56FA\u6709\u306E\u5B9F\u88C5\u306B\u95A2\u3059\u308B\u63A8\u8AD6\u306F\u3001\u5F15\u304D\u7D9A\u304D\u30E1\u30A4\u30F3\u30A8\u30FC\u30B8\u30A7\u30F3\u30C8\u304C\u62C5\u5F53\u305B\u3088\u3002`;
    const sysMsg = `[tech-expert] Available experts: ${detectedStacks.join(", ")}. Use for tech-specific knowledge retrieval.`;
    process.stdout.write(JSON.stringify({
      decision: "allow",
      systemMessage: sysMsg,
      hookSpecificOutput: {
        additionalContext: mandate
      }
    }));
  } else {
    process.stdout.write(JSON.stringify({ decision: "allow" }));
  }
}
main().catch((err) => {
  console.error(`[tech-stack-discovery] Fatal error: ${err.stack}`);
  process.stdout.write(JSON.stringify({ decision: "allow" }));
});
