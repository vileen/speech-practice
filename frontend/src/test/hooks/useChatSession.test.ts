import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useChatSession } from '../../hooks/useChatSession';

// Mock react-router-dom
const mockNavigate = vi.fn();
const mockLocationState: { state?: any } = { state: null };

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => mockLocationState,
}));

describe('useChatSession', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockLocationState.state = null;
  });

  describe('Initial State', () => {
    it('should initialize with default values', async () => {
      vi.mocked(localStorage.getItem).mockReturnValue(null);

      const { result } = renderHook(() => useChatSession());

      expect(result.current.password).toBe('');
      expect(result.current.session).toBeNull();
      expect(result.current.language).toBe('japanese');
      expect(result.current.gender).toBe('female');
      expect(result.current.voiceStyle).toBe('normal');
      expect(result.current.messages).toEqual([]);
      
      // Wait for the effect to complete (no session -> navigate to setup)
      await waitFor(() => {
        expect(result.current.isLoadingSession).toBe(false);
      });
    });
  });

  describe('Session Loading from Location State', () => {
    it('should load session from location state when available', () => {
      const mockSession = {
        id: 123,
        title: 'Test Session',
        created_at: '2024-01-01T00:00:00Z',
      };

      mockLocationState.state = {
        session: mockSession,
        language: 'japanese',
        gender: 'male',
        voiceStyle: 'anime',
      };

      const { result } = renderHook(() => useChatSession());

      expect(result.current.session).toEqual(mockSession);
      expect(result.current.language).toBe('japanese');
      expect(result.current.gender).toBe('male');
      expect(result.current.voiceStyle).toBe('anime');
      expect(result.current.isLoadingSession).toBe(false);
    });

    it('should use default values when location state has partial data', () => {
      const mockSession = { id: 456, title: 'Partial Session', created_at: '2024-01-01T00:00:00Z' };

      mockLocationState.state = {
        session: mockSession,
      };

      const { result } = renderHook(() => useChatSession());

      expect(result.current.session).toEqual(mockSession);
      expect(result.current.language).toBe('japanese');
      expect(result.current.gender).toBe('female');
      expect(result.current.voiceStyle).toBe('normal');
    });
  });

  describe('Session Loading from localStorage', () => {
    it('should load session from localStorage when no location state', () => {
      const mockSession = { id: 789, title: 'Stored Session', created_at: '2024-01-01T00:00:00Z' };
      const storedData = {
        session: mockSession,
        language: 'japanese',
        gender: 'female',
        voiceStyle: 'normal',
      };

      vi.mocked(localStorage.getItem).mockImplementation((key: string) => {
        if (key === 'speech_practice_password') return 'test-password';
        if (key === 'speech_practice_session') return JSON.stringify(storedData);
        return null;
      });

      const { result } = renderHook(() => useChatSession());

      expect(result.current.password).toBe('test-password');
      expect(result.current.session).toEqual(mockSession);
      expect(result.current.isLoadingSession).toBe(false);
    });

    it('should load messages from localStorage when available', () => {
      const mockSession = { id: 101, title: 'Session With Messages', created_at: '2024-01-01T00:00:00Z' };
      const storedSession = { session: mockSession, language: 'japanese', gender: 'female', voiceStyle: 'normal' };
      const storedMessages = [
        { role: 'user', text: 'Hello' },
        { role: 'assistant', text: 'こんにちは' },
      ];

      vi.mocked(localStorage.getItem).mockImplementation((key: string) => {
        if (key === 'speech_practice_session') return JSON.stringify(storedSession);
        if (key === 'speech_practice_messages') return JSON.stringify(storedMessages);
        return null;
      });

      const { result } = renderHook(() => useChatSession());

      expect(result.current.messages).toEqual(storedMessages);
    });

    it('should navigate to setup when no session in localStorage', () => {
      vi.mocked(localStorage.getItem).mockReturnValue(null);

      renderHook(() => useChatSession());

      expect(mockNavigate).toHaveBeenCalledWith('/chat/setup');
    });

    it('should handle invalid JSON in localStorage gracefully', () => {
      vi.mocked(localStorage.getItem).mockImplementation((key: string) => {
        if (key === 'speech_practice_session') return 'invalid json';
        return null;
      });

      renderHook(() => useChatSession());

      expect(mockNavigate).toHaveBeenCalledWith('/chat/setup');
    });
  });

  describe('Session Persistence', () => {
    it('should save session to localStorage when session changes', () => {
      const mockSession = { id: 202, title: 'New Session', created_at: '2024-01-01T00:00:00Z' };
      
      mockLocationState.state = { session: mockSession };

      renderHook(() => useChatSession());

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'speech_practice_session',
        JSON.stringify({
          session: mockSession,
          language: 'japanese',
          gender: 'female',
          voiceStyle: 'normal',
        })
      );
    });

    it('should save messages to localStorage when messages change', async () => {
      const mockSession = { id: 303, title: 'Message Test Session', created_at: '2024-01-01T00:00:00Z' };
      mockLocationState.state = { session: mockSession };

      const { result } = renderHook(() => useChatSession());

      const newMessages = [{ role: 'user', text: 'Test message' }];

      act(() => {
        result.current.setMessages(newMessages);
      });

      await waitFor(() => {
        expect(localStorage.setItem).toHaveBeenCalledWith(
          'speech_practice_messages',
          JSON.stringify(newMessages)
        );
      });
    });

    it('should not save empty messages array', () => {
      const mockSession = { id: 404, title: 'Empty Messages Session', created_at: '2024-01-01T00:00:00Z' };
      mockLocationState.state = { session: mockSession };

      renderHook(() => useChatSession());

      // Clear any previous calls
      vi.mocked(localStorage.setItem).mockClear();

      // Initial empty messages should not trigger save
      expect(localStorage.setItem).not.toHaveBeenCalledWith(
        'speech_practice_messages',
        expect.any(String)
      );
    });
  });

  describe('clearSession', () => {
    it('should remove session and messages from localStorage', () => {
      const mockSession = { id: 505, title: 'Session to Clear', created_at: '2024-01-01T00:00:00Z' };
      mockLocationState.state = { session: mockSession };

      const { result } = renderHook(() => useChatSession());

      act(() => {
        result.current.clearSession();
      });

      expect(localStorage.removeItem).toHaveBeenCalledWith('speech_practice_session');
      expect(localStorage.removeItem).toHaveBeenCalledWith('speech_practice_messages');
    });
  });

  describe('Password Loading', () => {
    it('should load password from localStorage on mount', () => {
      vi.mocked(localStorage.getItem).mockImplementation((key: string) => {
        if (key === 'speech_practice_password') return 'my-secret-password';
        return null;
      });

      const { result } = renderHook(() => useChatSession());

      expect(result.current.password).toBe('my-secret-password');
    });

    it('should use empty string when no password in localStorage', () => {
      vi.mocked(localStorage.getItem).mockReturnValue(null);

      const { result } = renderHook(() => useChatSession());

      expect(result.current.password).toBe('');
    });
  });

  describe('Session History Fetching', () => {
    it('should fetch session history when session loaded without messages', async () => {
      const mockSession = { id: 606, title: 'Session Needs History', created_at: '2024-01-01T00:00:00Z' };
      const storedSession = { session: mockSession, language: 'japanese', gender: 'female', voiceStyle: 'normal' };
      
      const mockHistoryResponse = {
        messages: [
          { id: 1, role: 'user', content: 'Hello there' },
          { id: 2, role: 'assistant', content: 'こんにちは' },
        ],
      };

      vi.mocked(localStorage.getItem).mockImplementation((key: string) => {
        if (key === 'speech_practice_password') return 'test-pass';
        if (key === 'speech_practice_session') return JSON.stringify(storedSession);
        return null;
      });

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockHistoryResponse),
      } as Response);

      const { result } = renderHook(() => useChatSession());

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/sessions/606'),
          expect.objectContaining({
            headers: { 'X-Password': 'test-pass' },
          })
        );
      });

      await waitFor(() => {
        expect(result.current.messages).toHaveLength(2);
      });
    });

    it('should handle fetch error gracefully', async () => {
      const mockSession = { id: 707, title: 'Error Session', created_at: '2024-01-01T00:00:00Z' };
      const storedSession = { session: mockSession, language: 'japanese', gender: 'female', voiceStyle: 'normal' };

      vi.mocked(localStorage.getItem).mockImplementation((key: string) => {
        if (key === 'speech_practice_session') return JSON.stringify(storedSession);
        return null;
      });

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      renderHook(() => useChatSession());

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Error fetching session history:',
          expect.any(Error)
        );
      });

      consoleErrorSpy.mockRestore();
    });

    it('should not fetch history when response is not ok', async () => {
      const mockSession = { id: 808, title: 'Not Found Session', created_at: '2024-01-01T00:00:00Z' };
      const storedSession = { session: mockSession, language: 'japanese', gender: 'female', voiceStyle: 'normal' };

      vi.mocked(localStorage.getItem).mockImplementation((key: string) => {
        if (key === 'speech_practice_session') return JSON.stringify(storedSession);
        return null;
      });

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
      } as Response);

      const { result } = renderHook(() => useChatSession());

      // Should complete without throwing
      await waitFor(() => {
        expect(result.current.isLoadingSession).toBe(false);
      });
    });
  });

  describe('State Updates', () => {
    it('should update messages through setMessages', () => {
      const mockSession = { id: 909, title: 'State Update Session', created_at: '2024-01-01T00:00:00Z' };
      mockLocationState.state = { session: mockSession };

      const { result } = renderHook(() => useChatSession());

      const newMessages = [
        { role: 'user', text: 'New message 1' },
        { role: 'assistant', text: 'Response 1' },
      ];

      act(() => {
        result.current.setMessages(newMessages);
      });

      expect(result.current.messages).toEqual(newMessages);
    });
  });
});
