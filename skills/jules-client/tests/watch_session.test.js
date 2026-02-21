
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import https from 'https';
import { EventEmitter } from 'events';

// Spy on https.request

// Mock child_process
vi.mock('child_process', () => ({
  execSync: vi.fn(),
  exec: vi.fn()
}));

const api = require('../scripts/api.cjs');

describe('watchSession', () => {
  let mockExit;
  let mockConsoleLog;
  let mockConsoleError;
  let mockRequest;
  let httpsRequestSpy;

  beforeEach(() => {
    mockExit = vi.spyOn(process, 'exit').mockImplementation((code) => {
       // Just spy, don't throw. This prevents unhandled rejections.
       // The loop will technically continue, but since we control time with fake timers,
       // we just won't advance it further.
    });

    mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});
    mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    mockRequest = vi.fn();
    httpsRequestSpy = vi.spyOn(https, 'request').mockImplementation(mockRequest);

    process.env.JULES_API_KEY = 'test-key';
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllTimers();
  });

  function mockResponse(data, statusCode = 200) {
    mockRequest.mockImplementationOnce((url, options, callback) => {
        const req = new EventEmitter();
        req.end = vi.fn();
        req.write = vi.fn();

        const responseStream = new EventEmitter();
        responseStream.statusCode = statusCode;

        callback(responseStream);

        if (data) {
             responseStream.emit('data', JSON.stringify(data));
        }
        responseStream.emit('end');

        return req;
    });
  }

  it('verifies fix: ID-based filtering (detects late-arriving old event)', async () => {
    const startTime = Date.now();
    const oldTime = new Date(startTime - 100000).toISOString();
    const slightlyOldTime = new Date(startTime - 1000).toISOString();

    const session = { state: 'RUNNING' };
    const act1 = { id: 'act-1', createTime: oldTime, planGenerated: { plan: { id: 'plan-1' } } };
    const act2 = { id: 'act-2', createTime: slightlyOldTime, planGenerated: { plan: { id: 'plan-2' } } };

    mockResponse(session); // 1. Init State
    mockResponse({ activities: [act1] }); // 2. Init Activities
    mockResponse({ activities: [act1] }); // 3. Loop 1 Activities
    mockResponse({ activities: [act1, act2] }); // 4. Loop 2 Activities

    api.watchSession(['session-1'], { waitFor: 'plan' });

    await vi.runOnlyPendingTimersAsync(); // Init
    await vi.advanceTimersByTimeAsync(3000); // Loop 1
    await vi.advanceTimersByTimeAsync(3000); // Loop 2

    expect(mockExit).toHaveBeenCalledWith(0);
  });

  it('verifies fix: Strict Error Handling (401 exits)', async () => {
    const session = { state: 'RUNNING' };
    const act1 = { id: 'act-1', createTime: new Date().toISOString() };

    mockResponse(session);
    mockResponse({ activities: [act1] });

    // Loop 1 (401 Error)
    mockRequest.mockImplementationOnce((url, options, callback) => {
         const req = new EventEmitter(); req.end = vi.fn(); req.write = vi.fn();
         const res = new EventEmitter();
         res.statusCode = 401;
         callback(res);
         res.emit('data', JSON.stringify({ error: { message: "Unauthorized" } }));
         res.emit('end');
         return req;
    });

    api.watchSession(['session-1'], { waitFor: 'plan' });

    await vi.runOnlyPendingTimersAsync(); // Init
    await vi.advanceTimersByTimeAsync(3000); // Loop 1

    expect(mockExit).toHaveBeenCalledWith(1);
    expect(mockConsoleError).toHaveBeenCalledWith(expect.stringContaining('Unauthorized'));
  });

  it('verifies fix: Strict Error Handling (404 exits)', async () => {
      const session = { state: 'RUNNING' };

      mockResponse(session);
      mockResponse({ activities: [] });

      // Loop 1 (404 Error)
      mockRequest.mockImplementationOnce((url, options, callback) => {
           const req = new EventEmitter(); req.end = vi.fn(); req.write = vi.fn();
           const res = new EventEmitter();
           res.statusCode = 404;
           callback(res);
           res.emit('data', JSON.stringify({ error: { message: "Not Found" } }));
           res.emit('end');
           return req;
      });

      api.watchSession(['session-1'], { waitFor: 'plan' });

      await vi.runOnlyPendingTimersAsync();
      await vi.advanceTimersByTimeAsync(3000);

      expect(mockExit).toHaveBeenCalledWith(1);
  });

  it('verifies fix: state transition detection (RUNNING -> COMPLETED)', async () => {
      const runningSession = { state: 'RUNNING' };
      const completedSession = { state: 'COMPLETED' };

      mockResponse(runningSession);
      mockResponse({ activities: [] });
      mockResponse({ activities: [] });
      mockResponse(completedSession);

      api.watchSession(['session-1'], { waitFor: 'finish' });

      await vi.runOnlyPendingTimersAsync();
      await vi.advanceTimersByTimeAsync(3000);

      expect(mockExit).toHaveBeenCalledWith(0);
  });
});
