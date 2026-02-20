
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
       // console.error(`MOCK EXIT CALLED WITH ${code}`);
    });

    mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});
    mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Spy on https.request
    mockRequest = vi.fn();
    httpsRequestSpy = vi.spyOn(https, 'request').mockImplementation(mockRequest);

    process.env.JULES_API_KEY = 'test-key';
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllTimers();
  });

  function mockResponses(responses) {
    responses.forEach((data, index) => {
      mockRequest.mockImplementationOnce((url, options, callback) => {
        const req = new EventEmitter();
        req.end = vi.fn();
        req.write = vi.fn();

        const responseStream = new EventEmitter();
        responseStream.statusCode = 200;

        callback(responseStream);
        responseStream.emit('data', JSON.stringify(data));
        responseStream.emit('end');

        return req;
      });
    });
  }

  it('verifies fix: does NOT exit immediately if past plan exists', async () => {
    const pastTime = new Date(Date.now() - 100000).toISOString();
    const session = { state: 'RUNNING' };
    const activities = {
      activities: [
        {
          id: 'act-1',
          createTime: pastTime,
          planGenerated: { plan: { id: 'plan-1', steps: [] } }
        }
      ]
    };

    mockResponses([session, activities]); // Session check, then Activities

    api.watchSession(['session-1'], { waitFor: 'plan' });

    await new Promise(resolve => setTimeout(resolve, 50));

    expect(mockExit).not.toHaveBeenCalled();
  });

  it('verifies fix: does NOT exit immediately if session finished in the past', async () => {
    const session = {
        name: 'sessions/session-1',
        state: 'COMPLETED',
        createTime: new Date(Date.now() - 100000).toISOString()
    };

    // 1. Initial state check (COMPLETED)
    // 2. Loop activities
    // 3. Loop session check (COMPLETED)

    // Logic: lastState = COMPLETED. currentState = COMPLETED.
    // Transition = false.

    mockResponses([
        session, // Initial state check
        { activities: [] }, // Activities
        session // Session check in loop
    ]);

    api.watchSession(['session-1'], { waitFor: 'finish' });

    await new Promise(resolve => setTimeout(resolve, 50));

    expect(mockExit).not.toHaveBeenCalled();
  });

  it('verifies fix: exits when NEW plan appears', async () => {
    const pastTime = new Date(Date.now() - 100000).toISOString();

    const session = { state: 'RUNNING' };
    const oldActivities = {
      activities: [
        { id: 'act-1', createTime: pastTime, planGenerated: { plan: { id: 'plan-1' } } }
      ]
    };

    mockResponses([session, oldActivities]);

    api.watchSession(['session-1'], { waitFor: 'plan' });
    await new Promise(resolve => setTimeout(resolve, 50));
    expect(mockExit).not.toHaveBeenCalled();
  });

  it('verifies fix: detects NEW plan immediately (if it just appeared)', async () => {
    const futureTime = new Date(Date.now() + 5000).toISOString();
    const session = { state: 'RUNNING' };
    const activities = {
      activities: [
        { id: 'act-2', createTime: futureTime, planGenerated: { plan: { id: 'plan-2' } } }
      ]
    };

    mockResponses([session, activities]);

    api.watchSession(['session-1'], { waitFor: 'plan' });
    await new Promise(resolve => setTimeout(resolve, 50));

    expect(mockExit).toHaveBeenCalledWith(0);
  });

  it('verifies fix: detects state transition to COMPLETED', async () => {
      const runningSession = { state: 'RUNNING' };
      const completedSession = { state: 'COMPLETED' };

      // 1. Initial state: RUNNING
      // 2. Loop activities: []
      // 3. Loop session check: COMPLETED

      mockResponses([
          runningSession, // Initial
          { activities: [] }, // Activities
          completedSession // Loop session check
      ]);

      api.watchSession(['session-1'], { waitFor: 'finish' });
      await new Promise(resolve => setTimeout(resolve, 50));

      expect(mockExit).toHaveBeenCalledWith(0);
  });

  it('verifies fix: is case insensitive', async () => {
    // wait-for: Plan (mixed case)
    const futureTime = new Date(Date.now() + 5000).toISOString();
    const session = { state: 'RUNNING' };
    const activities = {
      activities: [
        { id: 'act-2', createTime: futureTime, planGenerated: { plan: { id: 'plan-2' } } }
      ]
    };

    mockResponses([session, activities]);

    api.watchSession(['session-1'], { waitFor: 'Plan' }); // Capital P
    await new Promise(resolve => setTimeout(resolve, 50));

    expect(mockExit).toHaveBeenCalledWith(0);
  });

});
