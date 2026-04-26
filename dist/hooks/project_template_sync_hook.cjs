// hooks/scripts/project_template_sync_hook.cjs
var fs = require("fs");
var path = require("path");
function copyDirWithMtimeCheck(srcDir, destDir) {
  let updatedCount = 0;
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      updatedCount += copyDirWithMtimeCheck(srcPath, destPath);
    } else {
      let shouldCopy = true;
      if (fs.existsSync(destPath)) {
        const srcStat = fs.statSync(srcPath);
        const destStat = fs.statSync(destPath);
        if (srcStat.mtime <= destStat.mtime) {
          shouldCopy = false;
        }
      }
      if (shouldCopy) {
        const parentDir = path.dirname(destPath);
        if (!fs.existsSync(parentDir)) {
          fs.mkdirSync(parentDir, { recursive: true });
        }
        fs.copyFileSync(srcPath, destPath);
        updatedCount++;
      }
    }
  }
  return updatedCount;
}
async function main() {
  const inputData = fs.readFileSync(0, "utf-8");
  let input;
  try {
    input = JSON.parse(inputData);
  } catch (e) {
    process.stdout.write(JSON.stringify({ decision: "allow" }));
    return;
  }
  const eventName = input.hook_event_name;
  if (eventName !== "SessionStart") {
    process.stdout.write(JSON.stringify({ decision: "allow" }));
    return;
  }
  const cwd = process.cwd();
  if (/[\\/]\.gemini[\\/]tmp[\\/]/.test(cwd)) {
    process.stdout.write(JSON.stringify({ decision: "allow" }));
    return;
  }
  const hasPackageJson = fs.existsSync(path.join(cwd, "package.json"));
  const hasGit = fs.existsSync(path.join(cwd, ".git"));
  if (!hasPackageJson && !hasGit) {
    process.stdout.write(JSON.stringify({
      decision: "allow",
      systemMessage: "jintrick \u30D7\u30ED\u30B8\u30A7\u30AF\u30C8\u3067\u306F\u306A\u3044\u305F\u3081\u3001jintrick \u6A19\u6E96\u69CB\u6210\u306E\u540C\u671F\u3092\u30B9\u30AD\u30C3\u30D7\u3057\u307E\u3057\u305F"
    }));
    return;
  }
  const extensionRoot = path.resolve(__dirname, "../../");
  const sourceDir = process.env.JINTRICK_MOCK_TEMPLATE_DIR ? process.env.JINTRICK_MOCK_TEMPLATE_DIR : path.join(extensionRoot, "skills/jintrick-tools/assets/project-template");
  if (!fs.existsSync(sourceDir)) {
    process.stdout.write(JSON.stringify({ decision: "allow" }));
    return;
  }
  try {
    const updatedCount = copyDirWithMtimeCheck(sourceDir, cwd);
    if (updatedCount > 0) {
      process.stdout.write(JSON.stringify({
        decision: "allow",
        systemMessage: `jintrick \u6A19\u6E96\u69CB\u6210\u306E\u30D5\u30A1\u30A4\u30EB\u3092\u540C\u671F\u30FB\u66F4\u65B0\u3057\u307E\u3057\u305F\uFF08${updatedCount}\u4EF6\uFF09`
      }));
    } else {
      process.stdout.write(JSON.stringify({
        decision: "allow",
        systemMessage: "jintrick \u6A19\u6E96\u69CB\u6210\u306F\u6700\u65B0\u306E\u72B6\u614B\u3067\u3059"
      }));
    }
  } catch (err) {
    process.stdout.write(JSON.stringify({
      decision: "allow",
      systemMessage: `[project-template-sync] \u540C\u671F\u4E2D\u306B\u30A8\u30E9\u30FC\u304C\u767A\u751F\u3057\u307E\u3057\u305F: ${err.message}`
    }));
  }
}
main().catch((err) => {
  process.stdout.write(JSON.stringify({ decision: "allow" }));
});
