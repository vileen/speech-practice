import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, fireEvent } from '@testing-library/react';
import { useMemorySession } from '../../../components/MemoryMode/useMemorySession';
import type { MemoryCard } from '../../../hooks/useMemoryProgress';
import type { Rating } from '../../../lib/fsrs';

// --- Mock useMemoryProgress (card queue driven by `deck`) ---
const mockReview = vi.fn();
const mockGetNextCard = vi.fn();
const mockGetPreview = vi.fn();
const mockGetStats = vi.fn();
const mockImportUniqueVocabulary = vi.fn();
const mockCards: MemoryCard[] = [];

vi.mock('../../../hooks/useMemoryProgress', () => ({
  useMemoryProgress: () => ({
    cards: mockCards,
    isLoading: false,
    getStats: mockGetStats,
    review: mockReview,
    getNextCard: mockGetNextCard,
    getPreview: mockGetPreview,
    importUniqueVocabulary: mockImportUniqueVocabulary,
  }),
}));

// setup.ts replaces localStorage with plain vi.fn()s — expose them typed
const mockLocalStorage = localStorage as unknown as {
  getItem: ReturnType<typeof vi.fn>;
  setItem: ReturnType<typeof vi.fn>;
};

// Cards remaining in the "queue" — reviewing removes them
let deck: MemoryCard[] = [];

const createMockCard = (id: string, overrides: Partial<MemoryCard> = {}): MemoryCard => ({
  id,
  phraseId: id,
  phraseType: 'vocabulary',
  lessonId: 'lesson-1',
  jp: '日本語',
  en: 'Japanese language',
  reading: 'にほんご',
  romaji: 'nihongo',
  due: new Date('2024-01-01T00:00:00.000Z'),
  stability: 0,
  difficulty: 0,
  elapsedDays: 0,
  scheduledDays: 0,
  reps: 0,
  lapses: 0,
  state: 'new',
  ...overrides,
});

