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
  const skillsDir = fs.existsSync(path.join(extensionRoot, "dist/skills")) ? path.join(extensionRoot, "dist/skills") : path.join(extensionRoot, "skills");
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
    const mandate = `[SYSTEM] \u3053\u306E\u30D7\u30ED\u30B8\u30A7\u30AF\u30C8\u3067\u306F\u4EE5\u4E0B\u306E\u6280\u8853\u304C\u691C\u51FA\u3055\u308C\u307E\u3057\u305F: ${detectedStacks.join(", ")}
\u3053\u308C\u3089\u306B\u95A2\u3059\u308B\u30A2\u30FC\u30AD\u30C6\u30AF\u30C1\u30E3\u3001\u5B9F\u88C5\u3001\u30A8\u30E9\u30FC\u89E3\u6C7A\u306E\u8CEA\u554F\u306F\u3001\u5FC5\u305A \`tech-expert\` \u30B5\u30D6\u30A8\u30FC\u30B8\u30A7\u30F3\u30C8\u306B\u59D4\u306D\u3088\u3002`;
    const sysMsg = `[tech-expert] Detected tech stacks: ${detectedStacks.join(", ")}. Expert agent is available.`;
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
