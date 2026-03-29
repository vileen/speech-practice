import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useListeningMode } from '../../hooks/useListeningMode';

const mockPassages = [
  {
    id: 1,
    title: 'Test Passage 1',
    level: 'N5',
    audio_url: 'https://example.com/audio1.mp3',
    duration_seconds: 120,
    difficulty_speed: 'normal',
    topic_category: 'daily',
    created_at: '2024-01-01',
  },
  {
    id: 2,
    title: 'Test Passage 2',
    level: 'N4',
    audio_url: 'https://example.com/audio2.mp3',
    duration_seconds: 180,
    difficulty_speed: 'slow',
    topic_category: 'travel',
    created_at: '2024-01-02',
  },
];

const mockQuestions = [
  {
    id: 1,
    passage_id: 1,
    question_text: 'What is the main topic?',
    question_type: 'main_idea' as const,
    options: ['Option A', 'Option B', 'Option C', 'Option D'],
    correct_answer: 0,
    explanation: 'This is the explanation',
  },
  {
    id: 2,
    passage_id: 1,
    question_text: 'What time did they arrive?',
    question_type: 'detail' as const,
    options: ['9:00', '10:00', '11:00', '12:00'],
    correct_answer: 1,
    explanation: 'They arrived at 10:00',
  },
];

const mockTranscript = {
  transcript: 'This is the English transcript',
  japaneseText: 'これは日本語のテキストです',
};

