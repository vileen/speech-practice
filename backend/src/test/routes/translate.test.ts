import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';

const mockCreate = vi.fn();

vi.mock('openai', () => {
  return {
    default: class MockOpenAI {
      chat = {
        completions: {
          create: (...args: any[]) => mockCreate(...args),
        },
      };
    },
  };
});

vi.mock('../../config/index.js', () => ({
  appConfig: {
    password: 'test-password',
    apiKeys: {
      openai: 'test-openai-key',
    },
  },
}));

import translateRoutes from '../../routes/translate.js';

describe('Translate Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/', translateRoutes);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /', () => {
    it('should translate Japanese text to English by default', async () => {
      mockCreate.mockResolvedValue({
        choices: [
          {
            message: {
              content: 'Hello',
            },
          },
        ],
      });

      const response = await request(app)
        .post('/')
        .set('x-password', 'test-password')
        .send({ text: 'こんにちは' })
        .expect(200);

      expect(response.body).toEqual({ translation: 'Hello' });
      expect(mockCreate).toHaveBeenCalledOnce();
      const callArgs = mockCreate.mock.calls[0][0];
      expect(callArgs.model).toBe('gpt-4o-mini');
      expect(callArgs.messages[0].content).toContain('English');
      expect(callArgs.messages[1].content).toBe('こんにちは');
    });

    it('should translate to a custom target language', async () => {
      mockCreate.mockResolvedValue({
        choices: [
          {
            message: {
              content: 'Ciao',
            },
          },
        ],
      });

      const response = await request(app)
        .post('/')
        .set('x-password', 'test-password')
        .send({ text: 'こんにちは', targetLang: 'it' })
        .expect(200);

      expect(response.body).toEqual({ translation: 'Ciao' });
      const callArgs = mockCreate.mock.calls[0][0];
      expect(callArgs.messages[0].content).toContain('it');
    });

    it('should return 400 when no text is provided', async () => {
      const response = await request(app)
        .post('/')
        .set('x-password', 'test-password')
        .send({})
        .expect(400);

      expect(response.body).toEqual({ error: 'No text provided' });
      expect(mockCreate).not.toHaveBeenCalled();
    });

    it('should return 500 when OpenAI throws an error', async () => {
      mockCreate.mockRejectedValue(new Error('OpenAI failure'));

      const response = await request(app)
        .post('/')
        .set('x-password', 'test-password')
        .send({ text: 'こんにちは' })
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to translate' });
    });

    it('should return empty translation when OpenAI returns empty content', async () => {
      mockCreate.mockResolvedValue({
        choices: [
          {
            message: {
              content: null,
            },
          },
        ],
      });

      const response = await request(app)
        .post('/')
        .set('x-password', 'test-password')
        .send({ text: 'こんにちは' })
        .expect(200);

      expect(response.body).toEqual({ translation: '' });
    });

    it('should reject requests without password', async () => {
      await request(app)
        .post('/')
        .send({ text: 'こんにちは' })
        .expect(401);
    });
  });
});
