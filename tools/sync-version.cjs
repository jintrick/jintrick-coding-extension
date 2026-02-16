const fs = require('fs');
const path = require('path');

const packageJsonPath = path.join(__dirname, '../package.json');
const extensionJsonPath = path.join(__dirname, '../gemini-extension.json');

function syncVersion() {
  if (!fs.existsSync(packageJsonPath)) {
    console.error('package.json not found');
    process.exit(1);
  }
  if (!fs.existsSync(extensionJsonPath)) {
    console.error('gemini-extension.json not found');
    process.exit(1);
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const extensionJson = JSON.parse(fs.readFileSync(extensionJsonPath, 'utf8'));

  const version = packageJson.version;
  console.log(`Syncing version: ${version}`);

  extensionJson.version = version;

  fs.writeFileSync(extensionJsonPath, JSON.stringify(extensionJson, null, 2) + '\n');
  console.log('Successfully updated gemini-extension.json');
}

syncVersion();
