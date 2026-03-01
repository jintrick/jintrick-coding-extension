const fs = require('fs');
const path = require('path');

async function main() {
  const inputData = fs.readFileSync(0, 'utf-8');
  const input = JSON.parse(inputData);
  const eventName = input.hook_event_name;
  const cwd = input.cwd;

  if (eventName !== 'SessionStart') {
    process.stdout.write(JSON.stringify({ decision: "allow" }));
    return;
  }

  // Find manifests
  const extensionRoot = path.resolve(__dirname, '../../');
  const skillsDir = path.join(extensionRoot, 'skills');
  
  if (!fs.existsSync(skillsDir)) {
    process.stdout.write(JSON.stringify({ decision: "allow" }));
    return;
  }

  const IGNORE_DIRS = ['node_modules', '.git', 'dist', 'build', 'out', 'coverage', '.next', '.nuxt', 'venv', '.venv'];
  const MAX_DEPTH = 3;

  function getDirectoriesToScan(baseDir) {
    const dirs = [baseDir];

    function scan(currentDir, depth) {
      if (depth >= MAX_DEPTH) return;
      let dirEntries = [];
      try {
        dirEntries = fs.readdirSync(currentDir, { withFileTypes: true });
      } catch (e) {
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
    if (entry.isDirectory() && entry.name.startsWith('tech-expert-')) {
      const manifestPath = path.join(skillsDir, entry.name, 'manifest.json');
      if (fs.existsSync(manifestPath)) {
        try {
          const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
          if (manifest.detectors && Array.isArray(manifest.detectors)) {
            let matched = false;
            for (const scanDir of directoriesToScan) {
              if (matched) break;
              for (const detector of manifest.detectors) {
                if (detector.type === 'file_exists') {
                  if (fs.existsSync(path.join(scanDir, detector.file))) {
                    matched = true;
                    break;
                  }
                } else if (detector.type === 'file_contains') {
                  const targetFile = path.join(scanDir, detector.file);
                  if (fs.existsSync(targetFile)) {
                    const content = fs.readFileSync(targetFile, 'utf8');
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
          // Ignore
        }
      }
    }
  }

  if (detectedStacks.length > 0) {
    const mandate = `[SYSTEM] このプロジェクトでは以下の技術が検出されました: ${detectedStacks.join(', ')}\nこれらに関するアーキテクチャ、実装、エラー解決の質問は、必ず \`tech-expert\` サブエージェントに委ねよ。`;
    const sysMsg = `[tech-expert] Detected tech stacks: ${detectedStacks.join(', ')}. Expert agent is available.`;
    
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

main().catch(err => {
  process.stdout.write(JSON.stringify({ decision: "allow" }));
});
