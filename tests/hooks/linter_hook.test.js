import { describe, it, expect } from 'vitest';
import { spawnSync } from 'child_process';
import path from 'path';

const HOOK_SCRIPT = path.join(__dirname, '../../dist/hooks/linter_hook.cjs');

function runHook(input, env = {}) {
  const result = spawnSync('node', [HOOK_SCRIPT], {
    input: JSON.stringify({ hook_event_name: 'BeforeTool', ...input }),
    encoding: 'utf-8',
    env: { ...process.env, ...env }
  });
  
  try {
    const json = JSON.parse(result.stdout.trim());
    if (result.stderr) {
       // Add stderr to the result object for debugging
       json._stderr = result.stderr;
    }
    return json;
  } catch (e) {
    return { error: 'Invalid JSON output', raw: result.stdout, stderr: result.stderr };
  }
}

describe('linter_hook', () => {
  it('should allow valid JSON write', () => {
    const input = {
      tool_name: 'write_file',
      tool_input: {
        file_path: 'test.json',
        content: '{"key": "value"}'
      }
    };
    const output = runHook(input);
    expect(output).toMatchObject({ decision: 'allow' });
  });

  it('should deny invalid JSON write', () => {
    const input = {
      tool_name: 'write_file',
      tool_input: {
        file_path: 'test.json',
        content: '{"key": "value"' // Missing closing brace
      }
    };
    const output = runHook(input);
    expect(output.decision).toBe('deny');
    expect(output.reason).toContain('JSON syntax error');
  });

  it('should allow non-linted file types (e.g. .txt)', () => {
    const input = {
      tool_name: 'write_file',
      tool_input: {
        file_path: 'test.txt',
        content: 'Hello World'
      }
    };
    const output = runHook(input);
    expect(output).toMatchObject({ decision: 'allow' });
  });

  // --- JavaScript Tests ---

  it('should allow valid JavaScript code', () => {
    const input = {
      tool_name: 'write_file',
      tool_input: {
        file_path: 'script.js',
        content: 'const a = 10; console.log(a);'
      }
    };
    const output = runHook(input);
    expect(output).toMatchObject({ decision: 'allow' });
  });

  it('should deny invalid JavaScript syntax', () => {
    const input = {
      tool_name: 'write_file',
      tool_input: {
        file_path: 'script.js',
        content: 'const a = ;' // Syntax error
      }
    };
    const output = runHook(input);
    expect(output.decision).toBe('deny');
    expect(output.reason).toContain('Syntax Error');
    expect(output.systemMessage).toContain('Unexpected token');
  });

  it('should validate .cjs files', () => {
    const input = {
      tool_name: 'write_file',
      tool_input: {
        file_path: 'module.cjs',
        content: 'module.exports = { a: 1 }' // Valid CJS
      }
    };
    const output = runHook(input);
    expect(output).toMatchObject({ decision: 'allow' });
  });

  it('should validate .mjs files', () => {
    const input = {
      tool_name: 'write_file',
      tool_input: {
        file_path: 'module.mjs',
        content: 'export const a = 1;' // Valid ESM (vm accepts standard syntax)
      }
    };
    const output = runHook(input);
    expect(output).toMatchObject({ decision: 'allow' });
  });

  it('should deny invalid .mjs syntax', () => {
    const input = {
      tool_name: 'write_file',
      tool_input: {
        file_path: 'module.mjs',
        content: 'import { from "module";' // Syntax error
      }
    };
    const output = runHook(input);
    expect(output.decision).toBe('deny');
  });

  // --- TypeScript Tests ---

  it('should allow valid TypeScript code', () => {
    const input = {
      tool_name: 'write_file',
      tool_input: {
        file_path: 'script.ts',
        content: 'const a: number = 10; function b(x: string): void { console.log(x); }'
      }
    };
    const output = runHook(input);
    expect(output).toMatchObject({ decision: 'allow' });
  });

  it('should deny invalid TypeScript syntax', () => {
    const input = {
      tool_name: 'write_file',
      tool_input: {
        file_path: 'script.ts',
        content: 'const a: number = ;' // Syntax error
      }
    };
    const output = runHook(input);
    expect(output.decision).toBe('deny');
    expect(output.reason).toContain('Syntax Error');
    expect(output.systemMessage).toContain('Expression expected'); // TS error message
  });

  // --- Markdown / Preview Tests ---

  it('should create preview and allow Markdown files', () => {
    const input = {
      tool_name: 'write_file',
      tool_input: {
        file_path: 'README.md',
        content: '# Title\n\nBody content'
      }
    };
    const output = runHook(input);
    expect(output).toMatchObject({ decision: 'allow' });
    // Verify that the preview logic ran by checking stderr
    expect(output._stderr).toContain('[Human Linter] Preview created:');
  });

  // --- TSX Tests ---

  it('should allow valid TSX code', () => {
    const input = {
      tool_name: 'write_file',
      tool_input: {
        file_path: 'App.tsx',
        content: 'const App = () => <div>Hello</div>;'
      }
    };
    const output = runHook(input);
    expect(output).toMatchObject({ decision: 'allow' });
  });

  it('should deny invalid TSX syntax (unclosed tag)', () => {
    const input = {
      tool_name: 'write_file',
      tool_input: {
        file_path: 'App.tsx',
        content: 'const App = () => <div>Hello;' // Unclosed tag
      }
    };
    const output = runHook(input);
    expect(output.decision).toBe('deny');
    expect(output.reason).toContain('Syntax Error');
    expect(output.systemMessage).toContain("JSX element 'div' has no corresponding closing tag");
  });

  // --- Python Tests ---

  it('should allow valid Python code', () => {
    const input = {
      tool_name: 'write_file',
      tool_input: {
        file_path: 'script.py',
        content: 'print("hello")\ndef f():\n    return 1'
      }
    };
    const output = runHook(input);
    expect(output).toMatchObject({ decision: 'allow' });
  });

  it('should deny invalid Python syntax', () => {
    const input = {
      tool_name: 'write_file',
      tool_input: {
        file_path: 'script.py',
        content: 'print("hello"' // Syntax error
      }
    };
    const output = runHook(input);
    expect(output.decision).toBe('deny');
    expect(output.reason).toContain('Python Syntax Error');
    expect(output.systemMessage).toContain('SyntaxError');
  });

  it('should deny Python indentation error', () => {
    const input = {
      tool_name: 'write_file',
      tool_input: {
        file_path: 'script.py',
        content: 'def f():\nprint(1)' // Indentation error
      }
    };
    const output = runHook(input);
    expect(output.decision).toBe('deny');
    expect(output.reason).toContain('Python Syntax Error');
    // My updated linter script reports everything as SyntaxError, including indentation errors
    // The message "expected an indented block" comes from Python's error message
    expect(output.systemMessage).toContain('SyntaxError');
  });
});
