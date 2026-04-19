import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';

// Mock the config before importing routes
vi.mock('../../config/index.js', () => ({
  appConfig: {
    password: 'test-password'
  }
}));

import { checkPassword } from '../../middleware/auth.js';

describe('Auth Middleware', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    
    // Protected route for testing
    app.get('/protected', checkPassword, (_req, res) => {
      res.json({ success: true, message: 'Access granted' });
    });
    
    // Route that accepts body password
    app.post('/protected-post', checkPassword, (_req, res) => {
      res.json({ success: true, message: 'Post access granted' });
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('checkPassword', () => {
    it('should allow access with correct x-password header', async () => {
      const response = await request(app)
        .get('/protected')
        .set('x-password', 'test-password')
        .expect(200);

      expect(response.body).toEqual({ success: true, message: 'Access granted' });
    });

    it('should allow access with correct password in body', async () => {
      const response = await request(app)
        .post('/protected-post')
        .send({ password: 'test-password', data: 'test' })
        .expect(200);

      expect(response.body).toEqual({ success: true, message: 'Post access granted' });
    });

    it('should deny access with incorrect password header', async () => {
      const response = await request(app)
        .get('/protected')
        .set('x-password', 'wrong-password')
        .expect(401);

      expect(response.body).toEqual({ error: 'Unauthorized' });
    });

    it('should deny access with incorrect password in body', async () => {
      const response = await request(app)
        .post('/protected-post')
        .send({ password: 'wrong-password' })
        .expect(401);

      expect(response.body).toEqual({ error: 'Unauthorized' });
    });

    it('should deny access when no password is provided', async () => {
      const response = await request(app)
        .get('/protected')
        .expect(401);

      expect(response.body).toEqual({ error: 'Unauthorized' });
    });

    it('should deny access with empty password header', async () => {
      const response = await request(app)
        .get('/protected')
        .set('x-password', '')
        .expect(401);

      expect(response.body).toEqual({ error: 'Unauthorized' });
    });
  });
});
