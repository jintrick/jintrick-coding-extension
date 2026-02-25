import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { spawnSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';

const HOOK_SCRIPT = path.join(__dirname, '../../dist/hooks/linter_hook.cjs');
const TEMP_DIR = path.join(os.tmpdir(), 'linter_hook_replace_test');

if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR);
}

function runHook(input, env = {}) {
  const result = spawnSync('node', [HOOK_SCRIPT], {
    input: JSON.stringify({ hook_event_name: 'BeforeTool', ...input }),
    encoding: 'utf-8',
    env: { ...process.env, EDITOR: 'echo', ...env }
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

describe('linter_hook replace functionality', () => {
  let tempFile;

  beforeEach(() => {
    tempFile = path.join(TEMP_DIR, `test_${Date.now()}.md`);
  });

  afterEach(() => {
    if (fs.existsSync(tempFile)) {
      fs.unlinkSync(tempFile);
    }
    // Clean up preview files if possible
  });

  function getPreviewContent(stderr) {
    const match = stderr.match(/Preview created: (.*?) \(Editor:/);
    if (match && match[1]) {
      const previewPath = match[1];
      if (fs.existsSync(previewPath)) {
        const content = fs.readFileSync(previewPath, 'utf8');
        // Clean up preview file
        fs.unlinkSync(previewPath);
        return content;
      }
    }
    return null;
  }

  it('should verify multiple replacements work correctly', () => {
    fs.writeFileSync(tempFile, 'test test test', 'utf8');
    const input = {
      tool_name: 'replace',
      tool_input: {
        file_path: tempFile,
        old_string: 'test',
        new_string: 'passed',
        expected_replacements: 3
      }
    };
    const output = runHook(input);
    expect(output).toMatchObject({ decision: 'allow' });

    const previewContent = getPreviewContent(output._stderr);
    expect(previewContent).toBe('passed passed passed');
  });

  it('should verify special characters ($&) in replacement string are treated literally', () => {
    fs.writeFileSync(tempFile, 'price: value', 'utf8');
    const input = {
      tool_name: 'replace',
      tool_input: {
        file_path: tempFile,
        old_string: 'value',
        new_string: '$&-$&'
      }
    };
    const output = runHook(input);
    expect(output).toMatchObject({ decision: 'allow' });

    const previewContent = getPreviewContent(output._stderr);
    expect(previewContent).toBe('price: $&-$&');
  });
});
