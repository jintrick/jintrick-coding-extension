import { describe, it, expect } from 'vitest';
import { spawnSync } from 'child_process';
import path from 'path';

const HOOK_SCRIPT = path.join(__dirname, '../../dist/hooks/linter_hook.cjs');

function runHook(input) {
  const result = spawnSync('node', [HOOK_SCRIPT], {
    input: JSON.stringify({ hook_event_name: 'BeforeTool', ...input }),
    encoding: 'utf-8',
    env: { ...process.env }
  });

  try {
    const json = JSON.parse(result.stdout.trim());
    if (result.stderr) {
       json._stderr = result.stderr;
    }
    return json;
  } catch (e) {
    return { error: 'Invalid JSON output', raw: result.stdout, stderr: result.stderr };
  }
}

describe('Python Linter (v1.16.2)', () => {
  const runPy = (code) => runHook({
      tool_name: 'write_file',
      tool_input: {
        file_path: 'test.py',
        content: code
      }
  });

  // 1. Nested Function Lazy Import (Closure Issue)
  it('should allow lazy import in nested function', () => {
    const code = `
def outer():
    import os
    def inner():
        print(os.getcwd())
    inner()
    `;
    const output = runPy(code);
    expect(output.decision).toBe('allow');
  });

  // 2. Import in Except Block (Symbol Collection Issue)
  // Modified to ensure we test definition ONLY in except block
  it('should allow import only in except block', () => {
    const code = `
try:
    pass
except ImportError:
    import os as my_mod

def f():
    # If collect_defs skips except block, my_mod will be undefined
    print(my_mod.getcwd())
    `;
    const output = runPy(code);
    expect(output.decision).toBe('allow');
  });

  // 3. Default Argument Value Verification
  it('should deny undefined variable in default argument', () => {
    const code = `
def f(arg=undefined_var):
    pass
    `;
    const output = runPy(code);
    expect(output.decision).toBe('deny');
    expect(output.systemMessage).toContain("name 'undefined_var' is not defined");
  });

  // 4. Forward Reference Check
  it('should deny forward reference at top level', () => {
    const code = `
print(x)
x = 1
    `;
    const output = runPy(code);
    expect(output.decision).toBe('deny');
    expect(output.systemMessage).toContain("name 'x' is not defined");
  });

  // 5. Function Decorator Check
  it('should deny undefined variable in decorator', () => {
      const code = `
@undefined_decorator
def f():
    pass
      `;
      const output = runPy(code);
      expect(output.decision).toBe('deny');
      expect(output.systemMessage).toContain("name 'undefined_decorator' is not defined");
  });

  // 6. Function Annotation Check
  it('should deny undefined variable in annotation', () => {
      const code = `
def f(a: undefined_type):
    pass
      `;
      const output = runPy(code);
      expect(output.decision).toBe('deny');
      expect(output.systemMessage).toContain("name 'undefined_type' is not defined");
  });

  // 7. Class Decorator Check
  it('should deny undefined variable in class decorator', () => {
      const code = `
@undefined_decorator
class A:
    pass
      `;
      const output = runPy(code);
      expect(output.decision).toBe('deny');
      expect(output.systemMessage).toContain("name 'undefined_decorator' is not defined");
  });

  // 8. Class Base Check
  it('should deny undefined variable in class base', () => {
      const code = `
class A(undefined_base):
    pass
      `;
      const output = runPy(code);
      expect(output.decision).toBe('deny');
      expect(output.systemMessage).toContain("name 'undefined_base' is not defined");
  });

});
