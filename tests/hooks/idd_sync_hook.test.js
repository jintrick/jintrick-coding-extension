import fs from 'fs';
import path from 'path';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { main } = require('../../hooks/scripts/idd_sync_hook.cjs');
const { syncVersions } = require('../../hooks/scripts/idd_sync/sync.cjs');

const FIXTURE_DIR = path.resolve(process.cwd(), 'tests/fixtures');
const SANDBOX_DIR = path.join(FIXTURE_DIR, 'idd-sync-sandbox');

describe('idd_sync_hook', () => {
  beforeEach(() => {
    // Ensure fixture dir exists
    if (!fs.existsSync(FIXTURE_DIR)) {
      fs.mkdirSync(FIXTURE_DIR, { recursive: true });
    }
    // Clean and create sandbox
    if (fs.existsSync(SANDBOX_DIR)) {
      fs.rmSync(SANDBOX_DIR, { recursive: true, force: true });
    }
    fs.mkdirSync(SANDBOX_DIR, { recursive: true });
  });

  afterEach(() => {
    if (fs.existsSync(SANDBOX_DIR)) {
      fs.rmSync(SANDBOX_DIR, { recursive: true, force: true });
    }
  });

  function createManifest(filename, content) {
    fs.writeFileSync(path.join(SANDBOX_DIR, filename), content, 'utf8');
  }

  function readManifest(filename) {
    return fs.readFileSync(path.join(SANDBOX_DIR, filename), 'utf8');
  }

  // Mock deps for main
  function createDeps(inputCommand) {
      return {
          fs: {
              ...fs,
              readFileSync: (fd) => {
                  if (fd === 0) {
                      return JSON.stringify({
                          hook_event_name: 'BeforeTool',
                          tool_name: 'run_shell_command',
                          tool_input: { command: inputCommand }
                      });
                  }
                  return fs.readFileSync(fd);
              }
          },
          syncVersions: (targetVersion) => syncVersions(targetVersion, SANDBOX_DIR)
      };
  }

  // Helper to capture stdout
  async function runMain(inputCommand) {
    const originalLog = console.log;
    let output = '';
    console.log = (msg) => { output = msg; };

    try {
        await main(createDeps(inputCommand));
    } finally {
        console.log = originalLog;
    }

    try {
        return output ? JSON.parse(output) : {};
    } catch (e) {
        console.error('Failed to parse output:', output);
        throw e;
    }
  }

  it('Case 1: package.json root version update', async () => {
    createManifest('package.json', JSON.stringify({ version: '1.0.0' }, null, 2));

    const result = await runMain('git commit -m "v1.2.3"');

    expect(result.decision).toBe('allow');
    expect(result.hookSpecificOutput).toBeDefined();
    expect(result.hookSpecificOutput.tool_input.command).toContain('git add package.json');
    expect(result.hookSpecificOutput.tool_input.command).toContain('git commit -m "v1.2.3"');

    const updated = JSON.parse(readManifest('package.json'));
    expect(updated.version).toBe('1.2.3');
  });

  it('Case 2: pyproject.toml [project].version update', async () => {
    // smol-toml compatible TOML
    createManifest('pyproject.toml', '[project]\nversion = "1.0.0"\n');

    const result = await runMain('git commit -m "v2.0.0"');

    expect(result.hookSpecificOutput.tool_input.command).toContain('git add pyproject.toml');
    const updated = readManifest('pyproject.toml');
    expect(updated).toContain('version = "2.0.0"');
  });

  it('Case 3: pyproject.toml [tool.poetry] update', async () => {
    createManifest('pyproject.toml', '[tool.poetry]\nversion = "1.0.0"\n');

    const result = await runMain('git commit -m "v3.0.0"');

    expect(result.hookSpecificOutput.tool_input.command).toContain('git add pyproject.toml');
    const updated = readManifest('pyproject.toml');
    expect(updated).toContain('version = "3.0.0"');
  });

  it('Case 4: Command rewriting verification', async () => {
    createManifest('package.json', JSON.stringify({ version: '1.0.0' }, null, 2));
    const result = await runMain('git commit -m "v1.1.0"');

    const cmd = result.hookSpecificOutput.tool_input.command;
    expect(cmd).toMatch(/^git add .*? && git commit/);
  });

  it('Case 5: Skip when version is missing', async () => {
    createManifest('package.json', JSON.stringify({ version: '1.0.0' }, null, 2));
    const result = await runMain('git commit -m "fix bug"');

    expect(result.decision).toBe('allow');
    expect(result.hookSpecificOutput).toBeUndefined();

    const notUpdated = JSON.parse(readManifest('package.json'));
    expect(notUpdated.version).toBe('1.0.0');
  });

  it('Case 6: Support pre-release versions', async () => {
    createManifest('package.json', JSON.stringify({ version: '1.0.0' }, null, 2));

    const result = await runMain('git commit -m "v1.15.0-rc.1"');

    expect(result.hookSpecificOutput.tool_input.command).toContain('git add package.json');
    const updated = JSON.parse(readManifest('package.json'));
    expect(updated.version).toBe('1.15.0-rc.1');
  });

  it('Preserves JSON indentation', async () => {
      const content = '{\n    "version": "1.0.0"\n}\n'; // 4 spaces indentation
      createManifest('package.json', content);

      await runMain('git commit -m "v1.2.3"');

      const updated = readManifest('package.json');
      expect(updated).toBe('{\n    "version": "1.2.3"\n}\n');
  });

});
