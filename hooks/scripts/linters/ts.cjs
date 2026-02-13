/**
 * TypeScript Linter Module
 */
const ts = require('typescript');

module.exports = function(content, filePath, tool_name) {
  try {
    // ソースファイルを作成（パース実行）
    const sourceFile = ts.createSourceFile(
      filePath,
      content,
      ts.ScriptTarget.Latest, // 最新のJS機能を許可
      true // setParentNodes
    );

    // 構文エラーのみを取得 (parseDiagnostics)
    // プログラム全体を作らず、単一ファイルとしての構文チェックを行う
    const diagnostics = sourceFile.parseDiagnostics;

    if (diagnostics && diagnostics.length > 0) {
      // 最初のエラーを報告
      const firstError = diagnostics[0];
      const message = ts.flattenDiagnosticMessageText(firstError.messageText, '\n');
      
      let loc = '';
      if (firstError.file && firstError.start !== undefined) {
        const { line, character } = firstError.file.getLineAndCharacterOfPosition(firstError.start);
        loc = `line ${line + 1}, col ${character + 1}`;
      }

      return {
        valid: false,
        reason: `Syntax Error in ${filePath}: ${message}`,
        systemMessage: `🚫 TS Syntax Error: ${tool_name} で書き込もうとした ${filePath} に構文エラーがあります。
位置: ${loc}
エラー: ${message}`
      };
    }

    return { valid: true };

  } catch (e) {
    return {
      valid: false,
      reason: `Linter Error: ${e.message}`,
      systemMessage: `🚫 TS Linter Error: 予期せぬエラーが発生しました。
${e.message}`
    };
  }
};
