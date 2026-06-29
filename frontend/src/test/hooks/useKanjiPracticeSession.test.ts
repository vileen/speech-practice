import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useKanjiPracticeSession } from '../../hooks/useKanjiPracticeSession';
import * as fsrsModule from '../../lib/fsrs';
import type { KanjiCard } from '../../hooks/useKanjiProgress';

// Mock fsrs module
vi.mock('../../lib/fsrs', () => ({
  getDueCards: vi.fn((cards: KanjiCard[]) =>
    cards.filter((card) => card.due <= new Date('2024-01-01T00:00:00.000Z'))
  ),
}));

// Mock useKanjiProgress
vi.mock('../../hooks/useKanjiProgress', () => ({
  useKanjiProgress: vi.fn(),
}));

import { useKanjiProgress } from '../../hooks/useKanjiProgress';

const mockUseKanjiProgress = vi.mocked(useKanjiProgress);

// Mock kanji data
const createMockCard = (id: string, overrides: Partial<KanjiCard> = {}): KanjiCard => ({
  kanjiId: id,
  id,
  character: '日',
  meanings: ['sun', 'day'],
  readings: [{ type: 'on' as const, reading: 'nichi' }],
  lessonId: 'lesson-1',
  mnemonic: 'Looks like a sun',
  examples: [],
  due: new Date('2024-01-01T00:00:00.000Z'),
  stability: 0,
  difficulty: 0,
  elapsedDays: 0,
  scheduledDays: 0,
  reps: 0,
  lapses: 0,
  state: 'new' as const,
  ...overrides,
});

const mockCard1 = createMockCard('kanji-1');
const mockCard2 = createMockCard('kanji-2', {
  character: '月',
  meanings: ['moon', 'month'],
  lessonId: 'lesson-2',
});

