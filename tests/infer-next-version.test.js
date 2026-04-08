import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { inferNextVersion, getCurrentVersion } from '../skills/jintrick-tools/scripts/infer-next-version.cjs';
import fs from 'fs';

describe('infer-next-version.cjs', () => {
  describe('inferNextVersion', () => {
    it('feat の場合はマイナーバージョンを上げ、パッチを 0 にする', () => {
      expect(inferNextVersion('1.2.3', 'feat')).toBe('v1.3.0');
    });

    it('refactor の場合もマイナーバージョンを上げ、パッチを 0 にする', () => {
      expect(inferNextVersion('2.5.5', 'refactor')).toBe('v2.6.0');
    });

    it('fix の場合はパッチバージョンを上げる', () => {
      expect(inferNextVersion('1.0.0', 'fix')).toBe('v1.0.1');
    });

    it('docs の場合もパッチバージョンを上げる', () => {
      expect(inferNextVersion('2.0.1', 'docs')).toBe('v2.0.2');
    });

    it('vプレフィックスが付いていても正しく処理できる', () => {
      expect(inferNextVersion('v1.2.3', 'feat')).toBe('v1.3.0');
    });

    it('不正な形式のバージョンの場合は入力をそのまま返す', () => {
      expect(inferNextVersion('invalid', 'feat')).toBe('invalid');
      expect(inferNextVersion('1.2', 'feat')).toBe('1.2');
    });
  });

  describe('getCurrentVersion', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('package.json からバージョンを取得できる', () => {
      vi.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify({ version: '3.2.1' }));
      expect(getCurrentVersion()).toBe('3.2.1');
    });

    it('取得失敗時は 0.0.0 を返す', () => {
      vi.spyOn(fs, 'readFileSync').mockImplementation(() => { throw new Error(); });
      expect(getCurrentVersion()).toBe('0.0.0');
    });
  });
});
