import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAnswerChecker } from '../../hooks/useAnswerChecker';

describe('useAnswerChecker', () => {
  it('normalize strips punctuation and whitespace', () => {
    const { result } = renderHook(() => useAnswerChecker());
    expect(result.current.normalize('  食べて。  ')).toBe('食べて');
    expect(result.current.normalize('行きました！')).toBe('行きました');
    expect(result.current.normalize('話さない')).toBe('話さない');
  });

  it('normalize removes Japanese punctuation', () => {
    const { result } = renderHook(() => useAnswerChecker());
    expect(result.current.normalize('食べて。')).toBe('食べて');
    expect(result.current.normalize('行きました、')).toBe('行きました');
  });

  it('levenshtein distance for identical strings is 0', () => {
    const { result } = renderHook(() => useAnswerChecker());
    expect(result.current.levenshtein('食べる', '食べる')).toBe(0);
  });

  it('levenshtein distance for one character difference is 1', () => {
    const { result } = renderHook(() => useAnswerChecker());
    expect(result.current.levenshtein('食べる', '食べる')).toBe(0);
    expect(result.current.levenshtein('食べる', '食べた')).toBe(1);
  });

  it('levenshtein distance for different length strings', () => {
    const { result } = renderHook(() => useAnswerChecker());
    expect(result.current.levenshtein('食べ', '食べる')).toBe(1);
    expect(result.current.levenshtein('食べる', '食べ')).toBe(1);
  });

  it('checkAnswer returns exact match as correct', () => {
    const { result } = renderHook(() => useAnswerChecker());
    const answer = result.current.checkAnswer('食べる', '食べる');
    expect(answer.isCorrect).toBe(true);
    expect(answer.distance).toBe(0);
    expect(answer.similarity).toBe(100);
  });

  it('checkAnswer returns fuzzy match as correct for small differences', () => {
    const { result } = renderHook(() => useAnswerChecker());
    const answer = result.current.checkAnswer('食べる', '食べ');
    expect(answer.isCorrect).toBe(true); // distance=1 <= 2
  });

  it('checkAnswer returns wrong answer as incorrect', () => {
    const { result } = renderHook(() => useAnswerChecker());
    const answer = result.current.checkAnswer('飲む', '食べる');
    expect(answer.isCorrect).toBe(false);
    expect(answer.distance).toBeGreaterThan(2);
  });
});
