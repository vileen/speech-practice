import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';

// Mock dependencies - must be before imports
vi.mock('../../db/pool.js', () => ({
  pool: {
    query: vi.fn(),
    connect: vi.fn(),
  },
}));

vi.mock('../../config/index.js', () => ({
  appConfig: {
    password: 'test-password',
  },
}));

// Import after mocks
import progressRoutes from '../../routes/progress.js';
import { pool } from '../../db/pool.js';

const mockQuery = pool.query as ReturnType<typeof vi.fn>;

describe('Progress Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/', progressRoutes);
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('GET /overview', () => {
    it('should return overview stats when authorized', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ total_attempts: '100', week_attempts: '20' }] }) // studyTime
        .mockResolvedValueOnce({ rows: [{ streak: '5' }] }) // streak
        .mockResolvedValueOnce({ rows: [{ total_patterns: '50', mastered_patterns: '12' }] }) // grammar
        .mockResolvedValueOnce({ rows: [{ total_kanji: '100', learned_kanji: '30' }] }) // kanji
        .mockResolvedValueOnce({ rows: [{ completed_lessons: '10' }] }) // lessons
        .mockResolvedValueOnce({ rows: [{ total: '20' }] }); // totalLessons

      const response = await request(app)
        .get('/overview')
        .set('x-password', 'test-password')
        .expect(200);

      expect(response.body).toEqual({
        studyTime: { thisWeek: 40, allTime: 200, unit: 'minutes' },
        streak: 5,
        grammar: { mastered: 12, total: 50 },
        kanji: { learned: 30, total: 100 },
        lessons: { completed: 10, total: 20 },
      });
      expect(mockQuery).toHaveBeenCalledTimes(6);
    });

    it('should handle empty database results', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ total_attempts: '0', week_attempts: '0' }] })
        .mockResolvedValueOnce({ rows: [{ streak: '0' }] })
        .mockResolvedValueOnce({ rows: [{ total_patterns: '0', mastered_patterns: '0' }] })
        .mockResolvedValueOnce({ rows: [{ total_kanji: '0', learned_kanji: '0' }] })
        .mockResolvedValueOnce({ rows: [{ completed_lessons: '0' }] })
        .mockResolvedValueOnce({ rows: [{ total: '0' }] });

      const response = await request(app)
        .get('/overview')
        .set('x-password', 'test-password')
        .expect(200);

      expect(response.body.studyTime).toEqual({ thisWeek: 0, allTime: 0, unit: 'minutes' });
      expect(response.body.streak).toBe(0);
    });

    it('should return 401 when unauthorized', async () => {
      const response = await request(app)
        .get('/overview')
        .expect(401);

      expect(response.body).toEqual({ error: 'Unauthorized' });
      expect(mockQuery).not.toHaveBeenCalled();
    });

    it('should handle database errors gracefully', async () => {
      mockQuery.mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .get('/overview')
        .set('x-password', 'test-password')
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to fetch overview stats' });
    });
  });

  describe('GET /by-level', () => {
    it('should return JLPT progress for all levels when authorized', async () => {
      const grammarRows = [
        { jlpt_level: 'N5', total_patterns: '20', attempted_patterns: '15', mastered_patterns: '10' },
        { jlpt_level: 'N4', total_patterns: '30', attempted_patterns: '20', mastered_patterns: '8' },
        { jlpt_level: 'N3', total_patterns: '40', attempted_patterns: '10', mastered_patterns: '3' },
      ];
      const kanjiRows = [
        { jlpt_level: 'N5', total_kanji: '80', attempted_kanji: '60', mastered_kanji: '50' },
        { jlpt_level: 'N4', total_kanji: '120', attempted_kanji: '40', mastered_kanji: '20' },
        { jlpt_level: 'N3', total_kanji: '200', attempted_kanji: '10', mastered_kanji: '5' },
      ];

      mockQuery
        .mockResolvedValueOnce({ rows: grammarRows })
        .mockResolvedValueOnce({ rows: kanjiRows });

      const response = await request(app)
        .get('/by-level')
        .set('x-password', 'test-password')
        .expect(200);

      expect(response.body.levels).toHaveLength(3);
      expect(response.body.levels[0].level).toBe('N5');
      expect(response.body.levels[0].grammar).toEqual({ total: 20, mastered: 10, percentage: 50 });
      expect(response.body.levels[0].kanji).toEqual({ total: 80, mastered: 50, percentage: 63 });
      expect(response.body.levels[0].overall.mastered).toBe(60);
      expect(response.body.levels[0].overall.total).toBe(100);
    });

    it('should handle empty results with zero percentages', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .get('/by-level')
        .set('x-password', 'test-password')
        .expect(200);

      expect(response.body.levels).toHaveLength(3);
      response.body.levels.forEach((level: any) => {
        expect(level.grammar.percentage).toBe(0);
        expect(level.kanji.percentage).toBe(0);
        expect(level.overall.percentage).toBe(0);
      });
    });

    it('should return 401 when unauthorized', async () => {
      const response = await request(app)
        .get('/by-level')
        .expect(401);

      expect(response.body).toEqual({ error: 'Unauthorized' });
    });

    it('should handle database errors gracefully', async () => {
      mockQuery.mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .get('/by-level')
        .set('x-password', 'test-password')
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to fetch JLPT progress' });
    });
  });

  describe('GET /weak-points', () => {
    it('should return weak categories, patterns, and confused pairs when authorized', async () => {
      const categoryRows = [
        { category: 'Conditionals', total_patterns: '5', total_attempts: '20', accuracy_percentage: '35.0' },
        { category: 'Causative', total_patterns: '3', total_attempts: '15', accuracy_percentage: '40.0' },
      ];
      const patternRows = [
        { id: 1, pattern: '〜ば', category: 'Conditionals', jlpt_level: 'N4', total_attempts: '5', correct_attempts: '1', accuracy_percentage: '20.0' },
        { id: 2, pattern: '〜と', category: 'Conditionals', jlpt_level: 'N5', total_attempts: '8', correct_attempts: '3', accuracy_percentage: '37.5' },
      ];
      const confusedRows = [
        { pattern_id: 1, pattern_name: '〜てもいい', pattern_category: 'Permission', confused_with_id: 2, confused_with_name: '〜てはいけません', confusion_count: '7' },
      ];

      mockQuery
        .mockResolvedValueOnce({ rows: categoryRows })
        .mockResolvedValueOnce({ rows: patternRows })
        .mockResolvedValueOnce({ rows: confusedRows });

      const response = await request(app)
        .get('/weak-points')
        .set('x-password', 'test-password')
        .expect(200);

      expect(response.body.weakCategories).toHaveLength(2);
      expect(response.body.weakCategories[0]).toEqual({
        category: 'Conditionals',
        accuracy: 35.0,
        totalPatterns: 5,
        totalAttempts: 20,
      });

      expect(response.body.weakPatterns).toHaveLength(2);
      expect(response.body.weakPatterns[0]).toEqual({
        id: 1,
        pattern: '〜ば',
        category: 'Conditionals',
        jlptLevel: 'N4',
        accuracy: 20.0,
        attempts: 5,
        correct: 1,
      });

      expect(response.body.confusedPairs).toHaveLength(1);
      expect(response.body.confusedPairs[0]).toEqual({
        patternId: 1,
        patternName: '〜てもいい',
        patternCategory: 'Permission',
        confusedWithId: 2,
        confusedWithName: '〜てはいけません',
        count: 7,
      });
    });

    it('should return 401 when unauthorized', async () => {
      const response = await request(app)
        .get('/weak-points')
        .expect(401);

      expect(response.body).toEqual({ error: 'Unauthorized' });
    });

    it('should handle database errors gracefully', async () => {
      mockQuery.mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .get('/weak-points')
        .set('x-password', 'test-password')
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to fetch weak points' });
    });
  });

  describe('GET /activity', () => {
    it('should return 7-day activity data when authorized', async () => {
      const activityRows = [
        { date: '2026-05-16', grammar_attempts: '10', kanji_attempts: '5', total_sessions: '15' },
        { date: '2026-05-17', grammar_attempts: '8', kanji_attempts: '3', total_sessions: '11' },
        { date: '2026-05-18', grammar_attempts: '12', kanji_attempts: '7', total_sessions: '19' },
        { date: '2026-05-19', grammar_attempts: '5', kanji_attempts: '0', total_sessions: '5' },
        { date: '2026-05-20', grammar_attempts: '15', kanji_attempts: '10', total_sessions: '25' },
        { date: '2026-05-21', grammar_attempts: '3', kanji_attempts: '2', total_sessions: '5' },
        { date: '2026-05-22', grammar_attempts: '7', kanji_attempts: '4', total_sessions: '11' },
      ];

      mockQuery.mockResolvedValue({ rows: activityRows });

      const response = await request(app)
        .get('/activity')
        .set('x-password', 'test-password')
        .expect(200);

      expect(response.body.activity).toHaveLength(7);
      expect(response.body.activity[0]).toEqual({
        date: '2026-05-16',
        grammarAttempts: 10,
        kanjiAttempts: 5,
        totalSessions: 15,
      });
    });

    it('should handle empty activity days', async () => {
      const activityRows = [
        { date: '2026-05-16', grammar_attempts: '0', kanji_attempts: '0', total_sessions: '0' },
        { date: '2026-05-17', grammar_attempts: '0', kanji_attempts: '0', total_sessions: '0' },
      ];

      mockQuery.mockResolvedValue({ rows: activityRows });

      const response = await request(app)
        .get('/activity')
        .set('x-password', 'test-password')
        .expect(200);

      expect(response.body.activity).toHaveLength(2);
      expect(response.body.activity[0].totalSessions).toBe(0);
    });

    it('should return 401 when unauthorized', async () => {
      const response = await request(app)
        .get('/activity')
        .expect(401);

      expect(response.body).toEqual({ error: 'Unauthorized' });
    });

    it('should handle database errors gracefully', async () => {
      mockQuery.mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .get('/activity')
        .set('x-password', 'test-password')
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to fetch activity data' });
    });
  });

  describe('GET /categories', () => {
    it('should return category breakdown when authorized', async () => {
      const categoryRows = [
        { category: 'Permission', total_patterns: '5', total_attempts: '30', correct_attempts: '25', accuracy_percentage: '83.3' },
        { category: 'Prohibition', total_patterns: '4', total_attempts: '20', correct_attempts: '18', accuracy_percentage: '90.0' },
        { category: 'Conditionals', total_patterns: '6', total_attempts: '40', correct_attempts: '15', accuracy_percentage: '37.5' },
      ];

      mockQuery.mockResolvedValue({ rows: categoryRows });

      const response = await request(app)
        .get('/categories')
        .set('x-password', 'test-password')
        .expect(200);

      expect(response.body.categories).toHaveLength(3);
      expect(response.body.categories[0]).toEqual({
        category: 'Permission',
        totalPatterns: 5,
        totalAttempts: 30,
        accuracy: 83.3,
      });
    });

    it('should handle empty results', async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      const response = await request(app)
        .get('/categories')
        .set('x-password', 'test-password')
        .expect(200);

      expect(response.body.categories).toEqual([]);
    });

    it('should return 401 when unauthorized', async () => {
      const response = await request(app)
        .get('/categories')
        .expect(401);

      expect(response.body).toEqual({ error: 'Unauthorized' });
    });

    it('should handle database errors gracefully', async () => {
      mockQuery.mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .get('/categories')
        .set('x-password', 'test-password')
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to fetch category breakdown' });
    });
  });
});
