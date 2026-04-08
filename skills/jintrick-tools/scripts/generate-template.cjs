const child_process = require('child_process');
const fs = require('fs');
const path = require('path');
const { inferNextVersion, getCurrentVersion } = require('./infer-next-version.cjs');

function getGitInfo() {
  try {
    const branch = child_process.execSync('git branch --show-current', { encoding: 'utf8' }).trim();
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

function generate() {
  const { type: gitType, id: gitId } = getGitInfo();
  const currentVersion = getCurrentVersion();
  const today = new Date().toISOString().split('T')[0];

  const id = gitId || inferNextVersion(currentVersion, gitType || 'feat');

  // Load template
  const templatePath = path.join(__dirname, '..', 'references', 'TEMPLATE.md');
  let content = fs.readFileSync(templatePath, 'utf8');

  // Replace placeholders
  content = content.replace(/^id: .*/m, `id: ${id}`);
  if (gitType) {
    content = content.replace(/^type: .*/m, `type: ${gitType}`);
  } else {
    content = content.replace(/^type: .*/m, `type: [TYPE] # ユーザーのIntentから推論して埋めてください (feat, fix, docs, chore, refactor)`);
  }
  content = content.replace(/^created: .*/m, `created: ${today}`);
  content = content.replace(/^status: .*/m, `status: drafting`);

  // Write to physical file
  const issueDir = path.resolve(process.cwd(), 'docs', 'issue');
  if (!fs.existsSync(issueDir)) {
    fs.mkdirSync(issueDir, { recursive: true });
  }

  const fileName = `${id}.md`;
  const filePath = path.join(issueDir, fileName);

  if (fs.existsSync(filePath)) {
    console.error(`Error: File already exists at ${filePath}. Aborting to prevent overwrite.`);
    process.exit(1);
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Successfully created issue file: ${filePath}`);
}

if (require.main === module) {
  generate();
}
module.exports = { generate, getGitInfo };
