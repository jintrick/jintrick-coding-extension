import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { describe, it, expect, beforeEach, afterAll } from 'vitest';

const hookScript = path.resolve(__dirname, '../../hooks/scripts/toast_notification_hook.cjs');
const cacheDir = path.resolve(__dirname, '../../hooks/cache');

describe('toast_notification_hook.cjs', () => {
    const sessionId = 'test-session-id-for-toast';
    const lockFile = path.join(cacheDir, `${sessionId}.lock`);

    beforeEach(() => {
        if (fs.existsSync(cacheDir) && fs.existsSync(lockFile)) {
            fs.unlinkSync(lockFile);
        }
    });

    afterAll(() => {
        if (fs.existsSync(cacheDir) && fs.existsSync(lockFile)) {
            fs.unlinkSync(lockFile);
        }
    });

    it('BeforeModel should create a lock file', () => {
        const input = {
            hook_event_name: 'BeforeModel',
            session_id: sessionId,
            cwd: process.cwd(),
        };

        const res = spawnSync('node', [hookScript], {
            input: JSON.stringify(input),
            encoding: 'utf8'
        });

        expect(res.stdout.trim()).toBe('{"decision":"allow"}');
        expect(fs.existsSync(lockFile)).toBe(true);
    });

    it('AfterAgent should remove lock file', () => {
        if (!fs.existsSync(cacheDir)) {
            fs.mkdirSync(cacheDir, { recursive: true });
        }
        fs.writeFileSync(lockFile, '');

        const input = {
            hook_event_name: 'AfterAgent',
            session_id: sessionId,
            cwd: process.cwd(),
        };

        const res = spawnSync('node', [hookScript], {
            input: JSON.stringify(input),
            encoding: 'utf8'
        });

        expect(res.stdout.trim()).toBe('{"decision":"allow"}');
        expect(fs.existsSync(lockFile)).toBe(false);
    });
});
