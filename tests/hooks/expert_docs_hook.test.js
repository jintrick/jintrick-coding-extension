import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const hookPath = path.resolve(__dirname, '../../hooks/scripts/expert_docs_hook.cjs');
const mockDiscoveryPath = path.resolve(__dirname, '../../skills/gemini-cli-expert/references/discovery.json');

function runHook(input) {
  try {
    const inputStr = JSON.stringify(input);
    // パスにスペースが含まれる可能性があるため、ダブルクォートで囲む
    const result = execSync(`node "${hookPath}"`, {
      input: inputStr,
      encoding: 'utf-8',
      env: { ...process.env, TEST_MODE: 'true' }
    });
    const lines = result.trim().split('\n');
    const lastLine = lines[lines.length - 1];
    try {
        return JSON.parse(lastLine);
    } catch(e) {
        return { error: 'Failed to parse JSON', raw: result };
    }
  } catch (e) {
    return { error: e.message, stderr: e.stderr ? e.stderr.toString() : '' };
  }
}

const originalDiscovery = fs.existsSync(mockDiscoveryPath) ? fs.readFileSync(mockDiscoveryPath) : null;

describe('expert_docs_hook', () => {
  beforeEach(() => {
    vi.resetModules();
    if (fs.existsSync(mockDiscoveryPath)) {
        // 既存ファイルをバックアップ（originalDiscoveryがない場合）
    }
    // テスト用の discovery.json
    fs.writeFileSync(mockDiscoveryPath, JSON.stringify({
        metadata: {
            last_checked: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(),
            commit_hash: 'old_hash'
        }
    }));
  });

  afterEach(() => {
    if (originalDiscovery) {
      fs.writeFileSync(mockDiscoveryPath, originalDiscovery);
    } else {
      if (fs.existsSync(mockDiscoveryPath)) fs.unlinkSync(mockDiscoveryPath);
    }
  });

  it('should ignore other skills', () => {
    const input = {
      tool_input: { name: 'other-skill' }
    };
    const output = runHook(input);
    expect(output).toMatchObject({ decision: 'allow' });
    expect(output.systemMessage).toBeUndefined();
  });

  it('should skip check if checked recently', () => {
    fs.writeFileSync(mockDiscoveryPath, JSON.stringify({
        metadata: {
            last_checked: new Date().toISOString(),
            commit_hash: 'old_hash'
        }
    }));

    const input = {
      tool_input: { name: 'gemini-cli-expert' }
    };
    const output = runHook(input);
    expect(output).toMatchObject({ decision: 'allow' });
    expect(output.systemMessage).toBeUndefined();
  });
});
