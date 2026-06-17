import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useGrammarMode } from '../../hooks/useGrammarMode';

// Mock react-router-dom
const mockNavigate = vi.fn();
const mockUseParams: { exerciseId?: string } = { exerciseId: undefined };

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useParams: () => mockUseParams,
}));

// Mock useGrammarCategorySelection
const mockToggleCategory = vi.fn();
const mockSelectAllCategories = vi.fn();
const mockDeselectAllCategories = vi.fn();
const mockClearCategorySelection = vi.fn();
const mockSelectGroupCategories = vi.fn();
const mockSetExpandedGroup = vi.fn();
const mockSelectedCategories = ['Permission', 'Particles'];

vi.mock('../../hooks/useGrammarCategorySelection.js', () => ({
  useGrammarCategorySelection: () => ({
    selectedCategories: mockSelectedCategories,
    activeGroup: null,
    expandedGroup: null,
    setExpandedGroup: mockSetExpandedGroup,
    toggleCategory: mockToggleCategory,
    selectAllCategories: mockSelectAllCategories,
    deselectAllCategories: mockDeselectAllCategories,
    clearCategorySelection: mockClearCategorySelection,
    selectGroupCategories: mockSelectGroupCategories,
  }),
}));

// Mock verifyAnswer
vi.mock('../../lib/grammarAnswerVerification.js', () => ({
  verifyAnswer: vi.fn((user: string, correct: string) => ({
    isCorrect: user === correct,
    similarity: user === correct ? 100 : 50,
    issues: [],
  })),
}));

// Mock window.alert
const mockAlert = vi.fn();
Object.defineProperty(window, 'alert', {
  writable: true,
  value: mockAlert,
});

