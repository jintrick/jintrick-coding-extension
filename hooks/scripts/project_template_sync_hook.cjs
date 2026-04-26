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

  const targetCwd = input.cwd;

  if (!targetCwd) {
    process.stdout.write(JSON.stringify({ decision: "allow" }));
    return;
  }

  // [comment-preservation.md] Gemini CLI から明示的に渡される `input.cwd` を「唯一の絶対的なソース」として採用する。
  // Node.jsプロセスの `process.cwd()` は、CLIの一時ディレクトリ実行時でもメインプロジェクトを指している可能性があり、
  // それに依存すると誤作動や二重通知の原因となるため、使用を全面的に廃止した。
  // 
  // また、パスに `.gemini/tmp` が含まれる場合は CLI 内部の一時的なコンテキストであるため、
  // ユーザーへのノイズを避けるべく、一切の通知を行わずに直ちに終了（Ignore）する。
  if (/[\\/]\.gemini[\\/]tmp([\\/]|$)/i.test(targetCwd)) {
    process.stdout.write(JSON.stringify({ decision: "allow" }));
    return;
  }

  const hasPackageJson = fs.existsSync(path.join(targetCwd, 'package.json'));
  const hasGit = fs.existsSync(path.join(targetCwd, '.git'));

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
    const updatedCount = copyDirWithMtimeCheck(sourceDir, targetCwd);

    const evidence = ` [PID: ${process.pid}, TARGET: ${targetCwd}, TIME: ${new Date().toISOString()}]`;

    if (updatedCount > 0) {
      process.stdout.write(JSON.stringify({
        decision: "allow",
        systemMessage: `jintrick 標準構成のファイルを同期・更新しました（${updatedCount}件）${evidence}`
      }));
    } else {
      process.stdout.write(JSON.stringify({
        decision: "allow",
        systemMessage: "jintrick 標準構成は最新の状態です" + evidence
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
