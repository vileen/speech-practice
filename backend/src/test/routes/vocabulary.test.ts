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
import vocabularyRoutes from '../../routes/vocabulary.js';
import { pool } from '../../db/pool.js';

const mockQuery = pool.query as ReturnType<typeof vi.fn>;

describe('Vocabulary Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/', vocabularyRoutes);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /lessons/:id/vocabulary-with-sources', () => {
    it('should return vocabulary with other lesson sources when authorized', async () => {
      const lessonId = '2026-03-16';
      const vocabulary = [
        { jp: '猫', en: 'cat', romaji: 'neko' },
        { jp: '犬', en: 'dog', romaji: 'inu' },
      ];

      // First query: get lesson vocabulary
      mockQuery.mockResolvedValueOnce({
        rows: [{ vocabulary }],
      });

      // Second query: find other lessons with "猫"
      mockQuery.mockResolvedValueOnce({
        rows: [
          { id: '2026-03-15', title: 'Previous Lesson', date: '2026-03-15' },
        ],
      });

      // Third query: find other lessons with "犬"
      mockQuery.mockResolvedValueOnce({
        rows: [],
      });

      const response = await request(app)
        .get(`/lessons/${lessonId}/vocabulary-with-sources`)
        .set('x-password', 'test-password')
        .expect(200);

      expect(response.body).toEqual({
        lessonId,
        vocabulary: [
          {
            jp: '猫',
            en: 'cat',
            romaji: 'neko',
            otherLessons: [
              { id: '2026-03-15', title: 'Previous Lesson', date: '2026-03-15' },
            ],
          },
          {
            jp: '犬',
            en: 'dog',
            romaji: 'inu',
            otherLessons: [],
          },
        ],
      });

      expect(mockQuery).toHaveBeenCalledTimes(3);
      expect(mockQuery).toHaveBeenNthCalledWith(
        1,
        expect.stringContaining('SELECT vocabulary'),
        [lessonId]
      );
    });

    it('should return 401 when unauthorized', async () => {
      const response = await request(app)
        .get('/lessons/2026-03-16/vocabulary-with-sources')
        .expect(401);

      expect(response.body).toEqual({ error: 'Unauthorized' });
      expect(mockQuery).not.toHaveBeenCalled();
    });

    it('should return 404 when lesson not found', async () => {
      const lessonId = '2026-03-99';

      mockQuery.mockResolvedValueOnce({
        rows: [],
      });

      const response = await request(app)
        .get(`/lessons/${lessonId}/vocabulary-with-sources`)
        .set('x-password', 'test-password')
        .expect(404);

      expect(response.body).toEqual({ error: 'Lesson not found' });
      expect(mockQuery).toHaveBeenCalledTimes(1);
    });

    it('should handle empty vocabulary array', async () => {
      const lessonId = '2026-03-16';

      mockQuery.mockResolvedValueOnce({
        rows: [{ vocabulary: [] }],
      });

      const response = await request(app)
        .get(`/lessons/${lessonId}/vocabulary-with-sources`)
        .set('x-password', 'test-password')
        .expect(200);

      expect(response.body).toEqual({
        lessonId,
        vocabulary: [],
      });
      expect(mockQuery).toHaveBeenCalledTimes(1);
    });

    it('should handle null vocabulary', async () => {
      const lessonId = '2026-03-16';

      mockQuery.mockResolvedValueOnce({
        rows: [{ vocabulary: null }],
      });

      const response = await request(app)
        .get(`/lessons/${lessonId}/vocabulary-with-sources`)
        .set('x-password', 'test-password')
        .expect(200);

      expect(response.body).toEqual({
        lessonId,
        vocabulary: [],
      });
      expect(mockQuery).toHaveBeenCalledTimes(1);
    });

    it('should handle vocabulary entries without jp field (using word field)', async () => {
      const lessonId = '2026-03-16';
      const vocabulary = [
        { word: '猫', en: 'cat' },
      ];

      mockQuery.mockResolvedValueOnce({
        rows: [{ vocabulary }],
      });

      mockQuery.mockResolvedValueOnce({
        rows: [],
      });

      const response = await request(app)
        .get(`/lessons/${lessonId}/vocabulary-with-sources`)
        .set('x-password', 'test-password')
        .expect(200);

      expect(response.body.vocabulary[0]).toEqual({
        word: '猫',
        en: 'cat',
        otherLessons: [],
      });
    });

    it('should handle vocabulary entries with neither jp nor word field', async () => {
      const lessonId = '2026-03-16';
      const vocabulary = [
        { en: 'unknown', meaning: 'something' },
      ];

      mockQuery.mockResolvedValueOnce({
        rows: [{ vocabulary }],
      });

      const response = await request(app)
        .get(`/lessons/${lessonId}/vocabulary-with-sources`)
        .set('x-password', 'test-password')
        .expect(200);

      expect(response.body.vocabulary[0]).toEqual({
        en: 'unknown',
        meaning: 'something',
        otherLessons: [],
      });
      expect(mockQuery).toHaveBeenCalledTimes(1);
    });

    it('should limit other lessons to 5', async () => {
      const lessonId = '2026-03-16';
      const vocabulary = [{ jp: '猫', en: 'cat' }];

      mockQuery.mockResolvedValueOnce({
        rows: [{ vocabulary }],
      });

      mockQuery.mockResolvedValueOnce({
        rows: [
          { id: '2026-03-15', title: 'Lesson 5', date: '2026-03-15' },
          { id: '2026-03-14', title: 'Lesson 4', date: '2026-03-14' },
          { id: '2026-03-13', title: 'Lesson 3', date: '2026-03-13' },
          { id: '2026-03-12', title: 'Lesson 2', date: '2026-03-12' },
          { id: '2026-03-11', title: 'Lesson 1', date: '2026-03-11' },
        ],
      });

      const response = await request(app)
        .get(`/lessons/${lessonId}/vocabulary-with-sources`)
        .set('x-password', 'test-password')
        .expect(200);

      expect(response.body.vocabulary[0].otherLessons).toHaveLength(5);
    });

    it('should exclude current lesson from other lessons', async () => {
      const lessonId = '2026-03-16';
      const vocabulary = [{ jp: '猫', en: 'cat' }];

      mockQuery.mockResolvedValueOnce({
        rows: [{ vocabulary }],
      });

      mockQuery.mockResolvedValueOnce({
        rows: [],
      });

      await request(app)
        .get(`/lessons/${lessonId}/vocabulary-with-sources`)
        .set('x-password', 'test-password')
        .expect(200);

      // Verify the query excludes the current lesson
      const secondQueryCall = mockQuery.mock.calls[1];
      expect(secondQueryCall[0]).toContain('l.id != $1');
      expect(secondQueryCall[1]).toEqual([lessonId, JSON.stringify([{ jp: '猫' }])]);
    });

    it('should handle database errors gracefully', async () => {
      const lessonId = '2026-03-16';

      mockQuery.mockRejectedValueOnce(new Error('Database connection failed'));

      const response = await request(app)
        .get(`/lessons/${lessonId}/vocabulary-with-sources`)
        .set('x-password', 'test-password')
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to fetch vocabulary' });
    });

    it('should handle errors during otherLessons query gracefully', async () => {
      const lessonId = '2026-03-16';
      const vocabulary = [
        { jp: '猫', en: 'cat' },
      ];

      mockQuery.mockResolvedValueOnce({
        rows: [{ vocabulary }],
      });

      mockQuery.mockRejectedValueOnce(new Error('Query failed'));

      const response = await request(app)
        .get(`/lessons/${lessonId}/vocabulary-with-sources`)
        .set('x-password', 'test-password')
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to fetch vocabulary' });
    });

    it('should use body.password for authentication as fallback', async () => {
      const lessonId = '2026-03-16';
      const vocabulary = [{ jp: '猫', en: 'cat' }];

      mockQuery.mockResolvedValueOnce({
        rows: [{ vocabulary }],
      });

      mockQuery.mockResolvedValueOnce({
        rows: [],
      });

      const response = await request(app)
        .get(`/lessons/${lessonId}/vocabulary-with-sources`)
        .send({ password: 'test-password' })
        .expect(200);

      expect(response.body).toEqual({
        lessonId,
        vocabulary: expect.any(Array),
      });
    });

    it('should handle vocabulary with special characters in Japanese', async () => {
      const lessonId = '2026-03-16';
      const vocabulary = [
        { jp: '日本語', en: 'Japanese language' },
        { jp: '〜', en: 'from...to' },
      ];

      mockQuery.mockResolvedValueOnce({
        rows: [{ vocabulary }],
      });

      mockQuery.mockResolvedValueOnce({ rows: [] });
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .get(`/lessons/${lessonId}/vocabulary-with-sources`)
        .set('x-password', 'test-password')
        .expect(200);

      expect(response.body.vocabulary).toHaveLength(2);
      expect(response.body.vocabulary[0].jp).toBe('日本語');
      expect(response.body.vocabulary[1].jp).toBe('〜');
    });
  });
});
