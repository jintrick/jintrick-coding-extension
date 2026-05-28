const fs = require('fs');
const path = require('path');
const { jsonParser, tomlParser } = require('./parsers.cjs');

const KNOWN_MANIFESTS = [
  { file: 'package.json', parser: 'json', paths: [['version']] },
  { file: 'gemini-extension.json', parser: 'json', paths: [['version']] },
  { file: 'pyproject.toml', parser: 'toml', paths: [['project', 'version'], ['tool', 'poetry', 'version']] },
  { file: 'Cargo.toml', parser: 'toml', paths: [['package', 'version']] }
];

function discoverManifests(rootDir, deps = {}) {
  const {
      fs: fsDeps = fs,
      path: pathDeps = path,
      jsonParser: jsonParserDeps = jsonParser,
      tomlParser: tomlParserDeps = tomlParser
  } = deps;

  const syncList = [];

  // Check for .idd-sync.json
  let customManifests = [];
  const iddSyncPath = pathDeps.join(rootDir, '.idd-sync.json');
  if (fsDeps.existsSync(iddSyncPath)) {
    try {
      const config = JSON.parse(fsDeps.readFileSync(iddSyncPath, 'utf8'));
      if (config.manifests && Array.isArray(config.manifests)) {
        customManifests = config.manifests;
      }
    } catch (e) {
      console.error('Failed to parse .idd-sync.json:', e);
    }
  }

  // Merge known and custom manifests
  // Use a Map to avoid duplicates, keyed by file name
  const allManifests = new Map();

  KNOWN_MANIFESTS.forEach(m => allManifests.set(m.file, m));
  customManifests.forEach(m => allManifests.set(m.file, m));

  for (const [filename, config] of allManifests) {
    const filepath = pathDeps.join(rootDir, filename);
    if (fsDeps.existsSync(filepath)) {
      try {
        const content = fsDeps.readFileSync(filepath, 'utf8');
        let parser;
        if (config.parser === 'json') {
          parser = jsonParserDeps;
        } else if (config.parser === 'toml') {
          parser = tomlParserDeps;
        } else {
            // infer from extension if not specified in custom config
            if (filename.endsWith('.json')) parser = jsonParserDeps;
            else if (filename.endsWith('.toml')) parser = tomlParserDeps;
            else continue;
        }

        const obj = parser.parse(content);

        // Find the valid key path
        let validPath = null;
        for (const keyPath of config.paths) {
            let current = obj;
            let valid = true;
            for (const k of keyPath) {
                if (current && typeof current === 'object' && k in current) {
                    current = current[k];
                } else {
                    valid = false;
                    break;
                }
            }
            if (valid) {
                validPath = keyPath;
                break;
            }
        }

        if (validPath) {
            syncList.push({
                filepath: filename, // Relative path
                parser: config.parser || (filename.endsWith('.json') ? 'json' : 'toml'),
                keyPath: validPath
            });
        }

      } catch (e) {
        // Log files that fail to parse to provide feedback on misconfigurations.
        console.error(`Failed to parse ${filename}:`, e);
      }
    }
  }

  return syncList;
}

module.exports = { discoverManifests };
