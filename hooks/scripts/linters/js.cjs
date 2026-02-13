/**
 * JavaScript Linter Module (using acorn)
 */
const acorn = require('acorn');
const path = require('path');

module.exports = function(content, filePath, tool_name) {
  const ext = path.extname(filePath).toLowerCase();
  
  // デフォルトのパースモード決定
  // .mjs -> module (ESM)
  // .cjs -> script (CommonJS)
  // .js  -> module (とりあえずESMとして試す)
  let sourceType = 'script';
  if (ext === '.mjs' || ext === '.js') {
    sourceType = 'module';
  }
  
  try {
    parse(content, sourceType);
    return { valid: true };
  } catch (e) {
    // .js の場合、CommonJS (script) かもしれないのでリトライ
    // 例: トップレベルの return や、strict mode 違反など
    if (ext === '.js' && sourceType === 'module') {
      try {
        parse(content, 'script');
        return { valid: true };
      } catch (e2) {
        // リトライも失敗したら、最初のエラー（またはより適切な方）を返す
        // 通常は最初のエラーの方がユーザーにとって直感的なことが多い（import文を使っていて怒られた場合など）
        return formatError(e, filePath, tool_name);
      }
    }
    
    return formatError(e, filePath, tool_name);
  }
};

function parse(content, sourceType) {
  acorn.parse(content, {
    ecmaVersion: 'latest', // 最新のECMAScript仕様
    sourceType: sourceType,
    locations: true,       // エラー時の位置情報
    allowHashBang: true    // #!/usr/bin/env node を許可
  });
}

function formatError(e, filePath, tool_name) {
  const loc = e.loc ? `line ${e.loc.line}, col ${e.loc.column}` : '';
  // エラーメッセージから末尾の (line:col) を削除して見やすくする
  const message = e.message.replace(/\s*\(\d+:\d+\)$/, ''); 

  return {
    valid: false,
    reason: `Syntax Error in ${filePath}: ${message}`,
    systemMessage: `🚫 JS Syntax Error: ${tool_name} で書き込もうとした ${filePath} に構文エラーがあります。\n位置: ${loc}\nエラー: ${message}`
  };
}
