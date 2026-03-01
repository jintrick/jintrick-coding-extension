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

describe('tech_stack_discovery_hook monorepo support', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'monorepo-test-'));
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('should detect React in a sub-directory (apps/web/package.json)', () => {
    const webDir = path.join(tempDir, 'apps', 'web');
    fs.mkdirSync(webDir, { recursive: true });
    
    // Create package.json with react dependency in a sub-directory
    fs.writeFileSync(path.join(webDir, 'package.json'), JSON.stringify({
      dependencies: {
        "react": "^19.0.0"
      }
    }));
    
    const result = runHook({
      hook_event_name: 'SessionStart',
      cwd: tempDir
    });

    // Currently this is expected to FAIL (no tech stack detected)
    expect(result.systemMessage).toBeDefined();
    expect(result.systemMessage).toContain('React');
  });

  it('should detect Python in a sub-directory (packages/api/requirements.txt)', () => {
    const apiDir = path.join(tempDir, 'packages', 'api');
    fs.mkdirSync(apiDir, { recursive: true });
    
    // Create requirements.txt in a sub-directory
    fs.writeFileSync(path.join(apiDir, 'requirements.txt'), 'flask\nrequests');
    
    const result = runHook({
      hook_event_name: 'SessionStart',
      cwd: tempDir
    });

    // Currently this is expected to FAIL
    expect(result.systemMessage).toBeDefined();
    expect(result.systemMessage).toContain('Python');
  });

  it('should ignore node_modules directory even if it contains signature files', () => {
    const badDir = path.join(tempDir, 'node_modules', 'some-package');
    fs.mkdirSync(badDir, { recursive: true });
    
    // Create a package.json that looks like React but inside node_modules
    fs.writeFileSync(path.join(badDir, 'package.json'), JSON.stringify({
      dependencies: {
        "react": "^19.0.0"
      }
    }));
    
    const result = runHook({
      hook_event_name: 'SessionStart',
      cwd: tempDir
    });

    // It should NOT detect anything from node_modules
    expect(result.systemMessage).not.toBeDefined();
  });
});
