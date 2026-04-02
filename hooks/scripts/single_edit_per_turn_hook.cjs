#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function main() {
  let input;
  try {
    const rawInput = fs.readFileSync(0, 'utf8');
    if (!rawInput) process.exit(0);
    input = JSON.parse(rawInput);
  } catch (e) {
    process.exit(0);
  }

  const { hook_event_name, tool_name, tool_input, session_id } = input;
  if (!session_id) {
    allow();
  }

  const cacheDir = path.join(__dirname, '..', 'cache');
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }
  const cacheFile = path.join(cacheDir, `modified_${session_id}.json`);

  if (hook_event_name === 'BeforeTool') {
    if (tool_name !== 'write_file' && tool_name !== 'replace') {
      allow();
    }
    const filePath = tool_input && tool_input.file_path;
    if (!filePath) {
      allow();
    }

    let modifiedFiles = [];
    if (fs.existsSync(cacheFile)) {
      try {
        modifiedFiles = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
      } catch (e) {
        modifiedFiles = [];
      }
    }

    if (modifiedFiles.includes(filePath)) {
      deny(
        "Duplicate file edit in a single turn",
        "同一ターン内での同一ファイルに対する複数回の編集（replace/write_file）は禁止されています。すべての変更を1つの write_file にまとめるか、一旦思考を止めてユーザーに報告し、次のターンで残りの編集を行ってください。"
      );
    } else {
      modifiedFiles.push(filePath);
      fs.writeFileSync(cacheFile, JSON.stringify(modifiedFiles));
      allow();
    }
  } else if (hook_event_name === 'AfterAgent') {
    if (fs.existsSync(cacheFile)) {
      fs.unlinkSync(cacheFile);
    }
    allow();
  } else {
    allow();
  }
}

function allow() {
  console.log(JSON.stringify({ decision: 'allow' }));
  process.exit(0);
}

function deny(reason, systemMessage) {
  console.log(JSON.stringify({
    decision: 'deny',
    reason: reason,
    systemMessage: systemMessage
  }));
  process.exit(0);
}

main();
