#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

/**
 * Open File Hook (Non-blocking)
 * AfterTool イベントで動作し、可読ファイルを VSCode で開く。
 * エージェントのループを一切止めないため、detached spawn を使用する。
 */
function main() {
  let input;
  try {
    const rawInput = fs.readFileSync(0, 'utf8');
    if (!rawInput) process.exit(0);
    input = JSON.parse(rawInput);
  } catch (e) {
    process.stderr.write(`[Debug] Failed to parse input JSON: ${e.message}
`);
    process.exit(0);
  }

  const { tool_input } = input;
  if (!tool_input || !tool_input.file_path) {
    allow();
  }

  const filePath = tool_input.file_path;
  const ext = path.extname(filePath).toLowerCase();

  // 対象拡張子の定義
  const targetExtensions = ['.md', '.txt', '.toml', '.yaml', '.yml', '.env', '.ini', '.xml'];

  if (targetExtensions.includes(ext)) {
    process.stderr.write(`[Debug] Opening readable file: ${filePath}
`);
    
    // 非ブロッキングでの起動 (detached)
    try {
      const child = spawn('code', [filePath], {
        detached: true,
        stdio: 'ignore',
        shell: true
      });
      child.unref();
    } catch (e) {
      process.stderr.write(`[Debug] Failed to spawn code: ${e.message}
`);
    }
  }

  allow();
}

function allow() {
  process.stdout.write(JSON.stringify({ decision: 'allow' }));
  process.exit(0);
}

main();
