import fs from 'fs';
import path from 'path';
import os from 'os';
import { spawnSync } from 'child_process';
import { describe, it, expect, beforeEach, afterAll } from 'vitest';

const hookScript = path.resolve(__dirname, '../../hooks/scripts/toast_notification_hook.cjs');
const cacheDir = os.tmpdir();

describe('toast_notification_hook.cjs', () => {
    const sessionId = 'test-session-id-for-toast';
    const lockFile = path.join(cacheDir, `gemini_cli_toast_${sessionId}.lock`);

    beforeEach(() => {
        if (fs.existsSync(lockFile)) {
            fs.unlinkSync(lockFile);
        }
    });

    afterAll(() => {
        if (fs.existsSync(lockFile)) {
            fs.unlinkSync(lockFile);
        }
    });

    it('BeforeAgent should create a lock file', () => {
        const input = {
            hook_event_name: 'BeforeAgent',
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
        fs.writeFileSync(lockFile, Date.now().toString());

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
