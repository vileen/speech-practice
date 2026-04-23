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
import kanjiRoutes from '../../routes/kanji.js';
import { pool } from '../../db/pool.js';

const mockQuery = pool.query as ReturnType<typeof vi.fn>;

describe('Kanji Routes', () => {
  let app: express.Application;

  const mockKanjiRow = {
    id: 1,
    character: '水',
    meanings: ['water'],
    readings: ['すい', 'みず'],
    lesson_id: '2026-03-16',
    mnemonic: 'Water flows like a river',
    stroke_count: 4,
    jlpt_level: 5,
    examples: [{ word: '水曜日', reading: 'すいようび', meaning: 'Wednesday' }],
  };

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/', kanjiRoutes);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /', () => {
    it('should return all kanji without filters', async () => {
      mockQuery.mockResolvedValue({ rows: [mockKanjiRow] });

      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.body).toEqual([
        {
          id: 1,
          character: '水',
          meanings: ['water'],
          readings: ['すい', 'みず'],
          lesson_id: '2026-03-16',
          mnemonic: 'Water flows like a river',
          stroke_count: 4,
          jlpt_level: 5,
          examples: [{ word: '水曜日', reading: 'すいようび', meaning: 'Wednesday' }],
        },
      ]);
      expect(mockQuery).toHaveBeenCalledWith(
        'SELECT * FROM kanji ORDER BY lesson_id, character',
        []
      );
    });

    it('should filter by lessonId', async () => {
      mockQuery.mockResolvedValue({ rows: [mockKanjiRow] });

      const response = await request(app)
        .get('/?lessonId=2026-03-16')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(mockQuery).toHaveBeenCalledWith(
        'SELECT * FROM kanji WHERE lesson_id = $1 ORDER BY lesson_id, character',
        ['2026-03-16']
      );
    });

    it('should apply limit', async () => {
      mockQuery.mockResolvedValue({ rows: [mockKanjiRow] });

      const response = await request(app)
        .get('/?limit=5')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(mockQuery).toHaveBeenCalledWith(
        'SELECT * FROM kanji ORDER BY lesson_id, character LIMIT $1',
        [5]
      );
    });

    it('should combine lessonId and limit filters', async () => {
      mockQuery.mockResolvedValue({ rows: [mockKanjiRow] });

      const response = await request(app)
        .get('/?lessonId=2026-03-16&limit=10')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(mockQuery).toHaveBeenCalledWith(
        'SELECT * FROM kanji WHERE lesson_id = $1 ORDER BY lesson_id, character LIMIT $2',
        ['2026-03-16', 10]
      );
    });

    it('should handle empty results', async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should handle null examples', async () => {
      mockQuery.mockResolvedValue({
        rows: [{ ...mockKanjiRow, examples: null }],
      });

      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.body[0].examples).toEqual([]);
    });

    it('should handle database errors gracefully', async () => {
      mockQuery.mockRejectedValue(new Error('Database connection lost'));

      const response = await request(app)
        .get('/')
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to fetch kanji' });
    });
  });

  describe('GET /:id', () => {
    it('should return specific kanji by id', async () => {
      mockQuery.mockResolvedValue({ rows: [mockKanjiRow] });

      const response = await request(app)
        .get('/1')
        .expect(200);

      expect(response.body).toEqual({
        id: 1,
        character: '水',
        meanings: ['water'],
        readings: ['すい', 'みず'],
        lesson_id: '2026-03-16',
        mnemonic: 'Water flows like a river',
        stroke_count: 4,
        jlpt_level: 5,
        examples: [{ word: '水曜日', reading: 'すいようび', meaning: 'Wednesday' }],
      });
      expect(mockQuery).toHaveBeenCalledWith(
        'SELECT * FROM kanji WHERE id = $1',
        ['1']
      );
    });

    it('should return 404 when kanji not found', async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      const response = await request(app)
        .get('/999')
        .expect(404);

      expect(response.body).toEqual({ error: 'Kanji not found' });
    });

    it('should handle null examples for single kanji', async () => {
      mockQuery.mockResolvedValue({
        rows: [{ ...mockKanjiRow, examples: null }],
      });

      const response = await request(app)
        .get('/1')
        .expect(200);

      expect(response.body.examples).toEqual([]);
    });

    it('should handle database errors for single kanji', async () => {
      mockQuery.mockRejectedValue(new Error('Database connection lost'));

      const response = await request(app)
        .get('/1')
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to fetch kanji' });
    });
  });
});
