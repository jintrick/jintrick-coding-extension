import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import child_process from 'child_process';
import fs from 'fs';
import path from 'path';

import { generate, getGitInfo, inferNextVersion } from '../skills/issue-crafter/scripts/generate-template.cjs';

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

  describe('inferNextVersion', () => {
    it('increments minor for feat', () => {
      expect(inferNextVersion('2.9.1', 'feat')).toBe('v2.10.0');
    });

    it('increments minor for refactor', () => {
      expect(inferNextVersion('2.9.1', 'refactor')).toBe('v2.10.0');
    });

    it('increments patch for fix', () => {
      expect(inferNextVersion('2.9.1', 'fix')).toBe('v2.9.2');
    });

    it('increments patch for docs', () => {
      expect(inferNextVersion('2.9.1', 'docs')).toBe('v2.9.2');
    });
  });

  describe('generate', () => {
    it('generates template with branch info', () => {
      execSyncSpy.mockImplementation((cmd) => {
        if (cmd.includes('git branch')) return 'feat/v2.10.0\n';
        return '';
      });
      
      readFileSyncSpy.mockImplementation((file) => {
        if (file.includes('package.json')) return JSON.stringify({ version: '2.9.1' });
        if (file.includes('TEMPLATE.md')) return '---\nid: vX.Y.Z\ntype: feat\ncreated: yyyy-mm-dd\nstatus: drafting\n---\n';
        return '';
      });

      generate();

      expect(consoleLogSpy).toHaveBeenCalled();
      const output = consoleLogSpy.mock.calls[0][0];
      expect(output).toMatch(/^id: v2\.10\.0$/m);
      expect(output).toMatch(/^type: feat$/m);
      expect(output).toMatch(/^status: drafting$/m);
    });

    it('generates placeholder type if branch lacks type', () => {
      execSyncSpy.mockImplementation((cmd) => {
        if (cmd.includes('git branch')) throw new Error('Not a git repository');
        return '';
      });
      
      readFileSyncSpy.mockImplementation((file) => {
        if (file.includes('package.json')) return JSON.stringify({ version: '2.9.1' });
        if (file.includes('TEMPLATE.md')) return '---\nid: vX.Y.Z\ntype: feat\ncreated: yyyy-mm-dd\nstatus: drafting\n---\n';
        return '';
      });

      generate();

      expect(consoleLogSpy).toHaveBeenCalled();
      const output = consoleLogSpy.mock.calls[0][0];
      // Since default fallback is 'feat' for inferNextVersion if gitType is null
      expect(output).toMatch(/^id: v2\.10\.0$/m); 
      expect(output).toMatch(/^type: \[TYPE\]/m);
      expect(output).toMatch(/^status: drafting$/m);
    });
  });
});
