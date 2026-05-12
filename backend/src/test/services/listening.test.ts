import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getPassages,
  getPassageById,
  getPassageWithTranscript,
  getAudioUrl,
  getQuestionsByPassageId,
  submitAnswers,
  getListeningStats,
} from '../../services/listening.js';

// Mock the pool module
vi.mock('../../db/pool.js', () => ({
  pool: {
    query: vi.fn(),
  },
}));

import { pool } from '../../db/pool.js';

const mockQuery = vi.mocked(pool.query);

describe('listening service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getPassages', () => {
    it('should return all passages without level filter', async () => {
      const mockRows = [
        { id: 1, title: 'Test 1', level: 'N5', audio_url: 'url1', duration_seconds: 60, difficulty_speed: 'normal', topic_category: 'daily', created_at: new Date() },
        { id: 2, title: 'Test 2', level: 'N4', audio_url: 'url2', duration_seconds: 90, difficulty_speed: 'slow', topic_category: 'travel', created_at: new Date() },
      ];
      mockQuery.mockResolvedValue({ rows: mockRows } as any);

      const result = await getPassages();

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('SELECT id, title, level, audio_url'),
        []
      );
      expect(result).toHaveLength(2);
      expect(result[0].title).toBe('Test 1');
    });

    it('should filter passages by level', async () => {
      const mockRows = [
        { id: 1, title: 'N5 Passage', level: 'N5', audio_url: 'url1', duration_seconds: 60, difficulty_speed: 'normal', topic_category: 'daily', created_at: new Date() },
      ];
      mockQuery.mockResolvedValue({ rows: mockRows } as any);

      const result = await getPassages('N5');

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('WHERE level = $1'),
        ['N5']
      );
      expect(result).toHaveLength(1);
      expect(result[0].level).toBe('N5');
    });

    it('should return empty array when no passages', async () => {
      mockQuery.mockResolvedValue({ rows: [] } as any);

      const result = await getPassages();

      expect(result).toEqual([]);
    });
  });

  describe('getPassageById', () => {
    it('should return passage summary by id', async () => {
      const mockRow = { id: 1, title: 'Test', level: 'N5', audio_url: 'url', duration_seconds: 60, difficulty_speed: 'normal', topic_category: 'daily', created_at: new Date() };
      mockQuery.mockResolvedValue({ rows: [mockRow] } as any);

      const result = await getPassageById(1);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('SELECT id, title, level, audio_url'),
        [1]
      );
      expect(result).toEqual(mockRow);
    });

    it('should return null when passage not found', async () => {
      mockQuery.mockResolvedValue({ rows: [] } as any);

      const result = await getPassageById(999);

      expect(result).toBeNull();
    });
  });

  describe('getPassageWithTranscript', () => {
    it('should return full passage with transcript', async () => {
      const mockRow = {
        id: 1,
        title: 'Test',
        level: 'N5',
        audio_url: 'url',
        transcript: 'Hello world',
        japanese_text: 'こんにちは',
        duration_seconds: 60,
        difficulty_speed: 'normal',
        topic_category: 'daily',
        created_at: new Date(),
      };
      mockQuery.mockResolvedValue({ rows: [mockRow] } as any);

      const result = await getPassageWithTranscript(1);

      expect(mockQuery).toHaveBeenCalledWith(
        'SELECT * FROM listening_passages WHERE id = $1',
        [1]
      );
      expect(result?.transcript).toBe('Hello world');
      expect(result?.japanese_text).toBe('こんにちは');
    });

    it('should return null when passage not found', async () => {
      mockQuery.mockResolvedValue({ rows: [] } as any);

      const result = await getPassageWithTranscript(999);

      expect(result).toBeNull();
    });
  });

  describe('getAudioUrl', () => {
    it('should return audio URL for passage', async () => {
      mockQuery.mockResolvedValue({ rows: [{ audio_url: 'https://example.com/audio.mp3' }] } as any);

      const result = await getAudioUrl(1);

      expect(mockQuery).toHaveBeenCalledWith(
        'SELECT audio_url FROM listening_passages WHERE id = $1',
        [1]
      );
      expect(result).toBe('https://example.com/audio.mp3');
    });

    it('should return null when passage has no audio', async () => {
      mockQuery.mockResolvedValue({ rows: [{}] } as any);

      const result = await getAudioUrl(1);

      expect(result).toBeNull();
    });

    it('should return null when passage not found', async () => {
      mockQuery.mockResolvedValue({ rows: [] } as any);

      const result = await getAudioUrl(999);

      expect(result).toBeNull();
    });
  });

  describe('getQuestionsByPassageId', () => {
    it('should return questions for a passage', async () => {
      const mockRows = [
        { id: 1, passage_id: 1, question_text: 'Q1', question_type: 'main_idea', options: ['A', 'B', 'C', 'D'], correct_answer: 0, explanation: 'Exp1' },
        { id: 2, passage_id: 1, question_text: 'Q2', question_type: 'detail', options: ['A', 'B', 'C', 'D'], correct_answer: 1, explanation: 'Exp2' },
      ];
      mockQuery.mockResolvedValue({ rows: mockRows } as any);

      const result = await getQuestionsByPassageId(1);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('SELECT id, passage_id, question_text'),
        [1]
      );
      expect(result).toHaveLength(2);
      expect(result[0].question_text).toBe('Q1');
      expect(result[1].question_type).toBe('detail');
    });

    it('should return empty array when no questions', async () => {
      mockQuery.mockResolvedValue({ rows: [] } as any);

      const result = await getQuestionsByPassageId(1);

      expect(result).toEqual([]);
    });
  });

  describe('submitAnswers', () => {
    it('should calculate score correctly with all correct answers', async () => {
      const questions = [
        { id: 1, correct_answer: 0, explanation: 'Exp1', question_type: 'main_idea' },
        { id: 2, correct_answer: 1, explanation: 'Exp2', question_type: 'detail' },
      ];
      mockQuery.mockResolvedValue({ rows: questions } as any);

      const answers = [
        { questionId: 1, selectedOption: 0 },
        { questionId: 2, selectedOption: 1 },
      ];

      const result = await submitAnswers(1, answers);

      expect(result.score).toBe(100);
      expect(result.correctCount).toBe(2);
      expect(result.totalQuestions).toBe(2);
      expect(result.results.every(r => r.isCorrect)).toBe(true);
    });

    it('should calculate score correctly with mixed answers', async () => {
      const questions = [
        { id: 1, correct_answer: 0, explanation: 'Exp1', question_type: 'main_idea' },
        { id: 2, correct_answer: 1, explanation: 'Exp2', question_type: 'detail' },
        { id: 3, correct_answer: 2, explanation: 'Exp3', question_type: 'inference' },
      ];
      mockQuery.mockResolvedValue({ rows: questions } as any);

      const answers = [
        { questionId: 1, selectedOption: 0 },
        { questionId: 2, selectedOption: 0 },
        { questionId: 3, selectedOption: 2 },
      ];

      const result = await submitAnswers(1, answers);

      expect(result.score).toBe(67);
      expect(result.correctCount).toBe(2);
      expect(result.totalQuestions).toBe(3);
      expect(result.results[0].isCorrect).toBe(true);
      expect(result.results[1].isCorrect).toBe(false);
      expect(result.results[2].isCorrect).toBe(true);
    });

    it('should calculate score as 0 when all answers wrong', async () => {
      const questions = [
        { id: 1, correct_answer: 0, explanation: 'Exp1', question_type: 'main_idea' },
      ];
      mockQuery.mockResolvedValue({ rows: questions } as any);

      const answers = [{ questionId: 1, selectedOption: 2 }];

      const result = await submitAnswers(1, answers);

      expect(result.score).toBe(0);
      expect(result.correctCount).toBe(0);
    });

    it('should handle empty answers array', async () => {
      mockQuery.mockResolvedValue({ rows: [] } as any);

      const result = await submitAnswers(1, []);

      expect(result.score).toBe(0);
      expect(result.correctCount).toBe(0);
      expect(result.totalQuestions).toBe(0);
    });

    it('should calculate listening time when start and end times provided', async () => {
      const questions = [
        { id: 1, correct_answer: 0, explanation: 'Exp1', question_type: 'main_idea' },
      ];
      mockQuery.mockResolvedValue({ rows: questions } as any);

      const startTime = new Date('2024-01-01T10:00:00');
      const endTime = new Date('2024-01-01T10:02:30');

      const result = await submitAnswers(1, [{ questionId: 1, selectedOption: 0 }], startTime, endTime);

      expect(result.listeningTimeSeconds).toBe(150);
    });

    it('should return null listening time when times not provided', async () => {
      const questions = [
        { id: 1, correct_answer: 0, explanation: 'Exp1', question_type: 'main_idea' },
      ];
      mockQuery.mockResolvedValue({ rows: questions } as any);

      const result = await submitAnswers(1, [{ questionId: 1, selectedOption: 0 }]);

      expect(result.listeningTimeSeconds).toBeNull();
    });

    it('should include correct answer and explanation in results', async () => {
      const questions = [
        { id: 1, correct_answer: 2, explanation: 'Because it is correct', question_type: 'inference' },
      ];
      mockQuery.mockResolvedValue({ rows: questions } as any);

      const answers = [{ questionId: 1, selectedOption: 0 }];

      const result = await submitAnswers(1, answers);

      expect(result.results[0].correctAnswer).toBe(2);
      expect(result.results[0].explanation).toBe('Because it is correct');
      expect(result.results[0].questionType).toBe('inference');
    });
  });

  describe('getListeningStats', () => {
    it('should return stats by level and total questions', async () => {
      mockQuery
        .mockResolvedValueOnce({
          rows: [
            { level: 'N5', count: '5' },
            { level: 'N4', count: '3' },
          ],
        } as any)
        .mockResolvedValueOnce({
          rows: [{ total_questions: '20' }],
        } as any);

      const result = await getListeningStats();

      expect(mockQuery).toHaveBeenCalledTimes(2);
      expect(result.byLevel).toHaveLength(2);
      expect(result.byLevel[0].level).toBe('N5');
      expect(result.totalQuestions).toBe(20);
    });

    it('should handle zero questions', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [] } as any)
        .mockResolvedValueOnce({ rows: [{ total_questions: '0' }] } as any);

      const result = await getListeningStats();

      expect(result.byLevel).toEqual([]);
      expect(result.totalQuestions).toBe(0);
    });
  });
});