describe('useGrammarMode', () => {
  const mockPatterns = [
    { id: 1, pattern: '〜てもいいです', category: 'Permission', jlpt_level: 'N5', formation_rules: [], examples: [], common_mistakes: [], related_patterns: [2] },
    { id: 2, pattern: '〜てはいけません', category: 'Prohibition', jlpt_level: 'N5', formation_rules: [], examples: [], common_mistakes: [], related_patterns: [1] },
    { id: 3, pattern: 'は (topic marker)', category: 'Particles', jlpt_level: 'N5', formation_rules: [], examples: [], common_mistakes: [] },
    { id: 4, pattern: 'が (subject marker)', category: 'Particles', jlpt_level: 'N5', formation_rules: [], examples: [], common_mistakes: [] },
  ];

  const mockExercise = {
    id: 101,
    type: 'construction' as const,
    prompt: 'Complete the sentence',
    context: 'You want to ask for permission',
    correct_answer: '行ってもいいです',
    hints: [],
    difficulty: 1,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseParams.exerciseId = undefined;
    mockNavigate.mockClear();
    mockAlert.mockClear();

    // Ensure localStorage.getItem returns null by default (not undefined)
    vi.mocked(localStorage.getItem).mockReturnValue(null);
    vi.mocked(localStorage.setItem).mockImplementation(() => {});
    vi.mocked(localStorage.clear).mockImplementation(() => {});

    // Default fetch mock
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    } as Response);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Helper: wait for patterns to load in the hook
  const waitForPatternsLoaded = async (result: any) => {
    await waitFor(() => {
      expect(result.current.patterns.length).toBeGreaterThan(0);
    });
  };

  // Helper: setup fetch mock that handles all grammar endpoints
  const setupGrammarFetchMock = (overrides: Record<string, any> = {}) => {
    (global.fetch as any).mockImplementation((url: string) => {
      // Patterns list endpoint (exact match to avoid matching exercise endpoints)
      if (url.endsWith('/api/grammar/patterns')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ patterns: mockPatterns }),
        });
      }
      // Review endpoint
      if (url.includes('/api/grammar/review')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(overrides.review ?? { count: 0, patterns: [] }),
        });
      }
      // Mixed review endpoint
      if (url.includes('/api/grammar/mixed-review')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(overrides.mixedReview ?? { patterns: [mockPatterns[0], mockPatterns[2]] }),
        });
      }
      // Confusion stats endpoint
      if (url.includes('/api/grammar/confusion-stats')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(overrides.confusionStats ?? { topConfusions: [] }),
        });
      }
      // Exercise by pattern endpoint
      if (url.match(/\/api\/grammar\/patterns\/\d+\/exercise/)) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ exercise: overrides.exercise ?? mockExercise }),
        });
      }
      // Exercise by ID endpoint
      if (url.match(/\/api\/grammar\/exercises\/\d+/)) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            exercise: overrides.exerciseById ?? { ...mockExercise, pattern_id: 1 },
          }),
        });
      }
      // Discrimination endpoint
      if (url.match(/\/api\/grammar\/patterns\/\d+\/discrimination/)) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ exercise: overrides.discriminationExercise ?? mockExercise }),
        });
      }
      // Related patterns endpoint
      if (url.match(/\/api\/grammar\/patterns\/\d+\/related/)) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ patterns: overrides.relatedPatterns ?? [mockPatterns[1]] }),
        });
      }
      // Check confusion endpoint
      if (url.includes('/api/grammar/check-confusion')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(overrides.confusionCheck ?? {}),
        });
      }
      // Progress endpoint
      if (url.includes('/api/grammar/progress')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(overrides.progress ?? { progress: { streak: 1, ease_factor: 2.5 } }),
        });
      }
      // Counter variants endpoint
      if (url.includes('/api/counters/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ variants: overrides.variants ?? [] }),
        });
      }
      return Promise.resolve({ ok: false });
    });
  };

  describe('Initial State', () => {
    it('should initialize with correct default values', () => {
      const { result } = renderHook(() => useGrammarMode());

      expect(result.current.patterns).toEqual([]);
      expect(result.current.currentPattern).toBeNull();
      expect(result.current.exercise).toBeNull();
      expect(result.current.state).toBe('loading');
      expect(result.current.userAnswer).toBe('');
      expect(result.current.feedback).toBeNull();
      expect(result.current.dueCount).toBe(0);
      expect(result.current.showFurigana).toBe(true);
      expect(result.current.comparisonPatterns).toBeNull();
      expect(result.current.discriminationAlert).toBeNull();
      expect(result.current.reviewMode).toBe('normal');
      expect(result.current.showPatternGraph).toBe(false);
      expect(result.current.reviewQueue).toEqual([]);
      expect(result.current.reviewQueueIndex).toBe(0);
    });
  });

  describe('Mount Effects', () => {
    it('should load patterns on mount', async () => {
      setupGrammarFetchMock();

      renderHook(() => useGrammarMode());

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/grammar/patterns'),
          expect.objectContaining({
            headers: { 'X-Password': '' },
          })
        );
      });
    });

    it('should load due patterns on mount', async () => {
      setupGrammarFetchMock();

      renderHook(() => useGrammarMode());

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/grammar/review'),
          expect.objectContaining({
            headers: { 'X-Password': '' },
          })
        );
      });
    });

    it('should load confusion stats on mount', async () => {
      setupGrammarFetchMock();

      renderHook(() => useGrammarMode());

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/grammar/confusion-stats'),
          expect.objectContaining({
            headers: { 'X-Password': '' },
          })
        );
      });
    });

    it('should load furigana preference from localStorage', async () => {
      vi.mocked(localStorage.getItem).mockImplementation((key: string) => {
        if (key === 'grammar_show_furigana') return 'false';
        return null;
      });

      setupGrammarFetchMock();

      const { result } = renderHook(() => useGrammarMode());

      await waitFor(() => {
        expect(result.current.showFurigana).toBe(false);
      });
    });

    it('should default showFurigana to true when no localStorage value', async () => {
      setupGrammarFetchMock();

      const { result } = renderHook(() => useGrammarMode());

      await waitFor(() => {
        expect(result.current.showFurigana).toBe(true);
      });
    });
  });

  describe('startReview', () => {
    it('should start review with selected categories', async () => {
      setupGrammarFetchMock();

      const { result } = renderHook(() => useGrammarMode());

      // Wait for patterns to actually load
      await waitForPatternsLoaded(result);

      // Start review with selected categories
      await act(async () => {
        await result.current.startReview(true);
      });

      // Should have loaded exercise for first pattern
      expect(result.current.currentPattern).not.toBeNull();
      expect(result.current.reviewQueue.length).toBeGreaterThan(0);
      expect(result.current.state).toBe('input');
    });

    it('should fetch due patterns from API when not using selected categories', async () => {
      setupGrammarFetchMock({
        review: { count: 2, patterns: [mockPatterns[0], mockPatterns[1]] },
      });

      const { result } = renderHook(() => useGrammarMode());

      await waitForPatternsLoaded(result);

      await act(async () => {
        await result.current.startReview(false);
      });

      expect(result.current.currentPattern).not.toBeNull();
      expect(result.current.reviewMode).toBe('normal');
    });

    it('should show alert when no patterns available for review', async () => {
      setupGrammarFetchMock({
        review: { count: 0, patterns: [] },
      });

      const { result } = renderHook(() => useGrammarMode());

      await waitForPatternsLoaded(result);

      await act(async () => {
        await result.current.startReview(false);
      });

      expect(mockAlert).toHaveBeenCalledWith(expect.stringContaining('No patterns'));
    });

    it('should start mixed review mode', async () => {
      setupGrammarFetchMock();

      const { result } = renderHook(() => useGrammarMode());

      await waitForPatternsLoaded(result);

      await act(async () => {
        await result.current.startReview(true, true);
      });

      expect(result.current.reviewMode).toBe('mixed');
      expect(result.current.currentPattern).not.toBeNull();
    });
  });

  describe('startPattern', () => {
    it('should set up review queue and load exercise', async () => {
      setupGrammarFetchMock();

      const { result } = renderHook(() => useGrammarMode());

      await waitForPatternsLoaded(result);

      await act(async () => {
        await result.current.startPattern(mockPatterns[0]);
      });

      expect(result.current.currentPattern).not.toBeNull();
      expect(result.current.reviewQueue.length).toBeGreaterThan(0);
      expect(result.current.reviewQueueIndex).toBe(0);
      expect(result.current.state).toBe('input');
    });
  });

  describe('handleSubmit', () => {
    it('should submit correct answer and update state to feedback', async () => {
      setupGrammarFetchMock();

      const { result } = renderHook(() => useGrammarMode());

      await waitForPatternsLoaded(result);

      // Start a pattern to set up state
      await act(async () => {
        await result.current.startPattern(mockPatterns[0]);
      });

      // Set user answer to match correct answer
      act(() => {
        result.current.setUserAnswer('行ってもいいです');
      });

      // Submit
      await act(async () => {
        await result.current.handleSubmit();
      });

      await waitFor(() => {
        expect(result.current.state).toBe('feedback');
      });

      expect(result.current.feedback).not.toBeNull();
      expect(result.current.feedback?.correct).toBe(true);
    });

    it('should not submit empty answer', async () => {
      setupGrammarFetchMock();

      const { result } = renderHook(() => useGrammarMode());

      await waitForPatternsLoaded(result);

      await act(async () => {
        await result.current.startPattern(mockPatterns[0]);
      });

      const stateBefore = result.current.state;

      act(() => {
        result.current.setUserAnswer('   ');
      });

      await act(async () => {
        await result.current.handleSubmit();
      });

      // State should not change to processing/feedback
      expect(result.current.state).toBe(stateBefore);
    });
  });

  describe('handleNext', () => {
    it('should advance to next pattern in review queue', async () => {
      setupGrammarFetchMock();

      const { result } = renderHook(() => useGrammarMode());

      await waitForPatternsLoaded(result);

      // Start pattern to set up queue
      await act(async () => {
        await result.current.startPattern(mockPatterns[0]);
      });

      const initialQueueIndex = result.current.reviewQueueIndex;

      // Call handleNext
      await act(async () => {
        await result.current.handleNext();
      });

      // Should have advanced (or wrapped around)
      expect(result.current.reviewQueueIndex).toBe((initialQueueIndex + 1) % result.current.reviewQueue.length);
    });
  });

  describe('Keyboard Shortcuts', () => {
    it('should register and cleanup keyboard event listener', async () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

      setupGrammarFetchMock();

      const { unmount } = renderHook(() => useGrammarMode());

      await waitFor(() => {
        expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
      });

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));

      addEventListenerSpy.mockRestore();
      removeEventListenerSpy.mockRestore();
    });
  });

  describe('handleHeaderBack', () => {
    it('should navigate to /grammar when current pattern is set', async () => {
      setupGrammarFetchMock();

      const { result } = renderHook(() => useGrammarMode());

      await waitForPatternsLoaded(result);

      // Start a pattern
      await act(async () => {
        await result.current.startPattern(mockPatterns[0]);
      });

      act(() => {
        result.current.handleHeaderBack();
      });

      expect(mockNavigate).toHaveBeenCalledWith('/grammar');
    });

    it('should navigate to / when no current pattern', () => {
      setupGrammarFetchMock();

      const { result } = renderHook(() => useGrammarMode());

      act(() => {
        result.current.handleHeaderBack();
      });

      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  describe('startDiscriminationDrill', () => {
    it('should load discrimination exercise when eligible patterns exist', async () => {
      setupGrammarFetchMock();

      const { result } = renderHook(() => useGrammarMode());

      await waitForPatternsLoaded(result);

      await act(async () => {
        await result.current.startDiscriminationDrill();
      });

      // Should have loaded discrimination exercise
      expect(result.current.reviewMode).toBe('discrimination');
      expect(result.current.currentPattern).not.toBeNull();
    });

    it('should show alert when no eligible patterns', async () => {
      // Override fetch to return patterns without related_patterns
      (global.fetch as any).mockImplementation((url: string) => {
        if (url.endsWith('/api/grammar/patterns')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              patterns: [
                { id: 1, pattern: '〜てもいいです', category: 'Permission', jlpt_level: 'N5', formation_rules: [], examples: [], common_mistakes: [] },
                { id: 2, pattern: '〜てはいけません', category: 'Prohibition', jlpt_level: 'N5', formation_rules: [], examples: [], common_mistakes: [] },
              ],
            }),
          });
        }
        if (url.includes('/api/grammar/review')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ count: 0, patterns: [] }),
          });
        }
        if (url.includes('/api/grammar/confusion-stats')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ topConfusions: [] }),
          });
        }
        return Promise.resolve({ ok: false });
      });

      const { result } = renderHook(() => useGrammarMode());

      await waitForPatternsLoaded(result);

      await act(async () => {
        await result.current.startDiscriminationDrill();
      });

      expect(mockAlert).toHaveBeenCalledWith(expect.stringContaining('No patterns with relationships'));
    });
  });

  describe('handleCompare', () => {
    it('should load related patterns for comparison', async () => {
      setupGrammarFetchMock({
        relatedPatterns: [mockPatterns[1], mockPatterns[2]],
      });

      const { result } = renderHook(() => useGrammarMode());

      await waitForPatternsLoaded(result);

      await act(async () => {
        await result.current.handleCompare(mockPatterns[0]);
      });

      expect(result.current.comparisonPatterns).not.toBeNull();
      expect(result.current.comparisonPatterns?.length).toBeGreaterThan(0);
    });
  });

  describe('State Setters', () => {
    it('should update userAnswer', () => {
      setupGrammarFetchMock();

      const { result } = renderHook(() => useGrammarMode());

      act(() => {
        result.current.setUserAnswer('test answer');
      });

      expect(result.current.userAnswer).toBe('test answer');
    });

    it('should toggle showFurigana and save to localStorage', () => {
      setupGrammarFetchMock();

      const { result } = renderHook(() => useGrammarMode());

      act(() => {
        result.current.setShowFurigana(false);
      });

      expect(result.current.showFurigana).toBe(false);
      expect(localStorage.setItem).toHaveBeenCalledWith('grammar_show_furigana', 'false');
    });

    it('should update showPatternGraph', () => {
      setupGrammarFetchMock();

      const { result } = renderHook(() => useGrammarMode());

      act(() => {
        result.current.setShowPatternGraph(true);
      });

      expect(result.current.showPatternGraph).toBe(true);
    });

    it('should update comparisonPatterns', () => {
      setupGrammarFetchMock();

      const { result } = renderHook(() => useGrammarMode());

      act(() => {
        result.current.setComparisonPatterns([mockPatterns[0]]);
      });

      expect(result.current.comparisonPatterns).toEqual([mockPatterns[0]]);
    });

    it('should update returnToGraph', () => {
      setupGrammarFetchMock();

      const { result } = renderHook(() => useGrammarMode());

      act(() => {
        result.current.setReturnToGraph(true);
      });

      expect(result.current.returnToGraph).toBe(true);
    });

    it('should update discriminationAlert', () => {
      setupGrammarFetchMock();

      const { result } = renderHook(() => useGrammarMode());

      const alert = {
        confusedWith: mockPatterns[1],
        message: 'Test alert',
      };

      act(() => {
        result.current.setDiscriminationAlert(alert);
      });

      expect(result.current.discriminationAlert).toEqual(alert);
    });
  });

  describe('Exercise Loading from URL', () => {
    it('should load exercise when exerciseId is in URL params', async () => {
      mockUseParams.exerciseId = '101';

      setupGrammarFetchMock();

      const { result } = renderHook(() => useGrammarMode());

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/grammar/exercises/101'),
          expect.any(Object)
        );
      });

      await waitFor(() => {
        expect(result.current.exercise).not.toBeNull();
      });
    });

    it('should navigate to /grammar when exercise fetch fails', async () => {
      mockUseParams.exerciseId = '999';

      (global.fetch as any).mockImplementation((url: string) => {
        if (url.endsWith('/api/grammar/patterns')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ patterns: mockPatterns }),
          });
        }
        if (url.includes('/api/grammar/review')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ count: 0, patterns: [] }),
          });
        }
        if (url.includes('/api/grammar/confusion-stats')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ topConfusions: [] }),
          });
        }
        if (url.includes('/api/grammar/exercises/999')) {
          return Promise.resolve({
            ok: false,
            status: 404,
          });
        }
        return Promise.resolve({ ok: false });
      });

      renderHook(() => useGrammarMode());

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/grammar', { replace: true });
      });
    });
  });

  describe('Password Header', () => {
    it('should include password in fetch headers', async () => {
      vi.mocked(localStorage.getItem).mockImplementation((key: string) => {
        if (key === 'speech_practice_password') return 'test-password-123';
        return null;
      });

      setupGrammarFetchMock();

      renderHook(() => useGrammarMode());

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/grammar/patterns'),
          expect.objectContaining({
            headers: { 'X-Password': 'test-password-123' },
          })
        );
      });
    });
  });
});
