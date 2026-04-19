import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';
import { errorHandler } from '../../middleware/error-handler.js';
import * as fs from 'fs';
import * as path from 'path';

describe('Error Handler Middleware', () => {
  let app: express.Application;
  const mockLogDir = path.join(process.cwd(), 'logs');

  beforeEach(() => {
    // Clean up any test log files
    try {
      fs.rmSync(mockLogDir, { recursive: true, force: true });
    } catch {}
    
    app = express();
    app.use(express.json());
    
    // Route that throws error
    app.get('/error', (_req: Request, _res: Response, _next: NextFunction) => {
      throw new Error('Test error message');
    });
    
    // Route that calls next with error
    app.get('/async-error', async (_req: Request, _res: Response, next: NextFunction) => {
      next(new Error('Async error message'));
    });
    
    // Route that works fine
    app.get('/ok', (_req: Request, res: Response) => {
      res.json({ status: 'ok' });
    });
    
    // Error handler - must be last
    app.use(errorHandler);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    // Clean up test logs
    try {
      fs.rmSync(mockLogDir, { recursive: true, force: true });
    } catch {}
  });

  describe('errorHandler', () => {
    it('should handle synchronous errors', async () => {
      const response = await request(app)
        .get('/error')
        .expect('Content-Type', /json/)
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Internal server error');
      expect(response.body).toHaveProperty('timestamp');
    });

    it('should handle async errors passed to next()', async () => {
      const response = await request(app)
        .get('/async-error')
        .expect('Content-Type', /json/)
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Internal server error');
      expect(response.body).toHaveProperty('timestamp');
    });

    it('should not interfere with successful requests', async () => {
      const response = await request(app)
        .get('/ok')
        .expect(200);

      expect(response.body).toEqual({ status: 'ok' });
    });

    it('should include error message in development mode', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const response = await request(app)
        .get('/error')
        .expect(500);

      expect(response.body).toHaveProperty('message', 'Test error message');
      expect(response.body).toHaveProperty('timestamp');

      process.env.NODE_ENV = originalEnv;
    });

    it('should not include error message in production mode', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const response = await request(app)
        .get('/error')
        .expect(500);

      expect(response.body).not.toHaveProperty('message');
      expect(response.body).toHaveProperty('error', 'Internal server error');

      process.env.NODE_ENV = originalEnv;
    });

    it('should return valid ISO timestamp', async () => {
      const beforeRequest = new Date();
      const response = await request(app).get('/error').expect(500);
      const afterRequest = new Date();

      const responseTime = new Date(response.body.timestamp);
      expect(responseTime.getTime()).toBeGreaterThanOrEqual(beforeRequest.getTime());
      expect(responseTime.getTime()).toBeLessThanOrEqual(afterRequest.getTime());
    });
  });
});