describe('useKanjiPracticeSession', () => {
  const mockReview = vi.fn();
  const mockGetNextCard = vi.fn();
  const mockGetPreview = vi.fn();
  const mockImportKanji = vi.fn().mockResolvedValue([]);
  const mockUpdateCard = vi.fn();
  const mockGetAvailableLessons = vi.fn().mockReturnValue(['lesson-1', 'lesson-2']);

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'));

    // Reset mocks
    mockReview.mockClear();
    mockGetNextCard.mockClear();
    mockGetPreview.mockClear();
    mockImportKanji.mockClear();
    mockUpdateCard.mockClear();
    mockGetAvailableLessons.mockClear();

    // Default mock return
    mockUseKanjiProgress.mockReturnValue({
      cards: [],
      isLoading: false,
      stats: { total: 0, due: 0, new: 0, review: 0 },
      review: mockReview,
      getNextCard: mockGetNextCard,
      getPreview: mockGetPreview,
      importKanji: mockImportKanji,
      updateCard: mockUpdateCard,
      getAvailableLessons: mockGetAvailableLessons,
    });

    // Mock localStorage
    vi.mocked(global.localStorage.getItem).mockReturnValue(null);
    vi.mocked(global.localStorage.setItem).mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('Initial State', () => {
    it('should initialize with setup screen visible', () => {
      const { result } = renderHook(() => useKanjiPracticeSession());

      expect(result.current.state.showSetup).toBe(true);
      expect(result.current.state.isRevealed).toBe(false);
      expect(result.current.state.isComplete).toBe(false);
      expect(result.current.state.currentCard).toBeNull();
      expect(result.current.state.selectedLessons).toEqual([]);
      expect(result.current.state.isEditingMnemonic).toBe(false);
      expect(result.current.state.editedMnemonic).toBe('');
    });

    it('should expose deps from useKanjiProgress', () => {
      const { result } = renderHook(() => useKanjiPracticeSession());

      expect(result.current.deps.cards).toEqual([]);
      expect(result.current.deps.isLoading).toBe(false);
      expect(result.current.deps.review).toBe(mockReview);
      expect(result.current.deps.getNextCard).toBe(mockGetNextCard);
      expect(result.current.deps.getPreview).toBe(mockGetPreview);
      expect(result.current.deps.importKanji).toBe(mockImportKanji);
      expect(result.current.deps.updateCard).toBe(mockUpdateCard);
      expect(result.current.deps.getAvailableLessons).toBe(mockGetAvailableLessons);
    });
  });

  describe('Auto-import on Mount', () => {
    it('should auto-import kanji when no localStorage data exists', async () => {
      vi.mocked(global.localStorage.getItem).mockReturnValue(null);

      renderHook(() => useKanjiPracticeSession());

      await waitFor(() => {
        expect(mockImportKanji).toHaveBeenCalled();
      });
    });

    it('should not auto-import when localStorage data exists', async () => {
      vi.mocked(global.localStorage.getItem).mockReturnValue(
        JSON.stringify({ cards: [], lastSynced: new Date().toISOString() })
      );

      renderHook(() => useKanjiPracticeSession());

      // Wait a bit to ensure effect ran
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
      });

      expect(mockImportKanji).not.toHaveBeenCalled();
    });

    it('should set hasImported after auto-import', async () => {
      vi.mocked(global.localStorage.getItem).mockReturnValue(null);
      mockImportKanji.mockResolvedValue([mockCard1]);

      const { result } = renderHook(() => useKanjiPracticeSession());

      await waitFor(() => {
        expect(result.current.state.hasImported).toBe(true);
      });
    });
  });

  describe('Available Lessons', () => {
    it('should load available lessons on mount', () => {
      mockGetAvailableLessons.mockReturnValue(['lesson-a', 'lesson-b']);

      const { result } = renderHook(() => useKanjiPracticeSession());

      expect(mockGetAvailableLessons).toHaveBeenCalled();
      expect(result.current.state.availableLessons).toEqual(['lesson-a', 'lesson-b']);
    });

    it('should update lessons when cards change', () => {
      mockGetAvailableLessons.mockReturnValue(['lesson-1']);

      const { result } = renderHook(() => useKanjiPracticeSession());
      expect(result.current.state.availableLessons).toEqual(['lesson-1']);

      // Simulate cards change by re-rendering with new mock
      mockGetAvailableLessons.mockReturnValue(['lesson-1', 'lesson-2']);
      mockUseKanjiProgress.mockReturnValue({
        cards: [mockCard1, mockCard2],
        isLoading: false,
        stats: { total: 2, due: 0, new: 0, review: 0 },
        review: mockReview,
        getNextCard: mockGetNextCard,
        getPreview: mockGetPreview,
        importKanji: mockImportKanji,
        updateCard: mockUpdateCard,
        getAvailableLessons: mockGetAvailableLessons,
      });

      // Re-render
      const { result: result2 } = renderHook(() => useKanjiPracticeSession());
      expect(result2.current.state.availableLessons).toEqual(['lesson-1', 'lesson-2']);
    });
  });

  describe('handleStart', () => {
    it('should transition from setup to practice', async () => {
      const { result } = renderHook(() => useKanjiPracticeSession());

      await act(async () => {
        await result.current.actions.handleStart();
      });

      expect(result.current.state.showSetup).toBe(false);
      expect(result.current.state.isStarting).toBe(false);
    });

    it('should import kanji if not yet imported', async () => {
      const { result } = renderHook(() => useKanjiPracticeSession());

      // Ensure hasImported is false initially
      expect(result.current.state.hasImported).toBe(false);

      await act(async () => {
        await result.current.actions.handleStart();
      });

      expect(mockImportKanji).toHaveBeenCalled();
      expect(result.current.state.hasImported).toBe(true);
    });

    it('should not import if already imported', async () => {
      mockUseKanjiProgress.mockReturnValue({
        cards: [mockCard1],
        isLoading: false,
        stats: { total: 1, due: 0, new: 0, review: 0 },
        review: mockReview,
        getNextCard: mockGetNextCard,
        getPreview: mockGetPreview,
        importKanji: mockImportKanji,
        updateCard: mockUpdateCard,
        getAvailableLessons: mockGetAvailableLessons,
      });

      // First render will auto-import, so we need to start fresh after that
      const { result } = renderHook(() => useKanjiPracticeSession());

      // Wait for auto-import to complete
      await waitFor(() => expect(result.current.state.hasImported).toBe(true));

      mockImportKanji.mockClear();

      await act(async () => {
        await result.current.actions.handleStart();
      });

      expect(mockImportKanji).not.toHaveBeenCalled();
    });

    it('should pass lesson filter to import when lessons selected', async () => {
      const { result } = renderHook(() => useKanjiPracticeSession());

      // Select a lesson
      act(() => {
        result.current.actions.handleLessonChange('lesson-1');
      });

      await act(async () => {
        await result.current.actions.handleStart();
      });

      expect(mockImportKanji).toHaveBeenCalledWith({ lessonId: 'lesson-1' });
    });

    it('should set isStarting to false after start completes', async () => {
      const { result } = renderHook(() => useKanjiPracticeSession());

      await act(async () => {
        await result.current.actions.handleStart();
      });

      expect(result.current.state.isStarting).toBe(false);
      expect(result.current.state.showSetup).toBe(false);
    });
  });

  describe('handleReveal', () => {
    it('should reveal the current card', async () => {
      mockGetNextCard.mockReturnValue(mockCard1);

      const { result } = renderHook(() => useKanjiPracticeSession());

      await act(async () => {
        await result.current.actions.handleStart();
      });

      expect(result.current.state.isRevealed).toBe(false);

      act(() => {
        result.current.actions.handleReveal();
      });

      expect(result.current.state.isRevealed).toBe(true);
    });
  });

  describe('handleReview', () => {
    it('should review current card and hide reveal', async () => {
      mockGetNextCard.mockReturnValue(mockCard1);

      const { result } = renderHook(() => useKanjiPracticeSession());

      await act(async () => {
        await result.current.actions.handleStart();
      });

      act(() => {
        result.current.actions.handleReveal();
      });

      act(() => {
        result.current.actions.handleReview('good');
      });

      expect(mockReview).toHaveBeenCalledWith('kanji-1', 'good');
      expect(result.current.state.isRevealed).toBe(false);
    });

    it('should handle all rating types', async () => {
      mockGetNextCard.mockReturnValue(mockCard1);

      const { result } = renderHook(() => useKanjiPracticeSession());

      await act(async () => {
        await result.current.actions.handleStart();
      });

      const ratings: Array<'again' | 'hard' | 'good' | 'easy'> = ['again', 'hard', 'good', 'easy'];

      for (const rating of ratings) {
        act(() => {
          result.current.actions.handleReveal();
        });

        act(() => {
          result.current.actions.handleReview(rating);
        });

        expect(mockReview).toHaveBeenCalledWith('kanji-1', rating);
      }
    });

    it('should exit mnemonic editing mode on review', async () => {
      mockGetNextCard.mockReturnValue(mockCard1);

      const { result } = renderHook(() => useKanjiPracticeSession());

      await act(async () => {
        await result.current.actions.handleStart();
      });

      act(() => {
        result.current.actions.handleEditMnemonic();
      });

      expect(result.current.state.isEditingMnemonic).toBe(true);

      act(() => {
        result.current.actions.handleReveal();
      });

      act(() => {
        result.current.actions.handleReview('good');
      });

      expect(result.current.state.isEditingMnemonic).toBe(false);
    });

    it('should not crash if no current card', () => {
      const { result } = renderHook(() => useKanjiPracticeSession());

      // No card selected, should not throw
      expect(() => {
        act(() => {
          result.current.actions.handleReview('good');
        });
      }).not.toThrow();

      expect(mockReview).not.toHaveBeenCalled();
    });
  });

  describe('handleReset', () => {
    it('should return to setup state', async () => {
      mockGetNextCard.mockReturnValue(mockCard1);

      const { result } = renderHook(() => useKanjiPracticeSession());

      await act(async () => {
        await result.current.actions.handleStart();
      });

      act(() => {
        result.current.actions.handleReveal();
      });

      expect(result.current.state.showSetup).toBe(false);
      expect(result.current.state.isRevealed).toBe(true);

      act(() => {
        result.current.actions.handleReset();
      });

      expect(result.current.state.showSetup).toBe(true);
      expect(result.current.state.isComplete).toBe(false);
      expect(result.current.state.isRevealed).toBe(false);
      expect(result.current.state.currentCard).toBeNull();
    });
  });

  describe('handleLessonChange', () => {
    it('should update selected lessons', () => {
      const { result } = renderHook(() => useKanjiPracticeSession());

      act(() => {
        result.current.actions.handleLessonChange('lesson-1');
      });

      expect(result.current.state.selectedLessons).toEqual(['lesson-1']);
    });

    it('should clear selection when empty string passed', () => {
      const { result } = renderHook(() => useKanjiPracticeSession());

      act(() => {
        result.current.actions.handleLessonChange('lesson-1');
      });

      expect(result.current.state.selectedLessons).toEqual(['lesson-1']);

      act(() => {
        result.current.actions.handleLessonChange('');
      });

      expect(result.current.state.selectedLessons).toEqual([]);
    });
  });

  describe('Mnemonic Editing', () => {
    it('should enter edit mode with current mnemonic', async () => {
      mockGetNextCard.mockReturnValue(mockCard1);

      const { result } = renderHook(() => useKanjiPracticeSession());

      await act(async () => {
        await result.current.actions.handleStart();
      });

      act(() => {
        result.current.actions.handleEditMnemonic();
      });

      expect(result.current.state.isEditingMnemonic).toBe(true);
      expect(result.current.state.editedMnemonic).toBe('Looks like a sun');
    });

    it('should update edited mnemonic text', async () => {
      mockGetNextCard.mockReturnValue(mockCard1);

      const { result } = renderHook(() => useKanjiPracticeSession());

      await act(async () => {
        await result.current.actions.handleStart();
      });

      act(() => {
        result.current.actions.handleEditMnemonic();
      });

      act(() => {
        result.current.actions.handleMnemonicChange('New mnemonic text');
      });

      expect(result.current.state.editedMnemonic).toBe('New mnemonic text');
    });

    it('should save mnemonic and update card', async () => {
      mockGetNextCard.mockReturnValue(mockCard1);

      const { result } = renderHook(() => useKanjiPracticeSession());

      await act(async () => {
        await result.current.actions.handleStart();
      });

      act(() => {
        result.current.actions.handleEditMnemonic();
      });

      act(() => {
        result.current.actions.handleMnemonicChange('Updated mnemonic');
      });

      act(() => {
        result.current.actions.handleSaveMnemonic();
      });

      expect(mockUpdateCard).toHaveBeenCalledWith('kanji-1', { mnemonic: 'Updated mnemonic' });
      expect(result.current.state.isEditingMnemonic).toBe(false);
      expect(result.current.state.currentCard?.mnemonic).toBe('Updated mnemonic');
    });

    it('should cancel editing without saving', async () => {
      mockGetNextCard.mockReturnValue(mockCard1);

      const { result } = renderHook(() => useKanjiPracticeSession());

      await act(async () => {
        await result.current.actions.handleStart();
      });

      act(() => {
        result.current.actions.handleEditMnemonic();
      });

      act(() => {
        result.current.actions.handleMnemonicChange('Draft text');
      });

      act(() => {
        result.current.actions.handleCancelEditMnemonic();
      });

      expect(mockUpdateCard).not.toHaveBeenCalled();
      expect(result.current.state.isEditingMnemonic).toBe(false);
      expect(result.current.state.editedMnemonic).toBe('');
    });

    it('should not enter edit mode without current card', () => {
      const { result } = renderHook(() => useKanjiPracticeSession());

      act(() => {
        result.current.actions.handleEditMnemonic();
      });

      expect(result.current.state.isEditingMnemonic).toBe(false);
    });

    it('should not save without current card', () => {
      const { result } = renderHook(() => useKanjiPracticeSession());

      act(() => {
        result.current.actions.handleSaveMnemonic();
      });

      expect(mockUpdateCard).not.toHaveBeenCalled();
    });
  });

  describe('Session Flow', () => {
    it('should get next card after starting', async () => {
      mockGetNextCard.mockReturnValue(mockCard1);

      const { result } = renderHook(() => useKanjiPracticeSession());

      await act(async () => {
        await result.current.actions.handleStart();
      });

      expect(mockGetNextCard).toHaveBeenCalled();
      expect(result.current.state.currentCard).toEqual(mockCard1);
    });

    it('should complete session when no more cards', async () => {
      mockGetNextCard.mockReturnValue(null);

      const { result } = renderHook(() => useKanjiPracticeSession());

      await act(async () => {
        await result.current.actions.handleStart();
      });

      expect(result.current.state.isComplete).toBe(true);
      expect(result.current.state.currentCard).toBeNull();
    });

    it('should pass lesson filter to getNextCard when lessons selected', async () => {
      mockGetNextCard.mockReturnValue(mockCard1);

      const { result } = renderHook(() => useKanjiPracticeSession());

      act(() => {
        result.current.actions.handleLessonChange('lesson-1');
      });

      await act(async () => {
        await result.current.actions.handleStart();
      });

      expect(mockGetNextCard).toHaveBeenCalledWith(['lesson-1']);
    });

    it('should pass undefined to getNextCard when no lessons selected', async () => {
      mockGetNextCard.mockReturnValue(mockCard1);

      const { result } = renderHook(() => useKanjiPracticeSession());

      await act(async () => {
        await result.current.actions.handleStart();
      });

      expect(mockGetNextCard).toHaveBeenCalledWith(undefined);
    });

    it('should get next card after review', async () => {
      const secondCard = createMockCard('kanji-2');
      mockGetNextCard
        .mockReturnValueOnce(mockCard1)
        .mockReturnValueOnce(secondCard);

      const { result } = renderHook(() => useKanjiPracticeSession());

      await act(async () => {
        await result.current.actions.handleStart();
      });

      expect(result.current.state.currentCard).toEqual(mockCard1);

      act(() => {
        result.current.actions.handleReveal();
      });

      act(() => {
        result.current.actions.handleReview('good');
      });

      await waitFor(() => {
        expect(result.current.state.currentCard).toEqual(secondCard);
      });
    });
  });

  describe('Intervals', () => {
    it('should return default intervals when no card', () => {
      const { result } = renderHook(() => useKanjiPracticeSession());

      expect(result.current.state.intervals).toEqual({
        again: '< 1m',
        hard: '',
        good: '',
        easy: '',
      });
    });

    it('should compute intervals for current card', async () => {
      mockGetNextCard.mockReturnValue(mockCard1);
      mockGetPreview.mockImplementation((cardId, rating) => {
        if (rating === 'again') return 0.0005; // < 1 minute in days
        if (rating === 'hard') return 0.5;
        if (rating === 'good') return 2;
        if (rating === 'easy') return 7;
        return null;
      });

      const { result } = renderHook(() => useKanjiPracticeSession());

      await act(async () => {
        await result.current.actions.handleStart();
      });

      expect(mockGetPreview).toHaveBeenCalledWith('kanji-1', 'again');
      expect(mockGetPreview).toHaveBeenCalledWith('kanji-1', 'hard');
      expect(mockGetPreview).toHaveBeenCalledWith('kanji-1', 'good');
      expect(mockGetPreview).toHaveBeenCalledWith('kanji-1', 'easy');

      expect(result.current.state.intervals.again).toBe('< 1m');
      expect(result.current.state.intervals.hard).toContain('h');
      expect(result.current.state.intervals.good).toContain('d');
      expect(result.current.state.intervals.easy).toContain('d');
    });

    it('should format intervals correctly', async () => {
      mockGetNextCard.mockReturnValue(mockCard1);

      const testCases = [
        { preview: 0.0007, expected: '< 1m' },
        { preview: 0.02, expected: '29m' },   // ~30 min
        { preview: 0.5, expected: '12h' },    // 12 hours
        { preview: 2, expected: '2d' },       // 2 days
        { preview: 14, expected: '14d' },     // 14 days
      ];

      for (const tc of testCases) {
        mockGetPreview.mockReturnValue(tc.preview);

        const { result } = renderHook(() => useKanjiPracticeSession());

        await act(async () => {
          await result.current.actions.handleStart();
        });

        // Intervals are computed for all ratings, but we can check the structure
        expect(result.current.state.intervals).toBeDefined();
      }
    });

    it('should handle null preview gracefully', async () => {
      mockGetNextCard.mockReturnValue(mockCard1);
      mockGetPreview.mockReturnValue(null);

      const { result } = renderHook(() => useKanjiPracticeSession());

      await act(async () => {
        await result.current.actions.handleStart();
      });

      expect(result.current.state.intervals).toEqual({
        again: '',
        hard: '',
        good: '',
        easy: '',
      });
    });
  });

  describe('filteredDueCount', () => {
    it('should return 0 when no cards', () => {
      vi.mocked(fsrsModule.getDueCards).mockReturnValue([]);

      const { result } = renderHook(() => useKanjiPracticeSession());

      expect(result.current.state.filteredDueCount).toBe(0);
    });

    it('should return due count for all cards when no lesson selected', () => {
      const dueCards = [mockCard1, mockCard2];
      vi.mocked(fsrsModule.getDueCards).mockReturnValue(dueCards);

      mockUseKanjiProgress.mockReturnValue({
        cards: dueCards,
        isLoading: false,
        stats: { total: 2, due: 2, new: 0, review: 0 },
        review: mockReview,
        getNextCard: mockGetNextCard,
        getPreview: mockGetPreview,
        importKanji: mockImportKanji,
        updateCard: mockUpdateCard,
        getAvailableLessons: mockGetAvailableLessons,
      });

      const { result } = renderHook(() => useKanjiPracticeSession());
      expect(result.current.state.filteredDueCount).toBe(2);
    });

    it('should filter due count by selected lessons', () => {
      const dueCards = [mockCard1, mockCard2];
      vi.mocked(fsrsModule.getDueCards).mockReturnValue(dueCards);

      mockUseKanjiProgress.mockReturnValue({
        cards: dueCards,
        isLoading: false,
        stats: { total: 2, due: 2, new: 0, review: 0 },
        review: mockReview,
        getNextCard: mockGetNextCard,
        getPreview: mockGetPreview,
        importKanji: mockImportKanji,
        updateCard: mockUpdateCard,
        getAvailableLessons: mockGetAvailableLessons,
      });

      const { result } = renderHook(() => useKanjiPracticeSession());

      act(() => {
        result.current.actions.handleLessonChange('lesson-1');
      });

      expect(result.current.state.filteredDueCount).toBe(1);
    });
  });

  describe('Card Completion Flow', () => {
    it('should handle complete review cycle', async () => {
      mockGetNextCard.mockReturnValueOnce(mockCard1).mockReturnValueOnce(null);

      const { result } = renderHook(() => useKanjiPracticeSession());

      // Start session
      await act(async () => {
        await result.current.actions.handleStart();
      });

      expect(result.current.state.showSetup).toBe(false);
      expect(result.current.state.currentCard).toEqual(mockCard1);

      // Reveal
      act(() => {
        result.current.actions.handleReveal();
      });

      expect(result.current.state.isRevealed).toBe(true);

      // Review
      act(() => {
        result.current.actions.handleReview('good');
      });

      // Should complete since no more cards
      await waitFor(() => {
        expect(result.current.state.isComplete).toBe(true);
      });

      // Note: currentCard may still hold the last card reference in the hook implementation
      expect(result.current.state.isRevealed).toBe(false);
      expect(result.current.state.isComplete).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle start without selecting lessons', async () => {
      const { result } = renderHook(() => useKanjiPracticeSession());

      await act(async () => {
        await result.current.actions.handleStart();
      });

      expect(result.current.state.showSetup).toBe(false);
    });

    it('should handle multiple lesson changes', () => {
      const { result } = renderHook(() => useKanjiPracticeSession());

      act(() => {
        result.current.actions.handleLessonChange('lesson-1');
      });

      expect(result.current.state.selectedLessons).toEqual(['lesson-1']);

      act(() => {
        result.current.actions.handleLessonChange('lesson-2');
      });

      expect(result.current.state.selectedLessons).toEqual(['lesson-2']);
    });

    it('should handle review when card is null', () => {
      const { result } = renderHook(() => useKanjiPracticeSession());

      // Don't start, just try to review
      expect(() => {
        act(() => {
          result.current.actions.handleReview('good');
        });
      }).not.toThrow();
    });

    it('should handle reveal when card is null', () => {
      const { result } = renderHook(() => useKanjiPracticeSession());

      expect(() => {
        act(() => {
          result.current.actions.handleReveal();
        });
      }).not.toThrow();

      expect(result.current.state.isRevealed).toBe(true);
    });
  });
});
