import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useRepeatMode } from '../../hooks/useRepeatMode';
import { useFurigana } from '../../hooks/useFurigana';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';
import { usePronunciationCheck } from '../../hooks/usePronunciationCheck';
import { useVolume } from '../../hooks/useVolume';
import { PRACTICE_PHRASES } from '../../components/RepeatMode/practicePhrases';

// Hoisted mock functions shared across vi.mock factories
const mocks = vi.hoisted(() => ({
  play: vi.fn(),
  check: vi.fn(),
  clear: vi.fn(),
  setVolume: vi.fn(),
}));

vi.mock('../../hooks/useFurigana', () => ({
  useFurigana: vi.fn(() => ({ furigana: null, isLoading: false })),
}));

vi.mock('../../hooks/useAudioPlayer', () => ({
  useAudioPlayer: vi.fn(() => ({
    play: mocks.play,
    isPlaying: false,
    pause: vi.fn(),
    stop: vi.fn(),
    currentTime: 0,
    duration: 0,
  })),
}));

vi.mock('../../hooks/usePronunciationCheck', () => ({
  usePronunciationCheck: vi.fn(() => ({
    result: null,
    isChecking: false,
    error: null,
    check: mocks.check,
    clear: mocks.clear,
  })),
}));

vi.mock('../../hooks/useVolume', () => ({
  useVolume: vi.fn(() => [1, mocks.setVolume]),
}));

vi.mock('../../config/api.js', () => ({
  API_URL: 'http://localhost:3001',
}));

const phrases = PRACTICE_PHRASES.japanese;

const mockFetchSuccess = () => {
  vi.mocked(fetch).mockResolvedValue({
    ok: true,
    blob: vi.fn().mockResolvedValue(new Blob(['audio-data'], { type: 'audio/mpeg' })),
  } as unknown as Response);
};

