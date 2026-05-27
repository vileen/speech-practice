import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';

// Mock dependencies - must be before imports
vi.mock('../../db/pool.js', () => ({
  pool: {
    query: vi.fn(),
  },
}));

vi.mock('../../services/chat.js', () => ({
  generateChatResponse: vi.fn(),
}));

vi.mock('../../config/index.js', () => ({
  appConfig: {
    password: 'test-password',
  },
}));

// Now import after mocks are set up
import chatRoutes from '../../routes/chat.js';
import { pool } from '../../db/pool.js';
import { generateChatResponse } from '../../services/chat.js';

const mockQuery = pool.query as ReturnType<typeof vi.fn>;
const mockGenerateChatResponse = generateChatResponse as ReturnType<typeof vi.fn>;

describe('Chat Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/', chatRoutes);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /', () => {
    it('should generate chat response and save messages when session exists', async () => {
      const session = {
        id: 'session-123',
        lesson_context: 'Test lesson context',
      };
      const previousMessages = [
        { role: 'user', content: 'Hello', created_at: '2026-01-01' },
        { role: 'assistant', content: 'Konnichiwa', created_at: '2026-01-01' },
      ];
      const aiResponse = {
        text: '日本語',
        textWithFurigana: '<ruby>日本語<rt>にほんご</rt></ruby>',
        romaji: 'nihongo',
        translation: 'Japanese language',
      };

      mockQuery
        .mockResolvedValueOnce({ rows: [session] }) // session lookup
        .mockResolvedValueOnce({ rows: previousMessages }) // previous messages
        .mockResolvedValueOnce({ rowCount: 1 }) // insert user message
        .mockResolvedValueOnce({ rowCount: 1 }); // insert assistant message

      mockGenerateChatResponse.mockResolvedValueOnce(aiResponse);

      const response = await request(app)
        .post('/')
        .set('x-password', 'test-password')
        .send({ session_id: 'session-123', message: 'How do I say hello?' })
        .expect(200);

      expect(response.body).toEqual({
        text: aiResponse.text,
        text_with_furigana: aiResponse.textWithFurigana,
        romaji: aiResponse.romaji,
        translation: aiResponse.translation,
      });

      expect(mockQuery).toHaveBeenCalledTimes(4);
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
      expect(mockGenerateChatResponse).toHaveBeenCalledWith(
        [
          { role: 'user', content: 'Hello' },
          { role: 'assistant', content: 'Konnichiwa' },
          { role: 'user', content: 'How do I say hello?' },
        ],
        'Test lesson context'
      );
      expect(mockQuery).toHaveBeenNthCalledWith(
        3,
        'INSERT INTO messages (session_id, role, content) VALUES ($1, $2, $3)',
        ['session-123', 'user', 'How do I say hello?']
      );
      expect(mockQuery).toHaveBeenNthCalledWith(
        4,
        'INSERT INTO messages (session_id, role, content) VALUES ($1, $2, $3)',
        ['session-123', 'assistant', aiResponse.text]
      );
    });

    it('should return 401 when unauthorized', async () => {
      const response = await request(app)
        .post('/')
        .send({ session_id: 'session-123', message: 'test' })
        .expect(401);

      expect(response.body).toEqual({ error: 'Unauthorized' });
      expect(mockQuery).not.toHaveBeenCalled();
    });

    it('should return 404 when session not found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .post('/')
        .set('x-password', 'test-password')
        .send({ session_id: 'nonexistent', message: 'test' })
        .expect(404);

      expect(response.body).toEqual({ error: 'Session not found' });
      expect(mockQuery).toHaveBeenCalledTimes(1);
      expect(mockGenerateChatResponse).not.toHaveBeenCalled();
    });

    it('should handle empty previous messages', async () => {
      const session = {
        id: 'session-123',
        lesson_context: null,
      };
      const aiResponse = {
        text: 'こんにちは',
        textWithFurigana: '<ruby>今日は<rt>こんにちは</rt></ruby>',
        romaji: 'konnichiwa',
        translation: 'Hello',
      };

      mockQuery
        .mockResolvedValueOnce({ rows: [session] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rowCount: 1 })
        .mockResolvedValueOnce({ rowCount: 1 });

      mockGenerateChatResponse.mockResolvedValueOnce(aiResponse);

      const response = await request(app)
        .post('/')
        .set('x-password', 'test-password')
        .send({ session_id: 'session-123', message: 'Hi' })
        .expect(200);

      expect(response.body.text).toBe('こんにちは');
      expect(mockGenerateChatResponse).toHaveBeenCalledWith(
        [{ role: 'user', content: 'Hi' }],
        undefined
      );
    });

    it('should handle AI service errors gracefully', async () => {
      const session = {
        id: 'session-123',
        lesson_context: null,
      };

      mockQuery
        .mockResolvedValueOnce({ rows: [session] })
        .mockResolvedValueOnce({ rows: [] });

      mockGenerateChatResponse.mockRejectedValueOnce(new Error('OpenAI API error'));

      const response = await request(app)
        .post('/')
        .set('x-password', 'test-password')
        .send({ session_id: 'session-123', message: 'Hi' })
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to generate response' });
    });

    it('should handle database errors gracefully', async () => {
      mockQuery.mockRejectedValueOnce(new Error('Database connection failed'));

      const response = await request(app)
        .post('/')
        .set('x-password', 'test-password')
        .send({ session_id: 'session-123', message: 'Hi' })
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to generate response' });
      expect(mockGenerateChatResponse).not.toHaveBeenCalled();
    });

    it('should work without lesson context', async () => {
      const session = {
        id: 'session-123',
        // lesson_context is undefined
      };
      const aiResponse = {
        text: 'Response',
        textWithFurigana: 'Response',
        romaji: 'response',
      };

      mockQuery
        .mockResolvedValueOnce({ rows: [session] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rowCount: 1 })
        .mockResolvedValueOnce({ rowCount: 1 });

      mockGenerateChatResponse.mockResolvedValueOnce(aiResponse);

      await request(app)
        .post('/')
        .set('x-password', 'test-password')
        .send({ session_id: 'session-123', message: 'Hi' })
        .expect(200);

      expect(mockGenerateChatResponse).toHaveBeenCalledWith(
        [{ role: 'user', content: 'Hi' }],
        undefined
      );
    });

    it('should not include translation if AI response lacks it', async () => {
      const session = {
        id: 'session-123',
        lesson_context: null,
      };
      const aiResponse = {
        text: 'Response',
        textWithFurigana: 'Response',
        romaji: 'response',
        // translation is undefined
      };

      mockQuery
        .mockResolvedValueOnce({ rows: [session] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rowCount: 1 })
        .mockResolvedValueOnce({ rowCount: 1 });

      mockGenerateChatResponse.mockResolvedValueOnce(aiResponse);

      const response = await request(app)
        .post('/')
        .set('x-password', 'test-password')
        .send({ session_id: 'session-123', message: 'Hi' })
        .expect(200);

      expect(response.body).toHaveProperty('text');
      expect(response.body).toHaveProperty('text_with_furigana');
      expect(response.body).toHaveProperty('romaji');
      expect(response.body.translation).toBeUndefined();
    });
  });
});
