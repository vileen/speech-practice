import { describe, it, expect } from 'vitest';
import { verifyAnswer } from '../../lib/grammarAnswerVerification';

describe('verifyAnswer', () => {
  describe('Exact matches', () => {
    it('should return correct for exact match', () => {
      const result = verifyAnswer('学校に行きます', '学校に行きます');
      expect(result.isCorrect).toBe(true);
      expect(result.similarity).toBe(100);
      expect(result.issues).toEqual([]);
    });

    it('should return correct when punctuation differs', () => {
      const result = verifyAnswer('学校に行きます。', '学校に行きます');
      expect(result.isCorrect).toBe(true);
      expect(result.similarity).toBe(100);
      expect(result.issues).toEqual([]);
    });

    it('should return correct when whitespace differs', () => {
      const result = verifyAnswer('学校 に 行きます', '学校に行きます');
      expect(result.isCorrect).toBe(true);
      expect(result.similarity).toBe(100);
      expect(result.issues).toEqual([]);
    });

    it('should normalize mixed punctuation and whitespace', () => {
      const result = verifyAnswer('  学校に、行きます。  ', '学校に行きます');
      expect(result.isCorrect).toBe(true);
      expect(result.similarity).toBe(100);
    });
  });

  describe('Kanji strictness', () => {
    it('should be wrong when kanji differ', () => {
      const result = verifyAnswer('大学に行きます', '学校に行きます');
      expect(result.isCorrect).toBe(false);
      expect(result.issues).toContain('Kanji mismatch');
      expect(result.similarity).toBe(50);
    });

    it('should be wrong when kanji are missing', () => {
      const result = verifyAnswer('に行きます', '学校に行きます');
      expect(result.isCorrect).toBe(false);
      expect(result.issues).toContain('Kanji mismatch');
    });

    it('should be wrong when extra kanji are present', () => {
      const result = verifyAnswer('大学校に行きます', '学校に行きます');
      expect(result.isCorrect).toBe(false);
      expect(result.issues).toContain('Kanji mismatch');
    });

    it('should be correct when kanji match and kana differs slightly', () => {
      const result = verifyAnswer('学校へ行きます', '学校に行きます');
      expect(result.isCorrect).toBe(true);
      expect(result.issues).toEqual([]);
    });
  });

  describe('Kana leniency', () => {
    it('should accept small kana differences (distance <= 3)', () => {
      const result = verifyAnswer('これは本です', 'この本です');
      expect(result.isCorrect).toBe(true);
      expect(result.issues).toEqual([]);
    });

    it('should accept は/が swaps when similarity is high', () => {
      const result = verifyAnswer('私が学生です', '私は学生です');
      expect(result.isCorrect).toBe(true);
      expect(result.issues).toEqual([]);
    });

    it('should accept です/だ swaps when similarity is high', () => {
      const result = verifyAnswer('学生だ', '学生です');
      expect(result.isCorrect).toBe(true);
      expect(result.issues).toEqual([]);
    });

    it('should reject answers with too many differences', () => {
      // Same kanji but wildly different kana
      const result = verifyAnswer('学校に行ってきました', '学校に行きます');
      expect(result.isCorrect).toBe(false);
      expect(result.issues.some(i => i.includes('Too many differences'))).toBe(true);
    });

    it('should calculate similarity correctly for partial matches', () => {
      const result = verifyAnswer('学校に行きます', '学校に行きまし');
      expect(result.isCorrect).toBe(true); // distance is 1
      expect(result.similarity).toBeGreaterThanOrEqual(85);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty strings', () => {
      const result = verifyAnswer('', '');
      expect(result.isCorrect).toBe(true);
      expect(result.similarity).toBe(100);
    });

    it('should handle strings with only punctuation', () => {
      const result = verifyAnswer('。、！', '。');
      expect(result.isCorrect).toBe(true);
      expect(result.similarity).toBe(100);
    });

    it('should handle kana-only answers', () => {
      const result = verifyAnswer('ありがとうございます', 'ありがとう');
      // No kanji, so kanji check passes; then levenshtein decides
      expect(result.isCorrect).toBe(false);
      expect(result.issues.some(i => i.includes('Too many differences'))).toBe(true);
    });

    it('should handle romaji mixed with japanese', () => {
      const result = verifyAnswer('hello学校', '学校');
      expect(result.isCorrect).toBe(false);
    });
  });

  describe('Similarity threshold (85%)', () => {
    it('should accept answers at exactly 85% similarity', () => {
      // 13 chars with 2 differences = ~85% similarity
      const result = verifyAnswer('私は学生ですか', '私は学生です');
      expect(result.similarity).toBeGreaterThanOrEqual(85);
      expect(result.isCorrect).toBe(true);
    });

    it('should reject answers below 85% similarity with distance > 3', () => {
      const result = verifyAnswer('これはとても長い文章です', '学校に行きます');
      expect(result.isCorrect).toBe(false);
      expect(result.similarity).toBeLessThan(85);
    });
  });
});
