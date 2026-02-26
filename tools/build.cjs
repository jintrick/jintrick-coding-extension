const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');

const hooks = [
  'hooks/scripts/linter_hook.cjs',
  'hooks/scripts/expert_docs_hook.cjs',
  'hooks/scripts/command_fixer_hook.cjs'
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

  console.log('Build completed successfully!');
}

build().catch(err => {
  console.error(err);
  process.exit(1);
});
