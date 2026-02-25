import { describe, it, expect } from 'vitest';
import { translateLessonTitle } from '../../translations.js';

describe('translateLessonTitle', () => {
  it('should translate Polish lesson titles to English', () => {
    expect(translateLessonTitle('Lekcja 2025-10-22 — Partykuły wa, ga, no, o'))
      .toBe('Lesson 2025-10-22 — Particles wa, ga, no, o');
  });

  it('should return original if no translation found', () => {
    expect(translateLessonTitle('Unknown Topic'))
      .toBe('Unknown Topic');
  });

  it('should handle empty string', () => {
    expect(translateLessonTitle(''))
      .toBe('');
  });
});
