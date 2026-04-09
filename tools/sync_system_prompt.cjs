const fs = require('fs');
const path = require('path');

function syncSystemPrompt(content, destinations) {
  if (!destinations || destinations.length === 0) {
    destinations = [
      path.resolve(__dirname, '../.gemini/system.md'),
      path.resolve(__dirname, '../skills/init-jintrick-project/assets/.gemini/system.md')
    ];
  }

  for (const dest of destinations) {
    const dir = path.dirname(dest);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(dest, content, 'utf8');
    console.log(`Successfully synchronized system prompt to ${dest}`);
  }
}

if (require.main === module) {
  const sourcePath = process.argv[2];
  if (sourcePath && fs.existsSync(sourcePath)) {
    const content = fs.readFileSync(sourcePath, 'utf8');
    syncSystemPrompt(content);
  } else {
    console.error('Usage: node sync_system_prompt.cjs <source_file_path>');
    process.exit(1);
  }
}

module.exports = { syncSystemPrompt };
