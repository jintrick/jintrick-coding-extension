const fs = require('fs');
const path = require('path');

const sourcePath = path.resolve(__dirname, '../skills/gemini-cli-expert/references/system_prompts/v0.35.3/jintrick.md');
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
    if (!fs.existsSync(sourcePath)) {
      console.error(`Source file not found: ${sourcePath}`);
      process.exit(1);
    }

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

module.exports = { sanitize };
