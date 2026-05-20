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
import readingRoutes from '../../routes/reading.js';
import { pool } from '../../db/pool.js';

const mockQuery = pool.query as ReturnType<typeof vi.fn>;

describe('Reading Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/', readingRoutes);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /passages', () => {
    it('should return all passages when authorized', async () => {
      const mockRows = [
        {
          id: 1,
          title: 'Daily Conversation',
          level: 'N5',
          topic: 'greetings',
          character_count: 150,
          created_at: '2026-03-01T00:00:00.000Z',
        },
        {
          id: 2,
          title: 'Shopping Trip',
          level: 'N4',
          topic: 'shopping',
          character_count: 300,
          created_at: '2026-03-02T00:00:00.000Z',
        },
      ];
      mockQuery.mockResolvedValue({ rows: mockRows });

      const response = await request(app)
        .get('/passages')
        .set('x-password', 'test-password')
        .expect(200);

      expect(response.body).toEqual({
        count: 2,
        passages: mockRows,
      });
      expect(mockQuery).toHaveBeenCalledTimes(1);
    });

    it('should filter passages by level when query param provided', async () => {
      const mockRows = [
        {
          id: 1,
          title: 'Daily Conversation',
          level: 'N5',
          topic: 'greetings',
          character_count: 150,
          created_at: '2026-03-01T00:00:00.000Z',
        },
      ];
      mockQuery.mockResolvedValue({ rows: mockRows });

      const response = await request(app)
        .get('/passages?level=N5')
        .set('x-password', 'test-password')
        .expect(200);

      expect(response.body).toEqual({
        count: 1,
        passages: mockRows,
      });
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('WHERE level = $1'),
        ['N5']
      );
    });

    it('should return 401 when unauthorized', async () => {
      const response = await request(app)
        .get('/passages')
        .expect(401);

      expect(response.body).toEqual({ error: 'Unauthorized' });
      expect(mockQuery).not.toHaveBeenCalled();
    });

    it('should handle database errors gracefully', async () => {
      mockQuery.mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .get('/passages')
        .set('x-password', 'test-password')
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to fetch reading passages' });
    });

    it('should return empty array when no passages exist', async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      const response = await request(app)
        .get('/passages')
        .set('x-password', 'test-password')
        .expect(200);

      expect(response.body).toEqual({
        count: 0,
        passages: [],
      });
    });
  });

  describe('GET /passages/:id', () => {
    it('should return passage with questions when authorized', async () => {
      const mockPassage = {
        id: 1,
        title: 'Daily Conversation',
        content: '<ruby>今日<rt>きょう</rt></ruby>はいい天気ですね。',
        level: 'N5',
        topic: 'greetings',
        character_count: 150,
        created_at: '2026-03-01T00:00:00.000Z',
      };
      const mockQuestions = [
        {
          id: 1,
          question: 'What is the weather like today?',
          options: ['Sunny', 'Rainy', 'Cloudy', 'Snowy'],
          correct_answer: 0,
          explanation: 'The passage mentions good weather.',
          question_type: 'comprehension',
        },
        {
          id: 2,
          question: 'What does 今日 mean?',
          options: ['Yesterday', 'Today', 'Tomorrow', 'Now'],
          correct_answer: 1,
          explanation: '今日 (きょう) means today.',
          question_type: 'vocabulary',
        },
      ];

      mockQuery
        .mockResolvedValueOnce({ rows: [mockPassage] })
        .mockResolvedValueOnce({ rows: mockQuestions });

      const response = await request(app)
        .get('/passages/1')
        .set('x-password', 'test-password')
        .expect(200);

      expect(response.body).toEqual({
        passage: mockPassage,
        questions: mockQuestions,
      });
      expect(mockQuery).toHaveBeenCalledTimes(2);
    });

    it('should return 404 when passage not found', async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      const response = await request(app)
        .get('/passages/999')
        .set('x-password', 'test-password')
        .expect(404);

      expect(response.body).toEqual({ error: 'Passage not found' });
    });

    it('should return 401 when unauthorized', async () => {
      const response = await request(app)
        .get('/passages/1')
        .expect(401);

      expect(response.body).toEqual({ error: 'Unauthorized' });
    });

    it('should handle database errors gracefully', async () => {
      mockQuery.mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .get('/passages/1')
        .set('x-password', 'test-password')
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to fetch reading passage' });
    });
  });

  describe('POST /submit', () => {
    it('should calculate score and return results when authorized', async () => {
      const mockQuestions = [
        { id: 1, correct_answer: 0, explanation: 'Good weather.', question_type: 'comprehension' },
        { id: 2, correct_answer: 1, explanation: 'Today.', question_type: 'vocabulary' },
        { id: 3, correct_answer: 2, explanation: 'Correct answer is 2.', question_type: 'grammar' },
      ];
      const mockPassage = { character_count: 200 };

      mockQuery
        .mockResolvedValueOnce({ rows: mockQuestions })
        .mockResolvedValueOnce({ rows: [mockPassage] });

      const answers = [
        { questionId: 1, selectedOption: 0 },
        { questionId: 2, selectedOption: 1 },
        { questionId: 3, selectedOption: 1 }, // Wrong
      ];

      const response = await request(app)
        .post('/submit')
        .set('x-password', 'test-password')
        .send({
          passageId: 1,
          answers,
          startTime: '2026-03-20T10:00:00.000Z',
          endTime: '2026-03-20T10:02:30.000Z',
        })
        .expect(200);

      expect(response.body.score).toBe(67); // 2/3 = 66.67 -> 67
      expect(response.body.correctCount).toBe(2);
      expect(response.body.totalQuestions).toBe(3);
      expect(response.body.results).toHaveLength(3);
      expect(response.body.results[0].isCorrect).toBe(true);
      expect(response.body.results[1].isCorrect).toBe(true);
      expect(response.body.results[2].isCorrect).toBe(false);
      expect(response.body.readingTimeSeconds).toBe(150);
      expect(response.body.charsPerMinute).toBe(80); // (200/150)*60 = 80
    });

    it('should handle all correct answers', async () => {
      const mockQuestions = [
        { id: 1, correct_answer: 0, explanation: 'Ex1', question_type: 'comprehension' },
      ];
      const mockPassage = { character_count: 100 };

      mockQuery
        .mockResolvedValueOnce({ rows: mockQuestions })
        .mockResolvedValueOnce({ rows: [mockPassage] });

      const response = await request(app)
        .post('/submit')
        .set('x-password', 'test-password')
        .send({
          passageId: 1,
          answers: [{ questionId: 1, selectedOption: 0 }],
        })
        .expect(200);

      expect(response.body.score).toBe(100);
      expect(response.body.correctCount).toBe(1);
    });

    it('should handle all incorrect answers', async () => {
      const mockQuestions = [
        { id: 1, correct_answer: 0, explanation: 'Ex1', question_type: 'comprehension' },
      ];
      const mockPassage = { character_count: 100 };

      mockQuery
        .mockResolvedValueOnce({ rows: mockQuestions })
        .mockResolvedValueOnce({ rows: [mockPassage] });

      const response = await request(app)
        .post('/submit')
        .set('x-password', 'test-password')
        .send({
          passageId: 1,
          answers: [{ questionId: 1, selectedOption: 2 }],
        })
        .expect(200);

      expect(response.body.score).toBe(0);
      expect(response.body.correctCount).toBe(0);
    });

    it('should return 400 when passageId is missing', async () => {
      const response = await request(app)
        .post('/submit')
        .set('x-password', 'test-password')
        .send({
          answers: [{ questionId: 1, selectedOption: 0 }],
        })
        .expect(400);

      expect(response.body).toEqual({ error: 'passageId and answers array are required' });
    });

    it('should return 400 when answers is not an array', async () => {
      const response = await request(app)
        .post('/submit')
        .set('x-password', 'test-password')
        .send({
          passageId: 1,
          answers: 'not-an-array',
        })
        .expect(400);

      expect(response.body).toEqual({ error: 'passageId and answers array are required' });
    });

    it('should handle missing question in answer array gracefully', async () => {
      const mockQuestions = [
        { id: 1, correct_answer: 0, explanation: 'Ex1', question_type: 'comprehension' },
      ];
      const mockPassage = { character_count: 100 };

      mockQuery
        .mockResolvedValueOnce({ rows: mockQuestions })
        .mockResolvedValueOnce({ rows: [mockPassage] });

      const response = await request(app)
        .post('/submit')
        .set('x-password', 'test-password')
        .send({
          passageId: 1,
          answers: [{ questionId: 999, selectedOption: 0 }], // Non-existent question
        })
        .expect(200);

      expect(response.body.results[0].isCorrect).toBe(false);
      expect(response.body.results[0].correctAnswer).toBeUndefined();
      expect(response.body.results[0].explanation).toBeUndefined();
    });

    it('should calculate reading time and chars per minute correctly', async () => {
      const mockQuestions = [
        { id: 1, correct_answer: 0, explanation: 'Ex1', question_type: 'comprehension' },
      ];
      const mockPassage = { character_count: 300 };

      mockQuery
        .mockResolvedValueOnce({ rows: mockQuestions })
        .mockResolvedValueOnce({ rows: [mockPassage] });

      const startTime = '2026-03-20T10:00:00.000Z';
      const endTime = '2026-03-20T10:01:00.000Z'; // 60 seconds

      const response = await request(app)
        .post('/submit')
        .set('x-password', 'test-password')
        .send({
          passageId: 1,
          answers: [{ questionId: 1, selectedOption: 0 }],
          startTime,
          endTime,
        })
        .expect(200);

      expect(response.body.readingTimeSeconds).toBe(60);
      expect(response.body.charsPerMinute).toBe(300); // (300/60)*60 = 300
    });

    it('should handle zero reading time gracefully', async () => {
      const mockQuestions = [
        { id: 1, correct_answer: 0, explanation: 'Ex1', question_type: 'comprehension' },
      ];
      const mockPassage = { character_count: 100 };

      mockQuery
        .mockResolvedValueOnce({ rows: mockQuestions })
        .mockResolvedValueOnce({ rows: [mockPassage] });

      const startTime = '2026-03-20T10:00:00.000Z';
      const endTime = '2026-03-20T10:00:00.000Z'; // Same time = 0 seconds

      const response = await request(app)
        .post('/submit')
        .set('x-password', 'test-password')
        .send({
          passageId: 1,
          answers: [{ questionId: 1, selectedOption: 0 }],
          startTime,
          endTime,
        })
        .expect(200);

      expect(response.body.readingTimeSeconds).toBe(0);
      expect(response.body.charsPerMinute).toBeNull(); // Division by zero protection
    });

    it('should handle missing startTime and endTime', async () => {
      const mockQuestions = [
        { id: 1, correct_answer: 0, explanation: 'Ex1', question_type: 'comprehension' },
      ];
      const mockPassage = { character_count: 100 };

      mockQuery
        .mockResolvedValueOnce({ rows: mockQuestions })
        .mockResolvedValueOnce({ rows: [mockPassage] });

      const response = await request(app)
        .post('/submit')
        .set('x-password', 'test-password')
        .send({
          passageId: 1,
          answers: [{ questionId: 1, selectedOption: 0 }],
        })
        .expect(200);

      expect(response.body.readingTimeSeconds).toBeNull();
      expect(response.body.charsPerMinute).toBeNull();
    });

    it('should return 401 when unauthorized', async () => {
      const response = await request(app)
        .post('/submit')
        .send({
          passageId: 1,
          answers: [{ questionId: 1, selectedOption: 0 }],
        })
        .expect(401);

      expect(response.body).toEqual({ error: 'Unauthorized' });
    });

    it('should handle database errors gracefully', async () => {
      mockQuery.mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .post('/submit')
        .set('x-password', 'test-password')
        .send({
          passageId: 1,
          answers: [{ questionId: 1, selectedOption: 0 }],
        })
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to submit answers' });
    });

    it('should handle passage with zero questions', async () => {
      const mockPassage = { character_count: 150 };

      mockQuery
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [mockPassage] });

      const response = await request(app)
        .post('/submit')
        .set('x-password', 'test-password')
        .send({
          passageId: 1,
          answers: [],
        })
        .expect(200);

      expect(response.body.score).toBe(0);
      expect(response.body.correctCount).toBe(0);
      expect(response.body.totalQuestions).toBe(0);
    });

    it('should handle passage with null character_count', async () => {
      const mockQuestions = [
        { id: 1, correct_answer: 0, explanation: 'Ex1', question_type: 'comprehension' },
      ];
      const mockPassage = { character_count: null };

      mockQuery
        .mockResolvedValueOnce({ rows: mockQuestions })
        .mockResolvedValueOnce({ rows: [mockPassage] });

      const response = await request(app)
        .post('/submit')
        .set('x-password', 'test-password')
        .send({
          passageId: 1,
          answers: [{ questionId: 1, selectedOption: 0 }],
          startTime: '2026-03-20T10:00:00.000Z',
          endTime: '2026-03-20T10:01:00.000Z',
        })
        .expect(200);

      expect(response.body.charsPerMinute).toBe(0); // null || 0 -> 0
    });
  });

  describe('GET /stats', () => {
    it('should return reading stats when authorized', async () => {
      const mockLevelStats = [
        { level: 'N5', count: '5' },
        { level: 'N4', count: '3' },
        { level: 'N3', count: '2' },
      ];
      const mockQuestionStats = [{ total_questions: '45' }];

      mockQuery
        .mockResolvedValueOnce({ rows: mockLevelStats })
        .mockResolvedValueOnce({ rows: mockQuestionStats });

      const response = await request(app)
        .get('/stats')
        .set('x-password', 'test-password')
        .expect(200);

      expect(response.body).toEqual({
        byLevel: mockLevelStats,
        totalQuestions: 45,
      });
      expect(mockQuery).toHaveBeenCalledTimes(2);
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

      expect(response.body).toEqual({ error: 'Failed to fetch reading stats' });
    });

    it('should return zero total questions when none exist', async () => {
      const mockLevelStats: Array<Record<string, unknown>> = [];
      const mockQuestionStats = [{ total_questions: null }];

      mockQuery
        .mockResolvedValueOnce({ rows: mockLevelStats })
        .mockResolvedValueOnce({ rows: mockQuestionStats });

      const response = await request(app)
        .get('/stats')
        .set('x-password', 'test-password')
        .expect(200);

      expect(response.body).toEqual({
        byLevel: [],
        totalQuestions: 0,
      });
    });
  });
});
