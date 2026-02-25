import { describe, it, expect, beforeEach, afterEach } from 'vitest';
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
  });

  it('should update version in package.json and gemini-extension.json', () => {
    const packageJsonPath = path.join(tmpDir, 'package.json');
    const geminiJsonPath = path.join(tmpDir, 'gemini-extension.json');

    const initialPackageJson = { version: '1.0.0', name: 'test' };
    const initialGeminiJson = { version: '1.0.0', id: 'test-ext' };

    fs.writeFileSync(packageJsonPath, JSON.stringify(initialPackageJson, null, 2));
    fs.writeFileSync(geminiJsonPath, JSON.stringify(initialGeminiJson, null, 2));

    const newVersion = '1.1.0';
    updateVersion(newVersion, { fs, path, cwd: tmpDir });

    const updatedPackageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const updatedGeminiJson = JSON.parse(fs.readFileSync(geminiJsonPath, 'utf8'));

    expect(updatedPackageJson.version).toBe(newVersion);
    expect(updatedGeminiJson.version).toBe(newVersion);
  });

  it('should preserve indentation and trailing newline', () => {
    const packageJsonPath = path.join(tmpDir, 'package.json');
    // 4 spaces indent, with trailing newline
    const content = '{\n    "name": "test",\n    "version": "1.0.0"\n}\n';
    fs.writeFileSync(packageJsonPath, content);

    updateVersion('2.0.0', { fs, path, cwd: tmpDir });

    const newContent = fs.readFileSync(packageJsonPath, 'utf8');
    // JSON.stringify order depends on implementation but usually preserves insertion order for non-integer keys or reorders.
    // Here we are parsing and re-stringifying.
    // Wait, JSON.stringify does NOT preserve key order guaranteed, but V8 usually does for string keys.
    // However, my formatJson implementation uses JSON.stringify(obj, null, indent).
    // This will reconstruct the string.

    // Check if version is updated and format looks correct.
    expect(JSON.parse(newContent).version).toBe('2.0.0');
    expect(newContent).toMatch(/"version": "2.0.0"/);
    expect(newContent).toMatch(/^    "/m); // Indentation check
    expect(newContent).toMatch(/\n$/); // Trailing newline check
  });

  it('should handle missing files gracefully', () => {
    // Create empty dir
    const updatedFiles = updateVersion('1.0.0', { fs, path, cwd: tmpDir });
    expect(updatedFiles).toEqual([]);
  });
});
