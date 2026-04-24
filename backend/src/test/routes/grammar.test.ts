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
import grammarRoutes from '../../routes/grammar.js';
import { pool } from '../../db/pool.js';

const mockQuery = pool.query as ReturnType<typeof vi.fn>;
const mockConnect = pool.connect as ReturnType<typeof vi.fn>;

describe('Grammar Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/', grammarRoutes);
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('GET /patterns', () => {
    it('should return all grammar patterns when authorized', async () => {
      const mockRows = [
        { id: 1, pattern: '〜てもいい', category: 'Permission', jlpt_level: 'N5', formation_rules: [], examples: [] },
        { id: 2, pattern: '〜てはいけません', category: 'Prohibition', jlpt_level: 'N5', formation_rules: [], examples: [] },
      ];
      mockQuery.mockResolvedValue({ rows: mockRows });

      const response = await request(app)
        .get('/patterns')
        .set('x-password', 'test-password')
        .expect(200);

      expect(response.body).toEqual({
        count: 2,
        patterns: mockRows,
      });
      expect(mockQuery).toHaveBeenCalledTimes(1);
    });

    it('should return 401 when unauthorized', async () => {
      const response = await request(app)
        .get('/patterns')
        .expect(401);

      expect(response.body).toEqual({ error: 'Unauthorized' });
      expect(mockQuery).not.toHaveBeenCalled();
    });

    it('should filter by category when provided', async () => {
      const mockRows = [
        { id: 1, pattern: '〜てもいい', category: 'Permission', jlpt_level: 'N5', formation_rules: [], examples: [] },
      ];
      mockQuery.mockResolvedValue({ rows: mockRows });

      const response = await request(app)
        .get('/patterns?category=Permission')
        .set('x-password', 'test-password')
        .expect(200);

      expect(response.body.count).toBe(1);
      expect(response.body.patterns[0].category).toBe('Permission');
    });

    it('should filter by JLPT level when provided', async () => {
      const mockRows = [
        { id: 1, pattern: '〜てもいい', category: 'Permission', jlpt_level: 'N5', formation_rules: [], examples: [] },
      ];
      mockQuery.mockResolvedValue({ rows: mockRows });

      const response = await request(app)
        .get('/patterns?jlptLevel=N5')
        .set('x-password', 'test-password')
        .expect(200);

      expect(response.body.count).toBe(1);
    });

    it('should group Counters by base_form when groupBy=base_form', async () => {
      const mockRows = [
        {
          id: 1,
          pattern: '〜つ',
          category: 'Counters',
          jlpt_level: 'N5',
          variants: [
            { id: 1, pattern: '一つ', formation_rules: [], examples: [] },
          ],
          variant_count: '10',
        },
      ];
      mockQuery.mockResolvedValue({ rows: mockRows });

      const response = await request(app)
        .get('/patterns?groupBy=base_form&category=Counters')
        .set('x-password', 'test-password')
        .expect(200);

      expect(response.body.count).toBe(1);
      expect(response.body.patterns[0].isCounterGroup).toBe(true);
    });

    it('should handle database errors gracefully', async () => {
      mockQuery.mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .get('/patterns')
        .set('x-password', 'test-password')
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to fetch grammar patterns' });
    });

    it('should exclude Counters from normal query', async () => {
      const mockRows: any[] = [];
      mockQuery.mockResolvedValue({ rows: mockRows });

      await request(app)
        .get('/patterns')
        .set('x-password', 'test-password')
        .expect(200);

      const queryCall = mockQuery.mock.calls[0][0] as string;
      expect(queryCall).toContain("category != 'Counters'");
    });

    it('should return empty array when no patterns exist', async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      const response = await request(app)
        .get('/patterns')
        .set('x-password', 'test-password')
        .expect(200);

      expect(response.body).toEqual({
        count: 0,
        patterns: [],
      });
    });
  });

  describe('GET /patterns/:id', () => {
    it('should return pattern with exercises and progress when authorized', async () => {
      const mockPattern = { id: 1, pattern: '〜てもいい', category: 'Permission', jlpt_level: 'N5' };
      const mockExercises = [
        { id: 1, pattern_id: 1, prompt: 'Test prompt', correct_answer: '答え' },
      ];
      const mockProgress = { pattern_id: 1, ease_factor: 2.5, streak: 3 };

      mockQuery
        .mockResolvedValueOnce({ rows: [mockPattern] })
        .mockResolvedValueOnce({ rows: mockExercises })
        .mockResolvedValueOnce({ rows: [mockProgress] });

      const response = await request(app)
        .get('/patterns/1')
        .set('x-password', 'test-password')
        .expect(200);

      expect(response.body).toEqual({
        pattern: mockPattern,
        exercises: mockExercises,
        progress: mockProgress,
      });
      expect(mockQuery).toHaveBeenCalledTimes(3);
    });

    it('should return null progress when no progress exists', async () => {
      const mockPattern = { id: 1, pattern: '〜てもいい', category: 'Permission' };
      const mockExercises: any[] = [];

      mockQuery
        .mockResolvedValueOnce({ rows: [mockPattern] })
        .mockResolvedValueOnce({ rows: mockExercises })
        .mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .get('/patterns/1')
        .set('x-password', 'test-password')
        .expect(200);

      expect(response.body.progress).toBeNull();
    });

    it('should return 404 when pattern not found', async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      const response = await request(app)
        .get('/patterns/999')
        .set('x-password', 'test-password')
        .expect(404);

      expect(response.body).toEqual({ error: 'Pattern not found' });
    });

    it('should return 401 when unauthorized', async () => {
      const response = await request(app)
        .get('/patterns/1')
        .expect(401);

      expect(response.body).toEqual({ error: 'Unauthorized' });
    });

    it('should handle database errors gracefully', async () => {
      mockQuery.mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .get('/patterns/1')
        .set('x-password', 'test-password')
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to fetch grammar pattern' });
    });
  });

  describe('GET /review', () => {
    it('should return patterns due for review when authorized', async () => {
      const mockRows = [
        { id: 1, pattern: '〜てもいい', category: 'Permission', ease_factor: 2.5, interval_days: 1, streak: 0, total_attempts: 0, correct_attempts: 0 },
      ];
      mockQuery.mockResolvedValue({ rows: mockRows });

      const response = await request(app)
        .get('/review')
        .set('x-password', 'test-password')
        .expect(200);

      expect(response.body).toEqual({
        count: 1,
        patterns: mockRows,
      });
    });

    it('should return 401 when unauthorized', async () => {
      const response = await request(app)
        .get('/review')
        .expect(401);

      expect(response.body).toEqual({ error: 'Unauthorized' });
    });

    it('should handle database errors gracefully', async () => {
      mockQuery.mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .get('/review')
        .set('x-password', 'test-password')
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to fetch review patterns' });
    });

    it('should exclude Counters from review', async () => {
      const mockRows: any[] = [];
      mockQuery.mockResolvedValue({ rows: mockRows });

      await request(app)
        .get('/review')
        .set('x-password', 'test-password')
        .expect(200);

      const queryCall = mockQuery.mock.calls[0][0] as string;
      expect(queryCall).toContain("gp.category != 'Counters'");
    });
  });

  describe('GET /patterns/:id/exercise', () => {
    it('should return random exercise for pattern when authorized', async () => {
      const mockExercise = { id: 1, pattern_id: 1, prompt: 'Test prompt', correct_answer: '答え', type: 'fill-in-blank' };
      mockQuery.mockResolvedValue({ rows: [mockExercise] });

      const response = await request(app)
        .get('/patterns/1/exercise')
        .set('x-password', 'test-password')
        .expect(200);

      expect(response.body).toEqual({ exercise: mockExercise });
    });

    it('should filter by type when provided', async () => {
      const mockExercise = { id: 1, pattern_id: 1, prompt: 'Test', correct_answer: '答え', type: 'multiple-choice' };
      mockQuery.mockResolvedValue({ rows: [mockExercise] });

      const response = await request(app)
        .get('/patterns/1/exercise?type=multiple-choice')
        .set('x-password', 'test-password')
        .expect(200);

      expect(response.body.exercise.type).toBe('multiple-choice');
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('AND type = $2'),
        ['1', 'multiple-choice']
      );
    });

    it('should return 404 when no exercises found', async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      const response = await request(app)
        .get('/patterns/1/exercise')
        .set('x-password', 'test-password')
        .expect(404);

      expect(response.body).toEqual({ error: 'No exercises found for this pattern' });
    });

    it('should return 401 when unauthorized', async () => {
      const response = await request(app)
        .get('/patterns/1/exercise')
        .expect(401);

      expect(response.body).toEqual({ error: 'Unauthorized' });
    });

    it('should handle database errors gracefully', async () => {
      mockQuery.mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .get('/patterns/1/exercise')
        .set('x-password', 'test-password')
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to fetch exercise' });
    });
  });

  describe('GET /exercises/:id', () => {
    it('should return exercise by ID when authorized', async () => {
      const mockExercise = { id: 1, pattern_id: 1, prompt: 'Test prompt', correct_answer: '答え' };
      mockQuery.mockResolvedValue({ rows: [mockExercise] });

      const response = await request(app)
        .get('/exercises/1')
        .set('x-password', 'test-password')
        .expect(200);

      expect(response.body).toEqual({ exercise: mockExercise });
    });

    it('should return 404 when exercise not found', async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      const response = await request(app)
        .get('/exercises/999')
        .set('x-password', 'test-password')
        .expect(404);

      expect(response.body).toEqual({ error: 'Exercise not found' });
    });

    it('should return 401 when unauthorized', async () => {
      const response = await request(app)
        .get('/exercises/1')
        .expect(401);

      expect(response.body).toEqual({ error: 'Unauthorized' });
    });

    it('should handle database errors gracefully', async () => {
      mockQuery.mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .get('/exercises/1')
        .set('x-password', 'test-password')
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to fetch exercise' });
    });
  });

  describe('GET /patterns/:id/discrimination', () => {
    it('should return discrimination exercise when authorized', async () => {
      const mockPattern = { id: 1, pattern: '〜てもいい', category: 'Permission', related_patterns: [2] };
      const mockRelated = { id: 2, pattern: '〜てはいけません', category: 'Prohibition' };
      const mockExercise = { id: 1, pattern_id: 1, prompt: 'Choose the correct pattern', correct_answer: '〜てもいい' };

      mockQuery
        .mockResolvedValueOnce({ rows: [mockPattern] })
        .mockResolvedValueOnce({ rows: [mockRelated] })
        .mockResolvedValueOnce({ rows: [] }) // additional distractors
        .mockResolvedValueOnce({ rows: [mockExercise] });

      const response = await request(app)
        .get('/patterns/1/discrimination')
        .set('x-password', 'test-password')
        .expect(200);

      expect(response.body.exercise).toBeDefined();
      expect(response.body.exercise.type).toBe('discrimination');
      expect(response.body.exercise.options).toBeDefined();
      expect(response.body.exercise.options.length).toBe(2);
    });

    it('should find patterns in same category when no related patterns', async () => {
      const mockPattern = { id: 1, pattern: '〜てもいい', category: 'Permission', related_patterns: [] };
      const mockSameCategory = { id: 3, pattern: '〜なければなりません', category: 'Obligation' };
      const mockExercise = { id: 1, pattern_id: 1, prompt: 'Test', correct_answer: '〜てもいい' };

      mockQuery
        .mockResolvedValueOnce({ rows: [mockPattern] })
        .mockResolvedValueOnce({ rows: [{ id: 3 }] }) // category patterns
        .mockResolvedValueOnce({ rows: [mockSameCategory] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [mockExercise] });

      const response = await request(app)
        .get('/patterns/1/discrimination')
        .set('x-password', 'test-password')
        .expect(200);

      expect(response.body.exercise.options.length).toBeGreaterThanOrEqual(1);
    });

    it('should return 404 when pattern not found', async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      const response = await request(app)
        .get('/patterns/999/discrimination')
        .set('x-password', 'test-password')
        .expect(404);

      expect(response.body).toEqual({ error: 'Pattern not found' });
    });

    it('should return 401 when unauthorized', async () => {
      const response = await request(app)
        .get('/patterns/1/discrimination')
        .expect(401);

      expect(response.body).toEqual({ error: 'Unauthorized' });
    });

    it('should handle database errors gracefully', async () => {
      mockQuery.mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .get('/patterns/1/discrimination')
        .set('x-password', 'test-password')
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to fetch discrimination exercise' });
    });
  });

  describe('POST /progress', () => {
    it('should record attempt and update progress when authorized', async () => {
      // Setup transaction client - 5 queries: BEGIN, SELECT, INSERT, UPDATE, COMMIT
      const mockClient = {
        query: vi.fn(),
        release: vi.fn(),
      };
      mockClient.query
        .mockResolvedValueOnce({}) // BEGIN
        .mockResolvedValueOnce({ rows: [] }) // No existing progress
        .mockResolvedValueOnce({ rows: [{ pattern_id: 1, ease_factor: 2.5, interval_days: 1, streak: 0, correct_attempts: 0, total_attempts: 0 }] }) // INSERT new progress
        .mockResolvedValueOnce({ rows: [{ pattern_id: 1, ease_factor: 2.6, interval_days: 3, streak: 1, correct_attempts: 1, total_attempts: 1 }] }) // UPDATE progress
        .mockResolvedValueOnce({}); // COMMIT
      mockConnect.mockResolvedValue(mockClient);

      // Setup pool.query for grammar_attempts INSERT
      mockQuery.mockResolvedValue({ rows: [{ id: 1 }] });

      const response = await request(app)
        .post('/progress')
        .set('x-password', 'test-password')
        .send({
          patternId: 1,
          result: 'correct',
          exerciseId: 1,
          userSentence: 'Test sentence',
        })
        .expect(200);

      expect(response.body).toEqual({ success: true, progress: expect.any(Object) });
    });

    it('should log confusion when confusedWithPatternId provided and wrong', async () => {
      const mockClient = {
        query: vi.fn(),
        release: vi.fn(),
      };

      mockClient.query
        .mockResolvedValueOnce({}) // BEGIN
        .mockResolvedValueOnce({ rows: [{ pattern_id: 1, ease_factor: 2.5, interval_days: 1, streak: 0, correct_attempts: 0 }] })
        .mockResolvedValueOnce({ rows: [{ pattern_id: 1, ease_factor: 2.6, interval_days: 3, streak: 1, correct_attempts: 1 }] })
        .mockResolvedValueOnce({}); // COMMIT

      mockConnect.mockResolvedValue(mockClient);
      mockQuery.mockResolvedValue({}); // grammar_attempts and confusion INSERTs

      const response = await request(app)
        .post('/progress')
        .set('x-password', 'test-password')
        .send({
          patternId: 1,
          result: 'wrong',
          confusedWithPatternId: 2,
          userSentence: 'Wrong sentence',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should return 401 when unauthorized', async () => {
      const response = await request(app)
        .post('/progress')
        .send({ patternId: 1, result: 'correct' })
        .expect(401);

      expect(response.body).toEqual({ error: 'Unauthorized' });
    });

    it('should handle database errors gracefully', async () => {
      mockQuery.mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .post('/progress')
        .set('x-password', 'test-password')
        .send({ patternId: 1, result: 'correct' })
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to update progress' });
    });
  });

  describe('GET /stats', () => {
    it('should return user stats when authorized', async () => {
      const mockStats = {
        total_patterns: '10',
        total_attempts: '100',
        correct_attempts: '80',
        accuracy: '0.8',
        due_for_review: '5',
      };
      const mockCategories = [
        { category: 'Permission', pattern_count: '3', avg_accuracy: '0.85' },
      ];

      mockQuery
        .mockResolvedValueOnce({ rows: [mockStats] })
        .mockResolvedValueOnce({ rows: mockCategories });

      const response = await request(app)
        .get('/stats')
        .set('x-password', 'test-password')
        .expect(200);

      expect(response.body).toEqual({
        overall: mockStats,
        byCategory: mockCategories,
      });
    });

    it('should return 401 when unauthorized', async () => {
      const response = await request(app)
        .get('/stats')
        .expect(401);

      expect(response.body).toEqual({ error: 'Unauthorized' });
    });

    it('should handle database errors gracefully', async () => {
      mockQuery.mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .get('/stats')
        .set('x-password', 'test-password')
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to fetch stats' });
    });
  });

  describe('GET /patterns/:id/related', () => {
    it('should return related patterns when authorized', async () => {
      const mockPattern = { related_patterns: [2, 3] };
      const mockRelated = [
        { id: 2, pattern: '〜てはいけません', category: 'Prohibition' },
        { id: 3, pattern: '〜なければなりません', category: 'Obligation' },
      ];

      mockQuery
        .mockResolvedValueOnce({ rows: [mockPattern] })
        .mockResolvedValueOnce({ rows: mockRelated });

      const response = await request(app)
        .get('/patterns/1/related')
        .set('x-password', 'test-password')
        .expect(200);

      expect(response.body).toEqual({ patterns: mockRelated });
    });

    it('should return empty array when no related patterns', async () => {
      const mockPattern = { related_patterns: [] };

      mockQuery.mockResolvedValueOnce({ rows: [mockPattern] });

      const response = await request(app)
        .get('/patterns/1/related')
        .set('x-password', 'test-password')
        .expect(200);

      expect(response.body).toEqual({ patterns: [] });
    });

    it('should return 404 when pattern not found', async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      const response = await request(app)
        .get('/patterns/999/related')
        .set('x-password', 'test-password')
        .expect(404);

      expect(response.body).toEqual({ error: 'Pattern not found' });
    });

    it('should return 401 when unauthorized', async () => {
      const response = await request(app)
        .get('/patterns/1/related')
        .expect(401);

      expect(response.body).toEqual({ error: 'Unauthorized' });
    });

    it('should handle database errors gracefully', async () => {
      mockQuery.mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .get('/patterns/1/related')
        .set('x-password', 'test-password')
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to fetch related patterns' });
    });
  });

  describe('POST /confusion', () => {
    it('should log confusion event when authorized', async () => {
      const mockEvent = { id: 1, pattern_id: 1, confused_with_pattern_id: 2, user_sentence: 'Test' };
      mockQuery
        .mockResolvedValueOnce({ rows: [mockEvent] })
        .mockResolvedValueOnce({});

      const response = await request(app)
        .post('/confusion')
        .set('x-password', 'test-password')
        .send({
          patternId: 1,
          confusedWithPatternId: 2,
          userSentence: 'Test',
        })
        .expect(200);

      expect(response.body).toEqual({ success: true, event: mockEvent });
    });

    it('should return 400 when patternId missing', async () => {
      const response = await request(app)
        .post('/confusion')
        .set('x-password', 'test-password')
        .send({ confusedWithPatternId: 2 })
        .expect(400);

      expect(response.body).toEqual({ error: 'patternId and confusedWithPatternId are required' });
    });

    it('should return 400 when confusedWithPatternId missing', async () => {
      const response = await request(app)
        .post('/confusion')
        .set('x-password', 'test-password')
        .send({ patternId: 1 })
        .expect(400);

      expect(response.body).toEqual({ error: 'patternId and confusedWithPatternId are required' });
    });

    it('should return 401 when unauthorized', async () => {
      const response = await request(app)
        .post('/confusion')
        .send({ patternId: 1, confusedWithPatternId: 2 })
        .expect(401);

      expect(response.body).toEqual({ error: 'Unauthorized' });
    });

    it('should handle database errors gracefully', async () => {
      mockQuery.mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .post('/confusion')
        .set('x-password', 'test-password')
        .send({ patternId: 1, confusedWithPatternId: 2 })
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to log confusion event' });
    });
  });

  describe('GET /confusion-stats', () => {
    it('should return confusion stats when authorized', async () => {
      const mockEvents = [
        { id: 1, pattern_id: 1, confused_with_pattern_id: 2, pattern_name: '〜てもいい', confused_with_pattern_name: '〜てはいけません' },
      ];
      const mockPairs = [
        { pattern_name: '〜てもいい', confused_with_pattern_name: '〜てはいけません', count: '5' },
      ];

      mockQuery
        .mockResolvedValueOnce({ rows: mockEvents })
        .mockResolvedValueOnce({ rows: mockPairs });

      const response = await request(app)
        .get('/confusion-stats')
        .set('x-password', 'test-password')
        .expect(200);

      expect(response.body).toEqual({
        recentEvents: mockEvents,
        topConfusions: mockPairs,
      });
    });

    it('should return 401 when unauthorized', async () => {
      const response = await request(app)
        .get('/confusion-stats')
        .expect(401);

      expect(response.body).toEqual({ error: 'Unauthorized' });
    });

    it('should handle database errors gracefully', async () => {
      mockQuery.mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .get('/confusion-stats')
        .set('x-password', 'test-password')
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to fetch confusion stats' });
    });
  });

  describe('POST /check-confusion', () => {
    it('should detect confusion when pattern markers found', async () => {
      const mockPattern = { related_patterns: [2] };
      const mockRelated = [{ id: 2, pattern: '〜てはいけません', category: 'Prohibition' }];

      mockQuery
        .mockResolvedValueOnce({ rows: [mockPattern] })
        .mockResolvedValueOnce({ rows: mockRelated });

      const response = await request(app)
        .post('/check-confusion')
        .set('x-password', 'test-password')
        .send({
          patternId: 1,
          userSentence: '食べてはいけません',
        })
        .expect(200);

      expect(response.body.confusedWith).toBeDefined();
    });

    it('should return null when no confusion detected', async () => {
      const mockPattern = { related_patterns: [2] };
      const mockRelated = [{ id: 2, pattern: '〜てはいけません', category: 'Prohibition' }];

      mockQuery
        .mockResolvedValueOnce({ rows: [mockPattern] })
        .mockResolvedValueOnce({ rows: mockRelated });

      const response = await request(app)
        .post('/check-confusion')
        .set('x-password', 'test-password')
        .send({
          patternId: 1,
          userSentence: 'Some unrelated text',
        })
        .expect(200);

      expect(response.body.confusedWith).toBeNull();
    });

    it('should return 400 when patternId missing', async () => {
      const response = await request(app)
        .post('/check-confusion')
        .set('x-password', 'test-password')
        .send({ userSentence: 'Test' })
        .expect(400);

      expect(response.body).toEqual({ error: 'patternId and userSentence are required' });
    });

    it('should return 400 when userSentence missing', async () => {
      const response = await request(app)
        .post('/check-confusion')
        .set('x-password', 'test-password')
        .send({ patternId: 1 })
        .expect(400);

      expect(response.body).toEqual({ error: 'patternId and userSentence are required' });
    });

    it('should return 404 when pattern not found', async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      const response = await request(app)
        .post('/check-confusion')
        .set('x-password', 'test-password')
        .send({ patternId: 999, userSentence: 'Test' })
        .expect(404);

      expect(response.body).toEqual({ error: 'Pattern not found' });
    });

    it('should return 401 when unauthorized', async () => {
      const response = await request(app)
        .post('/check-confusion')
        .send({ patternId: 1, userSentence: 'Test' })
        .expect(401);

      expect(response.body).toEqual({ error: 'Unauthorized' });
    });

    it('should handle database errors gracefully', async () => {
      mockQuery.mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .post('/check-confusion')
        .set('x-password', 'test-password')
        .send({ patternId: 1, userSentence: 'Test' })
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to check confusion' });
    });
  });

  describe('GET /mixed-review', () => {
    it('should return mixed review patterns when authorized', async () => {
      const mockRows = [
        { id: 1, pattern: '〜てもいい', category: 'Permission', ease_factor: 2.5 },
      ];
      mockQuery.mockResolvedValue({ rows: mockRows });

      const response = await request(app)
        .get('/mixed-review')
        .set('x-password', 'test-password')
        .expect(200);

      expect(response.body).toEqual({
        count: 1,
        patterns: mockRows,
      });
    });

    it('should filter by categories when provided', async () => {
      const mockRows = [
        { id: 1, pattern: '〜てもいい', category: 'Permission' },
      ];
      mockQuery.mockResolvedValue({ rows: mockRows });

      const response = await request(app)
        .get('/mixed-review?categories=Permission,Prohibition')
        .set('x-password', 'test-password')
        .expect(200);

      expect(response.body.count).toBe(1);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('gp.category = ANY($1)'),
        expect.any(Array)
      );
    });

    it('should use default limit of 10', async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      await request(app)
        .get('/mixed-review')
        .set('x-password', 'test-password')
        .expect(200);

      const callArgs = mockQuery.mock.calls[0][1] as number[];
      expect(callArgs[callArgs.length - 1]).toBe(10);
    });

    it('should use custom limit when provided', async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      await request(app)
        .get('/mixed-review?limit=5')
        .set('x-password', 'test-password')
        .expect(200);

      const callArgs = mockQuery.mock.calls[0][1] as number[];
      expect(callArgs[callArgs.length - 1]).toBe(5);
    });

    it('should return 401 when unauthorized', async () => {
      const response = await request(app)
        .get('/mixed-review')
        .expect(401);

      expect(response.body).toEqual({ error: 'Unauthorized' });
    });

    it('should handle database errors gracefully', async () => {
      mockQuery.mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .get('/mixed-review')
        .set('x-password', 'test-password')
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to fetch mixed review patterns' });
    });
  });

  describe('GET /relationships', () => {
    it('should return all relationships when authorized', async () => {
      const mockRows = [
        {
          id: 1,
          from_pattern_id: 1,
          to_pattern_id: 2,
          relationship_type: 'similar',
          strength: 0.8,
          description: 'Similar patterns',
          from_pattern: '〜てもいい',
          from_category: 'Permission',
          from_jlpt: 'N5',
          to_pattern: '〜てはいけません',
          to_category: 'Prohibition',
          to_jlpt: 'N5',
        },
      ];
      mockQuery.mockResolvedValue({ rows: mockRows });

      const response = await request(app)
        .get('/relationships')
        .set('x-password', 'test-password')
        .expect(200);

      expect(response.body).toEqual({
        count: 1,
        relationships: mockRows,
      });
    });

    it('should filter by category when provided', async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      await request(app)
        .get('/relationships?category=Permission')
        .set('x-password', 'test-password')
        .expect(200);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('fp.category = $1 OR tp.category = $1'),
        ['Permission']
      );
    });

    it('should filter by patternId when provided', async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      await request(app)
        .get('/relationships?patternId=1')
        .set('x-password', 'test-password')
        .expect(200);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('pr.from_pattern_id = $1 OR pr.to_pattern_id = $1'),
        ['1']
      );
    });

    it('should return 401 when unauthorized', async () => {
      const response = await request(app)
        .get('/relationships')
        .expect(401);

      expect(response.body).toEqual({ error: 'Unauthorized' });
    });

    it('should handle database errors gracefully', async () => {
      mockQuery.mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .get('/relationships')
        .set('x-password', 'test-password')
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to fetch pattern relationships' });
    });
  });

  describe('GET /patterns/:id/relationships', () => {
    it('should return relationships for a pattern when authorized', async () => {
      const mockRows = [
        {
          id: 1,
          from_pattern_id: 1,
          to_pattern_id: 2,
          relationship_type: 'similar',
          strength: 0.8,
          from_pattern: '〜てもいい',
          from_category: 'Permission',
          to_pattern: '〜てはいけません',
          to_category: 'Prohibition',
        },
      ];
      mockQuery.mockResolvedValue({ rows: mockRows });

      const response = await request(app)
        .get('/patterns/1/relationships')
        .set('x-password', 'test-password')
        .expect(200);

      expect(response.body).toEqual({
        count: 1,
        relationships: mockRows,
      });
    });

    it('should filter by type when provided', async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      await request(app)
        .get('/patterns/1/relationships?type=similar')
        .set('x-password', 'test-password')
        .expect(200);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('pr.relationship_type = $2'),
        ['1', 'similar']
      );
    });

    it('should normalize direction so requested pattern is always "from"', async () => {
      const mockRows = [
        {
          from_pattern_id: 2,
          to_pattern_id: 1,
          from_pattern: '〜てはいけません',
          from_category: 'Prohibition',
          to_pattern: '〜てもいい',
          to_category: 'Permission',
        },
      ];
      mockQuery.mockResolvedValue({ rows: mockRows });

      const response = await request(app)
        .get('/patterns/1/relationships')
        .set('x-password', 'test-password')
        .expect(200);

      expect(response.body.relationships[0].from_pattern_id).toBe(1);
      expect(response.body.relationships[0].to_pattern_id).toBe(2);
    });

    it('should return 401 when unauthorized', async () => {
      const response = await request(app)
        .get('/patterns/1/relationships')
        .expect(401);

      expect(response.body).toEqual({ error: 'Unauthorized' });
    });

    it('should handle database errors gracefully', async () => {
      mockQuery.mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .get('/patterns/1/relationships')
        .set('x-password', 'test-password')
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to fetch pattern relationships' });
    });
  });
});
