const fs = require('fs');
const path = require('path');

function formatJson(obj, originalContent) {
  // Detect indentation
  let indent = 2; // Default
  const match = originalContent.match(/^[ \t]+(?=")/m);
  if (match) {
    indent = match[0];
  }

  // Detect trailing newline
  const hasTrailingNewline = originalContent.endsWith('\n');

  let stringified = JSON.stringify(obj, null, indent);
  if (hasTrailingNewline) {
    stringified += '\n';
  }
  return stringified;
}

function updateVersion(version, deps = {}) {
  const {
    fs: fsDeps = fs,
    path: pathDeps = path,
    cwd = process.cwd()
  } = deps;

  const filesToUpdate = ['package.json', 'gemini-extension.json'];
  const updatedFiles = [];

  for (const file of filesToUpdate) {
    const filePath = pathDeps.join(cwd, file);
    if (fsDeps.existsSync(filePath)) {
      try {
        const content = fsDeps.readFileSync(filePath, 'utf8');
        const obj = JSON.parse(content);

        // Update version if different
        if (obj.version !== version) {
          obj.version = version;
          const newContent = formatJson(obj, content);
          fsDeps.writeFileSync(filePath, newContent, 'utf8');
          updatedFiles.push(file);
          console.log(`Updated ${file} to version ${version}`);
        } else {
          console.log(`${file} is already at version ${version}`);
        }
      } catch (e) {
        console.error(`Failed to update ${file}:`, e);
      }
    } else {
      console.log(`File not found: ${filePath}`);
    }
  }
  return updatedFiles;
}

function main() {
  const version = process.argv[2];
  if (!version) {
    console.error('Please provide a version number.');
    process.exit(1);
  }
  updateVersion(version);
}

if (require.main === module) {
  main();
}

module.exports = { updateVersion, formatJson };
