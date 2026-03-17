import { describe, it, expect, beforeAll } from 'vitest';
import { getLesson } from '../../services/lessons.js';

// Check if database is available
let dbAvailable = false;

describe('getLesson', () => {
  beforeAll(async () => {
    try {
      // Try to fetch a lesson to check DB connectivity
      await getLesson('2026-03-16');
      dbAvailable = true;
    } catch (err: any) {
      if (err.message?.includes('ECONNREFUSED') || err.message?.includes('database')) {
        dbAvailable = false;
        console.log('⚠️ Database not available, skipping integration tests');
      } else {
        dbAvailable = true;
      }
    }
  });

  it('should convert string practice_phrases to objects with jp field', async () => {
    if (!dbAvailable) {
      console.log('⏭️ Skipping test - database not available');
      return;
    }
    
    const lesson = await getLesson('2026-03-16');
    
    expect(lesson).toBeDefined();
    expect(lesson!.phrases).toBeDefined();
    expect(lesson!.phrases!.length).toBeGreaterThan(0);
    
    // Check that phrases are objects with jp field, not strings
    const firstPhrase = lesson!.phrases![0];
    expect(typeof firstPhrase).toBe('object');
    expect(firstPhrase.jp).toBeDefined();
    expect(typeof firstPhrase.jp).toBe('string');
    expect(firstPhrase.romaji).toBeDefined();
  });

  it('should return phrases compatible with LessonMode', async () => {
    if (!dbAvailable) {
      console.log('⏭️ Skipping test - database not available');
      return;
    }
    
    const lesson = await getLesson('2026-03-16');
    
    // LessonMode expects phrases array with objects containing japanese field
    // or it maps jp to japanese
    expect(Array.isArray(lesson!.phrases)).toBe(true);
    
    // Each phrase should have required fields
    lesson!.phrases!.forEach((phrase: any) => {
      expect(phrase.jp).toBeDefined();
    });
  });
});
