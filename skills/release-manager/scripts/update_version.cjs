const fs = require('fs');
const path = require('path');
const { discoverManifests } = require('./lib/discovery.cjs');
const { jsonParser, tomlParser } = require('./lib/parsers.cjs');
const { validateVersion } = require('./lib/validation.cjs');

function updateVersion(targetVersion, deps = {}) {
  const {
    fs: fsDeps = fs,
    path: pathDeps = path,
    cwd = process.cwd(),
    discoverManifests: discoverDeps = discoverManifests,
    jsonParser: jsonParserDeps = jsonParser,
    tomlParser: tomlParserDeps = tomlParser,
    console: consoleDeps = console
  } = deps;

  // Validation
  const cleanVersion = targetVersion.startsWith('v') ? targetVersion.substring(1) : targetVersion;
  if (!validateVersion(cleanVersion)) {
    consoleDeps.error(`Invalid version format: ${targetVersion}. Expected SemVer (e.g., 1.0.0, v1.0.0).`);
    return null;
  }

  const manifests = discoverDeps(cwd, { fs: fsDeps, path: pathDeps, jsonParser: jsonParserDeps, tomlParser: tomlParserDeps });
  const updatedFiles = [];

  for (const item of manifests) {
    try {
      const filepath = pathDeps.join(cwd, item.filepath);
      const content = fsDeps.readFileSync(filepath, 'utf8');

      let parser;
      if (item.parser === 'json') {
        parser = jsonParserDeps;
      } else {
        parser = tomlParserDeps;
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
      if (current[lastKey] !== cleanVersion) {
        current[lastKey] = cleanVersion;

        let newContent;
        if (item.parser === 'json') {
            newContent = parser.stringify(obj, content);
        } else {
            newContent = parser.stringify(obj);
        }

        fsDeps.writeFileSync(filepath, newContent, 'utf8');
        updatedFiles.push(item.filepath);
        consoleDeps.log(`Updated ${item.filepath} to version ${cleanVersion}`);
      } else {
        consoleDeps.log(`${item.filepath} is already at version ${cleanVersion}`);
      }
    } catch (e) {
      consoleDeps.error(`Failed to update ${item.filepath}:`, e);
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

  const updated = updateVersion(version);
  if (updated === null) {
      process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { updateVersion };
