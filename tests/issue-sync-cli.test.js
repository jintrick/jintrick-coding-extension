import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import child_process from 'child_process';

describe('issue-sync.cjs CLI filtering', () => {
  const tempDir = path.join(__dirname, 'tmp_issue_sync_cli');
  const issueDir = path.join(tempDir, 'docs', 'issue');

  beforeEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
    fs.mkdirSync(issueDir, { recursive: true });
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('filters out non-issue md files and processes valid ones', () => {
    // Create a valid issue file
    fs.writeFileSync(path.join(issueDir, 'v1.0.0.md'), '---\nid: v1.0.0\nstatus: drafting\n---\n- [ ] task');
    
    // Create an invalid md file (no frontmatter)
    fs.writeFileSync(path.join(issueDir, 'memo.md'), '# Memo\nJust a memo.');
    
    // Create an invalid md file (frontmatter but no id: v...)
    fs.writeFileSync(path.join(issueDir, 'other.md'), '---\ntitle: test\n---\ncontent');

    // Run the script. Since the script uses process.cwd(), we need to run it in the temp directory.
    // However, issue-sync.cjs is in the parent's tools/ dir.
    const scriptPath = path.resolve(__dirname, '../tools/issue-sync.cjs');
    
    // Create a dummy package.json or similar if needed? No, script only looks at docs/issue
    // and runs git commands. We should mock git commands if possible, or just let them fail
    // since git failure is caught in the script.
    
    const output = child_process.execSync(`node "${scriptPath}"`, { cwd: tempDir, encoding: 'utf8', stdio: 'pipe' });
    
    // Output should contain Synced ... v1.0.0.md
    expect(output).toContain('v1.0.0.md');
    // Output should NOT contain memo.md or other.md
    expect(output).not.toContain('memo.md');
    expect(output).not.toContain('other.md');
  });
});
