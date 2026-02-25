const smolToml = require('smol-toml');

// JSON Parser with formatting preservation
const jsonParser = {
  parse: (content) => {
    return JSON.parse(content);
  },
  stringify: (obj, originalContent) => {
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
};

// TOML Parser
const tomlParser = {
  parse: (content) => {
    return smolToml.parse(content);
  },
  stringify: (obj) => {
    return smolToml.stringify(obj);
  }
};

module.exports = {
  jsonParser,
  tomlParser
};
