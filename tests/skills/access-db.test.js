import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { main, parseArgs, getConnectionString } = require('../../skills/access-db/scripts/db_client.cjs');

describe('access-db skill', () => {
    describe('parseArgs', () => {
        it('should parse arguments correctly', () => {
            const args = ['--db', 'test.accdb', '--sql', 'SELECT * FROM users', '--password', '1234'];
            const result = parseArgs(args);
            expect(result).toEqual({
                db: 'test.accdb',
                sql: 'SELECT * FROM users',
                password: '1234'
            });
        });

        it('should handle boolean flags', () => {
            const args = ['--verbose', '--db', 'test.accdb'];
            const result = parseArgs(args);
            expect(result).toEqual({
                verbose: true,
                db: 'test.accdb'
            });
        });
    });

    describe('getConnectionString', () => {
        it('should generate connection string without password', () => {
            const str = getConnectionString('test.accdb');
            expect(str).toContain('Data Source=test.accdb');
            expect(str).not.toContain('Jet OLEDB:Database Password');
        });

        it('should generate connection string with password', () => {
            const str = getConnectionString('test.accdb', 'secret');
            expect(str).toContain('Data Source=test.accdb');
            expect(str).toContain('Jet OLEDB:Database Password=secret');
        });
    });

    describe('main', () => {
        let mockConsole;
        let mockProcess;
        let mockAdodb;
        let mockConnection;

        beforeEach(() => {
            mockConsole = {
                log: vi.fn(),
                error: vi.fn(),
            };
            mockProcess = {
                exit: vi.fn(),
            };
            mockConnection = {
                query: vi.fn().mockResolvedValue([{ id: 1, name: 'Test' }]),
                execute: vi.fn().mockResolvedValue({}),
            };
            mockAdodb = {
                open: vi.fn().mockReturnValue(mockConnection),
            };
        });

        it('should execute SELECT query using query()', async () => {
            const args = ['--db', 'test.accdb', '--sql', 'SELECT * FROM users'];
            await main({
                adodb: mockAdodb,
                args,
                console: mockConsole,
                process: mockProcess
            });

            expect(mockAdodb.open).toHaveBeenCalled();
            expect(mockConnection.query).toHaveBeenCalledWith('SELECT * FROM users');
            expect(mockConsole.log).toHaveBeenCalledWith(expect.stringContaining('"id": 1'));
        });

        it('should execute INSERT query using execute()', async () => {
            const args = ['--db', 'test.accdb', '--sql', 'INSERT INTO users VALUES (1)'];
            await main({
                adodb: mockAdodb,
                args,
                console: mockConsole,
                process: mockProcess
            });

            expect(mockConnection.execute).toHaveBeenCalledWith('INSERT INTO users VALUES (1)');
        });

        it('should handle missing arguments', async () => {
            await main({
                adodb: mockAdodb,
                args: [],
                console: mockConsole,
                process: mockProcess
            });

            expect(mockConsole.error).toHaveBeenCalledWith(expect.stringContaining('Missing required arguments'));
            expect(mockProcess.exit).toHaveBeenCalledWith(1);
        });

        it('should handle connection errors', async () => {
             const error = new Error('Connection failed');
             error.process = { message: 'Provider cannot be found' };
             mockConnection.query.mockRejectedValue(error);

             const args = ['--db', 'test.accdb', '--sql', 'SELECT * FROM users'];
             await main({
                adodb: mockAdodb,
                args,
                console: mockConsole,
                process: mockProcess
            });

            expect(mockConsole.error).toHaveBeenCalledWith(expect.stringContaining('Provider cannot be found'));
            expect(mockProcess.exit).toHaveBeenCalledWith(1);
        });
    });
});
