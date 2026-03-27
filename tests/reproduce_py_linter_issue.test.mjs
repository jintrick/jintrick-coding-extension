import pyLinter from '../hooks/scripts/linters/py.cjs';
import { describe, it, expect } from 'vitest';

describe('Python Linter', () => {
  it('should allow lambda functions', () => {
    const code = 'f = lambda x: x + 1\n';
    const result = pyLinter(code, 'test.py', 'write_file');
    expect(result.valid).toBe(true);
  });

  it('should allow "\\n" in strings', () => {
    const code = 's = "hello\\nworld"\n';
    const result = pyLinter(code, 'test.py', 'write_file');
    expect(result.valid).toBe(true);
  });

  it('should detect actual undefined variables', () => {
    const code = 'print(undefined_var)\n';
    const result = pyLinter(code, 'test.py', 'write_file');
    expect(result.valid).toBe(false);
    expect(result.reason).toContain("name 'undefined_var' is not defined");
  });
});
