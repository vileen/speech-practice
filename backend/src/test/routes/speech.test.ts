import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';

// Mock dependencies - must be before imports
vi.mock('../../db/pool.js', () => ({
  pool: {
    query: vi.fn(),
  },
}));

vi.mock('../../services/speechAssessment.js', () => ({
  transcribeAudio: vi.fn(),
  comparePronunciation: vi.fn(),
}));

vi.mock('multer', () => {
  const mockMulter = vi.fn(() => ({
    memoryStorage: vi.fn(),
    single: vi.fn((fieldname: string) => {
      return (req: express.Request, res: express.Response, next: express.NextFunction) => {
        if (req.headers['x-test-file'] === 'yes') {
          (req as any).file = {
            fieldname,
            originalname: 'test.webm',
            encoding: '7bit',
            mimetype: 'audio/webm',
            buffer: Buffer.from('fake-audio-data'),
            size: 18,
          };
        }
        next();
      };
    }),
  })) as any;
  mockMulter.memoryStorage = vi.fn();
  return {
    __esModule: true,
    default: mockMulter,
  };
});

// Now import after mocks are set up
import speechRoutes from '../../routes/speech.js';
import { pool } from '../../db/pool.js';
import { transcribeAudio, comparePronunciation } from '../../services/speechAssessment.js';

const mockQuery = pool.query as ReturnType<typeof vi.fn>;
const mockTranscribeAudio = transcribeAudio as ReturnType<typeof vi.fn>;
const mockComparePronunciation = comparePronunciation as ReturnType<typeof vi.fn>;

