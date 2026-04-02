import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

const hookScript = path.resolve(__dirname, '../../hooks/scripts/single_edit_per_turn_hook.cjs');
const cacheDir = path.resolve(__dirname, '../../hooks/cache');

function runHook(input) {
  try {
    const output = execSync(`node "${hookScript}"`, {
      input: JSON.stringify(input),
      encoding: 'utf8'
    });
    return JSON.parse(output.trim());
  } catch (e) {
    if (e.stdout) {
      return JSON.parse(e.stdout.trim());
    }
    throw e;
  }
}

describe('single_edit_per_turn_hook', () => {
  const sessionId = 'test-session-123';
  const cacheFile = path.join(cacheDir, `modified_${sessionId}.json`);

  beforeEach(() => {
    if (fs.existsSync(cacheFile)) {
      fs.unlinkSync(cacheFile);
    }
  });

  afterEach(() => {
    if (fs.existsSync(cacheFile)) {
      fs.unlinkSync(cacheFile);
    }
  });

  it('BeforeTool: 初回の write_file が allow されること', () => {
    const res = runHook({
      hook_event_name: 'BeforeTool',
      tool_name: 'write_file',
      session_id: sessionId,
      tool_input: { file_path: 'test.txt' }
    });
    expect(res.decision).toBe('allow');
    expect(fs.existsSync(cacheFile)).toBe(true);
    const cache = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
    expect(cache).toContain('test.txt');
  });

  it('BeforeTool: 同一セッションでの2回目の replace が deny されること', () => {
    runHook({
      hook_event_name: 'BeforeTool',
      tool_name: 'write_file',
      session_id: sessionId,
      tool_input: { file_path: 'test.txt' }
    });
    const res = runHook({
      hook_event_name: 'BeforeTool',
      tool_name: 'replace',
      session_id: sessionId,
      tool_input: { file_path: 'test.txt' }
    });
    expect(res.decision).toBe('deny');
    expect(res.reason).toBe('Duplicate file edit in a single turn');
  });

  it('BeforeTool: 別の file_path であれば 2回目でも allow されること', () => {
    runHook({
      hook_event_name: 'BeforeTool',
      tool_name: 'write_file',
      session_id: sessionId,
      tool_input: { file_path: 'test.txt' }
    });
    const res = runHook({
      hook_event_name: 'BeforeTool',
      tool_name: 'replace',
      session_id: sessionId,
      tool_input: { file_path: 'other.txt' }
    });
    expect(res.decision).toBe('allow');
  });

  it('AfterAgent: 実行後に記録ファイルが削除されること', () => {
    runHook({
      hook_event_name: 'BeforeTool',
      tool_name: 'write_file',
      session_id: sessionId,
      tool_input: { file_path: 'test.txt' }
    });
    expect(fs.existsSync(cacheFile)).toBe(true);

    const res = runHook({
      hook_event_name: 'AfterAgent',
      session_id: sessionId
    });
    expect(res.decision).toBe('allow');
    expect(fs.existsSync(cacheFile)).toBe(false);
  });

  it('AfterAgent 実行後、再び BeforeTool で同じファイルへの編集が allow されること', () => {
    runHook({
      hook_event_name: 'BeforeTool',
      tool_name: 'write_file',
      session_id: sessionId,
      tool_input: { file_path: 'test.txt' }
    });
    runHook({
      hook_event_name: 'AfterAgent',
      session_id: sessionId
    });
    const res = runHook({
      hook_event_name: 'BeforeTool',
      tool_name: 'write_file',
      session_id: sessionId,
      tool_input: { file_path: 'test.txt' }
    });
    expect(res.decision).toBe('allow');
  });
});
