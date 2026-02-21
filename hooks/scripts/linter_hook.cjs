#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

/**
 * Linter Hook (Modular Version)
 * 拡張子に応じて linters/ ディレクトリ内の各言語用バリデータ呼び出す
 */

function main() {
  let input;
  try {
    const rawInput = fs.readFileSync(0, 'utf8');
    if (!rawInput) process.exit(0);
    input = JSON.parse(rawInput);
  } catch (e) {
    process.stderr.write(`[Debug] Failed to parse input JSON: ${e.message}\n`);
    process.exit(0);
  }

  const { hook_event_name, tool_name, tool_input } = input;
  if (!tool_input) {
    process.stderr.write(`[Debug] No tool_input found\n`);
    allow();
  }

  const filePath = tool_input.file_path || '';
  if (!filePath) {
    process.stderr.write(`[Debug] No file_path in tool_input\n`);
    allow();
  }

  // BeforeTool (バリデーション) のみを処理
  if (hook_event_name !== 'BeforeTool') {
    allow();
  }

  const ext = path.extname(filePath).toLowerCase();
  
  // バリデーション対象外の拡張子はスキップ
  const supportedExtensions = ['.js', '.cjs', '.mjs', '.ts', '.tsx', '.json', '.md', '.py'];
  if (!supportedExtensions.includes(ext)) {
    allow();
  }

  let contentToValidate = '';

  // 置換後のコンテンツを再現
  if (tool_name === 'write_file') {
    contentToValidate = tool_input.content;
  } else if (tool_name === 'replace') {
    try {
      if (!fs.existsSync(filePath)) {
        process.stderr.write(`[Debug] File not found for replace: ${filePath}\n`);
        allow();
      }
      const currentContent = fs.readFileSync(filePath, 'utf8');
      const { old_string, new_string } = tool_input;

      if (old_string !== undefined && new_string !== undefined) {
        const normalizedContent = currentContent.replace(/\r\n/g, '\n');
        const normalizedOld = old_string.replace(/\r\n/g, '\n');
        const normalizedNew = new_string.replace(/\r\n/g, '\n');
        contentToValidate = normalizedContent.replace(normalizedOld, normalizedNew);
      } else {
        process.stderr.write(`[Debug] old_string or new_string missing in replace\n`);
        allow();
      }
    } catch (e) {
      process.stderr.write(`[Debug] Error reconstructing content for replace: ${e.message}\n`);
      allow();
    }
  } else {
    process.stderr.write(`[Debug] Unsupported tool for linter: ${tool_name}\n`);
    allow();
  }

  if (!contentToValidate) {
    process.stderr.write(`[Debug] No content to validate\n`);
    allow();
  }

  // モジュールの動的読み込みと実行
  const linterPath = path.join(__dirname, 'linters', `${ext.slice(1)}.cjs`);
  process.stderr.write(`[Debug] Linter path: ${linterPath}\n`);

  if (fs.existsSync(linterPath)) {
    try {
      const validate = require(linterPath);
      const result = validate(contentToValidate, filePath, tool_name);
      if (result.valid) {
        process.stderr.write(`[Debug] Linter result: valid\n`);
        allow();
      } else {
        process.stderr.write(`[Debug] Linter result: invalid (${result.reason})\n`);
        deny(result.reason, result.systemMessage);
      }
    } catch (e) {
      process.stderr.write(`[Debug] Failed to load or execute linter: ${e.message}\n`);
      allow();
    }
  } else {
    process.stderr.write(`[Debug] Linter not found for: ${ext}\n`);
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
