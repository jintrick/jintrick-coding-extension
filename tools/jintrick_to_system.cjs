const fs = require('fs');
const path = require('path');

function getLatestSourcePath() {
  const systemPromptsDir = path.resolve(__dirname, '../skills/gemini-cli-expert/references/system_prompts');
  
  if (!fs.existsSync(systemPromptsDir)) {
    console.error(`System prompts directory not found: ${systemPromptsDir}`);
    process.exit(1);
  }

  const entries = fs.readdirSync(systemPromptsDir, { withFileTypes: true });
  const versions = entries
    .filter(entry => entry.isDirectory() && /^v\d+\.\d+\.\d+$/.test(entry.name))
    .map(entry => entry.name);

  if (versions.length === 0) {
    console.error(`No version directories (vX.Y.Z) found in ${systemPromptsDir}`);
    process.exit(1);
  }

  // Sort versions: Parse as numbers and sort in descending order
  versions.sort((a, b) => {
    const aParts = a.substring(1).split('.').map(Number);
    const bParts = b.substring(1).split('.').map(Number);

    for (let i = 0; i < 3; i++) {
      if (aParts[i] !== bParts[i]) {
        return bParts[i] - aParts[i];
      }
    }
    return 0;
  });

  const latestVersion = versions.find(v => fs.existsSync(path.join(systemPromptsDir, v, 'jintrick.md')));

  if (!latestVersion) {
    console.error(`jintrick.md not found in any version directory in ${systemPromptsDir}`);
    process.exit(1);
  }

  const sourcePath = path.join(systemPromptsDir, latestVersion, 'jintrick.md');

  return sourcePath;
}

const destPath = path.resolve(__dirname, '../.gemini/system.md');

function sanitize(content) {
  // 1. Remove HTML comments
  let sanitized = content.replace(/<!--[^]*?-->/g, '');
  
  // 2. Collapse 3 or more newlines into 2 (max one empty line)
  // This cleans up the "trash" left by removed comment blocks
  sanitized = sanitized.replace(/\n{3,}/g, '\n\n');
  
  return sanitized.trim();
}

if (require.main === module) {
  try {
    const sourcePath = getLatestSourcePath();

    console.log(`Sanitizing and generating .gemini/system.md from ${sourcePath} ...`);

    const content = fs.readFileSync(sourcePath, 'utf8');
    const result = sanitize(content);

    fs.writeFileSync(destPath, result, 'utf8');
    console.log(`Successfully generated ${destPath}`);
  } catch (err) {
    console.error(`Error during sanitization: ${err.message}`);
    process.exit(1);
  }
}

module.exports = { sanitize, getLatestSourcePath };
