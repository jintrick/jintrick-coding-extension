const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function getGitInfo() {
  try {
    const branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
    // Expected format: [type]/[id] (e.g., feat/v2.10.0 or v2.10.0)
    const parts = branch.split('/');
    let type = null;
    let id = null;

    if (parts.length === 2) {
      type = parts[0];
      id = parts[1];
    } else if (branch.startsWith('v')) {
      id = branch;
    }

    return { type, id };
  } catch (e) {
    return { type: null, id: null };
  }
}

function getPackageVersion() {
  try {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    return pkg.version;
  } catch (e) {
    return '0.0.0';
  }
}

function inferNextVersion(version, type) {
  const parts = version.split('.');
  if (parts.length < 3) return version;
  
  let [major, minor, patch] = parts.map(Number);
  if (type === 'feat' || type === 'refactor') {
    minor++;
    patch = 0;
  } else {
    patch++;
  }
  return `v${major}.${minor}.${patch}`;
}

function generate() {
  const { type: gitType, id: gitId } = getGitInfo();
  const currentVersion = getPackageVersion();
  const today = new Date().toISOString().split('T')[0];

  const id = gitId || inferNextVersion(currentVersion, gitType || 'feat');
  const type = gitType || 'feat';

  const templatePath = path.join(__dirname, '..', 'references', 'TEMPLATE.md');
  let content = fs.readFileSync(templatePath, 'utf8');

  content = content.replace(/^id: .*/m, `id: ${id}`);
  content = content.replace(/^type: .*/m, `type: ${type}`);
  content = content.replace(/^created: .*/m, `created: ${today}`);
  content = content.replace(/^status: .*/m, `status: drafting`);

  console.log(content);
}

generate();
