import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';

// Mock dependencies - must be before imports
vi.mock('../../db/pool.js', () => ({
  pool: {
    query: vi.fn(),
  },
}));

// Now import after mocks are set up
import speakingRoutes from '../../routes/speaking.js';
import { pool } from '../../db/pool.js';

const mockQuery = pool.query as ReturnType<typeof vi.fn>;

describe('Speaking Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/', speakingRoutes);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /templates', () => {
    it('should return all conversation templates', async () => {
      const templates = [
        { id: 1, title: 'Greeting', scenario: 'Meeting someone new', difficulty: 'easy', created_at: '2026-01-01' },
        { id: 2, title: 'Ordering Food', scenario: 'At a restaurant', difficulty: 'medium', created_at: '2026-01-02' },
      ];

      mockQuery.mockResolvedValueOnce({ rows: templates });

      const response = await request(app)
        .get('/templates')
        .expect(200);

      expect(response.body).toEqual(templates);
      expect(mockQuery).toHaveBeenCalledTimes(1);
      expect(mockQuery).toHaveBeenCalledWith(
        'SELECT id, title, scenario, difficulty, created_at FROM conversation_templates ORDER BY id'
      );
    });

    it('should return empty array when no templates exist', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .get('/templates')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should handle database errors gracefully', async () => {
      mockQuery.mockRejectedValueOnce(new Error('Database connection failed'));

      const response = await request(app)
        .get('/templates')
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to fetch templates' });
    });
  });

  describe('GET /templates/:id', () => {
    it('should return a specific template by id', async () => {
      const template = {
        id: 1,
        title: 'Greeting',
        scenario: 'Meeting someone new',
        difficulty: 'easy',
        content: 'Hello! Nice to meet you.',
        created_at: '2026-01-01',
      };

      mockQuery.mockResolvedValueOnce({ rows: [template] });

      const response = await request(app)
        .get('/templates/1')
        .expect(200);

      expect(response.body).toEqual(template);
      expect(mockQuery).toHaveBeenCalledTimes(1);
      expect(mockQuery).toHaveBeenCalledWith(
        'SELECT * FROM conversation_templates WHERE id = $1',
        ['1']
      );
    });

    it('should return 404 when template not found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .get('/templates/999')
        .expect(404);

      expect(response.body).toEqual({ error: 'Template not found' });
    });

    it('should handle database errors gracefully', async () => {
      mockQuery.mockRejectedValueOnce(new Error('Database connection failed'));

      const response = await request(app)
        .get('/templates/1')
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to fetch template' });
    });
  });

  describe('GET /shadowing', () => {
    it('should return all shadowing exercises', async () => {
      const exercises = [
        { id: 1, title: 'Basic Greeting', audio_url: '/audio/greeting.mp3', level: 'beginner', duration_seconds: 30 },
        { id: 2, title: 'Self Introduction', audio_url: '/audio/intro.mp3', level: 'intermediate', duration_seconds: 60 },
      ];

      mockQuery.mockResolvedValueOnce({ rows: exercises });

      const response = await request(app)
        .get('/shadowing')
        .expect(200);

      expect(response.body).toEqual(exercises);
      expect(mockQuery).toHaveBeenCalledTimes(1);
      expect(mockQuery).toHaveBeenCalledWith(
        'SELECT id, title, audio_url, level, duration_seconds FROM shadowing_exercises ORDER BY id'
      );
    });

    it('should return empty array when no shadowing exercises exist', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .get('/shadowing')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should handle database errors gracefully', async () => {
      mockQuery.mockRejectedValueOnce(new Error('Database connection failed'));

      const response = await request(app)
        .get('/shadowing')
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to fetch shadowing exercises' });
    });
  });

  describe('GET /shadowing/:id', () => {
    it('should return a specific shadowing exercise by id', async () => {
      const exercise = {
        id: 1,
        title: 'Basic Greeting',
        audio_url: '/audio/greeting.mp3',
        transcript: 'Hello, nice to meet you.',
        level: 'beginner',
        duration_seconds: 30,
        created_at: '2026-01-01',
      };

      mockQuery.mockResolvedValueOnce({ rows: [exercise] });

      const response = await request(app)
        .get('/shadowing/1')
        .expect(200);

      expect(response.body).toEqual(exercise);
      expect(mockQuery).toHaveBeenCalledTimes(1);
      expect(mockQuery).toHaveBeenCalledWith(
        'SELECT * FROM shadowing_exercises WHERE id = $1',
        ['1']
      );
    });

    it('should return 404 when shadowing exercise not found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .get('/shadowing/999')
        .expect(404);

      expect(response.body).toEqual({ error: 'Shadowing exercise not found' });
    });

    it('should handle database errors gracefully', async () => {
      mockQuery.mockRejectedValueOnce(new Error('Database connection failed'));

      const response = await request(app)
        .get('/shadowing/1')
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to fetch shadowing exercise' });
    });
  });

  describe('GET /response-drills', () => {
    it('should return all response drills', async () => {
      const drills = [
        { id: 1, cue_text: 'What is your name?', time_limit_seconds: 10, difficulty: 'easy', category: 'introduction' },
        { id: 2, cue_text: 'Where are you from?', time_limit_seconds: 15, difficulty: 'medium', category: 'introduction' },
      ];

      mockQuery.mockResolvedValueOnce({ rows: drills });

      const response = await request(app)
        .get('/response-drills')
        .expect(200);

      expect(response.body).toEqual(drills);
      expect(mockQuery).toHaveBeenCalledTimes(1);
      expect(mockQuery).toHaveBeenCalledWith(
        'SELECT id, cue_text, time_limit_seconds, difficulty, category FROM response_drills ORDER BY id'
      );
    });

    it('should return empty array when no response drills exist', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .get('/response-drills')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should handle database errors gracefully', async () => {
      mockQuery.mockRejectedValueOnce(new Error('Database connection failed'));

      const response = await request(app)
        .get('/response-drills')
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to fetch response drills' });
    });
  });

  describe('GET /response-drills/:id', () => {
    it('should return a specific response drill by id', async () => {
      const drill = {
        id: 1,
        cue_text: 'What is your name?',
        suggested_response: 'My name is Tanaka.',
        time_limit_seconds: 10,
        difficulty: 'easy',
        category: 'introduction',
        created_at: '2026-01-01',
      };

      mockQuery.mockResolvedValueOnce({ rows: [drill] });

      const response = await request(app)
        .get('/response-drills/1')
        .expect(200);

      expect(response.body).toEqual(drill);
      expect(mockQuery).toHaveBeenCalledTimes(1);
      expect(mockQuery).toHaveBeenCalledWith(
        'SELECT * FROM response_drills WHERE id = $1',
        ['1']
      );
    });

    it('should return 404 when response drill not found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .get('/response-drills/999')
        .expect(404);

      expect(response.body).toEqual({ error: 'Response drill not found' });
    });

    it('should handle database errors gracefully', async () => {
      mockQuery.mockRejectedValueOnce(new Error('Database connection failed'));

      const response = await request(app)
        .get('/response-drills/1')
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to fetch response drill' });
    });
  });

  describe('POST /evaluate-response', () => {
    it('should return score 100 for highly similar responses', async () => {
      const response = await request(app)
        .post('/evaluate-response')
        .send({
          userResponse: 'Hello, nice to meet you',
          suggestedResponse: 'Hello, nice to meet you',
          drillId: 1,
        })
        .expect(200);

      expect(response.body.score).toBe(100);
      expect(response.body.feedback).toContain('Excellent');
      expect(response.body.similarity).toBe(1);
      expect(response.body.userResponse).toBe('Hello, nice to meet you');
      expect(response.body.suggestedResponse).toBe('Hello, nice to meet you');
    });

    it('should return score 70 for somewhat similar responses', async () => {
      const response = await request(app)
        .post('/evaluate-response')
        .send({
          userResponse: 'Hello meet you',
          suggestedResponse: 'Hello, nice to meet you',
          drillId: 1,
        })
        .expect(200);

      expect(response.body.score).toBe(70);
      expect(response.body.feedback).toContain('Good attempt');
      expect(response.body.similarity).toBeGreaterThan(0.5);
      expect(response.body.similarity).toBeLessThan(0.8);
    });

    it('should return score 40 for very different responses', async () => {
      const response = await request(app)
        .post('/evaluate-response')
        .send({
          userResponse: 'completely different text',
          suggestedResponse: 'Hello, nice to meet you',
          drillId: 1,
        })
        .expect(200);

      expect(response.body.score).toBe(40);
      expect(response.body.feedback).toContain('Keep practicing');
      expect(response.body.similarity).toBeLessThan(0.5);
    });

    it('should handle case insensitivity', async () => {
      const response = await request(app)
        .post('/evaluate-response')
        .send({
          userResponse: 'HELLO, NICE TO MEET YOU',
          suggestedResponse: 'hello, nice to meet you',
          drillId: 1,
        })
        .expect(200);

      expect(response.body.score).toBe(100);
      expect(response.body.similarity).toBe(1);
    });

    it('should handle whitespace trimming', async () => {
      const response = await request(app)
        .post('/evaluate-response')
        .send({
          userResponse: '  Hello, nice to meet you  ',
          suggestedResponse: 'Hello, nice to meet you',
          drillId: 1,
        })
        .expect(200);

      expect(response.body.score).toBe(100);
      expect(response.body.similarity).toBe(1);
    });

    it('should return 400 when userResponse is missing', async () => {
      const response = await request(app)
        .post('/evaluate-response')
        .send({
          suggestedResponse: 'Hello, nice to meet you',
          drillId: 1,
        })
        .expect(400);

      expect(response.body).toEqual({ error: 'Missing userResponse or suggestedResponse' });
    });

    it('should return 400 when suggestedResponse is missing', async () => {
      const response = await request(app)
        .post('/evaluate-response')
        .send({
          userResponse: 'Hello, nice to meet you',
          drillId: 1,
        })
        .expect(400);

      expect(response.body).toEqual({ error: 'Missing userResponse or suggestedResponse' });
    });

    it('should return 400 when both fields are missing', async () => {
      const response = await request(app)
        .post('/evaluate-response')
        .send({ drillId: 1 })
        .expect(400);

      expect(response.body).toEqual({ error: 'Missing userResponse or suggestedResponse' });
    });

    it('should handle empty strings as missing', async () => {
      const response = await request(app)
        .post('/evaluate-response')
        .send({
          userResponse: '',
          suggestedResponse: 'Hello, nice to meet you',
          drillId: 1,
        })
        .expect(400);

      expect(response.body).toEqual({ error: 'Missing userResponse or suggestedResponse' });
    });

    it('should handle empty suggestedResponse', async () => {
      const response = await request(app)
        .post('/evaluate-response')
        .send({
          userResponse: 'Hello, nice to meet you',
          suggestedResponse: '',
          drillId: 1,
        })
        .expect(400);

      expect(response.body).toEqual({ error: 'Missing userResponse or suggestedResponse' });
    });

    it('should work without drillId', async () => {
      const response = await request(app)
        .post('/evaluate-response')
        .send({
          userResponse: 'Hello, nice to meet you',
          suggestedResponse: 'Hello, nice to meet you',
        })
        .expect(200);

      expect(response.body.score).toBe(100);
    });

    it('should handle Japanese text comparison', async () => {
      const response = await request(app)
        .post('/evaluate-response')
        .send({
          userResponse: 'こんにちは',
          suggestedResponse: 'こんにちは',
          drillId: 1,
        })
        .expect(200);

      expect(response.body.score).toBe(100);
      expect(response.body.similarity).toBe(1);
    });

    it('should handle identical empty strings', async () => {
      const response = await request(app)
        .post('/evaluate-response')
        .send({
          userResponse: '',
          suggestedResponse: '',
          drillId: 1,
        })
        .expect(400);

      expect(response.body).toEqual({ error: 'Missing userResponse or suggestedResponse' });
    });
  });
});
