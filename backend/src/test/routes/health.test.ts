import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import healthRoutes from '../../routes/health.js';

describe('Health Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use('/health', healthRoutes);
  });

  describe('GET /health', () => {
    it('should return status ok', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
    });

    it('should include an ISO timestamp', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body.timestamp).toBeDefined();
      // Verify it's a valid ISO 8601 string
      expect(new Date(response.body.timestamp).toISOString()).toBe(response.body.timestamp);
    });

    it('should return JSON content type', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toMatch(/application\/json/);
    });
  });
});
