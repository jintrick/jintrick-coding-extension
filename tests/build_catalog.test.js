import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

describe('build.cjs catalog generation', () => {
  const tmpKnowledgeDir = path.join(process.cwd(), 'knowledge', 'test-stack');
  const distSkillDir = path.join(process.cwd(), 'dist', 'skills', 'tech-expert-test-stack');

  beforeEach(() => {
    if (!fs.existsSync(tmpKnowledgeDir)) {
      fs.mkdirSync(tmpKnowledgeDir, { recursive: true });
    }
    fs.writeFileSync(path.join(tmpKnowledgeDir, 'doc1.md'), '# Test Title 1\nThis is a summary for doc1.');
    fs.writeFileSync(path.join(tmpKnowledgeDir, 'doc2.md'), '# Test Title 2\nThis is a summary for doc2.');
  });

  afterEach(() => {
    if (fs.existsSync(tmpKnowledgeDir)) {
      fs.rmSync(tmpKnowledgeDir, { recursive: true, force: true });
    }
    if (fs.existsSync(distSkillDir)) {
      fs.rmSync(distSkillDir, { recursive: true, force: true });
    }
  });

  it('should generate catalog.json in dist/skills/tech-expert-test-stack/references/', () => {
    execSync('node tools/build.cjs');

    const catalogPath = path.join(distSkillDir, 'references', 'catalog.json');
    expect(fs.existsSync(catalogPath)).toBe(true);

    const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
    expect(catalog).toHaveLength(2);
    expect(catalog[0].title).toBe('Test Title 1');
  });

  it('should include catalog.json instructions in SKILL.md', () => {
    execSync('node tools/build.cjs');

    const skillMdPath = path.join(distSkillDir, 'SKILL.md');
    const content = fs.readFileSync(skillMdPath, 'utf8');
    
    expect(content).toContain('catalog.json');
    expect(content).toContain('特定した上で');
  });

  it('should update existing SKILL.md without catalog instruction', () => {
    fs.writeFileSync(path.join(tmpKnowledgeDir, 'SKILL.md'), '---\nname: test\n---\n# Existing Skill');
    
    execSync('node tools/build.cjs');

    const skillMdPath = path.join(distSkillDir, 'SKILL.md');
    const content = fs.readFileSync(skillMdPath, 'utf8');
    
    expect(content).toContain('ナレッジの活用方法');
    expect(content).toContain('catalog.json');
  });
});
