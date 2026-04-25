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
import verbRoutes from '../../routes/verbs.js';
import { pool } from '../../db/pool.js';

const mockQuery = pool.query as ReturnType<typeof vi.fn>;

describe('Verbs Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/', verbRoutes);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /random', () => {
    it('should return a random verb when authorized', async () => {
      const mockVerb = {
        id: 1,
        dictionary_form: '食べる',
        reading: 'たべる',
        meaning: 'to eat',
        verb_group: 'ichidan',
        masu_form: '食べます',
        te_form: '食べて',
        nai_form: '食べない',
        ta_form: '食べた',
        conditional_form: '食べれば',
        potential_form: '食べられる',
        passive_form: '食べられる',
        is_common: true,
      };
      mockQuery.mockResolvedValue({ rows: [mockVerb] });

      const response = await request(app)
        .get('/random')
        .set('x-password', 'test-password')
        .expect(200);

      expect(response.body).toEqual(mockVerb);
      expect(mockQuery).toHaveBeenCalledTimes(1);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM verbs WHERE is_common = true ORDER BY RANDOM() LIMIT 1')
      );
    });

    it('should return 401 when unauthorized', async () => {
      const response = await request(app)
        .get('/random')
        .expect(401);

      expect(response.body).toEqual({ error: 'Unauthorized' });
      expect(mockQuery).not.toHaveBeenCalled();
    });

    it('should return 404 when no verbs found', async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      const response = await request(app)
        .get('/random')
        .set('x-password', 'test-password')
        .expect(404);

      expect(response.body).toEqual({ error: 'No verbs found' });
    });

    it('should handle database errors gracefully', async () => {
      mockQuery.mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .get('/random')
        .set('x-password', 'test-password')
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to fetch verb' });
    });
  });

  describe('GET /:id', () => {
    it('should return a specific verb when authorized', async () => {
      const mockVerb = {
        id: 5,
        dictionary_form: '行く',
        reading: 'いく',
        meaning: 'to go',
        verb_group: 'godan',
        masu_form: '行きます',
        te_form: '行って',
        nai_form: '行かない',
        ta_form: '行った',
        conditional_form: '行けば',
        potential_form: '行ける',
        passive_form: '行かれる',
        is_common: true,
      };
      mockQuery.mockResolvedValue({ rows: [mockVerb] });

      const response = await request(app)
        .get('/5')
        .set('x-password', 'test-password')
        .expect(200);

      expect(response.body).toEqual(mockVerb);
      expect(mockQuery).toHaveBeenCalledTimes(1);
      expect(mockQuery).toHaveBeenCalledWith(
        'SELECT * FROM verbs WHERE id = $1',
        ['5']
      );
    });

    it('should return 401 when unauthorized', async () => {
      const response = await request(app)
        .get('/5')
        .expect(401);

      expect(response.body).toEqual({ error: 'Unauthorized' });
      expect(mockQuery).not.toHaveBeenCalled();
    });

    it('should return 404 when verb not found', async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      const response = await request(app)
        .get('/999')
        .set('x-password', 'test-password')
        .expect(404);

      expect(response.body).toEqual({ error: 'Verb not found' });
    });

    it('should handle database errors gracefully', async () => {
      mockQuery.mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .get('/5')
        .set('x-password', 'test-password')
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to fetch verb' });
    });
  });

  describe('POST /check', () => {
    it('should return correct=true when answer matches', async () => {
      const mockVerb = {
        id: 1,
        dictionary_form: '食べる',
        reading: 'たべる',
        meaning: 'to eat',
        verb_group: 'ichidan',
        masu_form: '食べます',
        te_form: '食べて',
        nai_form: '食べない',
        ta_form: '食べた',
        conditional_form: '食べれば',
        potential_form: '食べられる',
        passive_form: '食べられる',
      };
      mockQuery.mockResolvedValue({ rows: [mockVerb] });

      const response = await request(app)
        .post('/check')
        .set('x-password', 'test-password')
        .send({
          verbId: 1,
          fromForm: 'dictionary',
          toForm: 'te',
          userAnswer: '食べて',
        })
        .expect(200);

      expect(response.body).toEqual({
        correct: true,
        correctAnswer: '食べて',
        userAnswer: '食べて',
        verb: {
          dictionary_form: '食べる',
          meaning: 'to eat',
          verb_group: 'ichidan',
        },
      });
    });

    it('should return correct=false when answer does not match', async () => {
      const mockVerb = {
        id: 1,
        dictionary_form: '食べる',
        reading: 'たべる',
        meaning: 'to eat',
        verb_group: 'ichidan',
        masu_form: '食べます',
        te_form: '食べて',
        nai_form: '食べない',
        ta_form: '食べた',
        conditional_form: '食べれば',
        potential_form: '食べられる',
        passive_form: '食べられる',
      };
      mockQuery.mockResolvedValue({ rows: [mockVerb] });

      const response = await request(app)
        .post('/check')
        .set('x-password', 'test-password')
        .send({
          verbId: 1,
          fromForm: 'dictionary',
          toForm: 'te',
          userAnswer: '食べた',
        })
        .expect(200);

      expect(response.body).toEqual({
        correct: false,
        correctAnswer: '食べて',
        userAnswer: '食べた',
        verb: {
          dictionary_form: '食べる',
          meaning: 'to eat',
          verb_group: 'ichidan',
        },
      });
    });

    it('should check masu form correctly', async () => {
      const mockVerb = {
        id: 2,
        dictionary_form: '行く',
        reading: 'いく',
        meaning: 'to go',
        verb_group: 'godan',
        masu_form: '行きます',
        te_form: '行って',
        nai_form: '行かない',
        ta_form: '行った',
        conditional_form: '行けば',
        potential_form: '行ける',
        passive_form: '行かれる',
      };
      mockQuery.mockResolvedValue({ rows: [mockVerb] });

      const response = await request(app)
        .post('/check')
        .set('x-password', 'test-password')
        .send({
          verbId: 2,
          fromForm: 'dictionary',
          toForm: 'masu',
          userAnswer: '行きます',
        })
        .expect(200);

      expect(response.body.correct).toBe(true);
      expect(response.body.correctAnswer).toBe('行きます');
    });

    it('should check nai form correctly', async () => {
      const mockVerb = {
        id: 2,
        dictionary_form: '行く',
        reading: 'いく',
        meaning: 'to go',
        verb_group: 'godan',
        masu_form: '行きます',
        te_form: '行って',
        nai_form: '行かない',
        ta_form: '行った',
        conditional_form: '行けば',
        potential_form: '行ける',
        passive_form: '行かれる',
      };
      mockQuery.mockResolvedValue({ rows: [mockVerb] });

      const response = await request(app)
        .post('/check')
        .set('x-password', 'test-password')
        .send({
          verbId: 2,
          fromForm: 'dictionary',
          toForm: 'nai',
          userAnswer: '行かない',
        })
        .expect(200);

      expect(response.body.correct).toBe(true);
      expect(response.body.correctAnswer).toBe('行かない');
    });

    it('should check conditional form correctly', async () => {
      const mockVerb = {
        id: 2,
        dictionary_form: '行く',
        reading: 'いく',
        meaning: 'to go',
        verb_group: 'godan',
        masu_form: '行きます',
        te_form: '行って',
        nai_form: '行かない',
        ta_form: '行った',
        conditional_form: '行けば',
        potential_form: '行ける',
        passive_form: '行かれる',
      };
      mockQuery.mockResolvedValue({ rows: [mockVerb] });

      const response = await request(app)
        .post('/check')
        .set('x-password', 'test-password')
        .send({
          verbId: 2,
          fromForm: 'dictionary',
          toForm: 'conditional',
          userAnswer: '行けば',
        })
        .expect(200);

      expect(response.body.correct).toBe(true);
      expect(response.body.correctAnswer).toBe('行けば');
    });

    it('should check potential form correctly', async () => {
      const mockVerb = {
        id: 2,
        dictionary_form: '行く',
        reading: 'いく',
        meaning: 'to go',
        verb_group: 'godan',
        masu_form: '行きます',
        te_form: '行って',
        nai_form: '行かない',
        ta_form: '行った',
        conditional_form: '行けば',
        potential_form: '行ける',
        passive_form: '行かれる',
      };
      mockQuery.mockResolvedValue({ rows: [mockVerb] });

      const response = await request(app)
        .post('/check')
        .set('x-password', 'test-password')
        .send({
          verbId: 2,
          fromForm: 'dictionary',
          toForm: 'potential',
          userAnswer: '行ける',
        })
        .expect(200);

      expect(response.body.correct).toBe(true);
      expect(response.body.correctAnswer).toBe('行ける');
    });

    it('should check passive form correctly', async () => {
      const mockVerb = {
        id: 2,
        dictionary_form: '行く',
        reading: 'いく',
        meaning: 'to go',
        verb_group: 'godan',
        masu_form: '行きます',
        te_form: '行って',
        nai_form: '行かない',
        ta_form: '行った',
        conditional_form: '行けば',
        potential_form: '行ける',
        passive_form: '行かれる',
      };
      mockQuery.mockResolvedValue({ rows: [mockVerb] });

      const response = await request(app)
        .post('/check')
        .set('x-password', 'test-password')
        .send({
          verbId: 2,
          fromForm: 'dictionary',
          toForm: 'passive',
          userAnswer: '行かれる',
        })
        .expect(200);

      expect(response.body.correct).toBe(true);
      expect(response.body.correctAnswer).toBe('行かれる');
    });

    it('should return 401 when unauthorized', async () => {
      const response = await request(app)
        .post('/check')
        .send({
          verbId: 1,
          fromForm: 'dictionary',
          toForm: 'te',
          userAnswer: '食べて',
        })
        .expect(401);

      expect(response.body).toEqual({ error: 'Unauthorized' });
      expect(mockQuery).not.toHaveBeenCalled();
    });

    it('should return 404 when verb not found', async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      const response = await request(app)
        .post('/check')
        .set('x-password', 'test-password')
        .send({
          verbId: 999,
          fromForm: 'dictionary',
          toForm: 'te',
          userAnswer: '食べて',
        })
        .expect(404);

      expect(response.body).toEqual({ error: 'Verb not found' });
    });

    it('should handle database errors gracefully', async () => {
      mockQuery.mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .post('/check')
        .set('x-password', 'test-password')
        .send({
          verbId: 1,
          fromForm: 'dictionary',
          toForm: 'te',
          userAnswer: '食べて',
        })
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to check answer' });
    });
  });
});
