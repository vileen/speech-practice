import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useLessonSession } from '../../hooks/useLessonSession';

// Mock react-router-dom
const mockNavigate = vi.fn();
const mockUseParams: { id?: string } = { id: undefined };

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useParams: () => mockUseParams,
}));

describe('useLessonSession', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockUseParams.id = undefined;
    mockNavigate.mockClear();
  });

  describe('Initial State', () => {
    it('should initialize with default values', async () => {
      vi.mocked(localStorage.getItem).mockReturnValue(null);

      const { result } = renderHook(() => useLessonSession());

      expect(result.current.password).toBe('');
      expect(result.current.session).toBeNull();
      expect(result.current.language).toBe('japanese');
      expect(result.current.gender).toBe('female');
      expect(result.current.voiceStyle).toBe('normal');
      expect(result.current.simpleMode).toBe(false);
      expect(result.current.messages).toEqual([]);
      expect(result.current.activeLesson).toEqual({ id: '', title: '' });
      expect(result.current.isLoadingSession).toBe(true);
    });
  });

  describe('Password Loading', () => {
    it('should load password from localStorage on mount', async () => {
      vi.mocked(localStorage.getItem).mockImplementation((key: string) => {
        if (key === 'speech_practice_password') return 'my-secret-password';
        return null;
      });

      const { result } = renderHook(() => useLessonSession());

      await waitFor(() => {
        expect(result.current.password).toBe('my-secret-password');
      });
    });

    it('should use empty string when no password in localStorage', async () => {
      vi.mocked(localStorage.getItem).mockReturnValue(null);

      const { result } = renderHook(() => useLessonSession());

      await waitFor(() => {
        expect(result.current.password).toBe('');
      });
    });
  });

  describe('Settings Loading from localStorage', () => {
    it('should load lessonPracticeSettings from localStorage', async () => {
      const settings = {
        gender: 'male',
        voiceStyle: 'anime',
        simpleMode: true,
        lessonId: 'lesson-123',
        lessonTitle: 'Test Lesson',
      };

      vi.mocked(localStorage.getItem).mockImplementation((key: string) => {
        if (key === 'lessonPracticeSettings') return JSON.stringify(settings);
        if (key === 'speech_practice_password') return 'test-password';
        return null;
      });

      const { result } = renderHook(() => useLessonSession());

      await waitFor(() => {
        expect(result.current.gender).toBe('male');
        expect(result.current.voiceStyle).toBe('anime');
        expect(result.current.simpleMode).toBe(true);
        expect(result.current.activeLesson).toEqual({ id: 'lesson-123', title: 'Test Lesson' });
      });
    });

    it('should use default values when settings are missing fields', async () => {
      const settings = {
        lessonId: 'lesson-456',
      };

      vi.mocked(localStorage.getItem).mockImplementation((key: string) => {
        if (key === 'lessonPracticeSettings') return JSON.stringify(settings);
        return null;
      });

      const { result } = renderHook(() => useLessonSession());

      await waitFor(() => {
        expect(result.current.gender).toBe('female');
        expect(result.current.voiceStyle).toBe('normal');
        expect(result.current.simpleMode).toBe(false);
        expect(result.current.activeLesson).toEqual({ id: 'lesson-456', title: '' });
      });
    });

    it('should handle invalid JSON in lessonPracticeSettings gracefully', async () => {
      vi.mocked(localStorage.getItem).mockImplementation((key: string) => {
        if (key === 'lessonPracticeSettings') return 'invalid json';
        return null;
      });

      const { result } = renderHook(() => useLessonSession());

      await waitFor(() => {
        expect(result.current.gender).toBe('female');
        expect(result.current.voiceStyle).toBe('normal');
        expect(result.current.simpleMode).toBe(false);
      });
    });

    it('should handle missing lessonPracticeSettings gracefully', async () => {
      vi.mocked(localStorage.getItem).mockReturnValue(null);

      const { result } = renderHook(() => useLessonSession());

      await waitFor(() => {
        expect(result.current.gender).toBe('female');
        expect(result.current.voiceStyle).toBe('normal');
        expect(result.current.simpleMode).toBe(false);
      });
    });
  });

  describe('Lesson Fetching', () => {
    it('should fetch lesson data when id is present in URL params', async () => {
      mockUseParams.id = 'lesson-789';

      const mockLesson = {
        id: 'lesson-789',
        title: 'Fetched Lesson Title',
      };

      vi.mocked(localStorage.getItem).mockImplementation((key: string) => {
        if (key === 'speech_practice_password') return 'test-password';
        return null;
      });

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockLesson),
      } as Response);

      const { result } = renderHook(() => useLessonSession());

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/lessons/lesson-789'),
          expect.objectContaining({
            headers: { 'X-Password': 'test-password' },
          })
        );
      });

      await waitFor(() => {
        expect(result.current.activeLesson).toEqual({ id: 'lesson-789', title: 'Fetched Lesson Title' });
      });
    });

    it('should navigate to /lessons on lesson fetch error', async () => {
      mockUseParams.id = 'invalid-lesson';

      vi.mocked(localStorage.getItem).mockImplementation((key: string) => {
        if (key === 'speech_practice_password') return 'test-password';
        return null;
      });

      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      renderHook(() => useLessonSession());

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/lessons');
      });
    });

    it('should use URL id when no stored lessonId in localStorage', async () => {
      mockUseParams.id = 'url-lesson-id';

      vi.mocked(localStorage.getItem).mockImplementation((key: string) => {
        if (key === 'speech_practice_password') return 'test-password';
        return null;
      });

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ id: 'url-lesson-id', title: 'URL Title' }),
      } as Response);

      const { result } = renderHook(() => useLessonSession());

      await waitFor(() => {
        expect(result.current.activeLesson?.id).toBe('url-lesson-id');
      });
    });
  });

  describe('Session Initialization', () => {
    it('should initialize session via POST to /api/sessions', async () => {
      mockUseParams.id = 'lesson-abc';

      const mockSession = {
        id: 123,
        title: 'Test Session',
        created_at: '2024-01-01T00:00:00Z',
      };

      vi.mocked(localStorage.getItem).mockImplementation((key: string) => {
        if (key === 'speech_practice_password') return 'test-password';
        return null;
      });

      global.fetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ id: 'lesson-abc', title: 'Lesson' }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockSession),
        } as Response);

      const { result } = renderHook(() => useLessonSession());

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/sessions'),
          expect.objectContaining({
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Password': 'test-password',
            },
            body: JSON.stringify({ language: 'japanese', voice_gender: 'female' }),
          })
        );
      });

      await waitFor(() => {
        expect(result.current.session).toEqual(mockSession);
        expect(result.current.isLoadingSession).toBe(false);
      });
    });

    it('should use settings from localStorage for session creation', async () => {
      mockUseParams.id = 'lesson-def';

      const settings = {
        gender: 'male',
        voiceStyle: 'anime',
      };

      vi.mocked(localStorage.getItem).mockImplementation((key: string) => {
        if (key === 'lessonPracticeSettings') return JSON.stringify(settings);
        if (key === 'speech_practice_password') return 'test-password';
        return null;
      });

      global.fetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ id: 'lesson-def', title: 'Lesson' }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ id: 456 }),
        } as Response);

      renderHook(() => useLessonSession());

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/sessions'),
          expect.objectContaining({
            body: JSON.stringify({ language: 'japanese', voice_gender: 'male' }),
          })
        );
      });
    });

    it('should handle session initialization error gracefully', async () => {
      mockUseParams.id = 'lesson-error';
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      vi.mocked(localStorage.getItem).mockImplementation((key: string) => {
        if (key === 'speech_practice_password') return 'test-password';
        return null;
      });

      global.fetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ id: 'lesson-error', title: 'Lesson' }),
        } as Response)
        .mockRejectedValue(new Error('Session creation failed'));

      const { result } = renderHook(() => useLessonSession());

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Error initializing lesson chat:',
          expect.any(Error)
        );
      });

      await waitFor(() => {
        expect(result.current.isLoadingSession).toBe(false);
      });

      consoleErrorSpy.mockRestore();
    });

    it('should not initialize session when no id is present', async () => {
      mockUseParams.id = undefined;

      vi.mocked(localStorage.getItem).mockImplementation((key: string) => {
        if (key === 'speech_practice_password') return 'test-password';
        return null;
      });

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      } as Response);

      renderHook(() => useLessonSession());

      // Wait a bit to ensure no fetch is called for sessions
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(global.fetch).not.toHaveBeenCalledWith(
        expect.stringContaining('/api/sessions'),
        expect.any(Object)
      );
    });

    it('should not initialize session when no password is present', async () => {
      mockUseParams.id = 'lesson-no-password';

      vi.mocked(localStorage.getItem).mockReturnValue(null);

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      } as Response);

      renderHook(() => useLessonSession());

      // Wait a bit to ensure no fetch is called for sessions
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(global.fetch).not.toHaveBeenCalledWith(
        expect.stringContaining('/api/sessions'),
        expect.any(Object)
      );
    });
  });

  describe('State Management', () => {
    it('should update messages through setMessages', async () => {
      vi.mocked(localStorage.getItem).mockReturnValue(null);

      const { result } = renderHook(() => useLessonSession());

      const newMessages = [
        { role: 'user', text: 'Hello' },
        { role: 'assistant', text: 'こんにちは' },
      ];

      act(() => {
        result.current.setMessages(newMessages);
      });

      expect(result.current.messages).toEqual(newMessages);
    });

    it('should update session when API returns different language', async () => {
      mockUseParams.id = 'lesson-multi-lang';

      const mockSession = {
        id: 789,
        language: 'english',
      };

      vi.mocked(localStorage.getItem).mockImplementation((key: string) => {
        if (key === 'speech_practice_password') return 'test-password';
        return null;
      });

      global.fetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ id: 'lesson-multi-lang', title: 'Lesson' }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockSession),
        } as Response);

      const { result } = renderHook(() => useLessonSession());

      await waitFor(() => {
        expect(result.current.session).toEqual(mockSession);
        expect(result.current.language).toBe('english');
      });
    });
  });

  describe('Edge Cases', () => {
    it('should keep loading state when session creation returns non-ok', async () => {
      mockUseParams.id = 'lesson-bad-response';

      vi.mocked(localStorage.getItem).mockImplementation((key: string) => {
        if (key === 'speech_practice_password') return 'test-password';
        return null;
      });

      global.fetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ id: 'lesson-bad-response', title: 'Lesson' }),
        } as Response)
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
        } as Response);

      const { result } = renderHook(() => useLessonSession());

      // Wait for fetch to complete
      await new Promise(resolve => setTimeout(resolve, 100));

      // Hook only sets isLoadingSession=false when response is ok
      expect(result.current.isLoadingSession).toBe(true);
      expect(result.current.session).toBeNull();
    });

    it('should handle empty lesson title from API', async () => {
      mockUseParams.id = 'lesson-empty-title';

      vi.mocked(localStorage.getItem).mockImplementation((key: string) => {
        if (key === 'speech_practice_password') return 'test-password';
        return null;
      });

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ id: 'lesson-empty-title' }),
      } as Response);

      const { result } = renderHook(() => useLessonSession());

      await waitFor(() => {
        expect(result.current.activeLesson).toEqual({ id: 'lesson-empty-title', title: '' });
      });
    });
  });
});
