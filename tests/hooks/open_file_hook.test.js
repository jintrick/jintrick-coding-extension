import { describe, it, expect } from 'vitest';
import { spawnSync } from 'child_process';
import path from 'path';

const HOOK_SCRIPT = path.join(__dirname, '../../dist/hooks/open_file_hook.cjs');

function runHook(input) {
  const result = spawnSync('node', [HOOK_SCRIPT], {
    input: JSON.stringify({ hook_event_name: 'AfterTool', ...input }),
    encoding: 'utf-8',
  });
  
  try {
    const json = JSON.parse(result.stdout.trim());
    json._stderr = result.stderr || '';
    return json;
  } catch (e) {
    return { error: 'Invalid JSON output', raw: result.stdout, stderr: result.stderr || '' };
  }
}

describe('open_file_hook', () => {
  it('should allow and try to open .md files', () => {
    const input = {
      tool_input: {
        file_path: 'README.md'
      }
    };
    const output = runHook(input);
    expect(output).toMatchObject({ decision: 'allow' });
    expect(output._stderr).toContain('Opening readable file');
  });

  it('should allow and try to open .toml files', () => {
    const input = {
      tool_input: {
        file_path: 'config.toml'
      }
    };
    const output = runHook(input);
    expect(output).toMatchObject({ decision: 'allow' });
    expect(output._stderr).toContain('Opening readable file');
  });

  it('should allow but skip .js files (not a target for auto-open)', () => {
    const input = {
      tool_input: {
        file_path: 'script.js'
      }
    };
    const output = runHook(input);
    expect(output).toMatchObject({ decision: 'allow' });
    expect(output._stderr).not.toContain('Opening readable file');
  });
});
