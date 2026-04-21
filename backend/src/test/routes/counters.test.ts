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
import counterRoutes from '../../routes/counters.js';
import { pool } from '../../db/pool.js';

const mockQuery = pool.query as ReturnType<typeof vi.fn>;

describe('Counters Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/', counterRoutes);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /groups', () => {
    it('should return all counter groups when authorized', async () => {
      const mockRows = [
        {
          base_form: '〜つ',
          count: '3',
          patterns: [
            { id: 1, pattern: '一つ', formation_rules: [{}, {}], examples: [] },
            { id: 2, pattern: '二つ', formation_rules: [{}, {}], examples: [] },
          ],
          counts: '1-10',
          description: 'General counter for items',
        },
        {
          base_form: '〜人',
          count: '2',
          patterns: [
            { id: 3, pattern: '一人', formation_rules: [{}, {}], examples: [] },
          ],
          counts: '1-10',
          description: 'Counter for people',
        },
      ];
      mockQuery.mockResolvedValue({ rows: mockRows });

      const response = await request(app)
        .get('/groups')
        .set('x-password', 'test-password')
        .expect(200);

      expect(response.body).toEqual({
        count: 2,
        groups: [
          {
            baseForm: '〜つ',
            count: 3,
            patterns: mockRows[0].patterns,
            counts: '1-10',
            description: 'General counter for items',
          },
          {
            baseForm: '〜人',
            count: 2,
            patterns: mockRows[1].patterns,
            counts: '1-10',
            description: 'Counter for people',
          },
        ],
      });
      expect(mockQuery).toHaveBeenCalledTimes(1);
    });

    it('should return 401 when unauthorized', async () => {
      const response = await request(app)
        .get('/groups')
        .expect(401);

      expect(response.body).toEqual({ error: 'Unauthorized' });
      expect(mockQuery).not.toHaveBeenCalled();
    });

    it('should handle database errors gracefully', async () => {
      mockQuery.mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .get('/groups')
        .set('x-password', 'test-password')
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to fetch counter groups' });
    });

    it('should use default values when counts and description are null', async () => {
      const mockRows = [
        {
          base_form: '〜個',
          count: '1',
          patterns: [{ id: 4, pattern: '一個', formation_rules: null, examples: null }],
          counts: null,
          description: null,
        },
      ];
      mockQuery.mockResolvedValue({ rows: mockRows });

      const response = await request(app)
        .get('/groups')
        .set('x-password', 'test-password')
        .expect(200);

      expect(response.body.groups[0].counts).toBe('Various');
      expect(response.body.groups[0].description).toBe('Counter for counting items');
    });

    it('should return empty array when no counter groups exist', async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      const response = await request(app)
        .get('/groups')
        .set('x-password', 'test-password')
        .expect(200);

      expect(response.body).toEqual({
        count: 0,
        groups: [],
      });
    });
  });

  describe('GET /:baseForm/variants', () => {
    it('should return counter variants when authorized', async () => {
      const mockRows = [
        {
          id: 1,
          pattern: '一つ',
          base_form: '〜つ',
          category: 'Counters',
          formation_rules: [{}, {}],
          examples: [],
          ease_factor: 2.5,
          interval_days: 1,
          streak: 0,
          total_attempts: 5,
          correct_attempts: 4,
        },
        {
          id: 2,
          pattern: '二つ',
          base_form: '〜つ',
          category: 'Counters',
          formation_rules: [{}, {}],
          examples: [],
          ease_factor: 2.7,
          interval_days: 3,
          streak: 2,
          total_attempts: 10,
          correct_attempts: 8,
        },
      ];
      mockQuery.mockResolvedValue({ rows: mockRows });

      const response = await request(app)
        .get('/〜つ/variants')
        .set('x-password', 'test-password')
        .expect(200);

      expect(response.body).toEqual({
        baseForm: '〜つ',
        count: 2,
        variants: mockRows,
      });
      expect(mockQuery).toHaveBeenCalledTimes(1);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        ['〜つ']
      );
    });

    it('should return 401 when unauthorized', async () => {
      const response = await request(app)
        .get('/〜つ/variants')
        .expect(401);

      expect(response.body).toEqual({ error: 'Unauthorized' });
      expect(mockQuery).not.toHaveBeenCalled();
    });

    it('should handle database errors gracefully', async () => {
      mockQuery.mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .get('/〜つ/variants')
        .set('x-password', 'test-password')
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to fetch counter variants' });
    });

    it('should handle counter with no user progress data', async () => {
      const mockRows = [
        {
          id: 1,
          pattern: '一つ',
          base_form: '〜つ',
          category: 'Counters',
          formation_rules: null,
          examples: null,
          ease_factor: null,
          interval_days: null,
          streak: null,
          total_attempts: null,
          correct_attempts: null,
        },
      ];
      mockQuery.mockResolvedValue({ rows: mockRows });

      const response = await request(app)
        .get('/〜つ/variants')
        .set('x-password', 'test-password')
        .expect(200);

      // COALESCE should provide defaults for null progress values
      expect(response.body.variants[0].ease_factor).toBeNull();
      expect(response.body.variants[0].streak).toBeNull();
    });

    it('should handle URL-encoded baseForm parameter', async () => {
      const mockRows: Array<Record<string, unknown>> = [];
      mockQuery.mockResolvedValue({ rows: mockRows });

      const response = await request(app)
        .get('/' + encodeURIComponent('〜本') + '/variants')
        .set('x-password', 'test-password')
        .expect(200);

      expect(response.body.baseForm).toBe('〜本');
      expect(response.body.count).toBe(0);
    });

    it('should return empty variants array when baseForm has no matches', async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      const response = await request(app)
        .get('/〜未知/variants')
        .set('x-password', 'test-password')
        .expect(200);

      expect(response.body).toEqual({
        baseForm: '〜未知',
        count: 0,
        variants: [],
      });
    });
  });
});
