import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import child_process from 'child_process';
import fs from 'fs';
import path from 'path';

import { generate, getGitInfo } from '../skills/jintrick-tools/scripts/generate-template.cjs';
// Note: inferNextVersion is now tested in its own test file

describe('generate-template.cjs', () => {
  let consoleLogSpy;
  let execSyncSpy;
  let readFileSyncSpy;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    execSyncSpy = vi.spyOn(child_process, 'execSync').mockImplementation(() => '');
    readFileSyncSpy = vi.spyOn(fs, 'readFileSync').mockImplementation(() => '');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getGitInfo', () => {
    it('returns type and id for standard branch name', () => {
      execSyncSpy.mockReturnValue('feat/v2.10.0\n');
      const info = getGitInfo();
      expect(info).toEqual({ type: 'feat', id: 'v2.10.0' });
    });

    it('returns only id for v-prefixed branch name without type', () => {
      execSyncSpy.mockReturnValue('v2.10.0\n');
      const info = getGitInfo();
      expect(info).toEqual({ type: null, id: 'v2.10.0' });
    });

    it('returns nulls on failure or non-matching branch', () => {
      execSyncSpy.mockImplementation(() => { throw new Error('Not git'); });
      const info = getGitInfo();
      expect(info).toEqual({ type: null, id: null });
    });
  });

  describe('generate', () => {
    let writeFileSyncSpy;
    let mkdirSyncSpy;
    let existsSyncSpy;

    beforeEach(() => {
      writeFileSyncSpy = vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {});
      mkdirSyncSpy = vi.spyOn(fs, 'mkdirSync').mockImplementation(() => {});
      existsSyncSpy = vi.spyOn(fs, 'existsSync').mockImplementation(() => false);
    });

    it('generates template and writes to docs/issue/vX.Y.Z.md', () => {
      execSyncSpy.mockImplementation((cmd) => {
        if (cmd.includes('git branch')) return 'feat/v2.10.0\n';
        return '';
      });
      
      // Mock TEMPLATE.md read only, other reads (package.json) are handled in inferNextVersion tested elsewhere
      // but generate() still reads TEMPLATE.md
      readFileSyncSpy.mockImplementation((file) => {
        if (file.includes('TEMPLATE.md')) return '---\nid: vX.Y.Z\ntype: feat\ncreated: yyyy-mm-dd\nstatus: drafting\n---\n';
        return '';
      });

      // getCurrentVersion mock
      existsSyncSpy.mockImplementation((file) => {
        if (file.includes('package.json')) return true;
        if (file.includes('docs/issue')) return true;
        return false;
      });
      readFileSyncSpy.mockImplementation((file) => {
        if (file.includes('package.json')) return JSON.stringify({ version: '2.9.1' });
        if (file.includes('TEMPLATE.md')) return '---\nid: vX.Y.Z\ntype: feat\ncreated: yyyy-mm-dd\nstatus: drafting\n---\n';
        return '';
      });

      generate();

      expect(writeFileSyncSpy).toHaveBeenCalled();
      const [filePath, content] = writeFileSyncSpy.mock.calls[0];
      expect(filePath).toMatch(/v2\.10\.0\.md$/);
      expect(content).toMatch(/^id: v2\.10\.0$/m);
      expect(content).toMatch(/^type: feat$/m);
      expect(content).toMatch(/^status: drafting$/m);
    });

    it('aborts if file already exists', () => {
      // getCurrentVersion mock
      existsSyncSpy.mockImplementation((file) => {
        if (file.includes('package.json')) return true;
        if (file.includes('v2.10.0.md')) return true; // Mark as existing
        return false;
      });
      readFileSyncSpy.mockImplementation((file) => {
        if (file.includes('package.json')) return JSON.stringify({ version: '2.9.1' });
        if (file.includes('TEMPLATE.md')) return 'template';
        return '';
      });
      
      const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process.exit');
      });
      
      expect(() => generate()).toThrow('process.exit');

      expect(writeFileSyncSpy).not.toHaveBeenCalled();
      expect(exitSpy).toHaveBeenCalledWith(1);
    });
  });
});
