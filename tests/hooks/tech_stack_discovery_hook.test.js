import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';

const HOOK_PATH = path.resolve(__dirname, '../../dist/hooks/tech_stack_discovery_hook.cjs');

function runHook(inputObj) {
  try {
    const inputStr = JSON.stringify(inputObj);
    const stdout = execSync(`node "${HOOK_PATH}"`, { 
      input: inputStr,
      encoding: 'utf-8' 
    });
    return JSON.parse(stdout);
  } catch (err) {
    throw new Error(`Hook execution failed: ${err.message}\nStdout: ${err.stdout}\nStderr: ${err.stderr}`);
  }
}

describe('tech_stack_discovery_hook', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tech-expert-test-'));
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('should return allow without context if no tech stack is detected', () => {
    // Create an empty package.json
    fs.writeFileSync(path.join(tempDir, 'package.json'), JSON.stringify({}));
    
    const result = runHook({
      hook_event_name: 'SessionStart',
      cwd: tempDir
    });

    expect(result).toEqual({ decision: 'allow' });
  });

  it('should detect React via file_contains rule', () => {
    // Create package.json with react dependency
    fs.writeFileSync(path.join(tempDir, 'package.json'), JSON.stringify({
      dependencies: {
        "react": "^19.0.0"
      }
    }));
    
    const result = runHook({
      hook_event_name: 'SessionStart',
      cwd: tempDir
    });

    expect(result.decision).toBe('allow');
    expect(result.systemMessage).toContain('Detected tech stacks: React v19 Expert');
    expect(result.hookSpecificOutput.additionalContext).toContain('[SYSTEM] このプロジェクトでは以下の技術が検出されました: React v19 Expert');
    expect(result.hookSpecificOutput.additionalContext).toContain('必ず `tech-expert` サブエージェントに委ねよ');
  });

  it('should ignore non-SessionStart events', () => {
    const result = runHook({
      hook_event_name: 'BeforeAgent',
      cwd: tempDir
    });

    expect(result).toEqual({ decision: 'allow' });
  });
});
