import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { promoteKnowledge } from '../tools/build.cjs';

describe('build.cjs detector.json logic', () => {
  const tmpKnowledgeDir = path.join(process.cwd(), 'tests', 'tmp', 'detector', 'knowledge', 'test-detector');
  const distSkillDir = path.join(process.cwd(), 'tests', 'tmp', 'detector', 'skills', 'tech-expert-test-detector');
  const extensionVersion = "1.0.0"; // mock

  beforeEach(() => {
    if (!fs.existsSync(tmpKnowledgeDir)) {
      fs.mkdirSync(tmpKnowledgeDir, { recursive: true });
    }
  });

  afterEach(() => {
    const tmpDir = path.join(process.cwd(), 'tests', 'tmp', 'detector');
    if (fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
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

    promoteKnowledge({
      knowledgeDir: path.join(process.cwd(), 'tests', 'tmp', 'detector', 'knowledge'),
      skillsDir: path.join(process.cwd(), 'tests', 'tmp', 'detector', 'skills'),
      extensionVersion,
      clean: true
    });

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

  it('should throw Error if detector.json is corrupted', () => {
    // Write corrupted JSON
    fs.writeFileSync(path.join(tmpKnowledgeDir, 'detector.json'), '{ "npm": "test-package", missing_quote }');
    // Write fallback trigger
    fs.writeFileSync(path.join(tmpKnowledgeDir, 'requirements.txt'), 'flask');

    // Should throw error
    expect(() => {
      promoteKnowledge({
        knowledgeDir: path.join(process.cwd(), 'tests', 'tmp', 'detector', 'knowledge'),
        skillsDir: path.join(process.cwd(), 'tests', 'tmp', 'detector', 'skills'),
        extensionVersion,
        clean: true
      });
    }).toThrow(/Failed to parse/);
  });

  it('should throw and skip if no detectors can be generated', () => {
    // Empty directory, no detector.json, no package.json, no config files
    expect(() => {
      promoteKnowledge({
        knowledgeDir: path.join(process.cwd(), 'tests', 'tmp', 'detector', 'knowledge'),
        skillsDir: path.join(process.cwd(), 'tests', 'tmp', 'detector', 'skills'),
        extensionVersion,
        clean: true
      });
    }).toThrow(/No detector rules could be generated/);
  });
});
