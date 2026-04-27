import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';

// Mock dependencies - must be before imports
vi.mock('../../services/listening.js', () => ({
  getPassages: vi.fn(),
  getPassageById: vi.fn(),
  getPassageWithTranscript: vi.fn(),
  getQuestionsByPassageId: vi.fn(),
  submitAnswers: vi.fn(),
  getListeningStats: vi.fn(),
}));

vi.mock('../../config/index.js', () => ({
  appConfig: {
    password: 'test-password',
  },
}));

// Now import after mocks are set up
import listeningRoutes from '../../routes/listening.js';
import {
  getPassages,
  getPassageById,
  getPassageWithTranscript,
  getQuestionsByPassageId,
  submitAnswers,
  getListeningStats,
} from '../../services/listening.js';

const mockGetPassages = getPassages as ReturnType<typeof vi.fn>;
const mockGetPassageById = getPassageById as ReturnType<typeof vi.fn>;
const mockGetPassageWithTranscript = getPassageWithTranscript as ReturnType<typeof vi.fn>;
const mockGetQuestionsByPassageId = getQuestionsByPassageId as ReturnType<typeof vi.fn>;
const mockSubmitAnswers = submitAnswers as ReturnType<typeof vi.fn>;
const mockGetListeningStats = getListeningStats as ReturnType<typeof vi.fn>;