describe('useMemorySession', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    deck = [];
    mockLocalStorage.getItem.mockReset();
    mockLocalStorage.setItem.mockReset();
    (window as unknown as { scrollTo: unknown }).scrollTo = vi.fn();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});

    mockGetNextCard.mockImplementation(() => deck[0] ?? null);
    mockReview.mockImplementation((phraseId: string) => {
      deck = deck.filter(c => c.phraseId !== phraseId);
    });
    mockGetStats.mockReturnValue({ total: 0, due: 0, new: 0, review: 0 });
    mockGetPreview.mockReturnValue(3);
    mockImportUniqueVocabulary.mockResolvedValue({ imported: 0, total: 0, unique: 0 });
  });

  describe('initial state', () => {
    it('should start in setup mode with empty session state', () => {
      const { result } = renderHook(() => useMemorySession());

      expect(result.current.showSetup).toBe(true);
      expect(result.current.currentCard).toBeNull();
      expect(result.current.isRevealed).toBe(false);
      expect(result.current.isComplete).toBe(false);
      expect(result.current.isStarting).toBe(false);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.selectedLessons).toEqual([]);
    });

    it('should load selected lessons from localStorage on mount', () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(['lesson-9', 'lesson-10']));

      const { result } = renderHook(() => useMemorySession());

      expect(result.current.selectedLessons).toEqual(['lesson-9', 'lesson-10']);
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('memoryModeSelectedLessons');
    });

    it('should fall back to empty selection when localStorage contains invalid JSON', () => {
      mockLocalStorage.getItem.mockReturnValue('{not-valid-json');

      const { result } = renderHook(() => useMemorySession());

      expect(result.current.selectedLessons).toEqual([]);
    });
  });

  describe('lesson selection', () => {
    it('should add a lesson when toggling an unselected lesson', () => {
      const { result } = renderHook(() => useMemorySession());

      act(() => result.current.toggleLesson('lesson-1'));

      expect(result.current.selectedLessons).toEqual(['lesson-1']);
    });

    it('should remove a lesson when toggling an already-selected lesson', () => {
      const { result } = renderHook(() => useMemorySession());

      act(() => result.current.toggleLesson('lesson-1'));
      act(() => result.current.toggleLesson('lesson-2'));
      act(() => result.current.toggleLesson('lesson-1'));

      expect(result.current.selectedLessons).toEqual(['lesson-2']);
    });

    it('should persist selection to localStorage when it changes', () => {
      const { result } = renderHook(() => useMemorySession());

      act(() => result.current.toggleLesson('lesson-1'));
      expect(mockLocalStorage.setItem).toHaveBeenLastCalledWith(
        'memoryModeSelectedLessons',
        JSON.stringify(['lesson-1'])
      );

      act(() => result.current.toggleLesson('lesson-2'));
      expect(mockLocalStorage.setItem).toHaveBeenLastCalledWith(
        'memoryModeSelectedLessons',
        JSON.stringify(['lesson-1', 'lesson-2'])
      );
    });
  });

  describe('stats', () => {
    it('should expose stats from getStats and recompute for current selection', () => {
      mockGetStats.mockReturnValue({ total: 5, due: 2, new: 2, review: 1 });

      const { result } = renderHook(() => useMemorySession());

      expect(result.current.stats).toEqual({ total: 5, due: 2, new: 2, review: 1 });
      expect(mockGetStats).toHaveBeenCalledWith([]);

      act(() => result.current.toggleLesson('lesson-1'));

      expect(mockGetStats).toHaveBeenLastCalledWith(['lesson-1']);
    });
  });

  describe('startSession', () => {
    it('should import unique vocabulary for each selected lesson and show the first card', async () => {
      deck = [createMockCard('card-1')];
      const { result } = renderHook(() => useMemorySession());

      act(() => result.current.setSelectedLessons(['lesson-1', 'lesson-2']));
      await act(async () => {
        await result.current.startSession();
      });

      expect(mockImportUniqueVocabulary).toHaveBeenCalledTimes(2);
      expect(mockImportUniqueVocabulary).toHaveBeenNthCalledWith(1, 'lesson-1');
      expect(mockImportUniqueVocabulary).toHaveBeenNthCalledWith(2, 'lesson-2');
      expect(result.current.showSetup).toBe(false);
      expect(result.current.isStarting).toBe(false);
      expect(result.current.currentCard?.phraseId).toBe('card-1');
      expect(mockGetNextCard).toHaveBeenCalledWith(['lesson-1', 'lesson-2']);
    });

    it('should start without importing when no lessons are selected', async () => {
      deck = [createMockCard('card-1')];
      const { result } = renderHook(() => useMemorySession());

      await act(async () => {
        await result.current.startSession();
      });

      expect(mockImportUniqueVocabulary).not.toHaveBeenCalled();
      expect(result.current.showSetup).toBe(false);
      expect(result.current.currentCard?.phraseId).toBe('card-1');
    });

    it('should complete immediately when there are no cards to review', async () => {
      deck = [];
      const { result } = renderHook(() => useMemorySession());

      await act(async () => {
        await result.current.startSession();
      });

      expect(result.current.isComplete).toBe(true);
      expect(result.current.currentCard).toBeNull();
    });

    it('should still start the session when import fails for a lesson', async () => {
      mockImportUniqueVocabulary.mockRejectedValue(new Error('network down'));
      deck = [createMockCard('card-1')];
      const { result } = renderHook(() => useMemorySession());

      act(() => result.current.setSelectedLessons(['lesson-1']));
      await act(async () => {
        await result.current.startSession();
      });

      expect(result.current.showSetup).toBe(false);
      expect(result.current.isComplete).toBe(false);
      expect(result.current.currentCard?.phraseId).toBe('card-1');
    });
  });

  describe('review lifecycle', () => {
    it('handleReveal should show the answer', async () => {
      deck = [createMockCard('card-1')];
      const { result } = renderHook(() => useMemorySession());
      await act(async () => {
        await result.current.startSession();
      });

      act(() => result.current.handleReveal());

      expect(result.current.isRevealed).toBe(true);
      expect(result.current.currentCard?.phraseId).toBe('card-1');
    });

    it('handleReview should submit the rating, hide the answer, and advance to the next card', async () => {
      deck = [createMockCard('card-1'), createMockCard('card-2')];
      const { result } = renderHook(() => useMemorySession());
      await act(async () => {
        await result.current.startSession();
      });

      act(() => result.current.handleReveal());
      act(() => result.current.handleReview('good'));

      expect(mockReview).toHaveBeenCalledWith('card-1', 'good');
      expect(result.current.isRevealed).toBe(false);
      expect(result.current.currentCard?.phraseId).toBe('card-2');
      expect(result.current.isComplete).toBe(false);
    });

    it('handleReview should complete the session when no cards remain', async () => {
      deck = [createMockCard('card-1')];
      const { result } = renderHook(() => useMemorySession());
      await act(async () => {
        await result.current.startSession();
      });

      act(() => result.current.handleReveal());
      act(() => result.current.handleReview('easy'));

      expect(mockReview).toHaveBeenCalledWith('card-1', 'easy');
      expect(result.current.isComplete).toBe(true);
    });

    it('getPreview should delegate to the progress hook', () => {
      const { result } = renderHook(() => useMemorySession());

      const preview = result.current.getPreview('card-1', 'good' as Rating);

      expect(preview).toBe(3);
      expect(mockGetPreview).toHaveBeenCalledWith('card-1', 'good');
    });
  });

  describe('resetSession', () => {
    it('should return to setup and keep the selected lessons', async () => {
      deck = [createMockCard('card-1')];
      const { result } = renderHook(() => useMemorySession());

      act(() => result.current.setSelectedLessons(['lesson-7']));
      await act(async () => {
        await result.current.startSession();
      });
      act(() => result.current.handleReveal());

      act(() => result.current.resetSession());

      expect(result.current.showSetup).toBe(true);
      expect(result.current.currentCard).toBeNull();
      expect(result.current.isRevealed).toBe(false);
      expect(result.current.isComplete).toBe(false);
      expect(result.current.selectedLessons).toEqual(['lesson-7']);
    });
  });

  describe('keyboard shortcuts', () => {
    it('should reveal the answer when Space is pressed during review', async () => {
      deck = [createMockCard('card-1')];
      const { result } = renderHook(() => useMemorySession());
      await act(async () => {
        await result.current.startSession();
      });

      act(() => {
        fireEvent.keyDown(window, { key: ' ' });
      });

      expect(result.current.isRevealed).toBe(true);
    });

    it('should map number keys 1-4 to again/hard/good/easy ratings', async () => {
      deck = [
        createMockCard('card-1'),
        createMockCard('card-2'),
        createMockCard('card-3'),
        createMockCard('card-4'),
      ];
      const { result } = renderHook(() => useMemorySession());
      await act(async () => {
        await result.current.startSession();
      });

      const sequence: Array<[string, Rating]> = [
        ['1', 'again'],
        ['2', 'hard'],
        ['3', 'good'],
        ['4', 'easy'],
      ];

      for (const [key] of sequence) {
        act(() => {
          fireEvent.keyDown(window, { key: ' ' }); // reveal
        });
        act(() => {
          fireEvent.keyDown(window, { key }); // rate
        });
      }

      expect(mockReview).toHaveBeenNthCalledWith(1, 'card-1', 'again');
      expect(mockReview).toHaveBeenNthCalledWith(2, 'card-2', 'hard');
      expect(mockReview).toHaveBeenNthCalledWith(3, 'card-3', 'good');
      expect(mockReview).toHaveBeenNthCalledWith(4, 'card-4', 'easy');
      expect(result.current.isComplete).toBe(true);
    });

    it('should submit "again" when Space is pressed after revealing', async () => {
      deck = [createMockCard('card-1'), createMockCard('card-2')];
      const { result } = renderHook(() => useMemorySession());
      await act(async () => {
        await result.current.startSession();
      });

      act(() => {
        fireEvent.keyDown(window, { key: ' ' }); // reveal
      });
      act(() => {
        fireEvent.keyDown(window, { key: ' ' }); // rate again
      });

      expect(mockReview).toHaveBeenCalledWith('card-1', 'again');
    });

    it('should ignore shortcuts while in setup mode', () => {
      deck = [createMockCard('card-1')];
      const { result } = renderHook(() => useMemorySession());

      act(() => {
        fireEvent.keyDown(window, { key: ' ' });
      });
      act(() => {
        fireEvent.keyDown(window, { key: '1' });
      });

      expect(result.current.isRevealed).toBe(false);
      expect(mockReview).not.toHaveBeenCalled();
    });
  });
});
