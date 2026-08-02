import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useResponseDrills, type ResponseDrill } from '../../components/SpeakingMode/hooks/useResponseDrills';

vi.mock('../../config/api.js', () => ({
  API_URL: 'http://localhost:3001',
}));

const mockDrills: ResponseDrill[] = [
  {
    id: 1,
    cue_text: 'How was your weekend?',
    suggested_response: 'It was great, thank you!',
    time_limit_seconds: 15,
    difficulty: 'beginner',
    category: 'daily',
  },
  {
    id: 2,
    cue_text: 'What are your hobbies?',
    suggested_response: 'I like reading and hiking.',
    time_limit_seconds: 10,
    difficulty: 'intermediate',
    category: 'interests',
  },
];

describe('useResponseDrills', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  describe('Initial State', () => {
    it('should initialize with correct default state', () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue([]),
      } as unknown as Response);

      const { result, unmount } = renderHook(() => useResponseDrills());

      expect(result.current.drills).toEqual([]);
      expect(result.current.currentDrill).toBeNull();
      expect(result.current.loading).toBe(true);
      expect(result.current.timeLeft).toBe(0);
      expect(result.current.isActive).toBe(false);
      expect(result.current.evaluation).toBeNull();

      unmount();
    });

    it('should fetch drills on mount', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockDrills),
      } as unknown as Response);

      const { result } = renderHook(() => useResponseDrills());

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.drills).toEqual(mockDrills);
      expect(fetch).toHaveBeenCalledWith('http://localhost:3001/api/speaking/response-drills');
    });
  });

  describe('Fetch Handling', () => {
    it('should handle fetch error gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.mocked(fetch).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useResponseDrills());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.drills).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith('Failed to fetch response drills:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });

  describe('Drill Lifecycle', () => {
    beforeEach(() => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockDrills),
      } as unknown as Response);
    });

    it('should set the current drill and start the timer', async () => {
      const { result } = renderHook(() => useResponseDrills());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.startDrill(mockDrills[0]);
      });

      expect(result.current.currentDrill).toEqual(mockDrills[0]);
      expect(result.current.timeLeft).toBe(15);
      expect(result.current.isActive).toBe(true);
      expect(result.current.evaluation).toBeNull();
    });

    it('should reset drill state and stop timer when going back', async () => {
      const { result } = renderHook(() => useResponseDrills());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.startDrill(mockDrills[0]);
      });

      expect(result.current.timeLeft).toBe(15);

      act(() => {
        result.current.goBack();
      });

      expect(result.current.currentDrill).toBeNull();
      expect(result.current.isActive).toBe(false);
      expect(result.current.timeLeft).toBe(15);
      expect(result.current.evaluation).toBeNull();
    });
  });

  describe('Timer', () => {
    beforeEach(() => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockDrills),
      } as unknown as Response);
    });

    it('should decrement timeLeft every second while active', async () => {
      const shortDrill: ResponseDrill = { ...mockDrills[1], time_limit_seconds: 5 };
      const { result } = renderHook(() => useResponseDrills());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.startDrill(shortDrill);
      });

      expect(result.current.timeLeft).toBe(5);

      await waitFor(() => {
        expect(result.current.timeLeft).toBe(4);
      }, { timeout: 2000 });
    });

    it('should stop the timer when timeLeft reaches 0', async () => {
      const shortDrill: ResponseDrill = { ...mockDrills[1], time_limit_seconds: 1 };
      const { result } = renderHook(() => useResponseDrills());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.startDrill(shortDrill);
      });

      expect(result.current.timeLeft).toBe(1);
      expect(result.current.isActive).toBe(true);

      await waitFor(() => {
        expect(result.current.timeLeft).toBe(0);
      }, { timeout: 2000 });

      expect(result.current.isActive).toBe(false);
    });
  });

  describe('getTimerClass', () => {
    beforeEach(() => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockDrills),
      } as unknown as Response);
    });

    it('should return danger when timeLeft <= 5', async () => {
      const dangerDrill: ResponseDrill = { ...mockDrills[0], time_limit_seconds: 5 };
      const { result } = renderHook(() => useResponseDrills());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.startDrill(dangerDrill);
      });

      expect(result.current.getTimerClass()).toBe('danger');
    });

    it('should return warning when timeLeft <= 10 and > 5', async () => {
      const warningDrill: ResponseDrill = { ...mockDrills[0], time_limit_seconds: 10 };
      const { result } = renderHook(() => useResponseDrills());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.startDrill(warningDrill);
      });

      expect(result.current.timeLeft).toBe(10);
      expect(result.current.getTimerClass()).toBe('warning');
    });

    it('should return empty string when timeLeft > 10', async () => {
      const { result } = renderHook(() => useResponseDrills());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.startDrill(mockDrills[0]);
      });

      expect(result.current.timeLeft).toBe(15);
      expect(result.current.getTimerClass()).toBe('');
    });
  });

  describe('handleRecordingComplete', () => {
    beforeEach(() => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockDrills),
      } as unknown as Response);
    });

    it('should submit evaluation and set result', async () => {
      const mockEvaluation = { score: 85, feedback: 'Good response!' };
      vi.mocked(fetch)
        .mockResolvedValueOnce({
          ok: true,
          json: vi.fn().mockResolvedValue(mockDrills),
        } as unknown as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: vi.fn().mockResolvedValue(mockEvaluation),
        } as unknown as Response);

      const { result } = renderHook(() => useResponseDrills());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.startDrill(mockDrills[0]);
      });

      const blob = new Blob(['audio'], { type: 'audio/webm' });

      await act(async () => {
        await result.current.handleRecordingComplete(blob);
      });

      expect(result.current.isActive).toBe(false);
      expect(result.current.evaluation).toEqual(mockEvaluation);
      expect(fetch).toHaveBeenLastCalledWith(
        'http://localhost:3001/api/speaking/evaluate-response',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userResponse: '[recorded audio]',
            suggestedResponse: mockDrills[0].suggested_response,
            drillId: mockDrills[0].id,
          }),
        })
      );
    });

    it('should not evaluate when no current drill is selected', async () => {
      const { result } = renderHook(() => useResponseDrills());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const blob = new Blob(['audio'], { type: 'audio/webm' });

      await act(async () => {
        await result.current.handleRecordingComplete(blob);
      });

      expect(result.current.evaluation).toBeNull();
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('should handle evaluation error gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.mocked(fetch)
        .mockResolvedValueOnce({
          ok: true,
          json: vi.fn().mockResolvedValue(mockDrills),
        } as unknown as Response)
        .mockRejectedValueOnce(new Error('Evaluation failed'));

      const { result } = renderHook(() => useResponseDrills());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.startDrill(mockDrills[0]);
      });

      const blob = new Blob(['audio'], { type: 'audio/webm' });

      await act(async () => {
        await result.current.handleRecordingComplete(blob);
      });

      expect(result.current.isActive).toBe(false);
      expect(result.current.evaluation).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith('Evaluation failed:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });
});