describe('Listening Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/', listeningRoutes);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /passages', () => {
    it('should return all passages when authorized', async () => {
      const mockPassages = [
        {
          id: 1,
          title: 'Test Passage',
          level: 'N5',
          audio_url: 'https://example.com/audio.mp3',
          duration_seconds: 120,
          difficulty_speed: 'normal',
          topic_category: 'daily',
          created_at: '2026-03-01T00:00:00.000Z',
        },
      ];
      mockGetPassages.mockResolvedValue(mockPassages);

      const response = await request(app)
        .get('/passages')
        .set('x-password', 'test-password')
        .expect(200);

      expect(response.body).toEqual({
        count: 1,
        passages: mockPassages,
      });
      expect(mockGetPassages).toHaveBeenCalledWith(undefined);
    });

    it('should filter by level when provided', async () => {
      const mockPassages = [
        {
          id: 1,
          title: 'N5 Passage',
          level: 'N5',
          audio_url: 'https://example.com/audio.mp3',
          duration_seconds: 120,
          difficulty_speed: 'normal',
          topic_category: 'daily',
          created_at: '2026-03-01T00:00:00.000Z',
        },
      ];
      mockGetPassages.mockResolvedValue(mockPassages);

      const response = await request(app)
        .get('/passages?level=N5')
        .set('x-password', 'test-password')
        .expect(200);

      expect(response.body).toEqual({
        count: 1,
        passages: mockPassages,
      });
      expect(mockGetPassages).toHaveBeenCalledWith('N5');
    });

    it('should return 401 when unauthorized', async () => {
      const response = await request(app)
        .get('/passages')
        .expect(401);

      expect(response.body).toEqual({ error: 'Unauthorized' });
    });

    it('should handle errors gracefully', async () => {
      mockGetPassages.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/passages')
        .set('x-password', 'test-password')
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to fetch listening passages' });
    });
  });

  describe('GET /passages/:id', () => {
    it('should return a specific passage when found', async () => {
      const mockPassage = {
        id: 1,
        title: 'Test Passage',
        level: 'N5',
        audio_url: 'https://example.com/audio.mp3',
        duration_seconds: 120,
        difficulty_speed: 'normal',
        topic_category: 'daily',
        created_at: '2026-03-01T00:00:00.000Z',
      };
      mockGetPassageById.mockResolvedValue(mockPassage);

      const response = await request(app)
        .get('/passages/1')
        .set('x-password', 'test-password')
        .expect(200);

      expect(response.body).toEqual({ passage: mockPassage });
      expect(mockGetPassageById).toHaveBeenCalledWith(1);
    });

    it('should return 400 for invalid passage ID', async () => {
      const response = await request(app)
        .get('/passages/invalid')
        .set('x-password', 'test-password')
        .expect(400);

      expect(response.body).toEqual({ error: 'Invalid passage ID' });
      expect(mockGetPassageById).not.toHaveBeenCalled();
    });

    it('should return 404 when passage not found', async () => {
      mockGetPassageById.mockResolvedValue(null);

      const response = await request(app)
        .get('/passages/999')
        .set('x-password', 'test-password')
        .expect(404);

      expect(response.body).toEqual({ error: 'Passage not found' });
      expect(mockGetPassageById).toHaveBeenCalledWith(999);
    });

    it('should return 401 when unauthorized', async () => {
      const response = await request(app)
        .get('/passages/1')
        .expect(401);

      expect(response.body).toEqual({ error: 'Unauthorized' });
    });

    it('should handle errors gracefully', async () => {
      mockGetPassageById.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/passages/1')
        .set('x-password', 'test-password')
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to fetch listening passage' });
    });
  });

  describe('GET /passages/:id/audio', () => {
    it('should return audio URL and duration for a passage', async () => {
      const mockPassage = {
        id: 1,
        title: 'Test Passage',
        level: 'N5',
        audio_url: 'https://example.com/audio.mp3',
        duration_seconds: 120,
        difficulty_speed: 'normal',
        topic_category: 'daily',
        created_at: '2026-03-01T00:00:00.000Z',
      };
      mockGetPassageById.mockResolvedValue(mockPassage);

      const response = await request(app)
        .get('/passages/1/audio')
        .set('x-password', 'test-password')
        .expect(200);

      expect(response.body).toEqual({
        audioUrl: 'https://example.com/audio.mp3',
        duration: 120,
      });
      expect(mockGetPassageById).toHaveBeenCalledWith(1);
    });

    it('should return 400 for invalid passage ID', async () => {
      const response = await request(app)
        .get('/passages/invalid/audio')
        .set('x-password', 'test-password')
        .expect(400);

      expect(response.body).toEqual({ error: 'Invalid passage ID' });
    });

    it('should return 404 when passage not found', async () => {
      mockGetPassageById.mockResolvedValue(null);

      const response = await request(app)
        .get('/passages/999/audio')
        .set('x-password', 'test-password')
        .expect(404);

      expect(response.body).toEqual({ error: 'Passage not found' });
    });

    it('should return 401 when unauthorized', async () => {
      const response = await request(app)
        .get('/passages/1/audio')
        .expect(401);

      expect(response.body).toEqual({ error: 'Unauthorized' });
    });

    it('should handle errors gracefully', async () => {
      mockGetPassageById.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/passages/1/audio')
        .set('x-password', 'test-password')
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to fetch audio' });
    });
  });

  describe('GET /passages/:id/questions', () => {
    it('should return questions for a passage', async () => {
      const mockQuestions = [
        {
          id: 1,
          passage_id: 1,
          question_text: 'What is the main idea?',
          question_type: 'main_idea',
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correct_answer: 0,
          explanation: 'Because...',
        },
      ];
      mockGetQuestionsByPassageId.mockResolvedValue(mockQuestions);

      const response = await request(app)
        .get('/passages/1/questions')
        .set('x-password', 'test-password')
        .expect(200);

      expect(response.body).toEqual({
        count: 1,
        questions: mockQuestions,
      });
      expect(mockGetQuestionsByPassageId).toHaveBeenCalledWith(1);
    });

    it('should return empty questions array when none exist', async () => {
      mockGetQuestionsByPassageId.mockResolvedValue([]);

      const response = await request(app)
        .get('/passages/1/questions')
        .set('x-password', 'test-password')
        .expect(200);

      expect(response.body).toEqual({
        count: 0,
        questions: [],
      });
    });

    it('should return 400 for invalid passage ID', async () => {
      const response = await request(app)
        .get('/passages/invalid/questions')
        .set('x-password', 'test-password')
        .expect(400);

      expect(response.body).toEqual({ error: 'Invalid passage ID' });
    });

    it('should return 401 when unauthorized', async () => {
      const response = await request(app)
        .get('/passages/1/questions')
        .expect(401);

      expect(response.body).toEqual({ error: 'Unauthorized' });
    });

    it('should handle errors gracefully', async () => {
      mockGetQuestionsByPassageId.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/passages/1/questions')
        .set('x-password', 'test-password')
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to fetch questions' });
    });
  });

  describe('GET /passages/:id/transcript', () => {
    it('should return transcript and japanese text for a passage', async () => {
      const mockPassage = {
        id: 1,
        title: 'Test Passage',
        level: 'N5',
        audio_url: 'https://example.com/audio.mp3',
        transcript: 'This is the transcript.',
        japanese_text: 'これはトランスクリプトです。',
        duration_seconds: 120,
        difficulty_speed: 'normal',
        topic_category: 'daily',
        created_at: '2026-03-01T00:00:00.000Z',
      };
      mockGetPassageWithTranscript.mockResolvedValue(mockPassage);

      const response = await request(app)
        .get('/passages/1/transcript')
        .set('x-password', 'test-password')
        .expect(200);

      expect(response.body).toEqual({
        transcript: 'This is the transcript.',
        japaneseText: 'これはトランスクリプトです。',
      });
      expect(mockGetPassageWithTranscript).toHaveBeenCalledWith(1);
    });

    it('should return 400 for invalid passage ID', async () => {
      const response = await request(app)
        .get('/passages/invalid/transcript')
        .set('x-password', 'test-password')
        .expect(400);

      expect(response.body).toEqual({ error: 'Invalid passage ID' });
    });

    it('should return 404 when passage not found', async () => {
      mockGetPassageWithTranscript.mockResolvedValue(null);

      const response = await request(app)
        .get('/passages/999/transcript')
        .set('x-password', 'test-password')
        .expect(404);

      expect(response.body).toEqual({ error: 'Passage not found' });
    });

    it('should return 401 when unauthorized', async () => {
      const response = await request(app)
        .get('/passages/1/transcript')
        .expect(401);

      expect(response.body).toEqual({ error: 'Unauthorized' });
    });

    it('should handle errors gracefully', async () => {
      mockGetPassageWithTranscript.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/passages/1/transcript')
        .set('x-password', 'test-password')
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to fetch transcript' });
    });
  });

  describe('POST /submit', () => {
    it('should submit answers and return results', async () => {
      const mockResult = {
        score: 80,
        correctCount: 4,
        totalQuestions: 5,
        results: [
          {
            questionId: 1,
            selectedOption: 0,
            isCorrect: true,
            correctAnswer: 0,
            explanation: 'Because...',
            questionType: 'main_idea',
          },
        ],
        listeningTimeSeconds: 180,
      };
      mockSubmitAnswers.mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/submit')
        .set('x-password', 'test-password')
        .send({
          passageId: 1,
          answers: [{ questionId: 1, selectedOption: 0 }],
          startTime: '2026-03-01T10:00:00Z',
          endTime: '2026-03-01T10:03:00Z',
        })
        .expect(200);

      expect(response.body).toEqual(mockResult);
      expect(mockSubmitAnswers).toHaveBeenCalledWith(
        1,
        [{ questionId: 1, selectedOption: 0 }],
        new Date('2026-03-01T10:00:00Z'),
        new Date('2026-03-01T10:03:00Z')
      );
    });

    it('should submit answers without optional time parameters', async () => {
      const mockResult = {
        score: 80,
        correctCount: 4,
        totalQuestions: 5,
        results: [],
        listeningTimeSeconds: null,
      };
      mockSubmitAnswers.mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/submit')
        .set('x-password', 'test-password')
        .send({
          passageId: 1,
          answers: [{ questionId: 1, selectedOption: 0 }],
        })
        .expect(200);

      expect(response.body).toEqual(mockResult);
      expect(mockSubmitAnswers).toHaveBeenCalledWith(
        1,
        [{ questionId: 1, selectedOption: 0 }],
        undefined,
        undefined
      );
    });

    it('should return 400 when passageId is missing', async () => {
      const response = await request(app)
        .post('/submit')
        .set('x-password', 'test-password')
        .send({
          answers: [{ questionId: 1, selectedOption: 0 }],
        })
        .expect(400);

      expect(response.body).toEqual({ error: 'passageId and answers array are required' });
      expect(mockSubmitAnswers).not.toHaveBeenCalled();
    });

    it('should return 400 when answers is not an array', async () => {
      const response = await request(app)
        .post('/submit')
        .set('x-password', 'test-password')
        .send({
          passageId: 1,
          answers: 'not-an-array',
        })
        .expect(400);

      expect(response.body).toEqual({ error: 'passageId and answers array are required' });
      expect(mockSubmitAnswers).not.toHaveBeenCalled();
    });

    it('should return 401 when unauthorized', async () => {
      const response = await request(app)
        .post('/submit')
        .send({
          passageId: 1,
          answers: [{ questionId: 1, selectedOption: 0 }],
        })
        .expect(401);

      expect(response.body).toEqual({ error: 'Unauthorized' });
    });

    it('should handle errors gracefully', async () => {
      mockSubmitAnswers.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/submit')
        .set('x-password', 'test-password')
        .send({
          passageId: 1,
          answers: [{ questionId: 1, selectedOption: 0 }],
        })
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to submit answers' });
    });
  });

  describe('GET /stats', () => {
    it('should return listening stats when authorized', async () => {
      const mockStats = {
        byLevel: [
          { level: 'N5', count: 5 },
          { level: 'N4', count: 3 },
        ],
        totalQuestions: 40,
      };
      mockGetListeningStats.mockResolvedValue(mockStats);

      const response = await request(app)
        .get('/stats')
        .set('x-password', 'test-password')
        .expect(200);

      expect(response.body).toEqual(mockStats);
      expect(mockGetListeningStats).toHaveBeenCalled();
    });

    it('should return 401 when unauthorized', async () => {
      const response = await request(app)
        .get('/stats')
        .expect(401);

      expect(response.body).toEqual({ error: 'Unauthorized' });
    });

    it('should handle errors gracefully', async () => {
      mockGetListeningStats.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/stats')
        .set('x-password', 'test-password')
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to fetch listening stats' });
    });
  });
});
