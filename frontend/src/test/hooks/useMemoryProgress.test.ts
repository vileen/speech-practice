import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useMemoryProgress, MemoryCard } from '../../hooks/useMemoryProgress';

const STORAGE_KEY = 'speech-practice-memory-progress';

describe('useMemoryProgress', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    vi.mocked(localStorage.getItem).mockReturnValue(null);
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

  describe('Add Card', () => {
    it('should add a new card and return it', () => {
      const { result } = renderHook(() => useMemoryProgress());

      let addedCard: MemoryCard | undefined;
      act(() => {
        addedCard = result.current.addCard({
          id: 'test-1',
          type: 'vocabulary',
          lessonId: 'lesson-1',
          jp: '学校',
          en: 'school',
          reading: 'がっこう',
          romaji: 'gakkou',
        });
      });

      expect(result.current.cards).toHaveLength(1);
      expect(addedCard!.phraseId).toBe('test-1');
      expect(addedCard!.phraseType).toBe('vocabulary');
      expect(addedCard!.jp).toBe('学校');
      expect(addedCard!.state).toBe('new');
    });

    it('should return existing card without duplicating', () => {
      const { result } = renderHook(() => useMemoryProgress());

      act(() => {
        result.current.addCard({
          id: 'test-1',
          type: 'vocabulary',
          lessonId: 'lesson-1',
          jp: '学校',
          en: 'school',
        });
      });

      let secondAdd: MemoryCard | undefined;
      act(() => {
        secondAdd = result.current.addCard({
          id: 'test-1',
          type: 'vocabulary',
          lessonId: 'lesson-1',
          jp: '学校',
          en: 'school',
        });
      });

      expect(result.current.cards).toHaveLength(1);
      expect(secondAdd!.phraseId).toBe('test-1');
    });
  });

  describe('Review', () => {
    it('should review a card and update its state', () => {
      const { result } = renderHook(() => useMemoryProgress());

      act(() => {
        result.current.addCard({
          id: 'test-review',
          type: 'vocabulary',
          lessonId: 'lesson-1',
          jp: '猫',
          en: 'cat',
        });
      });

      act(() => {
        result.current.review('test-review', 'good');
      });

      const reviewedCard = result.current.cards.find(c => c.phraseId === 'test-review');
      expect(reviewedCard).toBeDefined();
      expect(reviewedCard!.reps).toBe(1);
      expect(reviewedCard!.state).toBe('review');
      expect(reviewedCard!.lastReview).toBeDefined();
    });

    it('should handle "again" rating and put card in relearning', () => {
      const { result } = renderHook(() => useMemoryProgress());

      act(() => {
        result.current.addCard({
          id: 'test-again',
          type: 'vocabulary',
          lessonId: 'lesson-1',
          jp: '犬',
          en: 'dog',
        });
      });

      act(() => {
        result.current.review('test-again', 'again');
      });

      const reviewedCard = result.current.cards.find(c => c.phraseId === 'test-again');
      expect(reviewedCard!.state).toBe('relearning');
      expect(reviewedCard!.lapses).toBe(1);
    });

    it('should not affect other cards when reviewing one', () => {
      const { result } = renderHook(() => useMemoryProgress());

      act(() => {
        result.current.addCard({ id: 'card-a', type: 'vocabulary', lessonId: 'lesson-1', jp: 'A', en: 'a' });
        result.current.addCard({ id: 'card-b', type: 'vocabulary', lessonId: 'lesson-1', jp: 'B', en: 'b' });
      });

      const beforeReview = result.current.cards.find(c => c.phraseId === 'card-b')!;
      
      act(() => {
        result.current.review('card-a', 'good');
      });

      const afterReview = result.current.cards.find(c => c.phraseId === 'card-b')!;
      expect(afterReview.reps).toBe(beforeReview.reps);
      expect(afterReview.state).toBe(beforeReview.state);
    });
  });

  describe('Get Preview', () => {
    it('should return interval preview for a card', () => {
      const { result } = renderHook(() => useMemoryProgress());

      act(() => {
        result.current.addCard({
          id: 'test-preview',
          type: 'vocabulary',
          lessonId: 'lesson-1',
          jp: '本',
          en: 'book',
        });
      });

      const preview = result.current.getPreview('test-preview', 'good');
      expect(preview).toBeGreaterThan(0);
    });

    it('should return 0 for non-existent card', () => {
      const { result } = renderHook(() => useMemoryProgress());
      const preview = result.current.getPreview('nonexistent', 'good');
      expect(preview).toBe(0);
    });
  });

  describe('Get Next Card with Filtering', () => {
    it('should return null when no cards match lesson filter', () => {
      const { result } = renderHook(() => useMemoryProgress());

      act(() => {
        result.current.addCard({
          id: 'card-1',
          type: 'vocabulary',
          lessonId: 'lesson-a',
          jp: 'A',
          en: 'a',
        });
      });

      const next = result.current.getNextCard(['lesson-b']);
      expect(next).toBeNull();
    });

    it('should return matching card when lesson filter matches', () => {
      const { result } = renderHook(() => useMemoryProgress());

      act(() => {
        result.current.addCard({
          id: 'card-1',
          type: 'vocabulary',
          lessonId: 'lesson-a',
          jp: 'A',
          en: 'a',
        });
      });

      const next = result.current.getNextCard(['lesson-a']);
      expect(next).not.toBeNull();
      expect(next!.phraseId).toBe('card-1');
    });
  });

  describe('Get Stats with Filtering', () => {
    it('should filter stats by lesson IDs', () => {
      const { result } = renderHook(() => useMemoryProgress());

      act(() => {
        result.current.addCard({ id: 'c1', type: 'vocabulary', lessonId: 'lesson-a', jp: 'A', en: 'a' });
        result.current.addCard({ id: 'c2', type: 'vocabulary', lessonId: 'lesson-b', jp: 'B', en: 'b' });
      });

      const stats = result.current.getStats(['lesson-a']);
      expect(stats.total).toBe(1);
    });
  });

  describe('LocalStorage Persistence', () => {
    it('should load cards from localStorage on mount', () => {
      const mockCard: MemoryCard = {
        phraseId: 'lesson-1-vocab-0',
        phraseType: 'vocabulary',
        lessonId: '1',
        jp: '学校',
        en: 'school',
        reading: 'がっこう',
        romaji: 'gakkou',
        due: new Date('2024-01-15'),
        state: 'review',
        reps: 3,
        lapses: 0,
        elapsedDays: 2,
        scheduledDays: 4,
        difficulty: 3.5,
        stability: 5.2,
        lastReview: new Date('2024-01-13'),
      };

      vi.mocked(localStorage.getItem).mockImplementation((key: string) => {
        if (key === STORAGE_KEY) {
          return JSON.stringify({
            cards: [mockCard],
            lastSynced: new Date().toISOString(),
          });
        }
        return null;
      });

      const { result } = renderHook(() => useMemoryProgress());

      expect(result.current.cards).toHaveLength(1);
      expect(result.current.cards[0].phraseId).toBe('lesson-1-vocab-0');
      expect(result.current.cards[0].due).toBeInstanceOf(Date);
      expect(result.current.stats.total).toBe(1);
    });

    it('should handle corrupted localStorage gracefully', () => {
      vi.mocked(localStorage.getItem).mockImplementation((key: string) => {
        if (key === STORAGE_KEY) return 'not valid json';
        return null;
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const { result } = renderHook(() => useMemoryProgress());

      expect(result.current.cards).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to load memory progress:',
        expect.any(SyntaxError)
      );
      consoleSpy.mockRestore();
    });

    it('should persist cards to localStorage after changes', () => {
      vi.mocked(localStorage.getItem).mockReturnValue(null);

      const { result } = renderHook(() => useMemoryProgress());

      act(() => {
        result.current.addCard({
          id: 'persist-test',
          type: 'vocabulary',
          lessonId: 'lesson-1',
          jp: '水',
          en: 'water',
        });
      });

      expect(localStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEY,
        expect.stringContaining('persist-test')
      );

      // Get the last setItem call for this key (after addCard, not initial empty state)
      const setItemCalls = vi.mocked(localStorage.setItem).mock.calls.filter(
        call => call[0] === STORAGE_KEY
      );
      expect(setItemCalls.length).toBeGreaterThanOrEqual(1);
      const lastCall = setItemCalls[setItemCalls.length - 1];
      const saved = JSON.parse(lastCall[1]);
      expect(saved.cards).toHaveLength(1);
      expect(saved.cards[0].phraseId).toBe('persist-test');
      expect(saved.lastSynced).toBeDefined();
    });
  });

  describe('Import Unique Vocabulary', () => {
    it('should fetch and import unique vocabulary', async () => {
      const mockResponse = {
        vocabulary: [
          { jp: '新しい', en: 'new', reading: 'あたらしい', romaji: 'atarashii' },
        ],
        totalVocab: 10,
        uniqueVocab: 1,
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const { result } = renderHook(() => useMemoryProgress());

      let importResult: any;
      await act(async () => {
        importResult = await result.current.importUniqueVocabulary('lesson-5');
      });

      expect(importResult.imported).toBe(1);
      expect(importResult.total).toBe(10);
      expect(importResult.unique).toBe(1);
      expect(result.current.cards).toHaveLength(1);
      expect(result.current.cards[0].jp).toBe('新しい');
    });

    it('should not duplicate cards when importing unique vocabulary', async () => {
      const mockResponse = {
        vocabulary: [
          { jp: '水', en: 'water', reading: 'みず', romaji: 'mizu' },
        ],
        totalVocab: 5,
        uniqueVocab: 1,
      };

      // Pre-add the card with the exact ID that importUniqueVocabulary will generate
      const { result } = renderHook(() => useMemoryProgress());
      act(() => {
        result.current.addCard({
          id: 'lesson-5-vocab-0',
          type: 'vocabulary',
          lessonId: '5',
          jp: '水',
          en: 'water',
        });
      });

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      let importResult: any;
      await act(async () => {
        importResult = await result.current.importUniqueVocabulary('5');
      });

      expect(importResult.imported).toBe(0);
      expect(result.current.cards).toHaveLength(1);
    });

    it('should throw when API returns error', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      } as Response);

      const { result } = renderHook(() => useMemoryProgress());

      await expect(
        act(async () => {
          await result.current.importUniqueVocabulary('lesson-1');
        })
      ).rejects.toThrow('Failed to fetch unique vocabulary');
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
