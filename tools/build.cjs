const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');

const CURRENT_DATE = new Date().toISOString().split('T')[0];

const hooks = [
  'hooks/scripts/linter_hook.cjs',
  'hooks/scripts/expert_docs_hook.cjs',
  'hooks/scripts/command_fixer_hook.cjs',
  'hooks/scripts/tech_stack_discovery_hook.cjs'
];

const linters = [
  'hooks/scripts/linters/js.cjs',
  'hooks/scripts/linters/cjs.cjs',
  'hooks/scripts/linters/mjs.cjs',
  'hooks/scripts/linters/ts.cjs',
  'hooks/scripts/linters/tsx.cjs',
  'hooks/scripts/linters/json.cjs',
  'hooks/scripts/linters/md.cjs',
  'hooks/scripts/linters/py.cjs'
];

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  let entries = fs.readdirSync(src, { withFileTypes: true });

  for (let entry of entries) {
    let srcPath = path.join(src, entry.name);
    let destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function promoteKnowledge() {
  const knowledgeDir = 'knowledge';
  if (!fs.existsSync(knowledgeDir)) return;

  const stacks = fs.readdirSync(knowledgeDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  for (const stack of stacks) {
    const targetDir = path.join('dist/skills', `tech-expert-${stack}`);
    fs.mkdirSync(targetDir, { recursive: true });

    const stackDir = path.join(knowledgeDir, stack);

    // 1. Generate manifest.json
    let detectors = [];
    const stackFiles = fs.readdirSync(stackDir);

    // 1.1 Priority: detector.json (Issue v1.27.0 implementation)
    if (stackFiles.includes('detector.json')) {
      const detectorPath = path.join(stackDir, 'detector.json');
      try {
        const data = JSON.parse(fs.readFileSync(detectorPath, 'utf8'));
        
        // Convert npm -> file_contains (package.json)
        if (data.npm && typeof data.npm === 'string') {
          detectors.push({ type: "file_contains", file: "package.json", pattern: `"${data.npm}"` });
        }
        
        // Convert files -> file_exists
        if (Array.isArray(data.files)) {
          data.files.forEach(file => {
            if (typeof file === 'string') {
              detectors.push({ type: "file_exists", file: file });
            }
          });
        }
        
        // Convert patterns -> specific rules
        if (Array.isArray(data.patterns)) {
          data.patterns.forEach(p => {
            if (p.file && p.pattern) {
              detectors.push({ type: "file_contains", file: p.file, pattern: p.pattern });
            }
          });
        }
      } catch (e) {
        console.warn(`[build] Failed to parse ${detectorPath}, falling back to inference. Error: ${e.message}`);
      }
    }

    // 1.2 Fallback: Inference rules (only if no valid detectors from detector.json)
    if (detectors.length === 0) {
      if (stackFiles.includes('package.json')) {
        const packageJsonPath = path.join(stackDir, 'package.json');
        try {
          const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
          const name = pkg.name || stack;
          detectors.push({ type: "file_contains", file: "package.json", pattern: `"${name}"` });
        } catch (e) {
          console.warn(`[build] Failed to parse ${packageJsonPath}, falling back to directory name. Error: ${e.message}`);
          detectors.push({ type: "file_contains", file: "package.json", pattern: `"${stack}"` });
        }
      }

      if (stackFiles.includes('requirements.txt')) {
        detectors.push({ type: "file_exists", file: "requirements.txt" });
      }
      if (stackFiles.includes('pyproject.toml')) {
        detectors.push({ type: "file_exists", file: "pyproject.toml" });
      }

      for (const file of stackFiles) {
        if (file.endsWith('.config.js') || file.endsWith('.config.ts') || file.startsWith('vite.config.') || file.startsWith('next.config.')) {
          detectors.push({ type: "file_exists", file: file });
        }
      }

      // Final fallback
      if (detectors.length === 0) {
        detectors.push({ type: "file_exists", file: `${stack}.config.js` });
      }
    }

    const manifest = {
      id: `tech-expert-${stack}`,
      name: `${stack.charAt(0).toUpperCase() + stack.slice(1)} Expert`,
      description: `${stack} に関する技術的な専門知識を提供します。`,
      version: CURRENT_DATE,
      detectors: detectors
    };
    fs.writeFileSync(path.join(targetDir, 'manifest.json'), JSON.stringify(manifest, null, 2));

    // 2. Generate SKILL.md
    const catalogInstruction = `回答の際は、まず \`references/catalog.json\` を読み込み、質問に関連するドキュメントを特定した上で、そのドキュメントの内容に基づいて回答してください。`;
    const skillMdPath = path.join(stackDir, 'SKILL.md');
    if (fs.existsSync(skillMdPath)) {
      const content = fs.readFileSync(skillMdPath, 'utf8');
      let updated = content;
      if (content.startsWith('---') && !content.includes('version:')) {
        updated = updated.replace('---', `---\nversion: ${CURRENT_DATE}`);
      }
      if (!content.includes('catalog.json')) {
        updated += `\n\n## ナレッジの活用方法\n${catalogInstruction}\n`;
      }
      fs.writeFileSync(path.join(targetDir, 'SKILL.md'), updated);
    } else {
      const defaultSkillMd = `---
name: tech-expert-${stack}
description: ${stack} に関する技術的な専門知識を提供します。
version: ${CURRENT_DATE}
---
# ${stack} Expert Skill
あなたは ${stack} のスペシャリストです。

## 動作指示
${catalogInstruction}
`;
      fs.writeFileSync(path.join(targetDir, 'SKILL.md'), defaultSkillMd);
    }

    // 3. Copy contents to references/
    const targetRefsDir = path.join(targetDir, 'references');
    fs.mkdirSync(targetRefsDir, { recursive: true });

    const entries = fs.readdirSync(stackDir, { withFileTypes: true });
    const ignoreFiles = ['package.json', 'requirements.txt', 'pyproject.toml', 'SKILL.md'];
    const catalog = [];

    for (const entry of entries) {
      if (ignoreFiles.includes(entry.name)) continue;

      const srcPath = path.join(stackDir, entry.name);
      const destPath = path.join(targetRefsDir, entry.name);

      if (entry.isDirectory()) {
        copyDir(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
        
        // Add to catalog if it's a markdown file
        if (entry.name.endsWith('.md')) {
          const content = fs.readFileSync(srcPath, 'utf8');
          const titleMatch = content.match(/^#\s+(.*)/m);
          const title = titleMatch ? titleMatch[1] : entry.name;
          
          // Simple summary: first paragraph after title or first 150 chars
          const body = content.replace(/^#\s+.*$/m, '').trim();
          const summary = body.split('\n')[0].substring(0, 150) || "No summary available.";
          
          catalog.push({
            path: `references/${entry.name}`,
            title: title,
            summary: summary
          });
        }
      }
    }

    // Write catalog.json
    fs.writeFileSync(path.join(targetRefsDir, 'catalog.json'), JSON.stringify(catalog, null, 2));

    // 2. Generate SKILL.md (Move after catalog generation to ensure instructions are consistent)
    // ... (rest of the logic)
  }
}

async function build() {
  // hooks をビルド
  for (const hook of hooks) {
    await esbuild.build({
      entryPoints: [hook],
      bundle: true,
      platform: 'node',
      outfile: path.join('dist', hook.replace('hooks/scripts/', 'hooks/')),
      external: ['./linters/*'], // リンターの動的requireは外部参照として残す
    });
  }

  // linters をビルド
  for (const linter of linters) {
    await esbuild.build({
      entryPoints: [linter],
      bundle: true,
      platform: 'node',
      outfile: path.join('dist', linter.replace('hooks/scripts/', 'hooks/')),
    });
  }

  // skills ディレクトリをコピー
  console.log('Copying skills...');
  copyDir('skills', 'dist/skills');

  // knowledge を昇格
  console.log('Promoting knowledge to skills...');
  promoteKnowledge();

  console.log('Build completed successfully!');
}

build().catch(err => {
  console.error(err);
  process.exit(1);
});
