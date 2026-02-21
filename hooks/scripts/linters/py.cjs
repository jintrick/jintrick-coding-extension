const { spawnSync } = require('child_process');

const LINTER_SCRIPT = `
import ast, sys, builtins
try: tree = ast.parse(sys.stdin.read())
except SyntaxError as e: print(f"SyntaxError: {e}", file=sys.stderr); sys.exit(1)

# Pass 1: Collect ALL global definitions (including future ones)
final_globals = set(dir(builtins)) | {'__name__', '__file__', '__doc__', '__package__', '__loader__', '__spec__', '__annotations__', '__builtins__'}

def collect_target(node, scope):
    if isinstance(node, ast.Name): scope.add(node.id)
    elif isinstance(node, (ast.Tuple, ast.List)):
        for elt in node.elts: collect_target(elt, scope)

def collect_defs(node, scope):
    if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef)):
        scope.add(node.name)
    elif isinstance(node, (ast.Import, ast.ImportFrom)):
        for alias in node.names:
            scope.add(alias.asname if alias.asname else alias.name.split('.')[0])
    elif isinstance(node, (ast.Assign, ast.AnnAssign)):
        targets = node.targets if isinstance(node, ast.Assign) else [node.target]
        for t in targets: collect_target(t, scope)
    elif isinstance(node, (ast.For, ast.AsyncFor)):
        collect_target(node.target, scope)
    elif isinstance(node, (ast.With, ast.AsyncWith)):
        for item in node.items:
            if item.optional_vars: collect_target(item.optional_vars, scope)

    if isinstance(node, (ast.If, ast.For, ast.AsyncFor, ast.While, ast.With, ast.AsyncWith, ast.Try)):
        for field, value in ast.iter_fields(node):
            if isinstance(value, list):
                for item in value:
                    if isinstance(item, ast.AST): collect_defs(item, scope)
            elif isinstance(value, ast.AST):
                collect_defs(value, scope)

for node in tree.body:
    collect_defs(node, final_globals)

# Pass 2: Sequential Analysis
current_globals = set(dir(builtins)) | {'__name__', '__file__', '__doc__', '__package__', '__loader__', '__spec__', '__annotations__', '__builtins__'}

def check_node(node, read_scope, write_scope):
    if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef)):
        write_scope.add(node.name)
        func_scope = set(final_globals) # Start with all globals
        # Add arguments to local scope
        args = node.args if hasattr(node, 'args') else None
        if args:
            for arg in args.args: func_scope.add(arg.arg)
            for arg in args.kwonlyargs: func_scope.add(arg.arg)
            if args.vararg: func_scope.add(args.vararg.arg)
            if args.kwarg: func_scope.add(args.kwarg.arg)

        for child in node.body:
             check_node(child, func_scope, func_scope)
        return

    if isinstance(node, (ast.Import, ast.ImportFrom)):
        for alias in node.names:
            name = alias.asname if alias.asname else alias.name.split('.')[0]
            write_scope.add(name)
        return

    if isinstance(node, ast.ExceptHandler):
        handler_scope = set(read_scope)
        if node.name: handler_scope.add(node.name)
        for child in node.body:
            check_node(child, handler_scope, write_scope)
        return

    if isinstance(node, ast.Name) and isinstance(node.ctx, ast.Load):
        if node.id not in read_scope:
            print(f"line {node.lineno}: name '{node.id}' is not defined", file=sys.stderr); sys.exit(1)
        return # Important: Return here to stop recursion on Name node

    if isinstance(node, (ast.Assign, ast.AnnAssign)):
        if isinstance(node, ast.Assign):
            check_node(node.value, read_scope, write_scope)
        elif node.value:
            check_node(node.value, read_scope, write_scope)
        targets = node.targets if isinstance(node, ast.Assign) else [node.target]
        for t in targets: collect_target(t, write_scope)
        return

    if isinstance(node, (ast.ListComp, ast.SetComp, ast.DictComp, ast.GeneratorExp)):
        comp_scope = set(read_scope)
        for gen in node.generators:
            check_node(gen.iter, read_scope, write_scope) # iter uses OUTER scope
            collect_target(gen.target, comp_scope) # target adds to INNER scope
            for if_expr in gen.ifs: check_node(if_expr, comp_scope, comp_scope)

        elt = node.elt if hasattr(node, 'elt') else None
        if isinstance(node, ast.DictComp):
            check_node(node.key, comp_scope, comp_scope)
            check_node(node.value, comp_scope, comp_scope)
        elif elt:
            check_node(elt, comp_scope, comp_scope)
        return

    if isinstance(node, (ast.For, ast.AsyncFor)):
        check_node(node.iter, read_scope, write_scope)
        collect_target(node.target, write_scope)
        for child in node.body: check_node(child, read_scope, write_scope)
        for child in node.orelse: check_node(child, read_scope, write_scope)
        return

    if isinstance(node, (ast.With, ast.AsyncWith)):
        for item in node.items:
            check_node(item.context_expr, read_scope, write_scope)
            if item.optional_vars: collect_target(item.optional_vars, write_scope)
        for child in node.body: check_node(child, read_scope, write_scope)
        return

    for field, value in ast.iter_fields(node):
        if field in ('body', 'orelse', 'finalbody') and isinstance(value, list):
             for item in value: check_node(item, read_scope, write_scope)
        elif isinstance(value, list):
            for item in value:
                if isinstance(item, ast.AST): check_node(item, read_scope, write_scope)
        elif isinstance(value, ast.AST):
            check_node(value, read_scope, write_scope)

for node in tree.body:
    check_node(node, current_globals, current_globals)
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
