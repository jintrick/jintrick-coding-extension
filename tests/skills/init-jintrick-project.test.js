import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const extensionPath = path.resolve(__dirname, '../../');
const scriptPath = path.join(extensionPath, 'skills/init-jintrick-project/scripts/init_project.cjs');

describe('init-jintrick-project script', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'init-jintrick-test-'));
  });

  afterEach(() => {
    if (fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it('should initialize project in an empty directory', () => {
    console.log(`Testing initialization in ${tmpDir}`);
    execSync(`node "${scriptPath}"`, { cwd: tmpDir });
    
    expect(fs.existsSync(path.join(tmpDir, 'package.json'))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, '.gemini/system.md'))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, '.agent/rules/comment-preservation.md'))).toBe(true);
  });

  it('should fail if package.json already exists', () => {
    fs.writeFileSync(path.join(tmpDir, 'package.json'), '{}');
    
    expect(() => {
      execSync(`node "${scriptPath}"`, { cwd: tmpDir, stdio: 'pipe' });
    }).toThrow();
  });

  it('should succeed with --force if package.json already exists', () => {
    fs.writeFileSync(path.join(tmpDir, 'package.json'), '{}');
    
    execSync(`node "${scriptPath}" --force`, { cwd: tmpDir });
    
    const pkg = JSON.parse(fs.readFileSync(path.join(tmpDir, 'package.json'), 'utf8'));
    expect(pkg.name).toBe('jintrick-project');
  });
});
