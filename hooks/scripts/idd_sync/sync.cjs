const fs = require('fs');
const path = require('path');
const { discoverManifests } = require('./discovery.cjs');
const { jsonParser, tomlParser } = require('./parsers.cjs');

function syncVersions(targetVersion, rootDir = '.') {
  const manifests = discoverManifests(rootDir);
  const updatedFiles = [];

  for (const item of manifests) {
    try {
      const filepath = path.join(rootDir, item.filepath);
      const content = fs.readFileSync(filepath, 'utf8');

      let parser;
      if (item.parser === 'json') {
        parser = jsonParser;
      } else {
        parser = tomlParser;
      }

      const obj = parser.parse(content);

      // Navigate to the key to update
      let current = obj;
      const keyPath = item.keyPath;
      // We assume keyPath is valid as per discovery logic
      for (let i = 0; i < keyPath.length - 1; i++) {
        current = current[keyPath[i]];
      }

      // Check if update is needed
      const lastKey = keyPath[keyPath.length - 1];
      if (current[lastKey] !== targetVersion) {
        current[lastKey] = targetVersion;

        let newContent;
        if (item.parser === 'json') {
            newContent = parser.stringify(obj, content);
        } else {
            newContent = parser.stringify(obj);
        }

        fs.writeFileSync(filepath, newContent, 'utf8');
        updatedFiles.push(item.filepath);
      }
    } catch (e) {
      console.error(`Failed to update ${item.filepath}:`, e);
    }
  }

  return updatedFiles;
}

module.exports = { syncVersions };
