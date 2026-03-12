import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useFurigana } from '../../hooks/useFurigana';

describe('useFurigana', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initial State', () => {
    it('should initialize with null furigana and not loading', () => {
      const { result } = renderHook(() => useFurigana(''));

      expect(result.current.furigana).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('Text without Kanji', () => {
    it('should return null for text without kanji (hiragana only)', () => {
      const { result } = renderHook(() => useFurigana('ありがとう'));

      expect(result.current.furigana).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });

    it('should return null for text without kanji (katakana only)', () => {
      const { result } = renderHook(() => useFurigana('コンピュータ'));

      expect(result.current.furigana).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });

    it('should return null for text without kanji (romaji/numbers)', () => {
      const { result } = renderHook(() => useFurigana('hello 123'));

      expect(result.current.furigana).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('Text with Kanji', () => {
    it('should fetch furigana for text containing kanji', async () => {
      const mockResponse = {
        with_furigana: '学校[がっこう]に行きます',
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const { result } = renderHook(() => useFurigana('学校に行きます'));

      // Should start loading
      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.furigana).toBe('学校[がっこう]に行きます');
      expect(result.current.error).toBeNull();
    });

    it('should set loading state during fetch', async () => {
      global.fetch = vi.fn().mockImplementation(() => new Promise(() => {}));

      const { result } = renderHook(() => useFurigana('日本語'));

      expect(result.current.isLoading).toBe(true);
    });

    it('should call API with correct parameters', async () => {
      const mockResponse = {
        with_furigana: '漢字[かんじ]',
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      renderHook(() => useFurigana('漢字'));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/furigana'),
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
              'Content-Type': 'application/json',
            }),
            body: JSON.stringify({ text: '漢字' }),
          })
        );
      });
    });
  });

  describe('API Errors', () => {
    it('should handle API error response', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      } as Response);

      const { result } = renderHook(() => useFurigana('漢字'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('Failed to fetch furigana');
      expect(result.current.furigana).toBeNull();
    });

    it('should handle network errors', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useFurigana('漢字'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('Network error');
      expect(result.current.furigana).toBeNull();
    });

    it('should handle non-Error exceptions', async () => {
      global.fetch = vi.fn().mockRejectedValue('String error');

      const { result } = renderHook(() => useFurigana('漢字'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('Unknown error');
    });
  });

  describe('Disabled State', () => {
    it('should not fetch when enabled is false', () => {
      global.fetch = vi.fn();

      renderHook(() => useFurigana('漢字', false));

      expect(global.fetch).not.toHaveBeenCalled();
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should fetch when enabled changes to true', async () => {
      const mockResponse = {
        with_furigana: '学校[がっこう]',
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const { result, rerender } = renderHook(
        ({ text, enabled }) => useFurigana(text, enabled),
        { initialProps: { text: '学校', enabled: false } }
      );

      expect(global.fetch).not.toHaveBeenCalled();

      rerender({ text: '学校', enabled: true });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });
  });

  describe('Empty Text', () => {
    it('should not fetch for empty string', () => {
      global.fetch = vi.fn();

      renderHook(() => useFurigana(''));

      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('Refresh Functionality', () => {
    it('should refetch when refresh is called', async () => {
      const mockResponse = {
        with_furigana: '学校[がっこう]',
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const { result } = renderHook(() => useFurigana('学校'));

      await waitFor(() => {
        expect(result.current.furigana).toBe('学校[がっこう]');
      });

      // Clear the mock to track new calls
      vi.mocked(global.fetch).mockClear();

      act(() => {
        result.current.refresh();
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1);
      });
    });

    it('should not refresh when text is empty', async () => {
      global.fetch = vi.fn();

      const { result } = renderHook(() => useFurigana(''));

      act(() => {
        result.current.refresh();
      });

      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('Text Changes', () => {
    it('should refetch when text changes', async () => {
      const mockResponse1 = { with_furigana: '学校[がっこう]' };
      const mockResponse2 = { with_furigana: '日本[にほん]' };

      global.fetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResponse1),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResponse2),
        } as Response);

      const { result, rerender } = renderHook(
        ({ text }) => useFurigana(text),
        { initialProps: { text: '学校' } }
      );

      await waitFor(() => {
        expect(result.current.furigana).toBe('学校[がっこう]');
      });

      rerender({ text: '日本' });

      await waitFor(() => {
        expect(result.current.furigana).toBe('日本[にほん]');
      });

      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should handle kanji detection with mixed scripts', async () => {
      const mockResponse = {
        with_furigana: '私[わたし]はstudentです',
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const { result } = renderHook(() => useFurigana('私はstudentです'));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      expect(result.current.furigana).toBe('私[わたし]はstudentです');
    });
  });

  describe('Password Handling', () => {
    it('should use empty string when password is not in localStorage', async () => {
      const mockResponse = { with_furigana: '学校[がっこう]' };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      renderHook(() => useFurigana('学校'));

      await waitFor(() => {
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
  });
});
