import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useLessonFurigana } from '../../hooks/useLessonFurigana';

// Mock the API config
vi.mock('../../config/api.js', () => ({
  API_URL: 'http://localhost:3001',
}));

describe('useLessonFurigana', () => {
  const password = 'test-password';

  beforeEach(() => {
    vi.restoreAllMocks();
    // Explicitly reset localStorage mocks to avoid stale implementations between tests
    vi.mocked(localStorage.getItem).mockReturnValue(null);
    vi.mocked(localStorage.setItem).mockReturnValue(undefined);
    vi.mocked(localStorage.removeItem).mockReturnValue(undefined);
    vi.mocked(localStorage.clear).mockReturnValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initial State', () => {
    it('should initialize with empty cache and no loading/failed states', () => {
      const { result } = renderHook(() => useLessonFurigana(password));

      expect(result.current.furiganaCache).toEqual({});
      expect(result.current.furiganaLoading).toEqual({});
      expect(result.current.furiganaFailed).toEqual({});
    });

    it('should load cache from localStorage on init', () => {
      const cachedData = {
        '学校': { furigana: '<ruby>学校<rt>がっこう</rt></ruby>', timestamp: Date.now(), version: '3' },
      };
      vi.mocked(localStorage.getItem).mockImplementation((key: string) => {
        if (key === 'furiganaCache') return JSON.stringify(cachedData);
        if (key === 'furiganaCacheVersion') return '3';
        return null;
      });

      const { result } = renderHook(() => useLessonFurigana(password));

      expect(result.current.furiganaCache).toEqual(cachedData);
    });

    it('should invalidate cache if version mismatch', () => {
      const cachedData = {
        '学校': { furigana: '<ruby>学校<rt>がっこう</rt></ruby>', timestamp: Date.now(), version: '2' },
      };
      vi.mocked(localStorage.getItem).mockImplementation((key: string) => {
        if (key === 'furiganaCache') return JSON.stringify(cachedData);
        if (key === 'furiganaCacheVersion') return '2';
        return null;
      });

      const { result } = renderHook(() => useLessonFurigana(password));

      expect(result.current.furiganaCache).toEqual({});
      expect(localStorage.removeItem).toHaveBeenCalledWith('furiganaCache');
      expect(localStorage.setItem).toHaveBeenCalledWith('furiganaCacheVersion', '3');
    });
  });

  describe('fetchFurigana', () => {
    it('should return cached furigana without fetching', async () => {
      const cachedData = {
        '学校': { furigana: '<ruby>学校<rt>がっこう</rt></ruby>', timestamp: Date.now(), version: '3' },
      };
      vi.mocked(localStorage.getItem).mockImplementation((key: string) => {
        if (key === 'furiganaCache') return JSON.stringify(cachedData);
        if (key === 'furiganaCacheVersion') return '3';
        return null;
      });

      global.fetch = vi.fn();

      const { result } = renderHook(() => useLessonFurigana(password));

      let fetchedResult: string = '';
      await act(async () => {
        fetchedResult = await result.current.fetchFurigana('学校');
      });

      expect(fetchedResult).toBe('<ruby>学校<rt>がっこう</rt></ruby>');
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should fetch furigana from API when not cached', async () => {
      const mockResponse = { with_furigana: '<ruby>学校<rt>がっこう</rt></ruby>' };
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const { result } = renderHook(() => useLessonFurigana(password));

      let fetchedResult: string = '';
      await act(async () => {
        fetchedResult = await result.current.fetchFurigana('学校');
      });

      expect(fetchedResult).toBe('<ruby>学校<rt>がっこう</rt></ruby>');
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/furigana',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'X-Password': password,
          }),
          body: JSON.stringify({ text: '学校' }),
        })
      );
    });

    it('should set loading state during fetch', async () => {
      global.fetch = vi.fn().mockImplementation(() => new Promise(() => {}));

      const { result } = renderHook(() => useLessonFurigana(password));

      act(() => {
        result.current.fetchFurigana('学校');
      });

      await waitFor(() => {
        expect(result.current.furiganaLoading['学校']).toBe(true);
      });
    });

    it('should skip fetch if already loading', async () => {
      global.fetch = vi.fn().mockImplementation(() => new Promise(() => {}));

      const { result } = renderHook(() => useLessonFurigana(password));

      act(() => {
        result.current.fetchFurigana('学校');
      });

      await waitFor(() => {
        expect(result.current.furiganaLoading['学校']).toBe(true);
      });

      // Second call should return immediately without calling fetch again
      const secondCall = await act(async () => {
        return result.current.fetchFurigana('学校');
      });

      expect(secondCall).toBe('学校');
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should mark as failed on API error', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      } as Response);

      const { result } = renderHook(() => useLessonFurigana(password));

      await act(async () => {
        await result.current.fetchFurigana('学校');
      });

      await waitFor(() => {
        expect(result.current.furiganaFailed['学校']).toBe(true);
      });
      expect(result.current.furiganaLoading['学校']).toBe(false);
    });

    it('should mark as failed on network error', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useLessonFurigana(password));

      await act(async () => {
        await result.current.fetchFurigana('学校');
      });

      await waitFor(() => {
        expect(result.current.furiganaFailed['学校']).toBe(true);
      });
      expect(result.current.furiganaLoading['学校']).toBe(false);
      expect(console.error).toHaveBeenCalledWith('Error fetching furigana:', expect.any(Error));
    });

    it('should return original text when fetch fails', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      } as Response);

      const { result } = renderHook(() => useLessonFurigana(password));

      let fetchedResult: string = '';
      await act(async () => {
        fetchedResult = await result.current.fetchFurigana('学校');
      });

      expect(fetchedResult).toBe('学校');
    });

    it('should cache fetched result in localStorage', async () => {
      const mockResponse = { with_furigana: '<ruby>学校<rt>がっこう</rt></ruby>' };
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const { result } = renderHook(() => useLessonFurigana(password));

      await act(async () => {
        await result.current.fetchFurigana('学校');
      });

      await waitFor(() => {
        expect(localStorage.setItem).toHaveBeenCalledWith(
          'furiganaCache',
          expect.stringContaining('学校')
        );
      });
    });
  });

  describe('generateFuriganaFromReading', () => {
    it('should return null for empty reading', () => {
      const { result } = renderHook(() => useLessonFurigana(password));

      expect(result.current.generateFuriganaFromReading('安い', '')).toBeNull();
      expect(result.current.generateFuriganaFromReading('安い', null)).toBeNull();
      expect(result.current.generateFuriganaFromReading('安い', undefined)).toBeNull();
    });

    it('should return null for text without kanji', () => {
      const { result } = renderHook(() => useLessonFurigana(password));

      expect(result.current.generateFuriganaFromReading('ありがとう', 'ありがとう')).toBeNull();
      expect(result.current.generateFuriganaFromReading('hello', 'hello')).toBeNull();
    });

    it('should generate ruby HTML for kanji with reading', () => {
      const { result } = renderHook(() => useLessonFurigana(password));

      const html = result.current.generateFuriganaFromReading('安い', 'やす');
      expect(html).toBe('<ruby>安<rt>やす</rt></ruby>い');
    });

    it('should handle multiple kanji with okurigana', () => {
      const { result } = renderHook(() => useLessonFurigana(password));

      const html = result.current.generateFuriganaFromReading('学校', 'がっこう');
      expect(html).toBe('<ruby>学校<rt>がっこう</rt></ruby>');
    });

    it('should handle text with hiragana after kanji', () => {
      const { result } = renderHook(() => useLessonFurigana(password));

      const html = result.current.generateFuriganaFromReading('高い', 'たか');
      expect(html).toBe('<ruby>高<rt>たか</rt></ruby>い');
    });
  });

  describe('renderFurigana', () => {
    it('should return plain text when showFurigana is false', () => {
      const { result } = renderHook(() => useLessonFurigana(password));

      const rendered = result.current.renderFurigana('学校', false);
      expect(rendered).toBe('学校');
    });

    it('should render furigana from reading when available', () => {
      const { result } = renderHook(() => useLessonFurigana(password));

      const rendered = result.current.renderFurigana('安い', true, 'やす');
      expect(rendered).toEqual(
        expect.objectContaining({
          props: expect.objectContaining({
            dangerouslySetInnerHTML: expect.objectContaining({
              __html: '<ruby>安<rt>やす</rt></ruby>い',
            }),
          }),
        })
      );
    });

    it('should fallback to cached furigana when no reading', () => {
      const cachedData = {
        '学校': { furigana: '<ruby>学校<rt>がっこう</rt></ruby>', timestamp: Date.now(), version: '3' },
      };
      vi.mocked(localStorage.getItem).mockImplementation((key: string) => {
        if (key === 'furiganaCache') return JSON.stringify(cachedData);
        if (key === 'furiganaCacheVersion') return '3';
        return null;
      });

      const { result } = renderHook(() => useLessonFurigana(password));

      const rendered = result.current.renderFurigana('学校', true);
      expect(rendered).toEqual(
        expect.objectContaining({
          props: expect.objectContaining({
            dangerouslySetInnerHTML: expect.objectContaining({
              __html: '<ruby>学校<rt>がっこう</rt></ruby>',
            }),
          }),
        })
      );
    });

    it('should show failed state for kanji when fetch failed', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      } as Response);

      const { result } = renderHook(() => useLessonFurigana(password));

      await act(async () => {
        await result.current.fetchFurigana('漢字');
      });

      const rendered = result.current.renderFurigana('漢字', true);
      expect(rendered).toEqual(expect.objectContaining({ type: 'span' }));
    });

    it('should return plain text when no reading, cache, or failed state', () => {
      const { result } = renderHook(() => useLessonFurigana(password));

      const rendered = result.current.renderFurigana('学校', true);
      expect(rendered).toBe('学校');
    });
  });

  describe('prefetchLessonFurigana', () => {
    beforeEach(() => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should prefetch furigana for all lesson texts', async () => {
      const mockResponse = { with_furigana: '<ruby>学校<rt>がっこう</rt></ruby>' };
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const { result } = renderHook(() => useLessonFurigana(password));

      const lesson = {
        vocabulary: [{ jp: '学校' }, { jp: '先生' }],
        grammar: [
          {
            pattern: '〜てください',
            explanation: ' polite request form',
            examples: [{ jp: '行ってください' }],
          },
        ],
        practice_phrases: [{ jp: 'お願いします' }],
      };

      act(() => {
        result.current.prefetchLessonFurigana(lesson);
      });

      // Advance timers to trigger the delayed fetches
      await act(async () => {
        vi.advanceTimersByTime(200);
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('should skip already cached texts', async () => {
      const cachedData = {
        '学校': { furigana: '<ruby>学校<rt>がっこう</rt></ruby>', timestamp: Date.now(), version: '3' },
      };
      vi.mocked(localStorage.getItem).mockImplementation((key: string) => {
        if (key === 'furiganaCache') return JSON.stringify(cachedData);
        if (key === 'furiganaCacheVersion') return '3';
        return null;
      });

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ with_furigana: 'test' }),
      } as Response);

      const { result } = renderHook(() => useLessonFurigana(password));

      const lesson = {
        vocabulary: [{ jp: '学校' }],
        grammar: [],
        practice_phrases: [],
      };

      act(() => {
        result.current.prefetchLessonFurigana(lesson);
      });

      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should extract Japanese text from markdown table rows in explanations', async () => {
      const mockResponse = { with_furigana: 'test' };
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const { result } = renderHook(() => useLessonFurigana(password));

      const lesson = {
        vocabulary: [],
        grammar: [
          {
            pattern: '〜てください',
            explanation: '| Meaning | Example |\n| polite request | 行ってください |',
            examples: [],
          },
        ],
        practice_phrases: [],
      };

      act(() => {
        result.current.prefetchLessonFurigana(lesson);
      });

      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('should skip explanation lines without kanji', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ with_furigana: 'test' }),
      } as Response);

      const { result } = renderHook(() => useLessonFurigana(password));

      const lesson = {
        vocabulary: [],
        grammar: [
          {
            pattern: '〜てください',
            explanation: 'This is an English explanation without kanji.',
            examples: [],
          },
        ],
        practice_phrases: [],
      };

      act(() => {
        result.current.prefetchLessonFurigana(lesson);
      });

      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      // Pattern text is still fetched even without kanji, but explanation line is skipped
      // So we expect at least 1 call for the pattern, but NOT for the explanation text
      const calls = vi.mocked(global.fetch).mock.calls;
      const explanationCalls = calls.filter((call) => {
        const body = JSON.parse((call[1] as any)?.body || '{}');
        return body.text === 'This is an English explanation without kanji.';
      });
      expect(explanationCalls.length).toBe(0);
    });
  });

  describe('localStorage persistence', () => {
    it('should save cache to localStorage when cache updates', async () => {
      const mockResponse = { with_furigana: '<ruby>学校<rt>がっこう</rt></ruby>' };
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const { result } = renderHook(() => useLessonFurigana(password));

      await act(async () => {
        await result.current.fetchFurigana('学校');
      });

      await waitFor(() => {
        expect(localStorage.setItem).toHaveBeenCalledWith(
          'furiganaCache',
          expect.stringContaining('学校')
        );
        expect(localStorage.setItem).toHaveBeenCalledWith('furiganaCacheVersion', '3');
      });
    });
  });
});
