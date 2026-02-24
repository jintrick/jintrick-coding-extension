// hooks/scripts/linters/py.cjs
var { spawnSync } = require("child_process");
var LINTER_SCRIPT = `
import ast, sys, builtins
try: tree = ast.parse(sys.stdin.read())
except SyntaxError as e:
    print(f"SyntaxError: {e.msg} (line {e.lineno}, offset {e.offset})", file=sys.stderr)
    if e.text:
        print(e.text.rstrip(), file=sys.stderr)
        if e.offset:
            print(" " * (e.offset - 1) + "^", file=sys.stderr)
    sys.exit(1)

# Pass 1: Collect ALL global definitions (including future ones)
final_globals = set(dir(builtins)) | {'__name__', '__file__', '__doc__', '__package__', '__loader__', '__spec__', '__annotations__', '__builtins__'}

def collect_target(node, scope):
    if isinstance(node, ast.Name): scope.add(node.id)
    elif isinstance(node, (ast.Tuple, ast.List)):
        for elt in node.elts: collect_target(elt, scope)

def collect_defs(node, scope):
    # Stop recursion at new scopes (Function, Class, Lambda, Comprehensions)
    if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef)):
        scope.add(node.name)
        return

    if isinstance(node, (ast.Lambda, ast.ListComp, ast.SetComp, ast.DictComp, ast.GeneratorExp)):
        return

    # Collect definitions in current scope
    if isinstance(node, (ast.Import, ast.ImportFrom)):
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

    # Generic recursion for all fields (Handles If, Try, ExceptHandler, Match, etc.)
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
    if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
        write_scope.add(node.name)

        # Check decorators, returns, defaults in OUTER scope
        for decorator in node.decorator_list:
            check_node(decorator, read_scope, read_scope)
        if node.returns:
            check_node(node.returns, read_scope, read_scope)

        args = node.args
        if args.defaults:
            for default in args.defaults: check_node(default, read_scope, read_scope)
        if args.kw_defaults:
            for default in args.kw_defaults:
                if default: check_node(default, read_scope, read_scope)

        # Create function scope inheriting from OUTER scope (closure support)
        func_scope = set(final_globals) | set(read_scope)

        # Add arguments to local scope AND check annotations
        for arg in args.args:
            if arg.annotation: check_node(arg.annotation, read_scope, read_scope)
            func_scope.add(arg.arg)
        if hasattr(args, 'posonlyargs'): # Python 3.8+
            for arg in args.posonlyargs:
                if arg.annotation: check_node(arg.annotation, read_scope, read_scope)
                func_scope.add(arg.arg)
        for arg in args.kwonlyargs:
            if arg.annotation: check_node(arg.annotation, read_scope, read_scope)
            func_scope.add(arg.arg)
        if args.vararg:
            if args.vararg.annotation: check_node(args.vararg.annotation, read_scope, read_scope)
            func_scope.add(args.vararg.arg)
        if args.kwarg:
            if args.kwarg.annotation: check_node(args.kwarg.annotation, read_scope, read_scope)
            func_scope.add(args.kwarg.arg)

        for child in node.body:
             check_node(child, func_scope, func_scope)
        return

    if isinstance(node, ast.ClassDef):
        write_scope.add(node.name)

        # Check decorators, bases, keywords in OUTER scope
        for decorator in node.decorator_list:
            check_node(decorator, read_scope, read_scope)
        for base in node.bases:
            check_node(base, read_scope, read_scope)
        for keyword in node.keywords:
            check_node(keyword.value, read_scope, read_scope)

        class_scope = set(final_globals) | set(read_scope)
        for child in node.body:
            check_node(child, class_scope, class_scope)
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
      return spawnSync(cmd, ["-c", LINTER_SCRIPT], {
        input: content,
        encoding: "utf8",
        timeout: 5e3,
        shell: false
      });
    };
    let result = runPython("python");
    if (result.error && result.error.code === "ENOENT") {
      result = runPython("python3");
    }
    if (result.error && result.error.code === "ENOENT") {
      process.stderr.write(`[Debug] Python not found, skipping validation for ${filePath}
`);
      return { valid: true };
    }
    if (result.status !== 0) {
      const isSyntaxError = result.stderr.includes("SyntaxError");
      const reason = isSyntaxError ? `Python Syntax Error in ${filePath}: ${result.stderr.trim()}` : `Python Linter Error in ${filePath}: ${result.stderr.trim()}`;
      return {
        valid: false,
        reason,
        systemMessage: `\u{1F6AB} ${isSyntaxError ? "Python Syntax Error" : "Python Linter Error"}: ${tool_name} \u3067\u66F8\u304D\u8FBC\u3082\u3046\u3068\u3057\u305F ${filePath} \u306B\u30A8\u30E9\u30FC\u304C\u3042\u308A\u307E\u3059\u3002
${result.stderr}`
      };
    }
    return { valid: true };
  } catch (e) {
    return {
      valid: false,
      reason: `Linter Error: ${e.message}`,
      systemMessage: `\u{1F6AB} Python Linter Error: \u4E88\u671F\u305B\u306C\u30A8\u30E9\u30FC\u304C\u767A\u751F\u3057\u307E\u3057\u305F\u3002
${e.message}`
    };
  }
};
