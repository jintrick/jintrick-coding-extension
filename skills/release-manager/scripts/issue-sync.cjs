const child_process = require('child_process');
const fs = require('fs');
const path = require('path');

function getGitBranch() {
  try {
    return child_process.execSync('git branch --show-current', { encoding: 'utf8' }).trim();
  } catch (e) {
    return '';
  }
}

function getFirstCommitDate(filePath) {
  try {
    // Get the date of the first commit for the file
    const dateStr = child_process.execSync(`git log --diff-filter=A --format=%as -- "${filePath}"`, { encoding: 'utf8' }).split('\n')[0].trim();
    return dateStr || null;
  } catch (e) {
    return null;
  }
}

function hasDiff(filePath) {
  try {
    const status = child_process.execSync(`git status --porcelain -- "${filePath}"`, { encoding: 'utf8' }).trim();
    return status !== '';
  } catch (e) {
    return false;
  }
}

function isTracked(filePath) {
  try {
    child_process.execSync(`git ls-files --error-unmatch -- "${filePath}"`, { stdio: 'ignore' });
    return true;
  } catch (e) {
    return false;
  }
}

function getStatus(content, filePath) {
  const hasUnchecked = /^- \[ \]/m.test(content);
  const hasChecked = /^- \[x\]/m.test(content);

  if (!hasUnchecked && !hasChecked) {
    console.error(`Warning: No task list (DoD) found in ${filePath}. Status will not be automatically updated.`);
    const match = content.match(/^status:\s*(.*)/m);
    return match ? match[1].trim() : 'drafting';
  }

  if (!hasUnchecked && hasChecked) {
    return 'completed';
  }

  if (!isTracked(filePath)) {
    return 'drafting';
  }

  // Check if there are any changes in the repo (other than this issue file)
  try {
    const diff = child_process.execSync('git status --porcelain', { encoding: 'utf8' }).trim();
    const lines = diff.split('\n').filter(line => line.trim() !== '' && !line.includes(filePath));
    if (lines.length > 0) {
      return 'in-progress';
    }
  } catch (e) {}

  return 'in-progress';
}

function syncIssue(filePath, forceIdAndType = false) {
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return null;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  const branch = getGitBranch();
  const branchParts = branch.split('/');
  
  let branchType = null;
  let branchId = null;
  if (branchParts.length === 2) {
    branchType = branchParts[0];
    branchId = branchParts[1];
  } else if (branch.startsWith('v')) {
    branchId = branch;
  }

  // Update ID and Type only if explicitly requested (e.g., specific file targeted)
  // or if they are missing from the frontmatter.
  if (forceIdAndType) {
    if (branchId) {
      content = content.replace(/^id: .*/m, `id: ${branchId}`);
    }
    if (branchType) {
      content = content.replace(/^type: .*/m, `type: ${branchType}`);
    }
  }

  // Update Created
  const firstCommit = getFirstCommitDate(filePath);
  if (firstCommit) {
    content = content.replace(/^created: .*/m, `created: ${firstCommit}`);
  } else {
    const today = new Date().toISOString().split('T')[0];
    const currentCreated = content.match(/^created: (.*)/m);
    if (!currentCreated || currentCreated[1].includes('yyyy-mm-dd') || currentCreated[1].trim() === '') {
      content = content.replace(/^created: .*/m, `created: ${today}`);
    }
  }

  // Update Status
  const newStatus = getStatus(content, filePath);
  content = content.replace(/^status: .*/m, `status: ${newStatus}`);

  // Remove fixed_commit if exists
  content = content.replace(/^fixed_commit:.*\n?/m, '');

  fs.writeFileSync(filePath, content);
  console.log(`Synced ${filePath}: id=${forceIdAndType && branchId ? branchId : 'keep'}, type=${forceIdAndType && branchType ? branchType : 'keep'}, status=${newStatus}`);
  return newStatus;
}

if (require.main === module) {
  const branch = getGitBranch();
  let branchId = null;
  const branchParts = branch.split('/');
  
  if (branchParts.length === 2) {
    branchId = branchParts[1];
  } else if (branch.startsWith('v')) {
    branchId = branch;
  }

  // If on an issue branch, sync and verify THAT issue
  if (branchId) {
    const targetPath = path.join('docs', 'issue', `${branchId}.md`);
    if (fs.existsSync(targetPath)) {
      const finalStatus = syncIssue(targetPath, true);
      if (finalStatus !== 'completed') {
        console.error(`Error: Issue ${targetPath} is not completed (status: ${finalStatus}). Release blocked.`);
        process.exit(1);
      }
      console.log(`Success: Issue ${targetPath} is completed. Ready for release.`);
      process.exit(0);
    } else {
      console.log(`Warning: Issue file ${targetPath} not found for branch ${branch}. Fallback to directory sync.`);
    }
  }

  // Fallback: Sync all issues if not on a specific issue branch
  const issueDir = path.join('docs', 'issue');
  if (fs.existsSync(issueDir)) {
    const files = fs.readdirSync(issueDir).filter(f => {
      if (!f.endsWith('.md')) return false;
      try {
        const content = fs.readFileSync(path.join(issueDir, f), 'utf8');
        return /^---[\s\S]*?^id:\s*v/m.test(content);
      } catch (e) {
        return false;
      }
    });
    for (const file of files) {
      syncIssue(path.join(issueDir, file), false);
    }
  }
}
module.exports = { syncIssue, getStatus, getGitBranch, getFirstCommitDate, hasDiff, isTracked };