describe('Speech Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/', speechRoutes);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /assess', () => {
    it('should assess pronunciation and return result', async () => {
      const mockAssessment = {
        transcript: 'こんにちは',
        expected: 'こんにちは',
        accuracyScore: 95,
        feedback: {
          overall: 'Great job!',
          errors: [],
          suggestions: [],
        },
      };

      mockTranscribeAudio.mockResolvedValueOnce('こんにちは');
      mockComparePronunciation.mockReturnValueOnce(mockAssessment);
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .post('/assess')
        .set('x-test-file', 'yes')
        .send({
          target_text: 'こんにちは',
          expected_romaji: 'konnichiwa',
          user_id: 'user-123',
        })
        .expect(200);

      expect(response.body).toEqual(mockAssessment);
      expect(mockTranscribeAudio).toHaveBeenCalledTimes(1);
      expect(mockComparePronunciation).toHaveBeenCalledWith(
        'こんにちは',
        'こんにちは',
        'konnichiwa'
      );
      expect(mockQuery).toHaveBeenCalledTimes(1);
    });

    it('should return 400 when no audio file provided', async () => {
      const response = await request(app)
        .post('/assess')
        .send({ target_text: 'こんにちは' })
        .expect(400);

      expect(response.body).toEqual({ error: 'No audio file provided' });
      expect(mockTranscribeAudio).not.toHaveBeenCalled();
    });

    it('should return 400 when target_text is missing', async () => {
      const response = await request(app)
        .post('/assess')
        .set('x-test-file', 'yes')
        .send({})
        .expect(400);

      expect(response.body).toEqual({ error: 'target_text is required' });
      expect(mockTranscribeAudio).not.toHaveBeenCalled();
    });

    it('should handle transcription errors gracefully', async () => {
      mockTranscribeAudio.mockRejectedValueOnce(new Error('Whisper API error'));

      const response = await request(app)
        .post('/assess')
        .set('x-test-file', 'yes')
        .send({ target_text: 'こんにちは' })
        .expect(500);

      expect(response.body).toEqual({
        error: 'Failed to assess pronunciation',
        message: 'Whisper API error',
      });
    });

    it('should work without user_id (skip saving)', async () => {
      const mockAssessment = {
        transcript: 'こんにちは',
        expected: 'こんにちは',
        accuracyScore: 95,
        feedback: {
          overall: 'Great job!',
          errors: [],
          suggestions: [],
        },
      };

      mockTranscribeAudio.mockResolvedValueOnce('こんにちは');
      mockComparePronunciation.mockReturnValueOnce(mockAssessment);

      const response = await request(app)
        .post('/assess')
        .set('x-test-file', 'yes')
        .send({ target_text: 'こんにちは' })
        .expect(200);

      expect(response.body).toEqual(mockAssessment);
      expect(mockQuery).not.toHaveBeenCalled();
    });

    it('should handle database save errors gracefully (assessment still returned)', async () => {
      const mockAssessment = {
        transcript: 'こんにちは',
        expected: 'こんにちは',
        accuracyScore: 95,
        feedback: {
          overall: 'Great job!',
          errors: [],
          suggestions: [],
        },
      };

      mockTranscribeAudio.mockResolvedValueOnce('こんにちは');
      mockComparePronunciation.mockReturnValueOnce(mockAssessment);
      mockQuery.mockRejectedValueOnce(new Error('DB connection failed'));

      const response = await request(app)
        .post('/assess')
        .set('x-test-file', 'yes')
        .send({
          target_text: 'こんにちは',
          user_id: 'user-123',
        })
        .expect(200);

      expect(response.body).toEqual(mockAssessment);
    });
  });

  describe('POST /transcribe', () => {
    it('should transcribe audio and return transcript', async () => {
      mockTranscribeAudio.mockResolvedValueOnce('こんにちは');

      const response = await request(app)
        .post('/transcribe')
        .set('x-test-file', 'yes')
        .send({})
        .expect(200);

      expect(response.body).toEqual({
        transcript: 'こんにちは',
        language: 'ja',
      });
      expect(mockTranscribeAudio).toHaveBeenCalledTimes(1);
    });

    it('should return 400 when no audio file provided', async () => {
      const response = await request(app)
        .post('/transcribe')
        .send({})
        .expect(400);

      expect(response.body).toEqual({ error: 'No audio file provided' });
      expect(mockTranscribeAudio).not.toHaveBeenCalled();
    });

    it('should handle transcription errors gracefully', async () => {
      mockTranscribeAudio.mockRejectedValueOnce(new Error('Audio processing failed'));

      const response = await request(app)
        .post('/transcribe')
        .set('x-test-file', 'yes')
        .send({})
        .expect(500);

      expect(response.body).toEqual({
        error: 'Failed to transcribe audio',
        message: 'Audio processing failed',
      });
    });
  });

  describe('GET /assessments/:userId', () => {
    it("should return user's assessment history", async () => {
      const assessments = [
        {
          id: 1,
          target_phrase: 'こんにちは',
          user_transcript: 'こんにちは',
          accuracy_score: 95,
          feedback: { overall: 'Great' },
          created_at: '2026-01-01',
        },
        {
          id: 2,
          target_phrase: 'さようなら',
          user_transcript: 'さようなら',
          accuracy_score: 88,
          feedback: { overall: 'Good' },
          created_at: '2026-01-02',
        },
      ];

      mockQuery.mockResolvedValueOnce({ rows: assessments });

      const response = await request(app)
        .get('/assessments/user-123')
        .expect(200);

      expect(response.body).toEqual(assessments);
      expect(mockQuery).toHaveBeenCalledTimes(1);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('SELECT id, target_phrase, user_transcript, accuracy_score, feedback, created_at'),
        ['user-123', 50]
      );
    });

    it('should respect limit query parameter', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      await request(app)
        .get('/assessments/user-123?limit=10')
        .expect(200);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.any(String),
        ['user-123', 10]
      );
    });

    it('should handle database errors gracefully', async () => {
      mockQuery.mockRejectedValueOnce(new Error('Database connection failed'));

      const response = await request(app)
        .get('/assessments/user-123')
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to fetch assessments' });
    });
  });

  describe('GET /assessments/:userId/stats', () => {
    it("should return user's pronunciation stats", async () => {
      const stats = {
        total_attempts: '42',
        average_score: '82.5',
        best_score: '98',
        excellent_count: '25',
      };

      mockQuery.mockResolvedValueOnce({ rows: [stats] });

      const response = await request(app)
        .get('/assessments/user-123/stats')
        .expect(200);

      expect(response.body).toEqual(stats);
      expect(mockQuery).toHaveBeenCalledTimes(1);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('COUNT(*) as total_attempts'),
        ['user-123']
      );
    });

    it('should handle database errors gracefully', async () => {
      mockQuery.mockRejectedValueOnce(new Error('Database connection failed'));

      const response = await request(app)
        .get('/assessments/user-123/stats')
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to fetch stats' });
    });
  });
});