describe('useListeningMode', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    vi.mocked(localStorage.getItem).mockReturnValue('test-password');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initial State', () => {
    it('should initialize with empty state', () => {
      const { result } = renderHook(() => useListeningMode());

      expect(result.current.passages).toEqual([]);
      expect(result.current.currentPassage).toBeNull();
      expect(result.current.questions).toEqual([]);
      expect(result.current.answers).toEqual({});
      expect(result.current.result).toBeNull();
      expect(result.current.transcript).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('fetchPassages', () => {
    it('should fetch all passages successfully', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ passages: mockPassages }),
      } as Response);

      const { result } = renderHook(() => useListeningMode());

      await act(async () => {
        await result.current.fetchPassages();
      });

      expect(result.current.passages).toEqual(mockPassages);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should fetch passages with level filter', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ passages: [mockPassages[0]] }),
      } as Response);

      const { result } = renderHook(() => useListeningMode());

      await act(async () => {
        await result.current.fetchPassages('N5');
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/listening/passages?level=N5'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Password': 'test-password',
          }),
        })
      );
    });

    it('should handle fetch passages error', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      } as Response);

      const { result } = renderHook(() => useListeningMode());

      await act(async () => {
        await result.current.fetchPassages();
      });

      expect(result.current.error).toBe('Failed to fetch passages');
      expect(result.current.passages).toEqual([]);
    });

    it('should set loading state during fetch', async () => {
      global.fetch = vi.fn().mockImplementation(() => new Promise(() => {}));

      const { result } = renderHook(() => useListeningMode());

      act(() => {
        result.current.fetchPassages();
      });

      expect(result.current.loading).toBe(true);
    });
  });

  describe('fetchPassage', () => {
    it('should fetch passage and questions successfully', async () => {
      global.fetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ passage: mockPassages[0] }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ questions: mockQuestions }),
        } as Response);

      const { result } = renderHook(() => useListeningMode());

      await act(async () => {
        await result.current.fetchPassage(1);
      });

      expect(result.current.currentPassage).toEqual(mockPassages[0]);
      expect(result.current.questions).toEqual(mockQuestions);
      expect(result.current.answers).toEqual({});
      expect(result.current.result).toBeNull();
      expect(result.current.transcript).toBeNull();
      expect(result.current.loading).toBe(false);
    });

    it('should handle passage fetch error', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
      } as Response);

      const { result } = renderHook(() => useListeningMode());

      await act(async () => {
        await result.current.fetchPassage(999);
      });

      expect(result.current.error).toBe('Failed to fetch passage');
    });

    it('should handle questions fetch error', async () => {
      global.fetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ passage: mockPassages[0] }),
        } as Response)
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
        } as Response);

      const { result } = renderHook(() => useListeningMode());

      await act(async () => {
        await result.current.fetchPassage(1);
      });

      expect(result.current.error).toBe('Failed to fetch questions');
    });
  });

  describe('selectAnswer', () => {
    it('should select an answer for a question', () => {
      const { result } = renderHook(() => useListeningMode());

      act(() => {
        result.current.selectAnswer(1, 2);
      });

      expect(result.current.answers).toEqual({ 1: 2 });
    });

    it('should update existing answer', () => {
      const { result } = renderHook(() => useListeningMode());

      act(() => {
        result.current.selectAnswer(1, 0);
      });

      act(() => {
        result.current.selectAnswer(1, 3);
      });

      expect(result.current.answers).toEqual({ 1: 3 });
    });

    it('should store multiple answers', () => {
      const { result } = renderHook(() => useListeningMode());

      act(() => {
        result.current.selectAnswer(1, 0);
        result.current.selectAnswer(2, 2);
      });

      expect(result.current.answers).toEqual({ 1: 0, 2: 2 });
    });
  });

  describe('submitAnswers', () => {
    it('should not submit if no passage is selected', async () => {
      global.fetch = vi.fn();

      const { result } = renderHook(() => useListeningMode());

      await act(async () => {
        await result.current.submitAnswers();
      });

      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should submit answers successfully', async () => {
      const mockResult = {
        score: 80,
        correctCount: 1,
        totalQuestions: 2,
        results: [
          {
            questionId: 1,
            selectedOption: 0,
            isCorrect: true,
            correctAnswer: 0,
            explanation: 'Correct!',
            questionType: 'main_idea',
          },
        ],
        listeningTimeSeconds: 120,
      };

      global.fetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ passage: mockPassages[0] }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ questions: mockQuestions }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResult),
        } as Response);

      const { result } = renderHook(() => useListeningMode());

      // First fetch a passage
      await act(async () => {
        await result.current.fetchPassage(1);
      });

      // Select answers
      act(() => {
        result.current.selectAnswer(1, 0);
        result.current.selectAnswer(2, 1);
      });

      // Submit
      await act(async () => {
        await result.current.submitAnswers();
      });

      expect(result.current.result).toEqual(mockResult);
      expect(global.fetch).toHaveBeenLastCalledWith(
        expect.stringContaining('/api/listening/submit'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'X-Password': 'test-password',
          }),
          body: expect.stringContaining('passageId'),
        })
      );
    });

    it('should handle submit error', async () => {
      global.fetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ passage: mockPassages[0] }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ questions: mockQuestions }),
        } as Response)
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
        } as Response);

      const { result } = renderHook(() => useListeningMode());

      await act(async () => {
        await result.current.fetchPassage(1);
      });

      await act(async () => {
        await result.current.submitAnswers();
      });

      expect(result.current.error).toBe('Failed to submit answers');
    });
  });

  describe('fetchTranscript', () => {
    it('should not fetch if no passage is selected', async () => {
      global.fetch = vi.fn();

      const { result } = renderHook(() => useListeningMode());

      await act(async () => {
        await result.current.fetchTranscript();
      });

      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should fetch transcript successfully', async () => {
      global.fetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ passage: mockPassages[0] }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ questions: mockQuestions }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockTranscript),
        } as Response);

      const { result } = renderHook(() => useListeningMode());

      await act(async () => {
        await result.current.fetchPassage(1);
      });

      await act(async () => {
        await result.current.fetchTranscript();
      });

      expect(result.current.transcript).toEqual(mockTranscript);
    });

    it('should handle transcript fetch error', async () => {
      global.fetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ passage: mockPassages[0] }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ questions: mockQuestions }),
        } as Response)
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
        } as Response);

      const { result } = renderHook(() => useListeningMode());

      await act(async () => {
        await result.current.fetchPassage(1);
      });

      await act(async () => {
        await result.current.fetchTranscript();
      });

      expect(result.current.error).toBe('Failed to fetch transcript');
    });
  });

  describe('reset', () => {
    it('should reset all state to initial values', async () => {
      global.fetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ passage: mockPassages[0] }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ questions: mockQuestions }),
        } as Response);

      const { result } = renderHook(() => useListeningMode());

      // Set some state
      await act(async () => {
        await result.current.fetchPassage(1);
      });

      act(() => {
        result.current.selectAnswer(1, 0);
      });

      // Reset
      act(() => {
        result.current.reset();
      });

      expect(result.current.currentPassage).toBeNull();
      expect(result.current.questions).toEqual([]);
      expect(result.current.answers).toEqual({});
      expect(result.current.result).toBeNull();
      expect(result.current.transcript).toBeNull();
      expect(result.current.error).toBeNull();
    });
  });

  describe('Password Handling', () => {
    it('should use password from localStorage', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ passages: mockPassages }),
      } as Response);

      const { result } = renderHook(() => useListeningMode());

      await act(async () => {
        await result.current.fetchPassages();
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Password': 'test-password',
          }),
        })
      );
    });

    it('should use empty string when no password in localStorage', async () => {
      vi.mocked(localStorage.getItem).mockReturnValue(null);

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ passages: mockPassages }),
      } as Response);

      const { result } = renderHook(() => useListeningMode());

      await act(async () => {
        await result.current.fetchPassages();
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Password': '',
          }),
        })
      );
    });
  });

  describe('Network Errors', () => {
    it('should handle network error during fetchPassages', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useListeningMode());

      await act(async () => {
        await result.current.fetchPassages();
      });

      expect(result.current.error).toBe('Network error');
    });

    it('should handle non-Error exceptions', async () => {
      global.fetch = vi.fn().mockRejectedValue('String error');

      const { result } = renderHook(() => useListeningMode());

      await act(async () => {
        await result.current.fetchPassages();
      });

      expect(result.current.error).toBe('Unknown error');
    });
  });
});
