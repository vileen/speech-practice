import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useShowFurigana } from '../../hooks/useShowFurigana';

describe('useShowFurigana', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('Initial State', () => {
    it('should use default value (true) when localStorage is empty', () => {
      vi.mocked(localStorage.getItem).mockReturnValue(null);
      
      const { result } = renderHook(() => useShowFurigana());
      expect(result.current[0]).toBe(true);
    });

    it('should use custom default value when provided', () => {
      vi.mocked(localStorage.getItem).mockReturnValue(null);
      
      const { result } = renderHook(() => useShowFurigana('customKey', false));
      expect(result.current[0]).toBe(false);
    });

    it('should load true value from localStorage when saved as "true"', () => {
      vi.mocked(localStorage.getItem).mockImplementation((key: string) => {
        if (key === 'speechPracticeShowFurigana') return 'true';
        return null;
      });
      
      const { result } = renderHook(() => useShowFurigana());
      expect(result.current[0]).toBe(true);
    });

    it('should load false value from localStorage when saved as "false"', () => {
      vi.mocked(localStorage.getItem).mockImplementation((key: string) => {
        if (key === 'speechPracticeShowFurigana') return 'false';
        return null;
      });
      
      const { result } = renderHook(() => useShowFurigana());
      expect(result.current[0]).toBe(false);
    });

    it('should load from custom storage key', () => {
      vi.mocked(localStorage.getItem).mockImplementation((key: string) => {
        if (key === 'customFuriganaKey') return 'false';
        return null;
      });
      
      const { result } = renderHook(() => useShowFurigana('customFuriganaKey'));
      expect(result.current[0]).toBe(false);
    });
  });

  describe('State Updates', () => {
    it('should update showFurigana state to false', () => {
      vi.mocked(localStorage.getItem).mockReturnValue(null);
      const { result } = renderHook(() => useShowFurigana());
      
      act(() => {
        result.current[1](false);
      });

      expect(result.current[0]).toBe(false);
    });

    it('should update showFurigana state to true', () => {
      vi.mocked(localStorage.getItem).mockImplementation((key: string) => {
        if (key === 'speechPracticeShowFurigana') return 'false';
        return null;
      });
      
      const { result } = renderHook(() => useShowFurigana());
      expect(result.current[0]).toBe(false);

      act(() => {
        result.current[1](true);
      });

      expect(result.current[0]).toBe(true);
    });

    it('should handle multiple toggle changes', () => {
      vi.mocked(localStorage.getItem).mockReturnValue(null);
      const { result } = renderHook(() => useShowFurigana());

      // Toggle to false
      act(() => {
        result.current[1](false);
      });
      expect(result.current[0]).toBe(false);

      // Toggle back to true
      act(() => {
        result.current[1](true);
      });
      expect(result.current[0]).toBe(true);

      // Toggle to false again
      act(() => {
        result.current[1](false);
      });
      expect(result.current[0]).toBe(false);
    });

    it('should handle functional state updates', () => {
      vi.mocked(localStorage.getItem).mockReturnValue(null);
      const { result } = renderHook(() => useShowFurigana());

      // Use functional update to toggle
      act(() => {
        result.current[1]((prev: boolean) => !prev);
      });

      expect(result.current[0]).toBe(false);
    });
  });

  describe('localStorage Persistence', () => {
    it('should save to localStorage when state changes to true', () => {
      vi.mocked(localStorage.getItem).mockReturnValue(null);
      const { result } = renderHook(() => useShowFurigana());

      act(() => {
        result.current[1](true);
      });

      expect(localStorage.setItem).toHaveBeenCalledWith('speechPracticeShowFurigana', 'true');
    });

    it('should save to localStorage when state changes to false', () => {
      vi.mocked(localStorage.getItem).mockReturnValue(null);
      const { result } = renderHook(() => useShowFurigana());

      act(() => {
        result.current[1](false);
      });

      expect(localStorage.setItem).toHaveBeenCalledWith('speechPracticeShowFurigana', 'false');
    });

    it('should save to custom storage key when provided', () => {
      vi.mocked(localStorage.getItem).mockReturnValue(null);
      const { result } = renderHook(() => useShowFurigana('myCustomKey'));

      act(() => {
        result.current[1](false);
      });

      expect(localStorage.setItem).toHaveBeenCalledWith('myCustomKey', 'false');
    });

    it('should update localStorage on each state change', () => {
      vi.mocked(localStorage.getItem).mockReturnValue(null);
      const { result } = renderHook(() => useShowFurigana());

      // Clear mocks after initial render (useEffect runs on mount)
      vi.mocked(localStorage.setItem).mockClear();

      act(() => {
        result.current[1](false);
      });
      expect(localStorage.setItem).toHaveBeenCalledWith('speechPracticeShowFurigana', 'false');

      act(() => {
        result.current[1](true);
      });
      expect(localStorage.setItem).toHaveBeenLastCalledWith('speechPracticeShowFurigana', 'true');

      expect(localStorage.setItem).toHaveBeenCalledTimes(2);
    });
  });

  describe('Edge Cases', () => {
    it('should handle invalid localStorage values gracefully', () => {
      // Invalid values should be treated as false (only "true" string is truthy)
      vi.mocked(localStorage.getItem).mockImplementation((key: string) => {
        if (key === 'speechPracticeShowFurigana') return 'invalid';
        return null;
      });
      
      const { result } = renderHook(() => useShowFurigana());
      expect(result.current[0]).toBe(false);
    });

    it('should handle empty string in localStorage as default value', () => {
      // Empty string is falsy, so it falls back to default (true)
      vi.mocked(localStorage.getItem).mockImplementation((key: string) => {
        if (key === 'speechPracticeShowFurigana') return '';
        return null;
      });
      
      const { result } = renderHook(() => useShowFurigana());
      expect(result.current[0]).toBe(true);
    });

    it('should handle rerenders without changing localStorage state', () => {
      vi.mocked(localStorage.getItem).mockImplementation((key: string) => {
        if (key === 'speechPracticeShowFurigana') return 'true';
        return null;
      });
      
      const { result, rerender } = renderHook(() => useShowFurigana());
      
      // Initial render should have read from localStorage
      expect(result.current[0]).toBe(true);
      
      // Clear mock to track new calls
      vi.mocked(localStorage.setItem).mockClear();
      
      // Rerender without state change
      rerender();
      
      // Should not write to localStorage on rerender if state hasn't changed
      expect(localStorage.setItem).not.toHaveBeenCalled();
    });

    it('should persist state across multiple hooks with same key', () => {
      vi.mocked(localStorage.getItem).mockImplementation((key: string) => {
        if (key === 'sharedKey') return 'true';
        return null;
      });
      
      const { result: result1 } = renderHook(() => useShowFurigana('sharedKey'));
      const { result: result2 } = renderHook(() => useShowFurigana('sharedKey'));
      
      expect(result1.current[0]).toBe(true);
      expect(result2.current[0]).toBe(true);
    });

    it('should handle independent state with different keys', () => {
      vi.mocked(localStorage.getItem).mockImplementation((key: string) => {
        if (key === 'key1') return 'true';
        if (key === 'key2') return 'false';
        return null;
      });
      
      const { result: result1 } = renderHook(() => useShowFurigana('key1'));
      const { result: result2 } = renderHook(() => useShowFurigana('key2'));
      
      expect(result1.current[0]).toBe(true);
      expect(result2.current[0]).toBe(false);
    });
  });
});
