import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

describe('build.cjs detector.json logic', () => {
  const tmpKnowledgeDir = path.join(process.cwd(), 'knowledge', 'test-detector');
  const distSkillDir = path.join(process.cwd(), 'dist', 'skills', 'tech-expert-test-detector');

  beforeEach(() => {
    if (!fs.existsSync(tmpKnowledgeDir)) {
      fs.mkdirSync(tmpKnowledgeDir, { recursive: true });
    }
  });

  afterEach(() => {
    if (fs.existsSync(tmpKnowledgeDir)) {
      fs.rmSync(tmpKnowledgeDir, { recursive: true, force: true });
    }
    if (fs.existsSync(distSkillDir)) {
      fs.rmSync(distSkillDir, { recursive: true, force: true });
    }
  });

  it('should parse detector.json and generate correct detectors', () => {
    const detectorData = {
      npm: "test-package",
      files: ["test.config.js"],
      patterns: [
        { file: "Makefile", pattern: "test-lib" }
      ]
    };
    fs.writeFileSync(path.join(tmpKnowledgeDir, 'detector.json'), JSON.stringify(detectorData));

    // Also place a package.json to ensure detector.json takes priority and doesn't mix them
    fs.writeFileSync(path.join(tmpKnowledgeDir, 'package.json'), JSON.stringify({ name: "wrong-package" }));

    execSync('node tools/build.cjs');

    const manifestPath = path.join(distSkillDir, 'manifest.json');
    expect(fs.existsSync(manifestPath)).toBe(true);

    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    expect(manifest.detectors).toHaveLength(3);
    
    // Check npm -> file_contains
    expect(manifest.detectors).toContainEqual({
      type: 'file_contains',
      file: 'package.json',
      pattern: '"test-package"'
    });

    // Check files -> file_exists
    expect(manifest.detectors).toContainEqual({
      type: 'file_exists',
      file: 'test.config.js'
    });

    // Check patterns -> specific rules
    expect(manifest.detectors).toContainEqual({
      type: 'file_contains',
      file: 'Makefile',
      pattern: 'test-lib'
    });

    // Ensure fallback logic (wrong-package) was skipped
    expect(manifest.detectors).not.toContainEqual({
      type: 'file_contains',
      file: 'package.json',
      pattern: '"wrong-package"'
    });
  });

  it('should fallback to inference rules if detector.json is corrupted', () => {
    // Write corrupted JSON
    fs.writeFileSync(path.join(tmpKnowledgeDir, 'detector.json'), '{ "npm": "test-package", missing_quote }');
    // Write fallback trigger
    fs.writeFileSync(path.join(tmpKnowledgeDir, 'requirements.txt'), 'flask');

    // Should not throw error and crash
    execSync('node tools/build.cjs', { stdio: 'pipe' });

    const manifestPath = path.join(distSkillDir, 'manifest.json');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    
    // Should fallback to requirements.txt
    expect(manifest.detectors).toHaveLength(1);
    expect(manifest.detectors[0]).toEqual({
      type: 'file_exists',
      file: 'requirements.txt'
    });
  });
});
