import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// Mock config before importing routes
vi.mock('../../config/index.js', () => ({
  appConfig: {
    password: 'test-password',
  },
}));

vi.mock('fs', () => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
}));

import logsRoutes from '../../routes/logs.js';

describe('Logs Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/', logsRoutes);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /errors', () => {
    it('should return "No errors logged yet" when file does not exist', async () => {
      vi.mocked(existsSync).mockReturnValue(false);

      const response = await request(app)
        .get('/errors')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toEqual({ logs: 'No errors logged yet' });
    });

    it('should return parsed JSON log entries when file exists', async () => {
      const mockLogs = [
        JSON.stringify({ level: 'error', message: 'Test error', timestamp: '2024-01-01T00:00:00Z' }),
        JSON.stringify({ level: 'warn', message: 'Test warning', timestamp: '2024-01-01T00:01:00Z' }),
      ].join('\n');

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(mockLogs);

      const response = await request(app)
        .get('/errors')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('count', 2);
      expect(response.body).toHaveProperty('entries');
      expect(response.body.entries).toHaveLength(2);
      expect(response.body.entries[0]).toEqual({
        level: 'warn',
        message: 'Test warning',
        timestamp: '2024-01-01T00:01:00Z',
      });
      // Entries are reversed (most recent first)
      expect(response.body.entries[1]).toEqual({
        level: 'error',
        message: 'Test error',
        timestamp: '2024-01-01T00:00:00Z',
      });
    });

    it('should handle non-JSON lines gracefully', async () => {
      const mockLogs = [
        'not valid json',
        JSON.stringify({ level: 'error', message: 'Real error' }),
      ].join('\n');

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(mockLogs);

      const response = await request(app)
        .get('/errors')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.entries).toHaveLength(2);
      expect(response.body.entries[0]).toEqual({ level: 'error', message: 'Real error' });
      expect(response.body.entries[1]).toEqual({ raw: 'not valid json' });
    });

    it('should limit to last 100 lines', async () => {
      const manyLogs = Array.from({ length: 150 }, (_, i) =>
        JSON.stringify({ level: 'info', message: `Log ${i}` })
      ).join('\n');

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(manyLogs);

      const response = await request(app)
        .get('/errors')
        .expect(200);

      expect(response.body.count).toBe(100);
      expect(response.body.entries).toHaveLength(100);
      // Last 100 entries (indices 50-149), reversed
      expect(response.body.entries[0]).toEqual({ level: 'info', message: 'Log 149' });
      expect(response.body.entries[99]).toEqual({ level: 'info', message: 'Log 50' });
    });

    it('should return 500 when reading fails', async () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockImplementation(() => {
        throw new Error('Read error');
      });

      const response = await request(app)
        .get('/errors')
        .expect('Content-Type', /json/)
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to read logs' });
    });
  });

  describe('GET /app', () => {
    it('should return "No app logs yet" when file does not exist', async () => {
      vi.mocked(existsSync).mockReturnValue(false);

      const response = await request(app)
        .get('/app')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toEqual({ logs: 'No app logs yet' });
    });

    it('should return reversed log lines when file exists', async () => {
      const mockLogs = 'Line 1\nLine 2\nLine 3';

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(mockLogs);

      const response = await request(app)
        .get('/app')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('lines');
      expect(response.body.lines).toHaveLength(3);
      expect(response.body.lines[0]).toBe('Line 3');
      expect(response.body.lines[1]).toBe('Line 2');
      expect(response.body.lines[2]).toBe('Line 1');
    });

    it('should filter out empty lines', async () => {
      const mockLogs = 'Line 1\n\n\nLine 2\n\n';

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(mockLogs);

      const response = await request(app)
        .get('/app')
        .expect(200);

      expect(response.body.lines).toHaveLength(2);
      expect(response.body.lines).toEqual(['Line 2', 'Line 1']);
    });

    it('should limit to last 100 lines', async () => {
      const manyLines = Array.from({ length: 150 }, (_, i) => `Line ${i}`).join('\n');

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(manyLines);

      const response = await request(app)
        .get('/app')
        .expect(200);

      expect(response.body.lines).toHaveLength(100);
    });

    it('should return 500 when reading fails', async () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockImplementation(() => {
        throw new Error('Read error');
      });

      const response = await request(app)
        .get('/app')
        .expect('Content-Type', /json/)
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to read logs' });
    });
  });

  describe('DELETE /errors', () => {
    it('should clear error logs when file exists', async () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(writeFileSync).mockReturnValue(undefined);

      const response = await request(app)
        .delete('/errors')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toEqual({ message: 'Error logs cleared' });
      expect(writeFileSync).toHaveBeenCalledWith(expect.any(String), '');
    });

    it('should succeed when file does not exist', async () => {
      vi.mocked(existsSync).mockReturnValue(false);

      const response = await request(app)
        .delete('/errors')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toEqual({ message: 'Error logs cleared' });
      expect(writeFileSync).not.toHaveBeenCalled();
    });

    it('should return 500 when clearing fails', async () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(writeFileSync).mockImplementation(() => {
        throw new Error('Write error');
      });

      const response = await request(app)
        .delete('/errors')
        .expect('Content-Type', /json/)
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to clear logs' });
    });
  });
});
