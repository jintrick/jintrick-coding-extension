const fs = require('fs');
const path = require('path');

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
        
        // If source is not newer than target, skip.
        if (srcStat.mtime <= destStat.mtime) {
          shouldCopy = false;
        }
      }

      if (shouldCopy) {
        // Ensure parent directory exists for the target file
        const parentDir = path.dirname(destPath);
        if (!fs.existsSync(parentDir)) {
          fs.mkdirSync(parentDir, { recursive: true });
        }
        
        // Direct copy, no temporary files (compliance with no-temp-files-in-root.md)
        fs.copyFileSync(srcPath, destPath);
        updatedCount++;
      }
    }
  }

  return updatedCount;
}

async function main() {
  const inputData = fs.readFileSync(0, 'utf-8');
  let input;
  try {
    input = JSON.parse(inputData);
  } catch (e) {
    process.stdout.write(JSON.stringify({ decision: "allow" }));
    return;
  }

  const eventName = input.hook_event_name;
  if (eventName !== 'SessionStart') {
    process.stdout.write(JSON.stringify({ decision: "allow" }));
    return;
  }

  const cwd = process.cwd();

  // [comment-preservation.md] Gemini CLI が内部生成する一時ディレクトリ（plans等）での不要な同期処理と二重通知を回避するため、
  // パスに `.gemini/tmp` が含まれている場合はメッセージを出さずに直ちに終了（サイレント化）する。
  if (/[\\/]\.gemini[\\/]tmp[\\/]/.test(cwd)) {
    process.stdout.write(JSON.stringify({ decision: "allow" }));
    return;
  }

  const hasPackageJson = fs.existsSync(path.join(cwd, 'package.json'));
  const hasGit = fs.existsSync(path.join(cwd, '.git'));

  if (!hasPackageJson && !hasGit) {
    process.stdout.write(JSON.stringify({
      decision: "allow",
      systemMessage: "jintrick プロジェクトではないため、jintrick 標準構成の同期をスキップしました"
    }));
    return;
  }

  const extensionRoot = path.resolve(__dirname, '../../');
  const sourceDir = process.env.JINTRICK_MOCK_TEMPLATE_DIR 
    ? process.env.JINTRICK_MOCK_TEMPLATE_DIR 
    : path.join(extensionRoot, 'skills/jintrick-tools/assets/project-template');

  if (!fs.existsSync(sourceDir)) {
    // Cannot sync if the template does not exist
    process.stdout.write(JSON.stringify({ decision: "allow" }));
    return;
  }

  try {
    const updatedCount = copyDirWithMtimeCheck(sourceDir, cwd);

    if (updatedCount > 0) {
      process.stdout.write(JSON.stringify({
        decision: "allow",
        systemMessage: `jintrick 標準構成のファイルを同期・更新しました（${updatedCount}件）`
      }));
    } else {
      process.stdout.write(JSON.stringify({
        decision: "allow",
        systemMessage: "jintrick 標準構成は最新の状態です"
      }));
    }
  } catch (err) {
    // Fallback error handling
    process.stdout.write(JSON.stringify({ 
      decision: "allow",
      systemMessage: `[project-template-sync] 同期中にエラーが発生しました: ${err.message}`
    }));
  }
}

main().catch(err => {
  process.stdout.write(JSON.stringify({ decision: "allow" }));
});
