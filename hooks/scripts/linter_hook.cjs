#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

/**
 * Linter Hook (Modular Version)
 * 拡張子に応じて linters/ ディレクトリ内の各言語用バリデータを呼び出す。
 */

function main() {
  let input;
  try {
    const rawInput = fs.readFileSync(0, 'utf8');
    if (!rawInput) process.exit(0);
    input = JSON.parse(rawInput);
  } catch (e) {
    process.exit(0);
  }

  const { tool_name, tool_input } = input;
  if (!tool_input) allow();

  const filePath = tool_input.file_path || '';
  if (!filePath) allow();

  const ext = path.extname(filePath).toLowerCase();
  let contentToValidate = '';

  // 置換後のコンテンツを再現
  if (tool_name === 'write_file') {
    contentToValidate = tool_input.content;
  } else if (tool_name === 'replace') {
    try {
      if (!fs.existsSync(filePath)) allow();
      const currentContent = fs.readFileSync(filePath, 'utf8');
      const { old_string, new_string } = tool_input;
      
      if (old_string !== undefined && new_string !== undefined) {
        const normalizedContent = currentContent.replace(/\r\n/g, '\n');
        const normalizedOld = old_string.replace(/\r\n/g, '\n');
        const normalizedNew = new_string.replace(/\r\n/g, '\n');
        contentToValidate = normalizedContent.replace(normalizedOld, normalizedNew);
      } else {
        allow();
      }
    } catch (e) {
      allow();
    }
  } else {
    allow();
  }

  if (!contentToValidate) allow();

  // モジュールの動的読み込みと実行
  const linterPath = path.join(__dirname, 'linters', `${ext.slice(1)}.cjs`);
  
  if (fs.existsSync(linterPath)) {
    try {
      const validate = require(linterPath);
      const result = validate(contentToValidate, filePath, tool_name);
      if (result.valid) {
        allow();
      } else {
        deny(result.reason, result.systemMessage);
      }
    } catch (e) {
      // ロード失敗などは静かにパス
      allow();
    }
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
