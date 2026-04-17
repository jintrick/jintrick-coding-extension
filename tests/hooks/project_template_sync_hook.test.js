import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';

describe('project_template_sync_hook', () => {
  const hookScriptPath = path.join(__dirname, '../../hooks/scripts/project_template_sync_hook.cjs');
  const tempDir = path.join(__dirname, 'temp_project_sync');
  
  // Create a separate temp directory for our mock source to avoid modifying the real workspace
  const mockSourceDir = path.join(__dirname, 'temp_project_sync_mock_source');

  beforeEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
    fs.mkdirSync(tempDir, { recursive: true });

    if (fs.existsSync(mockSourceDir)) {
      fs.rmSync(mockSourceDir, { recursive: true, force: true });
    }
    fs.mkdirSync(mockSourceDir, { recursive: true });
    fs.writeFileSync(path.join(mockSourceDir, 'dummy.txt'), 'template content');
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
    if (fs.existsSync(mockSourceDir)) {
      fs.rmSync(mockSourceDir, { recursive: true, force: true });
    }
  });

  const executeHook = async (inputObj, cwd = tempDir) => {
    return new Promise((resolve) => {
      // Pass the mocked source directory via an environment variable
      const env = { ...process.env, JINTRICK_MOCK_TEMPLATE_DIR: mockSourceDir };
      
      const child = exec(`node "${hookScriptPath}"`, { cwd, env }, (error, stdout, stderr) => {
        if (error) {
          resolve({ error, stdout, stderr });
        } else {
          try {
            resolve(JSON.parse(stdout));
          } catch(e) {
            resolve({ error: e, stdout, stderr });
          }
        }
      });
      child.stdin.write(JSON.stringify(inputObj));
      child.stdin.end();
    });
  };

  it('SessionStart 以外のイベントでは何もしない', async () => {
    const input = { hook_event_name: 'BeforeTool' };
    const result = await executeHook(input);
    expect(result.decision).toBe('allow');
    expect(result.systemMessage).toBeUndefined();
  });

  it('package.json も .git もない場合はスキップメッセージを返す', async () => {
    const input = { hook_event_name: 'SessionStart' };
    const result = await executeHook(input);
    expect(result.decision).toBe('allow');
    expect(result.systemMessage).toContain('有効なプロジェクト（package.json または .git 存在下）ではないため、jintrick 標準構成の同期をスキップしました');
  });

  it('package.json がある場合、コピーを実行しメッセージを返す', async () => {
    fs.writeFileSync(path.join(tempDir, 'package.json'), '{}');

    const targetFile = path.join(tempDir, 'dummy.txt');
    expect(fs.existsSync(targetFile)).toBe(false);

    const input = { hook_event_name: 'SessionStart' };
    const result = await executeHook(input);

    expect(result.decision).toBe('allow');
    expect(result.systemMessage).toContain('jintrick 標準構成のファイルを同期・更新しました');
    expect(fs.existsSync(targetFile)).toBe(true);
    expect(fs.readFileSync(targetFile, 'utf8')).toBe('template content');
  });

  it('ターゲットの mtime が新しい場合は上書きしない', async () => {
    fs.writeFileSync(path.join(tempDir, 'package.json'), '{}');

    const targetFile = path.join(tempDir, 'dummy.txt');
    fs.writeFileSync(targetFile, 'local customized content');
    
    await new Promise(r => setTimeout(r, 100));

    const now = new Date();
    const past = new Date(now.getTime() - 10000);
    fs.utimesSync(path.join(mockSourceDir, 'dummy.txt'), past, past);
    fs.utimesSync(targetFile, now, now);

    const input = { hook_event_name: 'SessionStart' };
    const result = await executeHook(input);

    expect(result.decision).toBe('allow');
    expect(result.systemMessage).toBeUndefined();
    expect(fs.readFileSync(targetFile, 'utf8')).toBe('local customized content');
  });
});
