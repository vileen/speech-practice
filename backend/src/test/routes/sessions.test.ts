import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';

// Mock dependencies - must be before imports
vi.mock('../../db/pool.js', () => ({
  pool: {
    query: vi.fn(),
  },
}));

vi.mock('../../config/index.js', () => ({
  appConfig: {
    password: 'test-password',
  },
}));

// Now import after mocks are set up
import sessionsRoutes from '../../routes/sessions.js';
import { pool } from '../../db/pool.js';

const mockQuery = pool.query as ReturnType<typeof vi.fn>;

describe('Sessions Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/', sessionsRoutes);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /', () => {
    it('should create a new session when authorized', async () => {
      const newSession = {
        id: 'session-123',
        language: 'ja',
        voice_gender: 'female',
        created_at: '2026-05-30T10:00:00Z',
      };

      mockQuery.mockResolvedValueOnce({ rows: [newSession] });

      const response = await request(app)
        .post('/')
        .set('x-password', 'test-password')
        .send({ language: 'ja', voice_gender: 'female' })
        .expect(200);

      expect(response.body).toEqual(newSession);
      expect(mockQuery).toHaveBeenCalledTimes(1);
      expect(mockQuery).toHaveBeenCalledWith(
        'INSERT INTO sessions (language, voice_gender) VALUES ($1, $2) RETURNING *',
        ['ja', 'female']
      );
    });

    it('should return 401 when unauthorized', async () => {
      const response = await request(app)
        .post('/')
        .send({ language: 'ja', voice_gender: 'female' })
        .expect(401);

      expect(response.body).toEqual({ error: 'Unauthorized' });
      expect(mockQuery).not.toHaveBeenCalled();
    });

    it('should handle database errors during creation', async () => {
      mockQuery.mockRejectedValueOnce(new Error('Database connection failed'));

      const response = await request(app)
        .post('/')
        .set('x-password', 'test-password')
        .send({ language: 'ja', voice_gender: 'female' })
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to create session' });
      expect(mockQuery).toHaveBeenCalledTimes(1);
    });

    it('should use body.password for authentication as fallback', async () => {
      const newSession = {
        id: 'session-456',
        language: 'en',
        voice_gender: 'male',
        created_at: '2026-05-30T10:00:00Z',
      };

      mockQuery.mockResolvedValueOnce({ rows: [newSession] });

      const response = await request(app)
        .post('/')
        .send({ password: 'test-password', language: 'en', voice_gender: 'male' })
        .expect(200);

      expect(response.body).toEqual(newSession);
    });

    it('should create session with null voice_gender', async () => {
      const newSession = {
        id: 'session-789',
        language: 'ja',
        voice_gender: null,
        created_at: '2026-05-30T10:00:00Z',
      };

      mockQuery.mockResolvedValueOnce({ rows: [newSession] });

      const response = await request(app)
        .post('/')
        .set('x-password', 'test-password')
        .send({ language: 'ja', voice_gender: null })
        .expect(200);

      expect(response.body).toEqual(newSession);
      expect(mockQuery).toHaveBeenCalledWith(
        'INSERT INTO sessions (language, voice_gender) VALUES ($1, $2) RETURNING *',
        ['ja', null]
      );
    });
  });

  describe('GET /', () => {
    it('should return all sessions ordered by created_at DESC when authorized', async () => {
      const sessions = [
        { id: 'session-2', language: 'ja', voice_gender: 'female', created_at: '2026-05-30T12:00:00Z' },
        { id: 'session-1', language: 'ja', voice_gender: 'male', created_at: '2026-05-30T10:00:00Z' },
      ];

      mockQuery.mockResolvedValueOnce({ rows: sessions });

      const response = await request(app)
        .get('/')
        .set('x-password', 'test-password')
        .expect(200);

      expect(response.body).toEqual(sessions);
      expect(mockQuery).toHaveBeenCalledTimes(1);
      expect(mockQuery).toHaveBeenCalledWith(
        'SELECT * FROM sessions ORDER BY created_at DESC'
      );
    });

    it('should return empty array when no sessions exist', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .get('/')
        .set('x-password', 'test-password')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should return 401 when unauthorized', async () => {
      const response = await request(app).get('/').expect(401);

      expect(response.body).toEqual({ error: 'Unauthorized' });
      expect(mockQuery).not.toHaveBeenCalled();
    });

    it('should handle database errors when listing sessions', async () => {
      mockQuery.mockRejectedValueOnce(new Error('Database connection failed'));

      const response = await request(app)
        .get('/')
        .set('x-password', 'test-password')
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to fetch sessions' });
    });
  });

  describe('GET /:id', () => {
    it('should return session with messages when authorized and session exists', async () => {
      const session = {
        id: 'session-123',
        language: 'ja',
        voice_gender: 'female',
        created_at: '2026-05-30T10:00:00Z',
      };
      const messages = [
        { id: 'msg-1', session_id: 'session-123', role: 'user', content: 'Hello', created_at: '2026-05-30T10:01:00Z' },
        { id: 'msg-2', session_id: 'session-123', role: 'assistant', content: 'こんにちは', created_at: '2026-05-30T10:02:00Z' },
      ];

      mockQuery
        .mockResolvedValueOnce({ rows: [session] })
        .mockResolvedValueOnce({ rows: messages });

      const response = await request(app)
        .get('/session-123')
        .set('x-password', 'test-password')
        .expect(200);

      expect(response.body).toEqual({
        session,
        messages,
      });
      expect(mockQuery).toHaveBeenCalledTimes(2);
      expect(mockQuery).toHaveBeenNthCalledWith(
        1,
        'SELECT * FROM sessions WHERE id = $1',
        ['session-123']
      );
      expect(mockQuery).toHaveBeenNthCalledWith(
        2,
        'SELECT * FROM messages WHERE session_id = $1 ORDER BY created_at ASC',
        ['session-123']
      );
    });

    it('should return 404 when session not found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .get('/nonexistent-session')
        .set('x-password', 'test-password')
        .expect(404);

      expect(response.body).toEqual({ error: 'Session not found' });
      expect(mockQuery).toHaveBeenCalledTimes(1);
      expect(mockQuery).not.toHaveBeenCalledWith(
        expect.stringContaining('messages'),
        expect.anything()
      );
    });

    it('should return session with empty messages array when no messages exist', async () => {
      const session = {
        id: 'session-123',
        language: 'ja',
        voice_gender: 'female',
        created_at: '2026-05-30T10:00:00Z',
      };

      mockQuery
        .mockResolvedValueOnce({ rows: [session] })
        .mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .get('/session-123')
        .set('x-password', 'test-password')
        .expect(200);

      expect(response.body).toEqual({
        session,
        messages: [],
      });
    });

    it('should return 401 when unauthorized', async () => {
      const response = await request(app).get('/session-123').expect(401);

      expect(response.body).toEqual({ error: 'Unauthorized' });
      expect(mockQuery).not.toHaveBeenCalled();
    });

    it('should handle database errors when fetching session', async () => {
      mockQuery.mockRejectedValueOnce(new Error('Database connection failed'));

      const response = await request(app)
        .get('/session-123')
        .set('x-password', 'test-password')
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to fetch session' });
    });

    it('should handle database errors when fetching messages', async () => {
      const session = {
        id: 'session-123',
        language: 'ja',
        voice_gender: 'female',
        created_at: '2026-05-30T10:00:00Z',
      };

      mockQuery
        .mockResolvedValueOnce({ rows: [session] })
        .mockRejectedValueOnce(new Error('Messages query failed'));

      const response = await request(app)
        .get('/session-123')
        .set('x-password', 'test-password')
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to fetch session' });
    });

    it('should use body.password for authentication as fallback for GET by id', async () => {
      const session = {
        id: 'session-456',
        language: 'en',
        voice_gender: 'male',
        created_at: '2026-05-30T10:00:00Z',
      };

      mockQuery
        .mockResolvedValueOnce({ rows: [session] })
        .mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .get('/session-456')
        .send({ password: 'test-password' })
        .expect(200);

      expect(response.body).toEqual({ session, messages: [] });
    });
  });
});
