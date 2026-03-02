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

    // Scan all files in the stack knowledge directory
    const stackFiles = fs.readdirSync(stackDir);

    // Common detector inference rules
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

    // Config file inference: any file ending with .config.js or .config.ts or vite.config.*, next.config.*
    for (const file of stackFiles) {
      if (file.endsWith('.config.js') || file.endsWith('.config.ts') || file.startsWith('vite.config.') || file.startsWith('next.config.')) {
        detectors.push({ type: "file_exists", file: file });
      }
    }

    // Fallback if no detectors found
    if (detectors.length === 0) {
      detectors.push({ type: "file_exists", file: `${stack}.config.js` });
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
    const skillMdPath = path.join(stackDir, 'SKILL.md');
    if (fs.existsSync(skillMdPath)) {
      const content = fs.readFileSync(skillMdPath, 'utf8');
      if (content.startsWith('---') && !content.includes('version:')) {
        const updated = content.replace('---', `---\nversion: ${CURRENT_DATE}`);
        fs.writeFileSync(path.join(targetDir, 'SKILL.md'), updated);
      } else {
        fs.copyFileSync(skillMdPath, path.join(targetDir, 'SKILL.md'));
      }
    } else {
      const defaultSkillMd = `---
name: tech-expert-${stack}
description: ${stack} に関する技術的な専門知識を提供します。
version: ${CURRENT_DATE}
---
# ${stack} Expert Skill
あなたは ${stack} のスペシャリストです。\`references/\` 内のドキュメントに基づき、専門的な助言を行います。
`;
      fs.writeFileSync(path.join(targetDir, 'SKILL.md'), defaultSkillMd);
    }

    // 3. Copy contents to references/
    const targetRefsDir = path.join(targetDir, 'references');
    fs.mkdirSync(targetRefsDir, { recursive: true });

    const entries = fs.readdirSync(stackDir, { withFileTypes: true });
    const ignoreFiles = ['package.json', 'requirements.txt', 'pyproject.toml', 'SKILL.md'];

    for (const entry of entries) {
      if (ignoreFiles.includes(entry.name)) continue;

      const srcPath = path.join(stackDir, entry.name);
      const destPath = path.join(targetRefsDir, entry.name);

      if (entry.isDirectory()) {
        copyDir(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
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
