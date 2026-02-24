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
    return json;
  } catch (e) {
    return { error: 'Invalid JSON output', raw: result.stdout, stderr: result.stderr };
  }
}

describe('Python Linter Encoding (v1.18.1)', () => {
  const runPy = (code) => runHook({
      tool_name: 'write_file',
      tool_input: {
        file_path: 'test_encoding.py',
        content: code
      }
  });

  it('should allow Japanese comments', () => {
    const code = '# 日本語のコメント\nprint("Hello")';
    const output = runPy(code);
    expect(output.decision).toBe('allow');
  });

  it('should allow Japanese strings', () => {
    const code = 's = "こんにちは"\nprint(s)';
    const output = runPy(code);
    expect(output.decision).toBe('allow');
  });

  it('should allow Emojis', () => {
    const code = 'print("🚀")';
    const output = runPy(code);
    expect(output.decision).toBe('allow');
  });

  it('should handle SyntaxError with Japanese correctly', () => {
      // Missing closing parenthesis
      const code = 'print("こんにちは"';
      const output = runPy(code);
      expect(output.decision).toBe('deny');
      // The error message from python should be propagated
      expect(output.systemMessage).toMatch(/SyntaxError/);
  });
});
