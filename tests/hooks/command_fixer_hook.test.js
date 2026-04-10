import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { main } from '../../hooks/scripts/command_fixer_hook.cjs';

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
    fsMock = {
      readFileSync: vi.fn(),
    };
    processMock = {
      exit: processExitMock,
      stderr: {
        write: processStderrMock
      }
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const testCases = [
    { name: 'rm -rf test', input: 'rm -rf test', expected: 'Remove-Item -Recurse -Force test' },
    { name: 'mkdir -p a/b/c', input: 'mkdir -p a/b/c', expected: 'New-Item -ItemType Directory -Force -Path a/b/c' },
    { name: 'cp -r src dest', input: 'cp -r src dest', expected: 'Copy-Item -Recurse src dest' },
    { name: 'ls -la', input: 'ls -la', expected: 'Get-ChildItem' },
    { name: 'which node', input: 'which node', expected: 'Get-Command node' },
    { name: 'git add . && git commit', input: 'git add . && git commit', expected: 'git add . && git commit' },
    { name: 'echo "rm -rf"', input: 'echo "rm -rf"', expected: 'echo "rm -rf"' },
    { name: 'storm', input: 'storm', expected: 'storm' },
    { name: 'multiple commands', input: 'mkdir -p a && rm -rf b', expected: 'New-Item -ItemType Directory -Force -Path a && Remove-Item -Recurse -Force b' }
  ];

  testCases.forEach(({ name, input: cmdInput, expected }) => {
    it(`should transform "${cmdInput}" correctly`, () => {
      const input = JSON.stringify({
        hook_event_name: 'BeforeTool',
        tool_name: 'run_shell_command',
        tool_input: {
          command: cmdInput
        }
      });

      fsMock.readFileSync.mockReturnValue(input);

      main({ fs: fsMock, process: processMock, consoleLog: consoleLogMock });

      if (cmdInput !== expected) {
        expect(consoleLogMock).toHaveBeenCalledWith(JSON.stringify({
          decision: 'allow',
          hookSpecificOutput: {
            tool_input: {
              command: expected
            }
          }
        }));
      } else {
        expect(consoleLogMock).toHaveBeenCalledWith(JSON.stringify({ decision: 'allow' }));
      }
      expect(processExitMock).toHaveBeenCalledWith(0);
    });
  });

  it('should allow if tool is not run_shell_command', () => {
    const input = JSON.stringify({
      hook_event_name: 'BeforeTool',
      tool_name: 'write_file',
      tool_input: {
        command: 'rm -rf test'
      }
    });

    fsMock.readFileSync.mockReturnValue(input);

    main({ fs: fsMock, process: processMock, consoleLog: consoleLogMock });

    expect(consoleLogMock).toHaveBeenCalledWith(JSON.stringify({ decision: 'allow' }));
    expect(processExitMock).toHaveBeenCalledWith(0);
  });

  it('should allow if event is not BeforeTool', () => {
    const input = JSON.stringify({
      hook_event_name: 'AfterTool',
      tool_name: 'run_shell_command',
      tool_input: {
        command: 'rm -rf test'
      }
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
