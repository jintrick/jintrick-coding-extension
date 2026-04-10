import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { main, replaceCommands } from '../../hooks/scripts/command_fixer_hook.cjs';

describe('command_fixer_hook', () => {
  let consoleLogMock;
  let processExitMock;
  let processStderrMock;
  let fsMock;
  let processMock;

  beforeEach(() => {
    consoleLogMock = vi.fn();
    processExitMock = vi.fn();
    processStderrMock = vi.fn();
    fsMock = { readFileSync: vi.fn() };
    processMock = {
      exit: processExitMock,
      stderr: { write: processStderrMock }
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('replaceCommands', () => {
    const testCases = [
      { name: 'rm -rf test', input: 'rm -rf test', expected: 'Remove-Item test -Recurse -Force' },
      { name: 'rm test -rf', input: 'rm test -rf', expected: 'Remove-Item test -Recurse -Force' },
      { name: 'mkdir -p a/b/c', input: 'mkdir -p a/b/c', expected: 'New-Item a/b/c -ItemType Directory -Force' },
      { name: 'cp -r src dest', input: 'cp -r src dest', expected: 'Copy-Item src dest -Recurse' },
      { name: 'ls -la', input: 'ls -la', expected: 'Get-ChildItem -Force' },
      { name: 'ls -l', input: 'ls -l', expected: 'Get-ChildItem' },
      { name: 'which node', input: 'which node', expected: 'Get-Command node' },
      { name: 'quoted separator', input: 'rm -rf "some;dir"', expected: 'Remove-Item "some;dir" -Recurse -Force' },
      { name: 'quoted flag', input: 'rm -rf "my -rf file"', expected: 'Remove-Item "my -rf file" -Recurse -Force' },
      { name: 'echo inside quote', input: 'echo "rm -rf foo"', expected: 'echo "rm -rf foo"' },
      { name: 'multiple commands', input: 'mkdir -p a && rm -rf b', expected: 'New-Item a -ItemType Directory -Force && Remove-Item b -Recurse -Force' },
      { name: 'no change needed', input: 'git add . && git commit', expected: 'git add . && git commit' },
      { name: 'unrelated command', input: 'storm', expected: 'storm' },
    ];

    testCases.forEach(({ name, input, expected }) => {
      it(`should transform "${name}" correctly`, () => {
        expect(replaceCommands(input)).toBe(expected);
      });
    });
  });

  it('should allow and modify command via hook', () => {
    const input = JSON.stringify({
      hook_event_name: 'BeforeTool',
      tool_name: 'run_shell_command',
      tool_input: { command: 'rm -rf test' }
    });

    fsMock.readFileSync.mockReturnValue(input);
    main({ fs: fsMock, process: processMock, consoleLog: consoleLogMock });

    expect(consoleLogMock).toHaveBeenCalledWith(JSON.stringify({
      decision: 'allow',
      hookSpecificOutput: {
        tool_input: {
          command: 'Remove-Item test -Recurse -Force'
        }
      }
    }));
    expect(processExitMock).toHaveBeenCalledWith(0);
  });

  it('should allow without modification if tool is not run_shell_command', () => {
    const input = JSON.stringify({
      hook_event_name: 'BeforeTool',
      tool_name: 'write_file',
      tool_input: { command: 'rm -rf test' }
    });

    fsMock.readFileSync.mockReturnValue(input);
    main({ fs: fsMock, process: processMock, consoleLog: consoleLogMock });

    expect(consoleLogMock).toHaveBeenCalledWith(JSON.stringify({ decision: 'allow' }));
    expect(processExitMock).toHaveBeenCalledWith(0);
  });

  it('should handle malformed JSON gracefully', () => {
    fsMock.readFileSync.mockReturnValue('invalid json');
    main({ fs: fsMock, process: processMock, consoleLog: consoleLogMock });
    expect(processStderrMock).toHaveBeenCalled();
    expect(consoleLogMock).toHaveBeenCalledWith(JSON.stringify({ decision: 'allow' }));
    expect(processExitMock).toHaveBeenCalledWith(0);
  });
});