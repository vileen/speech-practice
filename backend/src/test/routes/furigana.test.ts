import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';

// Mock dependencies - must be before imports
vi.mock('../../services/elevenlabs.js', () => ({
  addFurigana: vi.fn(),
  saveFuriganaCache: vi.fn(),
}));

vi.mock('../../services/lessons.js', () => ({
  getCachedFurigana: vi.fn(),
  cacheFurigana: vi.fn(),
}));

vi.mock('../../config/index.js', () => ({
  appConfig: {
    password: 'test-password',
  },
}));

// Now import after mocks are set up
import furiganaRoutes from '../../routes/furigana.js';
import { addFurigana, saveFuriganaCache } from '../../services/elevenlabs.js';
import { getCachedFurigana, cacheFurigana } from '../../services/lessons.js';

const mockAddFurigana = addFurigana as ReturnType<typeof vi.fn>;
const mockSaveFuriganaCache = saveFuriganaCache as ReturnType<typeof vi.fn>;
const mockGetCachedFurigana = getCachedFurigana as ReturnType<typeof vi.fn>;
const mockCacheFurigana = cacheFurigana as ReturnType<typeof vi.fn>;

describe('Furigana Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/', furiganaRoutes);
    vi.clearAllMocks();
    // Reset all mock implementations to default resolved values
    mockAddFurigana.mockReset();
    mockSaveFuriganaCache.mockReset();
    mockGetCachedFurigana.mockReset();
    mockCacheFurigana.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /', () => {
    it('should return cached furigana when available', async () => {
      const text = '漢字';
      const cachedFurigana = '<ruby>漢字<rt>かんじ</rt></ruby>';
      mockGetCachedFurigana.mockResolvedValue(cachedFurigana);

      const response = await request(app)
        .post('/')
        .set('x-password', 'test-password')
        .send({ text })
        .expect(200);

      expect(response.body).toEqual({
        original: text,
        with_furigana: cachedFurigana,
        cached: true,
      });
      expect(mockGetCachedFurigana).toHaveBeenCalledWith(text);
      expect(mockAddFurigana).not.toHaveBeenCalled();
      expect(mockCacheFurigana).not.toHaveBeenCalled();
    });

    it('should generate and cache furigana when not cached', async () => {
      const text = '漢字';
      const generatedFurigana = '<ruby>漢字<rt>かんじ</rt></ruby>';
      mockGetCachedFurigana.mockResolvedValue(null);
      mockAddFurigana.mockResolvedValue(generatedFurigana);

      const response = await request(app)
        .post('/')
        .set('x-password', 'test-password')
        .send({ text })
        .expect(200);

      expect(response.body).toEqual({
        original: text,
        with_furigana: generatedFurigana,
        cached: false,
        hasFurigana: true,
      });
      expect(mockGetCachedFurigana).toHaveBeenCalledWith(text);
      expect(mockAddFurigana).toHaveBeenCalledWith(text);
      expect(mockCacheFurigana).toHaveBeenCalledWith(text, generatedFurigana);
    });

    it('should not cache when no furigana is generated', async () => {
      const text = 'hello';
      mockGetCachedFurigana.mockResolvedValue(null);
      mockAddFurigana.mockResolvedValue(text);

      const response = await request(app)
        .post('/')
        .set('x-password', 'test-password')
        .send({ text })
        .expect(200);

      expect(response.body).toEqual({
        original: text,
        with_furigana: text,
        cached: false,
        hasFurigana: false,
      });
      expect(mockCacheFurigana).not.toHaveBeenCalled();
    });

    it('should return 404 when kanji text has no furigana found', async () => {
      const text = '漢字';
      mockGetCachedFurigana.mockResolvedValue(null);
      mockAddFurigana.mockResolvedValue(text); // No <ruby> tags added

      const response = await request(app)
        .post('/')
        .set('x-password', 'test-password')
        .send({ text })
        .expect(404);

      expect(response.body).toEqual({
        original: text,
        with_furigana: text,
        cached: false,
        hasFurigana: false,
        error: 'No furigana found for this text',
      });
      expect(mockCacheFurigana).not.toHaveBeenCalled();
    });

    it('should return 400 when no text is provided', async () => {
      const response = await request(app)
        .post('/')
        .set('x-password', 'test-password')
        .send({})
        .expect(400);

      expect(response.body).toEqual({ error: 'No text provided' });
      expect(mockGetCachedFurigana).not.toHaveBeenCalled();
      expect(mockAddFurigana).not.toHaveBeenCalled();
    });

    it('should return 401 when unauthorized', async () => {
      const response = await request(app)
        .post('/')
        .send({ text: '漢字' })
        .expect(401);

      expect(response.body).toEqual({ error: 'Unauthorized' });
      expect(mockGetCachedFurigana).not.toHaveBeenCalled();
      expect(mockAddFurigana).not.toHaveBeenCalled();
    });

    it('should return 500 when addFurigana throws an error', async () => {
      const text = '漢字';
      mockGetCachedFurigana.mockResolvedValue(null);
      mockAddFurigana.mockRejectedValue(new Error('Tokenizer failed'));

      const response = await request(app)
        .post('/')
        .set('x-password', 'test-password')
        .send({ text })
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to add furigana' });
    });

    it('should return 500 when getCachedFurigana throws an error', async () => {
      const text = '漢字';
      mockGetCachedFurigana.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/')
        .set('x-password', 'test-password')
        .send({ text })
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to add furigana' });
    });

    it('should return 500 when cacheFurigana throws an error', async () => {
      const text = '漢字';
      const generatedFurigana = '<ruby>漢字<rt>かんじ</rt></ruby>';
      mockGetCachedFurigana.mockResolvedValue(null);
      mockAddFurigana.mockResolvedValue(generatedFurigana);
      mockCacheFurigana.mockRejectedValue(new Error('Cache write failed'));

      const response = await request(app)
        .post('/')
        .set('x-password', 'test-password')
        .send({ text })
        .expect(500);

      // The route catches cache errors and returns 500
      expect(response.body).toEqual({ error: 'Failed to add furigana' });
    });

    it('should handle text with mixed kanji and hiragana', async () => {
      const text = '漢字です';
      const generatedFurigana = '<ruby>漢字<rt>かんじ</rt></ruby>です';
      mockGetCachedFurigana.mockResolvedValue(null);
      mockAddFurigana.mockResolvedValue(generatedFurigana);

      const response = await request(app)
        .post('/')
        .set('x-password', 'test-password')
        .send({ text })
        .expect(200);

      expect(response.body).toEqual({
        original: text,
        with_furigana: generatedFurigana,
        cached: false,
        hasFurigana: true,
      });
    });

    it('should handle very long text', async () => {
      const text = '漢字'.repeat(100);
      const generatedFurigana = '<ruby>漢字<rt>かんじ</rt></ruby>'.repeat(100);
      mockGetCachedFurigana.mockResolvedValue(null);
      mockAddFurigana.mockResolvedValue(generatedFurigana);

      const response = await request(app)
        .post('/')
        .set('x-password', 'test-password')
        .send({ text })
        .expect(200);

      expect(response.body.with_furigana).toBe(generatedFurigana);
    });

    it('should accept password in body instead of header', async () => {
      const text = '漢字';
      const generatedFurigana = '<ruby>漢字<rt>かんじ</rt></ruby>';
      mockGetCachedFurigana.mockResolvedValue(null);
      mockAddFurigana.mockResolvedValue(generatedFurigana);

      const response = await request(app)
        .post('/')
        .send({ text, password: 'test-password' })
        .expect(200);

      expect(response.body).toEqual({
        original: text,
        with_furigana: generatedFurigana,
        cached: false,
        hasFurigana: true,
      });
    });
  });

  describe('POST /save', () => {
    it('should save furigana cache to disk', async () => {
      mockSaveFuriganaCache.mockResolvedValue(undefined);

      const response = await request(app)
        .post('/save')
        .set('x-password', 'test-password')
        .expect(200);

      expect(response.body).toEqual({
        status: 'saved',
        message: 'Furigana cache saved to disk',
      });
      expect(mockSaveFuriganaCache).toHaveBeenCalledTimes(1);
    });

    it('should return 401 when unauthorized', async () => {
      const response = await request(app)
        .post('/save')
        .expect(401);

      expect(response.body).toEqual({ error: 'Unauthorized' });
      expect(mockSaveFuriganaCache).not.toHaveBeenCalled();
    });

    it('should return 500 when saveFuriganaCache fails', async () => {
      mockSaveFuriganaCache.mockRejectedValue(new Error('Disk write failed'));

      const response = await request(app)
        .post('/save')
        .set('x-password', 'test-password')
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to save cache' });
      expect(mockSaveFuriganaCache).toHaveBeenCalledTimes(1);
    });

    it('should accept password in body', async () => {
      mockSaveFuriganaCache.mockResolvedValue(undefined);

      const response = await request(app)
        .post('/save')
        .send({ password: 'test-password' })
        .expect(200);

      expect(response.body).toEqual({
        status: 'saved',
        message: 'Furigana cache saved to disk',
      });
    });
  });
});
