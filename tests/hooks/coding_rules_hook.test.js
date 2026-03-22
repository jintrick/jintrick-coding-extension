import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';

const execAsync = promisify(exec);

describe('coding_rules_hook', () => {
  const hookScriptPath = path.join(__dirname, '../../hooks/scripts/coding_rules_hook.cjs');
  const tempDir = path.join(__dirname, 'temp_agent_rules');
  const rulesDir = path.join(tempDir, '.agent', 'rules');

  beforeEach(() => {
    // Create temp directory for rules
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
    fs.mkdirSync(rulesDir, { recursive: true });
  });

  afterEach(() => {
    // Clean up
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  const runHook = async (inputObj) => {
    const inputStr = JSON.stringify(inputObj);
    try {
      const { stdout, stderr } = await execAsync(`node "${hookScriptPath}"`, {
        // Send JSON string to stdin
        env: process.env
      });
      // The child process needs standard input fed
    } catch(e) { /* ignored here, handled in wrapper */ }
  };

  // Helper function to run the script with a specific stdin
  const executeHook = async (inputStr) => {
    return new Promise((resolve, reject) => {
      const child = exec(`node "${hookScriptPath}"`, { cwd: tempDir }, (error, stdout, stderr) => {
        if (error) {
          resolve({ error, stdout, stderr }); // hook might exit 0 or pass logs
        } else {
          try {
            resolve(JSON.parse(stdout));
          } catch(e) {
            resolve({ error: e, stdout, stderr });
          }
        }
      });
      child.stdin.write(inputStr);
      child.stdin.end();
    });
  };

  it('ルール未発見時の正常終了 (additionalContext なし)', async () => {
    const input = {
      hook_event_name: 'AfterTool',
      tool_name: 'read_file',
      cwd: tempDir,
      tool_input: { file_path: 'src/main.ts' }
    };
    
    // Create a dummy file without glob trigger
    fs.writeFileSync(path.join(rulesDir, 'dummy.md'), '---\ntrigger: none\nglobs: *.ts\n---\nHello');

    const result = await executeHook(JSON.stringify(input));
    expect(result.decision).toBe('allow');
    expect(result.hookSpecificOutput).toBeUndefined();
  });

  it('フロントマターの正常パースと単一 glob による合致', async () => {
    const input = {
      hook_event_name: 'AfterTool',
      tool_name: 'read_file',
      cwd: tempDir,
      tool_input: { file_path: 'src/main.ts' }
    };
    
    // Create matching rule
    fs.writeFileSync(path.join(rulesDir, 'match.md'), '---\ntrigger: glob\nglobs: *.ts\n---\nThis is a TS rule');

    const result = await executeHook(JSON.stringify(input));
    expect(result.decision).toBe('allow');
    expect(result.hookSpecificOutput).toBeDefined();
    expect(result.hookSpecificOutput.additionalContext).toContain('[RULE APPLIED: match.md]');
    expect(result.hookSpecificOutput.additionalContext).toContain('This is a TS rule');
  });

  it('/**/ による0階層ディレクトリの合致および特殊文字のエスケープ', async () => {
    const input = {
      hook_event_name: 'AfterTool',
      tool_name: 'read_file',
      cwd: tempDir,
      tool_input: { file_path: 'src/index.js' }
    };
    
    // Create matching rule
    fs.writeFileSync(path.join(rulesDir, 'match.md'), '---\ntrigger: glob\nglobs: src/**/index.js\n---\nZero directories match');

    const result = await executeHook(JSON.stringify(input));
    expect(result.decision).toBe('allow');
    expect(result.hookSpecificOutput).toBeDefined();
    expect(result.hookSpecificOutput.additionalContext).toContain('[RULE APPLIED: match.md]');
    expect(result.hookSpecificOutput.additionalContext).toContain('Zero directories match');

    // Test with 1+ directory
    const input2 = {
      hook_event_name: 'AfterTool',
      tool_name: 'read_file',
      cwd: tempDir,
      tool_input: { file_path: 'src/app/index.js' }
    };
    const result2 = await executeHook(JSON.stringify(input2));
    expect(result2.hookSpecificOutput).toBeDefined();
  });

  it('複数ファイルの合致と結合', async () => {
    const input = {
      hook_event_name: 'AfterTool',
      tool_name: 'read_file',
      cwd: tempDir,
      tool_input: { file_path: 'src/app/index.js' }
    };
    
    // Create matching rules
    fs.writeFileSync(path.join(rulesDir, 'rule1.md'), '---\ntrigger: glob\nglobs: \n  - **/*.js\n---\nRule 1');
    fs.writeFileSync(path.join(rulesDir, 'rule2.md'), '---\ntrigger: glob\nglobs: \n  - src/**/*.js\n---\nRule 2');

    const result = await executeHook(JSON.stringify(input));
    expect(result.decision).toBe('allow');
    expect(result.hookSpecificOutput.additionalContext).toContain('[RULE APPLIED: rule1.md]');
    expect(result.hookSpecificOutput.additionalContext).toContain('Rule 1');
    expect(result.hookSpecificOutput.additionalContext).toContain('[RULE APPLIED: rule2.md]');
    expect(result.hookSpecificOutput.additionalContext).toContain('Rule 2');
  });

  it('先頭の ** およびファイル名の特殊記号に対する合致', async () => {
    // 1) **/*.js が main.js にマッチする
    fs.writeFileSync(path.join(rulesDir, 'root_match.md'), '---\ntrigger: glob\nglobs: **/*.js\n---\nRoot match');
    const input1 = {
      hook_event_name: 'AfterTool', tool_name: 'read_file', cwd: tempDir,
      tool_input: { file_path: 'main.js' }
    };
    const result1 = await executeHook(JSON.stringify(input1));
    expect(result1.hookSpecificOutput).toBeDefined();
    expect(result1.hookSpecificOutput.additionalContext).toContain('Root match');

    // 2) ファイル名に +, (, ) 等の特殊記号を含む場合
    fs.writeFileSync(path.join(rulesDir, 'special_chars.md'), '---\ntrigger: glob\nglobs: src/**/file+(1).js\n---\nSpecial chars');
    const input2 = {
      hook_event_name: 'AfterTool', tool_name: 'read_file', cwd: tempDir,
      tool_input: { file_path: 'src/file+(1).js' }
    };
    const result2 = await executeHook(JSON.stringify(input2));
    expect(result2.hookSpecificOutput).toBeDefined();
    expect(result2.hookSpecificOutput.additionalContext).toContain('Special chars');
    
    // Cleanup rules for next tests
    fs.rmSync(path.join(rulesDir, 'root_match.md'));
    fs.rmSync(path.join(rulesDir, 'special_chars.md'));
  });

  it('trigger 条件が glob 以外の場合は無視される', async () => {
    const input = {
      hook_event_name: 'AfterTool',
      tool_name: 'read_file',
      cwd: tempDir,
      tool_input: { file_path: 'src/main.ts' }
    };
    
    // Create an invalid trigger rule
    fs.writeFileSync(path.join(rulesDir, 'invalid.md'), '---\ntrigger: regex\nglobs: *.ts\n---\nShould not match');

    const result = await executeHook(JSON.stringify(input));
    expect(result.decision).toBe('allow');
    expect(result.hookSpecificOutput).toBeUndefined();
  });

  it('条件外イベントでは何もしない', async () => {
    const input = {
      hook_event_name: 'BeforeTool', // Not AfterTool
      tool_name: 'read_file',
      cwd: tempDir,
      tool_input: { file_path: 'src/main.ts' }
    };

    fs.writeFileSync(path.join(rulesDir, 'rule.md'), '---\ntrigger: glob\nglobs: *.ts\n---\nRule');

    const result = await executeHook(JSON.stringify(input));
    expect(result.decision).toBe('allow');
    expect(result.hookSpecificOutput).toBeUndefined();
  });
});
