import { describe, it, expect, vi, beforeEach } from 'vitest';
import { comparePronunciation, transcribeAudio } from '../../services/speechAssessment.js';

// Mock config
vi.mock('../../config/index.js', () => ({
  appConfig: {
    apiKeys: {
      openai: 'test-api-key',
    },
  },
}));

describe('speechAssessment service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('comparePronunciation', () => {
    it('should return perfect score for exact match', () => {
      const result = comparePronunciation('こんにちは', 'こんにちは');
      
      expect(result.accuracyScore).toBe(100);
      expect(result.transcript).toBe('こんにちは');
      expect(result.expected).toBe('こんにちは');
      expect(result.feedback.errors).toHaveLength(0);
      expect(result.feedback.overall).toContain('Excellent');
    });

    it('should detect omission errors with spaced text', () => {
      const result = comparePronunciation('hello world', 'hello big world');
      
      expect(result.accuracyScore).toBeLessThan(100);
      expect(result.feedback.errors).toContainEqual(
        expect.objectContaining({
          type: 'omission',
          expected: 'big',
          actual: '',
        })
      );
      expect(result.feedback.suggestions).toContainEqual(
        expect.stringContaining('skipped')
      );
    });

    it('should detect omission at end of text', () => {
      const result = comparePronunciation('こんにちは', 'こんにちは 元気です');
      
      expect(result.accuracyScore).toBeLessThan(100);
      expect(result.feedback.errors.length).toBeGreaterThan(0);
    });

    it('should detect insertion errors with spaced text', () => {
      const result = comparePronunciation('hello big nice world', 'hello world');
      
      expect(result.accuracyScore).toBeLessThan(100);
      expect(result.feedback.errors).toContainEqual(
        expect.objectContaining({
          type: 'insertion',
          actual: 'big',
          expected: '',
        })
      );
      expect(result.feedback.suggestions).toContainEqual(
        expect.stringContaining('extra words')
      );
    });

    it('should detect substitution errors', () => {
      const result = comparePronunciation('hello world', 'hello there');
      
      expect(result.accuracyScore).toBeLessThan(100);
      expect(result.feedback.errors).toContainEqual(
        expect.objectContaining({
          type: 'substitution',
          expected: 'there',
          actual: 'world',
        })
      );
      expect(result.feedback.suggestions).toContainEqual(
        expect.stringContaining('Listen carefully')
      );
    });

    it('should normalize Japanese text before comparison', () => {
      // ぢ and づ should be normalized to じ and ず
      const result1 = comparePronunciation('みづ', 'みず');
      expect(result1.accuracyScore).toBe(100);

      const result2 = comparePronunciation('はなぢ', 'はなじ');
      expect(result2.accuracyScore).toBe(100);
    });

    it('should remove punctuation during normalization', () => {
      const result = comparePronunciation('こんにちは。', 'こんにちは');
      expect(result.accuracyScore).toBe(100);
    });

    it('should handle whitespace normalization', () => {
      const result = comparePronunciation('こんにちは　元気です', 'こんにちは 元気です');
      expect(result.accuracyScore).toBe(100);
    });

    it('should calculate similarity correctly for partial matches', () => {
      // "abc" vs "abc" = 100%
      const perfect = comparePronunciation('abc', 'abc');
      expect(perfect.accuracyScore).toBe(100);

      // "abc" vs "abd" = 2/3 ≈ 67%
      const partial = comparePronunciation('abd', 'abc');
      expect(partial.accuracyScore).toBe(67);
    });

    it('should handle empty strings', () => {
      const result = comparePronunciation('', '');
      expect(result.accuracyScore).toBe(100);
      expect(result.feedback.overall).toContain('Excellent');
    });

    it('should handle completely different strings', () => {
      const result = comparePronunciation('さようなら', 'こんにちは');
      expect(result.accuracyScore).toBeLessThan(50);
      expect(result.feedback.errors.length).toBeGreaterThan(0);
    });

    it('should include expectedRomaji in result when provided', () => {
      const result = comparePronunciation('こんにちは', 'こんにちは', 'konnichiwa');
      expect(result.expectedRomaji).toBe('konnichiwa');
    });

    it('should provide appropriate feedback for score ranges', () => {
      const excellent = comparePronunciation('hello world', 'hello world');
      expect(excellent.accuracyScore).toBe(100);
      expect(excellent.feedback.overall).toContain('Excellent');

      // 91% still excellent (>= 90)
      const excellent2 = comparePronunciation('hello worl', 'hello world');
      expect(excellent2.accuracyScore).toBe(91);
      expect(excellent2.feedback.overall).toContain('Excellent');

      // ~82% is "Great"
      const good = comparePronunciation('hello wor', 'hello world');
      expect(good.accuracyScore).toBeGreaterThanOrEqual(80);
      expect(good.feedback.overall).toContain('Great');

      // ~64% is "Good attempt"
      const okay = comparePronunciation('hello w', 'hello world');
      expect(okay.accuracyScore).toBeGreaterThanOrEqual(60);
      expect(okay.feedback.overall).toContain('Good attempt');

      // 45% -> "Keep practicing" (40-59 range)
      const poor = comparePronunciation('hello', 'hello world');
      expect(poor.accuracyScore).toBe(45);
      expect(poor.feedback.overall).toContain('Keep practicing');

      // 0% -> "Try again" (< 40 range)
      const bad = comparePronunciation('xyz', 'hello world');
      expect(bad.accuracyScore).toBe(0);
      expect(bad.feedback.overall).toContain('Try again');
    });

    it('should suggest breaking into smaller parts for low scores', () => {
      const result = comparePronunciation('a', 'abcdefghij');
      expect(result.accuracyScore).toBeLessThan(60);
      expect(result.feedback.suggestions).toContainEqual(
        expect.stringContaining('smaller parts')
      );
    });

    it('should handle multiple error types in one comparison', () => {
      const result = comparePronunciation('こんにち さようなら', 'こんにちは 元気です');
      
      expect(result.feedback.errors.length).toBeGreaterThan(1);
      expect(result.accuracyScore).toBeLessThan(100);
    });

    it('should handle word-level misalignment', () => {
      // Missing word in the middle
      const result = comparePronunciation('hello world test', 'hello big world test');
      
      expect(result.feedback.errors).toContainEqual(
        expect.objectContaining({
          type: 'omission',
          expected: 'big',
          actual: '',
        })
      );
    });

    it('should handle extra words in actual', () => {
      const result = comparePronunciation('hello big nice world', 'hello world');
      
      expect(result.feedback.errors).toContainEqual(
        expect.objectContaining({
          type: 'insertion',
          actual: 'big',
          expected: '',
        })
      );
    });
  });

  describe('transcribeAudio', () => {
    it('should be defined', () => {
      expect(transcribeAudio).toBeDefined();
      expect(typeof transcribeAudio).toBe('function');
    });
  });
});
