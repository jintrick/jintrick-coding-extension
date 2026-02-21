const { spawnSync } = require('child_process');

const LINTER_SCRIPT = `
import ast, sys, builtins
try: tree = ast.parse(sys.stdin.read())
except SyntaxError as e: print(f"SyntaxError: {e}", file=sys.stderr); sys.exit(1)
defined_all = set(dir(builtins)) | {'__name__', '__file__', '__doc__', '__package__', '__loader__', '__spec__', '__annotations__', '__builtins__'}
defined_globals = set(defined_all)
def collect_globals(node):
    if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef)): defined_globals.add(node.name); return
    if isinstance(node, (ast.Lambda, ast.ListComp, ast.SetComp, ast.DictComp, ast.GeneratorExp)): return
    if isinstance(node, (ast.Import, ast.ImportFrom)):
        for alias in node.names: defined_globals.add(alias.asname if alias.asname else alias.name.split('.')[0])
    if isinstance(node, ast.Name) and isinstance(node.ctx, ast.Store): defined_globals.add(node.id)
    if isinstance(node, ast.ExceptHandler) and node.name: defined_globals.add(node.name)
    for f, v in ast.iter_fields(node):
        if isinstance(v, list):
             for i in v:
                 if isinstance(i, ast.AST): collect_globals(i)
        elif isinstance(v, ast.AST): collect_globals(v)
collect_globals(tree)
defined_all.update(defined_globals)
for node in ast.walk(tree):
    if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef)): defined_all.add(node.name)
    elif isinstance(node, ast.Name) and isinstance(node.ctx, ast.Store): defined_all.add(node.id)
    elif isinstance(node, ast.arg): defined_all.add(node.arg)
    elif isinstance(node, (ast.Import, ast.ImportFrom)):
        for alias in node.names: defined_all.add(alias.asname if alias.asname else alias.name.split('.')[0])
    elif isinstance(node, ast.ExceptHandler) and node.name: defined_all.add(node.name)
def check(node, allowed, strict=False):
    if strict and isinstance(node, (ast.Lambda, ast.ListComp, ast.SetComp, ast.DictComp, ast.GeneratorExp)): return check(node, defined_all, False)
    if isinstance(node, ast.Name) and isinstance(node.ctx, ast.Load) and node.id not in allowed:
        print(f"line {node.lineno}: name '{node.id}' is not defined", file=sys.stderr); sys.exit(1)
    for f, v in ast.iter_fields(node):
        if isinstance(v, list):
            for i in v:
                if isinstance(i, ast.AST): check(i, allowed, strict)
        elif isinstance(v, ast.AST): check(v, allowed, strict)
for node in tree.body:
    if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef)): check(node, defined_all, False)
    else: check(node, defined_globals, True)
`;

module.exports = function(content, filePath, tool_name) {
  try {
    const runPython = (cmd) => {
      return spawnSync(cmd, ['-c', LINTER_SCRIPT], {
        input: content,
        encoding: 'utf8',
        timeout: 5000,
        shell: false
      });
    };

    let result = runPython('python');

    if (result.error && result.error.code === 'ENOENT') {
      result = runPython('python3');
    }

    if (result.error && result.error.code === 'ENOENT') {
      process.stderr.write(`[Debug] Python not found, skipping validation for ${filePath}\n`);
      return { valid: true };
    }

    if (result.status !== 0) {
      const isSyntaxError = result.stderr.includes('SyntaxError');
      const reason = isSyntaxError ? 'Python Syntax Error' : 'Python Linter Error';

      return {
        valid: false,
        reason: reason,
        systemMessage: `🚫 ${reason}: ${tool_name} で書き込もうとした ${filePath} にエラーがあります。
${result.stderr}`
      };
    }

    return { valid: true };
  } catch (e) {
    return {
      valid: false,
      reason: `Linter Error: ${e.message}`,
      systemMessage: `🚫 Python Linter Error: 予期せぬエラーが発生しました。
${e.message}`
    };
  }
};
