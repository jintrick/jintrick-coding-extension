import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { updateVersion } from '../scripts/update_version.cjs';

describe('updateVersion', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'release-manager-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  it('should reject invalid version', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    // Pass console explicitly if needed, but spyOn works on global too if not passed via DI
    // Our implementation uses DI for console, so we pass it.
    const result = updateVersion('invalid-version', { fs, path, cwd: tmpDir, console });
    expect(result).toBeNull();
    expect(consoleError).toHaveBeenCalledWith(expect.stringContaining('Invalid version format'));
  });

  it('should accept valid SemVer versions', () => {
    const result = updateVersion('1.0.0', { fs, path, cwd: tmpDir });
    expect(result).toEqual([]); // No files to update, but not null (valid)

    const result2 = updateVersion('v2.0.0-rc.1', { fs, path, cwd: tmpDir });
    expect(result2).toEqual([]);
  });

  it('should update package.json correctly', () => {
    const packageJsonPath = path.join(tmpDir, 'package.json');
    const initialPackageJson = { version: '0.1.0', name: 'test' };
    fs.writeFileSync(packageJsonPath, JSON.stringify(initialPackageJson, null, 2));

    const result = updateVersion('1.0.0', { fs, path, cwd: tmpDir });
    expect(result).toContain('package.json');

    const updated = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    expect(updated.version).toBe('1.0.0');
  });

  it('should update pyproject.toml correctly', () => {
    const tomlPath = path.join(tmpDir, 'pyproject.toml');
    const initialToml = '[tool.poetry]\nversion = "0.1.0"\n';
    fs.writeFileSync(tomlPath, initialToml);

    const result = updateVersion('1.0.0', { fs, path, cwd: tmpDir });
    expect(result).toContain('pyproject.toml');

    const updatedContent = fs.readFileSync(tomlPath, 'utf8');
    expect(updatedContent).toContain('version = "1.0.0"');
  });

  it('should update Cargo.toml correctly', () => {
    const tomlPath = path.join(tmpDir, 'Cargo.toml');
    const initialToml = '[package]\nversion = "0.1.0"\n';
    fs.writeFileSync(tomlPath, initialToml);

    const result = updateVersion('1.0.0', { fs, path, cwd: tmpDir });
    expect(result).toContain('Cargo.toml');

    const updatedContent = fs.readFileSync(tomlPath, 'utf8');
    expect(updatedContent).toContain('version = "1.0.0"');
  });

  it('should handle multiple files', () => {
    fs.writeFileSync(path.join(tmpDir, 'package.json'), JSON.stringify({ version: '0.1.0' }));
    fs.writeFileSync(path.join(tmpDir, 'gemini-extension.json'), JSON.stringify({ version: '0.1.0' }));

    const result = updateVersion('1.0.0', { fs, path, cwd: tmpDir });
    expect(result).toHaveLength(2);
    expect(result).toContain('package.json');
    expect(result).toContain('gemini-extension.json');
  });

    it('should respect .idd-sync.json configuration', () => {
    const customJsonPath = path.join(tmpDir, 'custom.json');
    fs.writeFileSync(customJsonPath, JSON.stringify({ meta: { v: '0.1.0' } }));

    const iddSyncConfig = {
      manifests: [
        { file: 'custom.json', parser: 'json', paths: [['meta', 'v']] }
      ]
    };
    fs.writeFileSync(path.join(tmpDir, '.idd-sync.json'), JSON.stringify(iddSyncConfig));

    const result = updateVersion('1.0.0', { fs, path, cwd: tmpDir });
    expect(result).toContain('custom.json');

    const updated = JSON.parse(fs.readFileSync(customJsonPath, 'utf8'));
    expect(updated.meta.v).toBe('1.0.0');
  });
});
