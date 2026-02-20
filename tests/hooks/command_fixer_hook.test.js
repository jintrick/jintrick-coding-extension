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

  it('should replace " && " with " ; " in run_shell_command', () => {
    const input = JSON.stringify({
      hook_event_name: 'BeforeTool',
      tool_name: 'run_shell_command',
      tool_input: {
        command: 'git add . && git commit'
      }
    });

    fsMock.readFileSync.mockReturnValue(input);

    main({ fs: fsMock, process: processMock, consoleLog: consoleLogMock });

    expect(consoleLogMock).toHaveBeenCalledWith(JSON.stringify({
      decision: 'allow',
      hookSpecificOutput: {
        tool_input: {
          command: 'git add . ; git commit'
        }
      }
    }));
    expect(processExitMock).toHaveBeenCalledWith(0);
  });

  it('should allow without changes if " && " is not present', () => {
    const input = JSON.stringify({
      hook_event_name: 'BeforeTool',
      tool_name: 'run_shell_command',
      tool_input: {
        command: 'git status'
      }
    });

    fsMock.readFileSync.mockReturnValue(input);

    main({ fs: fsMock, process: processMock, consoleLog: consoleLogMock });

    expect(consoleLogMock).toHaveBeenCalledWith(JSON.stringify({ decision: 'allow' }));
    expect(processExitMock).toHaveBeenCalledWith(0);
  });

  it('should allow if tool is not run_shell_command', () => {
    const input = JSON.stringify({
      hook_event_name: 'BeforeTool',
      tool_name: 'write_file',
      tool_input: {
        command: 'something && something'
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
        command: 'git add . && git commit'
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

  it('should not replace if "&&" is inside a word (no spaces)', () => {
     const input = JSON.stringify({
      hook_event_name: 'BeforeTool',
      tool_name: 'run_shell_command',
      tool_input: {
        command: 'echo foo&&bar'
      }
    });

    fsMock.readFileSync.mockReturnValue(input);

    main({ fs: fsMock, process: processMock, consoleLog: consoleLogMock });

    expect(consoleLogMock).toHaveBeenCalledWith(JSON.stringify({ decision: 'allow' }));
    expect(processExitMock).toHaveBeenCalledWith(0);
  });
});
