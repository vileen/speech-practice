import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useMemoryProgress, MemoryCard } from '../../hooks/useMemoryProgress';

const STORAGE_KEY = 'speech-practice-memory-progress';

describe('useMemoryProgress', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with empty cards', () => {
      const { result } = renderHook(() => useMemoryProgress());
      
      expect(result.current.cards).toEqual([]);
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('Stats', () => {
    it('should calculate stats correctly', () => {
      const { result } = renderHook(() => useMemoryProgress());
      
      expect(result.current.stats).toEqual({
        total: 0,
        new: 0,
        learning: 0,
        review: 0,
        relearning: 0,
        due: 0,
      });
    });
  });

  describe('Import from Lesson', () => {
    const mockLesson = {
      id: 1,
      vocabulary: [
        { jp: '学校', en: 'school', reading: 'がっこう', romaji: 'gakkou' },
        { jp: '猫', en: 'cat', reading: 'ねこ', romaji: 'neko' },
      ],
      grammar: [
        {
          pattern: '〜てください',
          explanation: 'Please do',
          examples: [{ jp: '見てください', en: 'Please look' }],
        },
      ],
    };

    it('should import vocabulary cards', () => {
      const { result } = renderHook(() => useMemoryProgress());
      
      act(() => {
        const count = result.current.importFromLesson(mockLesson);
        expect(count).toBe(3); // 2 vocab + 1 grammar
      });

      expect(result.current.cards).toHaveLength(3);
      expect(result.current.stats.total).toBe(3);
    });

    it('should not duplicate cards on reimport', () => {
      const { result } = renderHook(() => useMemoryProgress());
      
      act(() => {
        result.current.importFromLesson(mockLesson);
      });

      act(() => {
        result.current.importFromLesson(mockLesson);
      });

      expect(result.current.cards).toHaveLength(3);
    });

    it('should handle lesson without vocabulary', () => {
      const lessonNoVocab = {
        id: 2,
        vocabulary: undefined,
        grammar: [],
      };

      const { result } = renderHook(() => useMemoryProgress());
      
      act(() => {
        const count = result.current.importFromLesson(lessonNoVocab);
        expect(count).toBe(0);
      });
    });

    it('should handle empty lesson', () => {
      const emptyLesson = {
        id: 3,
        vocabulary: [],
        grammar: [],
      };

      const { result } = renderHook(() => useMemoryProgress());
      
      act(() => {
        const count = result.current.importFromLesson(emptyLesson);
        expect(count).toBe(0);
      });
    });
  });

  describe('Get Next Card', () => {
    it('should return null when no cards', () => {
      const { result } = renderHook(() => useMemoryProgress());
      
      const nextCard = result.current.getNextCard();
      expect(nextCard).toBeNull();
    });
  });

  describe('Reset Progress', () => {
    it('should clear all progress', () => {
      const mockCard: MemoryCard = {
        phraseId: 'lesson-1-vocab-0',
        phraseType: 'vocabulary',
        lessonId: 1,
        jp: '学校',
        en: 'school',
        reading: 'がっこう',
        romaji: 'gakkou',
        due: new Date(),
        state: 'new',
        reps: 0,
        lapses: 0,
        elapsedDays: 0,
        scheduledDays: 0,
        difficulty: 0,
        stability: 0,
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        cards: [mockCard],
        lastSynced: new Date().toISOString(),
      }));

      const { result } = renderHook(() => useMemoryProgress());
      
      act(() => {
        result.current.resetProgress();
      });

      expect(result.current.cards).toHaveLength(0);
      expect(result.current.stats.total).toBe(0);
      // localStorage is cleared by resetProgress
    });
  });
});
