import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useTTS } from '../../hooks/useTTS';

describe('useTTS', () => {
  const mockCreateObjectURL = vi.fn();

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.mocked(global.fetch).mockClear();
    mockCreateObjectURL.mockReturnValue('blob:mock-audio-url');
    global.URL.createObjectURL = mockCreateObjectURL;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initial State', () => {
    it('should return fetchTTS function', () => {
      const { result } = renderHook(() => useTTS('normal'));

      expect(result.current.fetchTTS).toBeDefined();
      expect(typeof result.current.fetchTTS).toBe('function');
    });
  });

  describe('Successful TTS Fetch', () => {
    it('should fetch TTS audio and return blob URL', async () => {
      const mockBlob = new Blob(['audio-data'], { type: 'audio/mp3' });
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        blob: () => Promise.resolve(mockBlob),
      } as Response);

      // Mock localStorage.getItem to return password
      vi.mocked(localStorage.getItem).mockReturnValue('test-password');

      const { result } = renderHook(() => useTTS('normal'));

      const audioUrl = await result.current.fetchTTS(
        'こんにちは',
        { language: 'japanese', voice_gender: 'female' }
      );

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/tts'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'X-Password': 'test-password',
          }),
          body: JSON.stringify({
            text: 'こんにちは',
            language: 'japanese',
            gender: 'female',
            voiceStyle: 'normal',
          }),
        })
      );

      expect(mockCreateObjectURL).toHaveBeenCalledWith(mockBlob);
      expect(audioUrl).toBe('blob:mock-audio-url');
    });

    it('should use currentSession when sessionData is not provided', async () => {
      const mockBlob = new Blob(['audio-data'], { type: 'audio/mp3' });
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        blob: () => Promise.resolve(mockBlob),
      } as Response);

      vi.mocked(localStorage.getItem).mockReturnValue('test-password');

      const { result } = renderHook(() => useTTS('anime'));

      await result.current.fetchTTS(
        'Hello',
        undefined,
        { language: 'english', voice_gender: 'male' }
      );

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify({
            text: 'Hello',
            language: 'english',
            gender: 'male',
            voiceStyle: 'anime',
          }),
        })
      );
    });

    it('should prioritize sessionData over currentSession', async () => {
      const mockBlob = new Blob(['audio-data'], { type: 'audio/mp3' });
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        blob: () => Promise.resolve(mockBlob),
      } as Response);

      vi.mocked(localStorage.getItem).mockReturnValue('test-password');

      const { result } = renderHook(() => useTTS('normal'));

      await result.current.fetchTTS(
        'Test',
        { language: 'japanese', voice_gender: 'female' },
        { language: 'english', voice_gender: 'male' }
      );

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('"language":"japanese"'),
        })
      );
    });
  });

  describe('Error Handling', () => {
    it('should return null when no session data is provided', async () => {
      const { result } = renderHook(() => useTTS('normal'));

      const audioUrl = await result.current.fetchTTS('Hello');

      expect(audioUrl).toBeNull();
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should return null when no password is in localStorage', async () => {
      vi.mocked(localStorage.getItem).mockReturnValue('');

      const { result } = renderHook(() => useTTS('normal'));

      const audioUrl = await result.current.fetchTTS(
        'Hello',
        { language: 'english', voice_gender: 'female' }
      );

      expect(audioUrl).toBeNull();
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should return null when API response is not ok', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
      } as Response);

      vi.mocked(localStorage.getItem).mockReturnValue('wrong-password');

      const { result } = renderHook(() => useTTS('normal'));

      const audioUrl = await result.current.fetchTTS(
        'Hello',
        { language: 'english', voice_gender: 'female' }
      );

      expect(audioUrl).toBeNull();
    });

    it('should handle network errors gracefully', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'));

      vi.mocked(localStorage.getItem).mockReturnValue('test-password');

      const { result } = renderHook(() => useTTS('normal'));

      const audioUrl = await result.current.fetchTTS(
        'Hello',
        { language: 'english', voice_gender: 'female' }
      );

      expect(audioUrl).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error fetching TTS:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });

    it('should handle non-Error exceptions', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.mocked(global.fetch).mockRejectedValueOnce('String error');

      vi.mocked(localStorage.getItem).mockReturnValue('test-password');

      const { result } = renderHook(() => useTTS('normal'));

      const audioUrl = await result.current.fetchTTS(
        'Hello',
        { language: 'english', voice_gender: 'female' }
      );

      expect(audioUrl).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Voice Style Updates', () => {
    it('should use the voiceStyle from hook initialization', async () => {
      const mockBlob = new Blob(['audio-data'], { type: 'audio/mp3' });
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        blob: () => Promise.resolve(mockBlob),
      } as Response);

      vi.mocked(localStorage.getItem).mockReturnValue('test-password');

      const { result } = renderHook(() => useTTS('anime'));

      await result.current.fetchTTS(
        'Hello',
        { language: 'japanese', voice_gender: 'female' }
      );

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('"voiceStyle":"anime"'),
        })
      );
    });

    it('should update when voiceStyle changes', async () => {
      const mockBlob = new Blob(['audio-data'], { type: 'audio/mp3' });
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        blob: () => Promise.resolve(mockBlob),
      } as Response);

      vi.mocked(localStorage.getItem).mockReturnValue('test-password');

      const { result, rerender } = renderHook(
        ({ voiceStyle }) => useTTS(voiceStyle),
        { initialProps: { voiceStyle: 'normal' as const } }
      );

      await result.current.fetchTTS(
        'Hello',
        { language: 'japanese', voice_gender: 'female' }
      );

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('"voiceStyle":"normal"'),
        })
      );

      // Change voice style
      rerender({ voiceStyle: 'whisper' as const });

      await result.current.fetchTTS(
        'Hello',
        { language: 'japanese', voice_gender: 'female' }
      );

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('"voiceStyle":"whisper"'),
        })
      );
    });
  });

  describe('Password Handling', () => {
    it('should use empty string when password is not set', async () => {
      vi.mocked(localStorage.getItem).mockReturnValue('');

      const { result } = renderHook(() => useTTS('normal'));

      const audioUrl = await result.current.fetchTTS(
        'Hello',
        { language: 'english', voice_gender: 'female' }
      );

      expect(audioUrl).toBeNull();
    });
  });

  describe('Fetch Memoization', () => {
    it('should return the same fetchTTS function reference when voiceStyle unchanged', () => {
      const { result, rerender } = renderHook(() => useTTS('normal'));

      const firstFetchTTS = result.current.fetchTTS;

      rerender();

      expect(result.current.fetchTTS).toBe(firstFetchTTS);
    });

    it('should return a new fetchTTS function when voiceStyle changes', () => {
      const { result, rerender } = renderHook(
        ({ voiceStyle }) => useTTS(voiceStyle),
        { initialProps: { voiceStyle: 'normal' as const } }
      );

      const firstFetchTTS = result.current.fetchTTS;

      rerender({ voiceStyle: 'anime' as const });

      expect(result.current.fetchTTS).not.toBe(firstFetchTTS);
    });
  });
});
