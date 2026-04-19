import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';

// Mock dependencies - must be before imports
vi.mock('../../db/pool.js', () => ({
  pool: {
    query: vi.fn(),
  },
}));

vi.mock('../../services/lessons.js', () => ({
  getLesson: vi.fn(),
  getLessonIndex: vi.fn(),
  getRecentLessons: vi.fn(),
  getLessonSystemPrompt: vi.fn(),
}));

vi.mock('../../config/index.js', () => ({
  appConfig: {
    password: 'test-password',
  },
}));

// Now import after mocks are set up
import lessonRoutes from '../../routes/lessons.js';
import { pool } from '../../db/pool.js';
import { getLesson, getLessonIndex, getRecentLessons, getLessonSystemPrompt } from '../../services/lessons.js';

const mockQuery = pool.query as ReturnType<typeof vi.fn>;
const mockGetLesson = getLesson as ReturnType<typeof vi.fn>;
const mockGetLessonIndex = getLessonIndex as ReturnType<typeof vi.fn>;
const mockGetRecentLessons = getRecentLessons as ReturnType<typeof vi.fn>;
const mockGetLessonSystemPrompt = getLessonSystemPrompt as ReturnType<typeof vi.fn>;

describe('Lessons Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/', lessonRoutes);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /', () => {
    it('should return lesson index when authorized', async () => {
      const mockIndex = [
        { id: '2026-03-16', title: 'Test Lesson', date: '2026-03-16' },
      ];
      mockGetLessonIndex.mockResolvedValue(mockIndex);

      const response = await request(app)
        .get('/')
        .set('x-password', 'test-password')
        .expect(200);

      expect(response.body).toEqual(mockIndex);
      expect(mockGetLessonIndex).toHaveBeenCalled();
    });

    it('should return 401 when unauthorized', async () => {
      const response = await request(app)
        .get('/')
        .expect(401);

      expect(response.body).toEqual({ error: 'Unauthorized' });
    });

    it('should handle errors gracefully', async () => {
      mockGetLessonIndex.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/')
        .set('x-password', 'test-password')
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to fetch lessons' });
    });
  });

  describe('GET /recent', () => {
    it('should return recent lessons with default count', async () => {
      const mockLessons = [
        { id: '2026-03-16', title: 'Lesson 1' },
        { id: '2026-03-15', title: 'Lesson 2' },
      ];
      mockGetRecentLessons.mockResolvedValue(mockLessons);

      const response = await request(app)
        .get('/recent')
        .set('x-password', 'test-password')
        .expect(200);

      expect(response.body).toEqual({ lessons: mockLessons });
      expect(mockGetRecentLessons).toHaveBeenCalledWith(3);
    });

    it('should accept custom count parameter', async () => {
      const mockLessons = [{ id: '2026-03-16', title: 'Lesson 1' }];
      mockGetRecentLessons.mockResolvedValue(mockLessons);

      await request(app)
        .get('/recent?count=5')
        .set('x-password', 'test-password')
        .expect(200);

      expect(mockGetRecentLessons).toHaveBeenCalledWith(5);
    });

    it('should handle string count gracefully', async () => {
      const mockLessons: Array<Record<string, unknown>> = [];
      mockGetRecentLessons.mockResolvedValue(mockLessons);

      await request(app)
        .get('/recent?count=invalid')
        .set('x-password', 'test-password')
        .expect(200);

      // NaN defaults to 3
      expect(mockGetRecentLessons).toHaveBeenCalledWith(3);
    });
  });

  describe('GET /memory', () => {
    it('should return lessons formatted for memory mode', async () => {
      const mockRows = [
        {
          id: '2026-03-16',
          date: '2026-03-16',
          title: 'Test Lesson',
          order: 1,
          topics: ['topic1'],
          vocabulary: [{ jp: 'word1' }, { jp: 'word2' }],
          grammar: [{ pattern: 'pattern1' }],
        },
      ];
      mockQuery.mockResolvedValue({ rows: mockRows });

      const response = await request(app)
        .get('/memory')
        .set('x-password', 'test-password')
        .expect(200);

      expect(response.body).toEqual({
        count: 1,
        lessons: [
          {
            id: '2026-03-16',
            date: '2026-03-16',
            title: 'Test Lesson',
            order: 1,
            topics: ['topic1'],
            vocabCount: 2,
            grammarCount: 1,
            vocabulary: [{ jp: 'word1' }, { jp: 'word2' }],
            grammar: [{ pattern: 'pattern1' }],
          },
        ],
      });
    });

    it('should handle empty results', async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      const response = await request(app)
        .get('/memory')
        .set('x-password', 'test-password')
        .expect(200);

      expect(response.body).toEqual({
        count: 0,
        lessons: [],
      });
    });

    it('should handle null vocabulary and grammar', async () => {
      const mockRows = [
        {
          id: '2026-03-16',
          date: '2026-03-16',
          title: 'Test Lesson',
          order: 1,
          topics: null,
          vocabulary: null,
          grammar: null,
        },
      ];
      mockQuery.mockResolvedValue({ rows: mockRows });

      const response = await request(app)
        .get('/memory')
        .set('x-password', 'test-password')
        .expect(200);

      expect(response.body.lessons[0].vocabCount).toBe(0);
      expect(response.body.lessons[0].grammarCount).toBe(0);
      expect(response.body.lessons[0].vocabulary).toEqual([]);
      expect(response.body.lessons[0].grammar).toEqual([]);
    });
  });

  describe('GET /:id', () => {
    it('should return specific lesson when found', async () => {
      const mockLesson = {
        id: '2026-03-16',
        title: 'Test Lesson',
        vocabulary: [],
        grammar: [],
      };
      mockGetLesson.mockResolvedValue(mockLesson);

      const response = await request(app)
        .get('/2026-03-16')
        .set('x-password', 'test-password')
        .expect(200);

      expect(response.body).toEqual(mockLesson);
      expect(mockGetLesson).toHaveBeenCalledWith('2026-03-16', false);
    });

    it('should pass furigana query parameter', async () => {
      const mockLesson = { id: '2026-03-16', title: 'Test' };
      mockGetLesson.mockResolvedValue(mockLesson);

      await request(app)
        .get('/2026-03-16?furigana=true')
        .set('x-password', 'test-password')
        .expect(200);

      expect(mockGetLesson).toHaveBeenCalledWith('2026-03-16', true);
    });

    it('should return 404 when lesson not found', async () => {
      mockGetLesson.mockResolvedValue(null);

      const response = await request(app)
        .get('/2026-03-99')
        .set('x-password', 'test-password')
        .expect(404);

      expect(response.body).toEqual({ error: 'Lesson not found' });
    });
  });

  describe('POST /:id/start', () => {
    it('should start lesson conversation', async () => {
      const mockLesson = {
        id: '2026-03-16',
        title: 'Test Lesson',
        topics: ['topic1'],
        vocabulary: [{ jp: 'word' }],
        grammar: [{ pattern: 'grammar' }],
      };
      mockGetLesson.mockResolvedValue(mockLesson);
      mockGetLessonSystemPrompt.mockReturnValue('System prompt content');
      mockQuery.mockResolvedValue({ rowCount: 1 });

      const response = await request(app)
        .post('/2026-03-16/start')
        .set('x-password', 'test-password')
        .send({ relaxed: true, session_id: 'test-session' })
        .expect(200);

      expect(response.body).toHaveProperty('lesson');
      expect(response.body).toHaveProperty('system_prompt', 'System prompt content');
      expect(response.body).toHaveProperty('vocabulary_count', 1);
      expect(response.body).toHaveProperty('grammar_count', 1);
    });

    it('should return 404 when lesson not found', async () => {
      mockGetLesson.mockResolvedValue(null);

      const response = await request(app)
        .post('/2026-03-99/start')
        .set('x-password', 'test-password')
        .send({})
        .expect(404);

      expect(response.body).toEqual({ error: 'Lesson not found' });
    });

    it('should use default values for optional parameters', async () => {
      const mockLesson = {
        id: '2026-03-16',
        title: 'Test Lesson',
        topics: [],
        vocabulary: [],
        grammar: [],
      };
      mockGetLesson.mockResolvedValue(mockLesson);
      mockGetLessonSystemPrompt.mockReturnValue('prompt');

      await request(app)
        .post('/2026-03-16/start')
        .set('x-password', 'test-password')
        .send({})
        .expect(200);

      // Should be called with defaults: relaxed=true, simpleMode=false
      expect(mockGetLessonSystemPrompt).toHaveBeenCalledWith(mockLesson, true, false);
    });
  });
});