describe('useRepeatMode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useFurigana).mockReturnValue({ furigana: null, isLoading: false });
    vi.mocked(useAudioPlayer).mockReturnValue({
      play: mocks.play,
      isPlaying: false,
      pause: vi.fn(),
      stop: vi.fn(),
      currentTime: 0,
      duration: 0,
    } as unknown as ReturnType<typeof useAudioPlayer>);
    vi.mocked(usePronunciationCheck).mockReturnValue({
      result: null,
      isChecking: false,
      error: null,
      check: mocks.check,
      clear: mocks.clear,
    } as unknown as ReturnType<typeof usePronunciationCheck>);
    vi.mocked(useVolume).mockReturnValue([1, mocks.setVolume] as unknown as ReturnType<typeof useVolume>);

    // localStorage mock from setup returns undefined; keep it consistent
    vi.mocked(localStorage.getItem).mockReturnValue(null);
    (URL as unknown as { createObjectURL: unknown }).createObjectURL = vi.fn(() => 'blob:mock-audio-url');
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initial State', () => {
    it('should initialize with the first phrase and default settings', async () => {
      mockFetchSuccess();

      const { result } = renderHook(() => useRepeatMode());

      // Mount auto-fetch flips isFetchingAudio synchronously; wait for it to settle
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.phrases).toEqual(phrases);
      expect(result.current.currentPhrase).toEqual(phrases[0]);
      expect(result.current.furigana).toBeNull();
      expect(result.current.isPlaying).toBe(false);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.volume).toBe(1);
      expect(result.current.showTranslation).toBe(false);
      expect(result.current.showFurigana).toBe(true);
      expect(result.current.recordingMode).toBe('push-to-talk');
      expect(result.current.isListening).toBe(false);
      expect(result.current.vadResetCounter).toBe(0);
      expect(result.current.pronunciationResult).toBeNull();
      expect(result.current.isChecking).toBe(false);
    });

    it('should report isLoading while fetching audio on mount', async () => {
      // Fetch that stays pending so isFetchingAudio remains true
      vi.mocked(fetch).mockReturnValue(new Promise<Response>(() => {}));

      const { result } = renderHook(() => useRepeatMode());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(true);
      });
    });
  });

  describe('Audio Fetching', () => {
    it('should fetch and play audio for the first phrase on mount', async () => {
      mockFetchSuccess();

      renderHook(() => useRepeatMode());

      await waitFor(() => {
        expect(mocks.play).toHaveBeenCalledWith('blob:mock-audio-url');
      });

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/repeat-after-me',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            target_text: phrases[0].text,
            language: 'japanese',
            gender: 'female',
            voiceStyle: 'normal',
          }),
        })
      );
    });

    it('should replay cached audio without a new fetch', async () => {
      mockFetchSuccess();

      const { result } = renderHook(() => useRepeatMode());

      await waitFor(() => {
        expect(mocks.play).toHaveBeenCalledTimes(1);
      });
      expect(fetch).toHaveBeenCalledTimes(1);

      await act(async () => {
        result.current.fetchAndPlayAudio();
      });

      expect(mocks.play).toHaveBeenCalledTimes(2);
      expect(mocks.play).toHaveBeenLastCalledWith('blob:mock-audio-url');
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('should not play audio when the API responds with an error', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 500,
      } as unknown as Response);

      renderHook(() => useRepeatMode());

      // Allow the fetch effect to settle
      await act(async () => {
        await Promise.resolve();
      });

      expect(mocks.play).not.toHaveBeenCalled();
    });

    it('should log an error and recover when the fetch fails', async () => {
      const networkError = new Error('Network down');
      vi.mocked(fetch).mockRejectedValue(networkError);

      const { result } = renderHook(() => useRepeatMode());

      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith('Error fetching audio:', networkError);
      });

      // isFetchingAudio must be reset so loading state doesn't stick
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('nextPhrase', () => {
    it('should advance to the next phrase and reset transient state', async () => {
      mockFetchSuccess();

      const { result } = renderHook(() => useRepeatMode());

      act(() => {
        result.current.toggleTranslation();
        result.current.handleStartListening();
      });
      expect(result.current.showTranslation).toBe(true);
      expect(result.current.isListening).toBe(true);

      act(() => {
        result.current.nextPhrase();
      });

      expect(result.current.currentPhrase).toEqual(phrases[1]);
      expect(result.current.showTranslation).toBe(false);
      expect(result.current.isListening).toBe(false);
      expect(result.current.vadResetCounter).toBe(1);
      expect(mocks.clear).toHaveBeenCalled();
    });

    it('should wrap around to the first phrase after the last one', async () => {
      mockFetchSuccess();

      const { result } = renderHook(() => useRepeatMode());

      // Each call needs its own act() so nextPhrase gets a fresh phraseIndex closure
      for (let i = 0; i < phrases.length; i++) {
        act(() => {
          result.current.nextPhrase();
        });
      }

      expect(result.current.currentPhrase).toEqual(phrases[0]);
      expect(result.current.vadResetCounter).toBe(phrases.length);
    });

    it('should fetch audio for the newly selected phrase', async () => {
      mockFetchSuccess();

      const { result } = renderHook(() => useRepeatMode());

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledTimes(1);
      });

      act(() => {
        result.current.nextPhrase();
      });

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledTimes(2);
      });

      const lastCall = vi.mocked(fetch).mock.calls[1][0] as string;
      expect(lastCall).toBe('http://localhost:3001/api/repeat-after-me');
      const body = JSON.parse(vi.mocked(fetch).mock.calls[1][1]?.body as string);
      expect(body.target_text).toBe(phrases[1].text);
    });
  });

  describe('Toggles and Settings', () => {
    it('should toggle translation visibility', () => {
      const { result } = renderHook(() => useRepeatMode());

      act(() => result.current.toggleTranslation());
      expect(result.current.showTranslation).toBe(true);

      act(() => result.current.toggleTranslation());
      expect(result.current.showTranslation).toBe(false);
    });

    it('should toggle furigana visibility', () => {
      const { result } = renderHook(() => useRepeatMode());

      act(() => result.current.toggleFurigana());
      expect(result.current.showFurigana).toBe(false);

      act(() => result.current.toggleFurigana());
      expect(result.current.showFurigana).toBe(true);
    });

    it('should change recording mode', () => {
      const { result } = renderHook(() => useRepeatMode());

      act(() => result.current.setRecordingMode('voice-activated'));
      expect(result.current.recordingMode).toBe('voice-activated');
    });

    it('should delegate volume changes to useVolume setter', () => {
      const { result } = renderHook(() => useRepeatMode());

      act(() => result.current.setVolume(0.4));
      expect(mocks.setVolume).toHaveBeenCalledWith(0.4);
    });

    it('should toggle listening state', () => {
      const { result } = renderHook(() => useRepeatMode());

      act(() => result.current.handleStartListening());
      expect(result.current.isListening).toBe(true);

      act(() => result.current.handleStopListening());
      expect(result.current.isListening).toBe(false);
    });
  });

  describe('Recording and Pronunciation Check', () => {
    it('should submit the recording for the current phrase', async () => {
      mockFetchSuccess();
      mocks.check.mockResolvedValue(undefined);

      const { result } = renderHook(() => useRepeatMode());

      const blob = new Blob(['voice'], { type: 'audio/wav' });
      await act(async () => {
        await result.current.handleRecordingComplete(blob);
      });

      expect(mocks.check).toHaveBeenCalledWith(blob, phrases[0].text, 'japanese');
    });
  });

  describe('Spacebar Shortcut', () => {
    const pressSpace = () => {
      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space' }));
      });
    };

    it('should advance to the next phrase when Space is pressed', async () => {
      mockFetchSuccess();

      const { result } = renderHook(() => useRepeatMode());
      expect(result.current.currentPhrase).toEqual(phrases[0]);

      // Let the mount auto-fetch settle — Space is ignored while isLoading
      await waitFor(() => {
        expect(mocks.play).toHaveBeenCalled();
      });

      pressSpace();

      expect(result.current.currentPhrase).toEqual(phrases[1]);
    });

    it('should ignore Space while a pronunciation check is running', async () => {
      mockFetchSuccess();

      const { result, rerender } = renderHook(() => useRepeatMode());

      vi.mocked(usePronunciationCheck).mockReturnValue({
        result: null,
        isChecking: true,
        error: null,
        check: mocks.check,
        clear: mocks.clear,
      } as unknown as ReturnType<typeof usePronunciationCheck>);
      rerender();

      await waitFor(() => {
        expect(result.current.isChecking).toBe(true);
      });

      pressSpace();

      expect(result.current.currentPhrase).toEqual(phrases[0]);
    });

    it('should ignore Space when typing in an input field', async () => {
      mockFetchSuccess();

      const { result } = renderHook(() => useRepeatMode());
      const input = document.createElement('input');
      document.body.appendChild(input);
      input.focus();
      expect(document.activeElement?.tagName).toBe('INPUT');

      await waitFor(() => {
        expect(mocks.play).toHaveBeenCalled();
      });

      pressSpace();

      expect(result.current.currentPhrase).toEqual(phrases[0]);

      input.remove();
    });

    it('should ignore repeated Space keydown events', async () => {
      mockFetchSuccess();

      const { result } = renderHook(() => useRepeatMode());

      await waitFor(() => {
        expect(mocks.play).toHaveBeenCalled();
      });

      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space', repeat: true }));
      });

      expect(result.current.currentPhrase).toEqual(phrases[0]);
    });
  });
});
