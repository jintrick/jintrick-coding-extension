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

describe('Python Linter (Enhanced)', () => {
  const runPy = (code) => runHook({
      tool_name: 'write_file',
      tool_input: {
        file_path: 'test.py',
        content: code
      }
  });

  it('should deny missing import (math.sqrt)', () => {
    const output = runPy('print(math.sqrt(2))');
    expect(output.decision).toBe('deny');
    expect(output.reason).toContain('Python Linter Error');
    expect(output.systemMessage).toContain("name 'math' is not defined");
  });

  it('should deny undefined variable', () => {
    const output = runPy('a = b + 1');
    expect(output.decision).toBe('deny');
    expect(output.systemMessage).toContain("name 'b' is not defined");
  });

  it('should allow builtin functions (print, len)', () => {
    const output = runPy('print(len("test"))');
    expect(output.decision).toBe('allow');
  });

  it('should deny top-level scope leakage', () => {
    const output = runPy('def f():\n    x = 1\nprint(x)');
    expect(output.decision).toBe('deny');
    expect(output.systemMessage).toContain("name 'x' is not defined");
  });

  it('should allow normal imports', () => {
    const output = runPy('import os\nprint(os.getcwd())');
    expect(output.decision).toBe('allow');
  });

  it('should allow function definition and usage', () => {
    const output = runPy('def f(x):\n    return x + 1\nprint(f(10))');
    expect(output.decision).toBe('allow');
  });

  it('should allow class definition', () => {
    const output = runPy('class A:\n    def method(self):\n        pass\na = A()');
    expect(output.decision).toBe('allow');
  });

  it('should allow list comprehension at top level', () => {
    const output = runPy('x = [i for i in range(10)]');
    expect(output.decision).toBe('allow');
  });

  it('should allow lambda at top level', () => {
    const output = runPy('f = lambda x: x * 2');
    expect(output.decision).toBe('allow');
  });

  it('should deny undefined variable in list comprehension', () => {
     const output = runPy('x = [z for i in range(10)]'); // z undefined
     expect(output.decision).toBe('deny');
     expect(output.systemMessage).toContain("name 'z' is not defined");
  });

  it('should allow tuple unpacking', () => {
     const output = runPy('x, y = 1, 2\nprint(x + y)');
     expect(output.decision).toBe('allow');
  });

  it('should allow top-level for loop', () => {
     const output = runPy('for i in range(10):\n    print(i)');
     expect(output.decision).toBe('allow');
  });

  it('should allow top-level with statement', () => {
     const output = runPy('class CM:\n    def __enter__(self): return 1\n    def __exit__(self, *args): pass\nwith CM() as f:\n    print(f)');
     expect(output.decision).toBe('allow');
  });

  it('should allow exception handler variable', () => {
     const output = runPy('try:\n    1/0\nexcept Exception as e:\n    print(e)');
     expect(output.decision).toBe('allow');
  });

  it('should allow variable defined in if block', () => {
     const output = runPy('if True:\n    x = 1\nprint(x)');
     expect(output.decision).toBe('allow');
  });

  it('should deny variable in list comp (leak check)', () => {
     const output = runPy('x = [i for i in range(10)]\nprint(i)'); // i should not leak
     expect(output.decision).toBe('deny');
     expect(output.systemMessage).toContain("name 'i' is not defined");
  });
});
