import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useConversationMode } from '../../components/SpeakingMode/hooks/useConversationMode';

vi.mock('../../config/api.js', () => ({
  API_URL: 'http://localhost:3001',
}));

const mockTemplates = [
  {
    id: 1,
    title: 'At the Restaurant',
    scenario: 'Ordering food at a restaurant',
    difficulty: 'beginner',
    turns: [
      { speaker: 'waiter', japanese: 'いらっしゃいませ', romaji: 'irasshaimase', meaning: 'Welcome' },
      { speaker: 'customer', japanese: 'メニューをください', romaji: 'menyuu wo kudasai', meaning: 'Menu please' },
      { speaker: 'waiter', japanese: 'はい、どうぞ', romaji: 'hai, douzo', meaning: 'Here you go' },
    ],
  },
  {
    id: 2,
    title: 'At the Station',
    scenario: 'Asking for directions',
    difficulty: 'intermediate',
    turns: [
      { speaker: 'traveler', japanese: '駅はどこですか', romaji: 'eki wa doko desu ka', meaning: 'Where is the station?' },
      { speaker: 'local', japanese: 'あそこです', romaji: 'asoko desu', meaning: 'Over there' },
    ],
  },
];

describe('useConversationMode', () => {
  const mockSpeak = vi.fn();
  const mockSynthesis = {
    speak: mockSpeak,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fetch).mockClear();
    global.speechSynthesis = mockSynthesis as unknown as SpeechSynthesis;
    global.SpeechSynthesisUtterance = vi.fn(function(text: string) {
      this.text = text;
      this.lang = '';
    }) as unknown as typeof SpeechSynthesisUtterance;
  });

  describe('Initial State', () => {
    it('should initialize with correct default state', () => {
      const { result } = renderHook(() => useConversationMode());

      expect(result.current.templates).toEqual([]);
      expect(result.current.selectedTemplate).toBeNull();
      expect(result.current.userRole).toBe('');
      expect(result.current.currentTurnIndex).toBe(0);
      expect(result.current.loading).toBe(true);
      expect(result.current.completedTurns).toEqual(new Set());
      expect(result.current.currentTurn).toBeUndefined();
      expect(result.current.isUserTurn).toBe(false);
      expect(result.current.isComplete).toBe(false);
    });

    it('should fetch templates on mount', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue(mockTemplates),
      } as unknown as Response);

      const { result } = renderHook(() => useConversationMode());

      // Initially loading
      expect(result.current.loading).toBe(true);
      expect(result.current.templates).toEqual([]);

      // After fetch completes
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.templates).toEqual(mockTemplates);
      expect(fetch).toHaveBeenCalledWith('http://localhost:3001/api/speaking/templates');
    });
  });

  describe('Template Fetching', () => {
    it('should handle fetch error gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useConversationMode());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.templates).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith('Failed to fetch templates:', expect.any(Error));
      consoleSpy.mockRestore();
    });

    it('should handle non-ok response', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: vi.fn().mockResolvedValue({ error: 'Server error' }),
      } as unknown as Response);

      const { result } = renderHook(() => useConversationMode());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Response is still parsed even if not ok
      expect(result.current.templates).toEqual({ error: 'Server error' });
    });
  });

  describe('Conversation Selection', () => {
    it('should start a conversation with selected template and role', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue(mockTemplates),
      } as unknown as Response);

      const { result } = renderHook(() => useConversationMode());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const template = mockTemplates[0];
      act(() => {
        result.current.startConversation(template, 'customer');
      });

      expect(result.current.selectedTemplate).toEqual(template);
      expect(result.current.userRole).toBe('customer');
      expect(result.current.currentTurnIndex).toBe(0);
      expect(result.current.completedTurns).toEqual(new Set());
      expect(result.current.isComplete).toBe(false);
    });

    it('should identify user turn correctly', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue(mockTemplates),
      } as unknown as Response);

      const { result } = renderHook(() => useConversationMode());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const template = mockTemplates[0]; // First turn is 'waiter'
      act(() => {
        result.current.startConversation(template, 'customer');
      });

      // First turn is waiter, so not user turn
      expect(result.current.isUserTurn).toBe(false);
      expect(result.current.currentTurn).toEqual(template.turns[0]);
    });

    it('should identify user turn when speaker matches role', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue(mockTemplates),
      } as unknown as Response);

      const { result } = renderHook(() => useConversationMode());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const template = mockTemplates[0];
      act(() => {
        result.current.startConversation(template, 'waiter');
      });

      // First turn is waiter, so it IS user turn
      expect(result.current.isUserTurn).toBe(true);
    });
  });

  describe('Turn Progression', () => {
    it('should advance to next turn on handleTurnComplete', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue(mockTemplates),
      } as unknown as Response);

      const { result } = renderHook(() => useConversationMode());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const template = mockTemplates[0];
      act(() => {
        result.current.startConversation(template, 'customer');
      });

      // Complete first turn
      act(() => {
        result.current.handleTurnComplete();
      });

      expect(result.current.currentTurnIndex).toBe(1);
      expect(result.current.completedTurns).toEqual(new Set([0]));
      expect(result.current.currentTurn).toEqual(template.turns[1]);
    });

    it('should mark conversation complete when all turns done', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue(mockTemplates),
      } as unknown as Response);

      const { result } = renderHook(() => useConversationMode());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const template = mockTemplates[1]; // Only 2 turns
      act(() => {
        result.current.startConversation(template, 'traveler');
      });

      // Complete both turns
      act(() => {
        result.current.handleTurnComplete();
      });
      act(() => {
        result.current.handleTurnComplete();
      });

      expect(result.current.currentTurnIndex).toBe(2);
      expect(result.current.isComplete).toBe(true);
      expect(result.current.completedTurns).toEqual(new Set([0, 1]));
    });

    it('should not exceed turn count', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue(mockTemplates),
      } as unknown as Response);

      const { result } = renderHook(() => useConversationMode());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const template = mockTemplates[1]; // 2 turns
      act(() => {
        result.current.startConversation(template, 'traveler');
      });

      // Complete all turns + extra
      act(() => { result.current.handleTurnComplete(); });
      act(() => { result.current.handleTurnComplete(); });
      act(() => { result.current.handleTurnComplete(); });

      expect(result.current.currentTurnIndex).toBe(3);
      expect(result.current.isComplete).toBe(true);
      expect(result.current.currentTurn).toBeUndefined();
      expect(result.current.isUserTurn).toBe(false);
    });
  });

  describe('playTurn', () => {
    it('should speak the japanese text using speech synthesis', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue(mockTemplates),
      } as unknown as Response);

      const { result } = renderHook(() => useConversationMode());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const turn = mockTemplates[0].turns[0];
      act(() => {
        result.current.playTurn(turn);
      });

      expect(mockSpeak).toHaveBeenCalledTimes(1);
      const utterance = mockSpeak.mock.calls[0][0] as SpeechSynthesisUtterance;
      expect(utterance.text).toBe(turn.japanese);
      expect(utterance.lang).toBe('ja-JP');
    });
  });

  describe('goBack', () => {
    it('should reset conversation state', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue(mockTemplates),
      } as unknown as Response);

      const { result } = renderHook(() => useConversationMode());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Start a conversation
      act(() => {
        result.current.startConversation(mockTemplates[0], 'customer');
      });
      act(() => {
        result.current.handleTurnComplete();
      });

      // Now go back
      act(() => {
        result.current.goBack();
      });

      expect(result.current.selectedTemplate).toBeNull();
      expect(result.current.userRole).toBe('');
      expect(result.current.currentTurnIndex).toBe(0);
      expect(result.current.completedTurns).toEqual(new Set());
      expect(result.current.isComplete).toBe(false);
    });
  });

  describe('setSelectedTemplate', () => {
    it('should allow direct template selection', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue(mockTemplates),
      } as unknown as Response);

      const { result } = renderHook(() => useConversationMode());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.setSelectedTemplate(mockTemplates[1]);
      });

      expect(result.current.selectedTemplate).toEqual(mockTemplates[1]);
    });
  });

  describe('Loading State', () => {
    it('should remain loading until fetch completes', async () => {
      let resolveFetch: (value: Response) => void;
      const fetchPromise = new Promise<Response>((resolve) => {
        resolveFetch = resolve;
      });
      vi.mocked(fetch).mockReturnValueOnce(fetchPromise);

      const { result } = renderHook(() => useConversationMode());

      // Should still be loading
      expect(result.current.loading).toBe(true);

      // Resolve the fetch
      resolveFetch!({
        ok: true,
        json: vi.fn().mockResolvedValue(mockTemplates),
      } as unknown as Response);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.templates).toEqual(mockTemplates);
    });
  });
});
