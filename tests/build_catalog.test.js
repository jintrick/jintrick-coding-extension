import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { promoteKnowledge } from '../tools/build.cjs';

describe('build.cjs catalog generation', () => {
  const tmpKnowledgeDir = path.join(process.cwd(), 'tests', 'tmp', 'catalog', 'knowledge', 'test-stack');
  const distSkillDir = path.join(process.cwd(), 'tests', 'tmp', 'catalog', 'skills', 'tech-expert-test-stack');
  const extensionVersion = "1.0.0"; // mock

  beforeEach(() => {
    if (!fs.existsSync(tmpKnowledgeDir)) {
      fs.mkdirSync(tmpKnowledgeDir, { recursive: true });
    }
    fs.writeFileSync(path.join(tmpKnowledgeDir, 'doc1.md'), '# Test Title 1\nThis is a summary for doc1.');
    fs.writeFileSync(path.join(tmpKnowledgeDir, 'doc2.md'), '# Test Title 2\nThis is a summary for doc2.');
    fs.writeFileSync(path.join(tmpKnowledgeDir, 'package.json'), JSON.stringify({ name: "test-stack" }));
  });

  afterEach(() => {
    const tmpDir = path.join(process.cwd(), 'tests', 'tmp', 'catalog');
    if (fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it('should generate catalog.json in target dir', () => {
    promoteKnowledge({
      knowledgeDir: path.join(process.cwd(), 'tests', 'tmp', 'catalog', 'knowledge'),
      skillsDir: path.join(process.cwd(), 'tests', 'tmp', 'catalog', 'skills'),
      extensionVersion,
      clean: true
    });

    const catalogPath = path.join(distSkillDir, 'references', 'catalog.json');
    expect(fs.existsSync(catalogPath)).toBe(true);

    const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
    expect(catalog).toHaveLength(2);
    expect(catalog[0].title).toBe('Test Title 1');
  });

  it('should include catalog.json instructions in SKILL.md', () => {
    promoteKnowledge({
      knowledgeDir: path.join(process.cwd(), 'tests', 'tmp', 'catalog', 'knowledge'),
      skillsDir: path.join(process.cwd(), 'tests', 'tmp', 'catalog', 'skills'),
      extensionVersion,
      clean: true
    });

    const skillMdPath = path.join(distSkillDir, 'SKILL.md');
    const content = fs.readFileSync(skillMdPath, 'utf8');

    expect(content).toContain('catalog.json');
    expect(content).toContain('特定した上で');
  });

  it('should update existing SKILL.md without catalog instruction', () => {
    fs.writeFileSync(path.join(tmpKnowledgeDir, 'SKILL.md'), '---\nname: test\n---\n# Existing Skill');

    promoteKnowledge({
      knowledgeDir: path.join(process.cwd(), 'tests', 'tmp', 'catalog', 'knowledge'),
      skillsDir: path.join(process.cwd(), 'tests', 'tmp', 'catalog', 'skills'),
      extensionVersion,
      clean: true
    });

    const skillMdPath = path.join(distSkillDir, 'SKILL.md');
    const content = fs.readFileSync(skillMdPath, 'utf8');

    expect(content).toContain('ナレッジの活用方法');
    expect(content).toContain('catalog.json');
  });
});
