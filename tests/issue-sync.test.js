import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import child_process from 'child_process';
import fs from 'fs';
import path from 'path';

import { syncIssue, getStatus } from '../tools/issue-sync.cjs';

describe('issue-sync.cjs', () => {
  let consoleLogSpy;
  let consoleErrorSpy;
  let writeFileSyncSpy;
  let existsSyncSpy;
  let readFileSyncSpy;
  let execSyncSpy;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    writeFileSyncSpy = vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {});
    existsSyncSpy = vi.spyOn(fs, 'existsSync').mockImplementation(() => true);
    readFileSyncSpy = vi.spyOn(fs, 'readFileSync').mockImplementation(() => '');
    execSyncSpy = vi.spyOn(child_process, 'execSync').mockImplementation(() => '');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getStatus', () => {
    it('returns completed if all tasks are checked', () => {
      const content = '- [x] Task 1\n- [x] Task 2\n';
      expect(getStatus(content, 'test.md')).toBe('completed');
    });

    it('returns drafting if file is not tracked by git', () => {
      const content = '- [ ] Task 1\n';
      execSyncSpy.mockImplementation((cmd) => {
        if (cmd.includes('git ls-files --error-unmatch')) {
          throw new Error('Not tracked');
        }
        return '';
      });
      expect(getStatus(content, 'test.md')).toBe('drafting');
    });

    it('returns in-progress if some tasks are unchecked and file is tracked', () => {
      const content = '- [ ] Task 1\n- [x] Task 2\n';
      execSyncSpy.mockImplementation((cmd) => {
        if (cmd.includes('git ls-files')) return '';
        if (cmd.includes('git status --porcelain')) return '';
        return '';
      });
      expect(getStatus(content, 'test.md')).toBe('in-progress');
    });

    it('returns current status and logs warning if no task list exists', () => {
      const content = '---\nstatus: custom-status\n---\n# Title';
      expect(getStatus(content, 'test.md')).toBe('custom-status');
      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Warning: No task list (DoD) found'));
    });
  });

  describe('syncIssue', () => {
    it('does not overwrite id/type if forceIdAndType is false and returns status', () => {
      const initialContent = '---\nid: v1.0.0\ntype: fix\nstatus: drafting\ncreated: yyyy-mm-dd\n---\n# Title';
      existsSyncSpy.mockReturnValue(true);
      readFileSyncSpy.mockReturnValue(initialContent);

      execSyncSpy.mockImplementation((cmd) => {
        if (cmd.includes('git branch')) return 'feat/v2.0.0\n';
        if (cmd.includes('git log --diff-filter=A')) return '2026-01-01\n';
        if (cmd.includes('git ls-files')) return '';
        return '';
      });

      const resultStatus = syncIssue('test.md', false);

      expect(writeFileSyncSpy).toHaveBeenCalled();
      const writtenContent = writeFileSyncSpy.mock.calls[0][1];
      
      // Should retain original ID and Type
      expect(writtenContent).toContain('id: v1.0.0');
      expect(writtenContent).toContain('type: fix');
      // Should update status based on content (no checkboxes -> retains current status due to warning logic)
      expect(writtenContent).toContain('status: drafting');
      expect(resultStatus).toBe('drafting');
    });

    it('overwrites id/type if forceIdAndType is true and returns status', () => {
      const initialContent = '---\nid: v1.0.0\ntype: fix\nstatus: drafting\ncreated: yyyy-mm-dd\n---\n# Title';
      existsSyncSpy.mockReturnValue(true);
      readFileSyncSpy.mockReturnValue(initialContent);

      execSyncSpy.mockImplementation((cmd) => {
        if (cmd.includes('git branch')) return 'feat/v2.10.0\n';
        if (cmd.includes('git log --diff-filter=A')) return '2026-01-01\n';
        if (cmd.includes('git ls-files')) return '';
        return '';
      });

      const resultStatus = syncIssue('test.md', true);

      expect(writeFileSyncSpy).toHaveBeenCalled();
      const writtenContent = writeFileSyncSpy.mock.calls[0][1];
      
      // Should overwrite ID and Type
      expect(writtenContent).toContain('id: v2.10.0');
      expect(writtenContent).toContain('type: feat');
      expect(resultStatus).toBe('drafting');
    });

    it('removes fixed_commit field', () => {
      const initialContent = '---\nid: v1.0.0\nfixed_commit: abcdef\ntype: fix\n---\n# Title';
      existsSyncSpy.mockReturnValue(true);
      readFileSyncSpy.mockReturnValue(initialContent);
      execSyncSpy.mockReturnValue('');

      syncIssue('test.md', false);

      const writtenContent = writeFileSyncSpy.mock.calls[0][1];
      expect(writtenContent).not.toContain('fixed_commit');
    });
  });
});

