import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';

const hookScript = path.resolve(__dirname, '../../hooks/scripts/single_edit_per_turn_hook.cjs');
const cacheDir = os.tmpdir();

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
  const cacheFile = path.join(cacheDir, `gemini_cli_modified_${sessionId}.json`);

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

  it('BeforeTool: 初回の replace が allow されること', () => {
    const res = runHook({
      hook_event_name: 'BeforeTool',
      tool_name: 'replace',
      session_id: sessionId,
      tool_input: { file_path: 'test.txt' }
    });
    expect(res.decision).toBe('allow');
    expect(fs.existsSync(cacheFile)).toBe(true);
    const cache = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
    expect(cache).toHaveProperty('test.txt', 'replace');
  });

  it('BeforeTool: 初回の write_file が allow されること', () => {
    const res = runHook({
      hook_event_name: 'BeforeTool',
      tool_name: 'write_file',
      session_id: sessionId,
      tool_input: { file_path: 'test2.txt' }
    });
    expect(res.decision).toBe('allow');
    expect(fs.existsSync(cacheFile)).toBe(true);
    const cache = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
    expect(cache).toHaveProperty('test2.txt', 'write_file');
  });

  it('BeforeTool: 対象外のツール（read_fileなど）は制限対象外（常に allow）であること', () => {
    runHook({
      hook_event_name: 'BeforeTool',
      tool_name: 'read_file',
      session_id: sessionId,
      tool_input: { file_path: 'test.txt' }
    });
    const res = runHook({
      hook_event_name: 'BeforeTool',
      tool_name: 'read_file',
      session_id: sessionId,
      tool_input: { file_path: 'test.txt' }
    });
    expect(res.decision).toBe('allow');
    if (fs.existsSync(cacheFile)) {
        const cache = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
        expect(cache).not.toHaveProperty('test.txt');
    }
  });

  it('BeforeTool: 同一セッションでの2回目の replace が deny されること', () => {
    runHook({
      hook_event_name: 'BeforeTool',
      tool_name: 'replace',
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
    expect(res.reason).toBe("[PHYSICAL CONCURRENCY ERROR] File is LOCKED: test.txt");
    expect(res.systemMessage).toContain("【物理的並列実行エラー】対象ファイルは現在ロックされています。");
    expect(res.systemMessage).toContain("競合ツール: replace (現在) vs replace (実行待ち)");
  });

  it('BeforeTool: replace 後の write_file が deny されること', () => {
    runHook({
      hook_event_name: 'BeforeTool',
      tool_name: 'replace',
      session_id: sessionId,
      tool_input: { file_path: 'test.txt' }
    });
    const res = runHook({
      hook_event_name: 'BeforeTool',
      tool_name: 'write_file',
      session_id: sessionId,
      tool_input: { file_path: 'test.txt' }
    });
    expect(res.decision).toBe('deny');
    expect(res.reason).toBe("[PHYSICAL CONCURRENCY ERROR] File is LOCKED: test.txt");
    expect(res.systemMessage).toContain("競合ツール: write_file (現在) vs replace (実行待ち)");
  });

  it('BeforeTool: 別の file_path であれば 2回目でも allow されること', () => {
    runHook({
      hook_event_name: 'BeforeTool',
      tool_name: 'replace',
      session_id: sessionId,
      tool_input: { file_path: 'test.txt' }
    });
    const res = runHook({
      hook_event_name: 'BeforeTool',
      tool_name: 'write_file',
      session_id: sessionId,
      tool_input: { file_path: 'other.txt' }
    });
    expect(res.decision).toBe('allow');
  });

  it('BeforeAgent: ターン開始時に記録ファイルが削除（初期化）されること', () => {
    runHook({
      hook_event_name: 'BeforeTool',
      tool_name: 'replace',
      session_id: sessionId,
      tool_input: { file_path: 'test.txt' }
    });
    expect(fs.existsSync(cacheFile)).toBe(true);

    const res = runHook({
      hook_event_name: 'BeforeAgent',
      session_id: sessionId
    });
    expect(res.decision).toBe('allow');
    expect(fs.existsSync(cacheFile)).toBe(false);
  });

  it('AfterAgent: 実行後に記録ファイルが削除されること', () => {
    runHook({
      hook_event_name: 'BeforeTool',
      tool_name: 'replace',
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
      tool_name: 'replace',
      session_id: sessionId,
      tool_input: { file_path: 'test.txt' }
    });
    runHook({
      hook_event_name: 'AfterAgent',
      session_id: sessionId
    });
    const res = runHook({
      hook_event_name: 'BeforeTool',
      tool_name: 'replace',
      session_id: sessionId,
      tool_input: { file_path: 'test.txt' }
    });
    expect(res.decision).toBe('allow');
  });

  it('BeforeTool: 同一セッションでの2回目の編集でも wait_for_previous: true があれば allow されること', () => {
    runHook({
      hook_event_name: 'BeforeTool',
      tool_name: 'replace',
      session_id: sessionId,
      tool_input: { file_path: 'test.txt' }
    });
    const res = runHook({
      hook_event_name: 'BeforeTool',
      tool_name: 'write_file',
      session_id: sessionId,
      tool_input: { file_path: 'test.txt', wait_for_previous: true }
    });
    expect(res.decision).toBe('allow');
  });

  it('BeforeTool: 古いキャッシュ（5分以上前）が存在する場合はセルフヒーリングで削除され allow されること', () => {
    // 擬似的に古いキャッシュを作成
    fs.writeFileSync(cacheFile, JSON.stringify({'test.txt': 'replace'}));
    const oldTime = new Date(Date.now() - 300001); // 5分 + 1ms前
    fs.utimesSync(cacheFile, oldTime, oldTime);

    const res = runHook({
      hook_event_name: 'BeforeTool',
      tool_name: 'replace',
      session_id: sessionId,
      tool_input: { file_path: 'test.txt' }
    });
    
    // 古い test.txt の記録は消され、今回の replace が allow される
    expect(res.decision).toBe('allow');
    
    // allowされた結果、新たに test.txt がキャッシュに記録されているはず
    expect(fs.existsSync(cacheFile)).toBe(true);
    const cache = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
    expect(cache).toHaveProperty('test.txt', 'replace');
  });
});
