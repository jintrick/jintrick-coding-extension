const fs = require('fs');
const path = require('path');

function matchGlob(filePath, glob) {
  const normalizedPath = filePath.replace(/\\/g, '/');
  
  let escaped = glob.replace(/[.+^${}()|[\]\\]/g, '\\$&');
  escaped = escaped.replace(/\/\*\*\//g, '\u0001');
  escaped = escaped.replace(/\*\*/g, '\u0002');
  escaped = escaped.replace(/\*/g, '[^/]*');
  escaped = escaped.replace(/\?/g, '.');
  
  escaped = escaped.replace(/^\u0002\//, '(?:.*/)?');
  escaped = escaped.replace(/\u0001/g, '(?:/|/.*/)');
  escaped = escaped.replace(/\u0002/g, '.*');
  
  const regex = new RegExp((glob.includes('/') ? '^' : '(^|/)') + escaped + '$');
  return regex.test(normalizedPath);
}

function parseFrontmatter(content) {
  const frontmatterRegex = /^---(?:\r?\n)([\s\S]*?)(?:\r?\n)---(?:\r?\n)?([\s\S]*)$/;
  const match = content.match(frontmatterRegex);
  
  if (!match) return { frontmatter: {}, body: content };
  
  const frontmatterStr = match[1];
  const body = match[2];
  const frontmatter = {};
  
  const lines = frontmatterStr.split(/\r?\n/);
  let currentKey = null;
  
  for (const line of lines) {
    const kvMatch = line.match(/^([a-zA-Z0-9_-]+):\s*(.*)$/);
    if (kvMatch) {
      currentKey = kvMatch[1];
      const val = kvMatch[2].trim().replace(/^["'](.*)["']$/, '$1');
      if (val === '') {
          frontmatter[currentKey] = [];
      } else {
          frontmatter[currentKey] = val;
      }
    } else if (currentKey && line.trim().startsWith('- ')) {
      if (!Array.isArray(frontmatter[currentKey])) {
        const existingVal = frontmatter[currentKey];
        frontmatter[currentKey] = existingVal ? [existingVal] : [];
      }
      frontmatter[currentKey].push(line.replace(/^\s*-\s*/, '').trim().replace(/^["'](.*)["']$/, '$1'));
    }
  }
  
  return { frontmatter, body };
}

function main() {
  const args = [...new Set(process.argv.slice(2))];
  const cwd = process.cwd();
  
  // Try .agents/rules first, then fallback to .agents/rules
  let rulesDir = path.join(cwd, '.agents', 'rules');
  if (!fs.existsSync(rulesDir)) {
    rulesDir = path.join(cwd, '.agent', 'rules');
  }
  
  if (!fs.existsSync(rulesDir)) {
    console.log(JSON.stringify({ rules: {}, mapping: {} }, null, 2));
    process.exit(0);
  }
  
  const files = fs.readdirSync(rulesDir);
  const rules = {};
  const mapping = {};
  
  for (const arg of args) {
    const relativePath = path.relative(cwd, path.resolve(cwd, arg)).replace(/\\/g, '/');
    mapping[relativePath] = [];
  }
  
  for (const file of files) {
    if (!file.endsWith('.md')) continue;
    
    const rulePath = path.join(rulesDir, file);
    const content = fs.readFileSync(rulePath, 'utf8');
    const { frontmatter, body } = parseFrontmatter(content);
    
    if (frontmatter.trigger !== 'glob') continue;
    
    let globs = [];
    if (Array.isArray(frontmatter.globs)) {
      globs = frontmatter.globs;
    } else if (typeof frontmatter.globs === 'string') {
      globs = [frontmatter.globs];
    }
    
    if (args.length === 0) {
      rules[file] = body.trim();
    } else {
      let fileMatched = false;
      for (const arg of args) {
        const relativePath = path.relative(cwd, path.resolve(cwd, arg)).replace(/\\/g, '/');
        
        let pathMatched = false;
        for (const glob of globs) {
          if (matchGlob(relativePath, glob)) {
            pathMatched = true;
            break;
          }
        }
        
        if (pathMatched) {
          fileMatched = true;
          mapping[relativePath].push(file);
        }
      }
      
      if (fileMatched) {
        rules[file] = body.trim();
      }
    }
  }
  
  for (const key of Object.keys(mapping)) {
    if (mapping[key].length === 0) {
      delete mapping[key];
    }
  }
  
  console.log(JSON.stringify({ rules, mapping }, null, 2));
}

main();
