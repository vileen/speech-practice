import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useSpeechAssessment, useTranscription } from '../../hooks/useSpeechAssessment';

// Mock the API config
vi.mock('../../config/api.js', () => ({
  API_URL: 'http://localhost:3001',
}));

describe('useSpeechAssessment', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initial State', () => {
    it('should initialize with null result and not assessing', () => {
      const { result } = renderHook(() => useSpeechAssessment());

      expect(result.current.result).toBeNull();
      expect(result.current.isAssessing).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('assessPronunciation', () => {
    it('should send audio and target text to API', async () => {
      const mockAssessment = {
        transcript: 'konnichiwa',
        accuracyScore: 85,
        feedback: {
          overall: 'Good pronunciation',
          errors: [],
          suggestions: ['Try to stress the second syllable more'],
        },
        expected: 'こんにちは',
        expectedRomaji: 'konnichiwa',
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockAssessment),
      } as Response);

      const { result } = renderHook(() => useSpeechAssessment());
      const audioBlob = new Blob(['audio-data'], { type: 'audio/webm' });

      let assessmentResult: typeof mockAssessment | null = null;
      await act(async () => {
        assessmentResult = await result.current.assessPronunciation(
          audioBlob,
          'こんにちは',
          'konnichiwa'
        );
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/speech/assess',
        expect.objectContaining({
          method: 'POST',
          body: expect.any(FormData),
        })
      );

      // Verify FormData contents
      const fetchCall = vi.mocked(global.fetch).mock.calls[0];
      const formData = fetchCall[1]!.body as FormData;
      expect(formData.get('audio')).toBeInstanceOf(Blob);
      expect(formData.get('target_text')).toBe('こんにちは');
      expect(formData.get('expected_romaji')).toBe('konnichiwa');

      expect(assessmentResult).toEqual(mockAssessment);
    });

    it('should set isAssessing to true during assessment', async () => {
      let resolveFetch: (value: Response) => void;
      const fetchPromise = new Promise<Response>((resolve) => {
        resolveFetch = resolve;
      });

      global.fetch = vi.fn().mockReturnValue(fetchPromise);

      const { result } = renderHook(() => useSpeechAssessment());
      const audioBlob = new Blob(['audio-data'], { type: 'audio/webm' });

      act(() => {
        result.current.assessPronunciation(audioBlob, 'こんにちは');
      });

      expect(result.current.isAssessing).toBe(true);
      expect(result.current.error).toBeNull();

      resolveFetch!({
        ok: true,
        json: () => Promise.resolve({
          transcript: 'konnichiwa',
          accuracyScore: 90,
          feedback: { overall: 'Great!', errors: [], suggestions: [] },
          expected: 'こんにちは',
        }),
      } as Response);

      await waitFor(() => {
        expect(result.current.isAssessing).toBe(false);
      });
    });

    it('should not include expected_romaji when not provided', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          transcript: 'konnichiwa',
          accuracyScore: 80,
          feedback: { overall: 'OK', errors: [], suggestions: [] },
          expected: 'こんにちは',
        }),
      } as Response);

      const { result } = renderHook(() => useSpeechAssessment());
      const audioBlob = new Blob(['audio-data'], { type: 'audio/webm' });

      await act(async () => {
        await result.current.assessPronunciation(audioBlob, 'こんにちは');
      });

      const fetchCall = vi.mocked(global.fetch).mock.calls[0];
      const formData = fetchCall[1]!.body as FormData;
      expect(formData.get('expected_romaji')).toBeNull();
    });

    it('should handle API error response', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ message: 'Server error' }),
      } as Response);

      const { result } = renderHook(() => useSpeechAssessment());
      const audioBlob = new Blob(['audio-data'], { type: 'audio/webm' });

      await act(async () => {
        await result.current.assessPronunciation(audioBlob, 'こんにちは');
      });

      expect(result.current.error).toBe('Server error');
      expect(result.current.result).toBeNull();
      expect(result.current.isAssessing).toBe(false);
    });

    it('should handle API error with no message', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: () => Promise.resolve({}),
      } as Response);

      const { result } = renderHook(() => useSpeechAssessment());
      const audioBlob = new Blob(['audio-data'], { type: 'audio/webm' });

      await act(async () => {
        await result.current.assessPronunciation(audioBlob, 'こんにちは');
      });

      expect(result.current.error).toBe('Assessment failed: 400');
      expect(result.current.result).toBeNull();
    });

    it('should handle network errors', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      global.fetch = vi.fn().mockRejectedValue(new Error('Network failure'));

      const { result } = renderHook(() => useSpeechAssessment());
      const audioBlob = new Blob(['audio-data'], { type: 'audio/webm' });

      await act(async () => {
        await result.current.assessPronunciation(audioBlob, 'こんにちは');
      });

      expect(result.current.error).toBe('Network failure');
      expect(result.current.result).toBeNull();
      expect(result.current.isAssessing).toBe(false);

      consoleErrorSpy.mockRestore();
    });

    it('should handle non-Error exceptions', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      global.fetch = vi.fn().mockRejectedValue('String error');

      const { result } = renderHook(() => useSpeechAssessment());
      const audioBlob = new Blob(['audio-data'], { type: 'audio/webm' });

      await act(async () => {
        await result.current.assessPronunciation(audioBlob, 'こんにちは');
      });

      expect(result.current.error).toBe('Assessment failed');

      consoleErrorSpy.mockRestore();
    });
  });

  describe('reset', () => {
    it('should clear result, error, and isAssessing state', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          transcript: 'konnichiwa',
          accuracyScore: 90,
          feedback: { overall: 'Great!', errors: [], suggestions: [] },
          expected: 'こんにちは',
        }),
      } as Response);

      const { result } = renderHook(() => useSpeechAssessment());
      const audioBlob = new Blob(['audio-data'], { type: 'audio/webm' });

      await act(async () => {
        await result.current.assessPronunciation(audioBlob, 'こんにちは');
      });

      expect(result.current.result).not.toBeNull();

      act(() => {
        result.current.reset();
      });

      expect(result.current.result).toBeNull();
      expect(result.current.error).toBeNull();
      expect(result.current.isAssessing).toBe(false);
    });
  });
});

describe('useTranscription', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initial State', () => {
    it('should initialize with null transcript and not transcribing', () => {
      const { result } = renderHook(() => useTranscription());

      expect(result.current.transcript).toBeNull();
      expect(result.current.isTranscribing).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('transcribe', () => {
    it('should send audio to transcription API and return transcript', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ transcript: 'konnichiwa' }),
      } as Response);

      const { result } = renderHook(() => useTranscription());
      const audioBlob = new Blob(['audio-data'], { type: 'audio/webm' });

      let transcriptResult: string | null = null;
      await act(async () => {
        transcriptResult = await result.current.transcribe(audioBlob);
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/speech/transcribe',
        expect.objectContaining({
          method: 'POST',
          body: expect.any(FormData),
        })
      );

      expect(transcriptResult).toBe('konnichiwa');
      expect(result.current.transcript).toBe('konnichiwa');
    });

    it('should set isTranscribing to true during transcription', async () => {
      let resolveFetch: (value: Response) => void;
      const fetchPromise = new Promise<Response>((resolve) => {
        resolveFetch = resolve;
      });

      global.fetch = vi.fn().mockReturnValue(fetchPromise);

      const { result } = renderHook(() => useTranscription());
      const audioBlob = new Blob(['audio-data'], { type: 'audio/webm' });

      act(() => {
        result.current.transcribe(audioBlob);
      });

      expect(result.current.isTranscribing).toBe(true);

      resolveFetch!({
        ok: true,
        json: () => Promise.resolve({ transcript: 'hello' }),
      } as Response);

      await waitFor(() => {
        expect(result.current.isTranscribing).toBe(false);
      });
    });

    it('should handle API error response', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      } as Response);

      const { result } = renderHook(() => useTranscription());
      const audioBlob = new Blob(['audio-data'], { type: 'audio/webm' });

      await act(async () => {
        await result.current.transcribe(audioBlob);
      });

      expect(result.current.error).toBe('Transcription failed: 500');
      expect(result.current.transcript).toBeNull();
    });

    it('should handle network errors', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Connection lost'));

      const { result } = renderHook(() => useTranscription());
      const audioBlob = new Blob(['audio-data'], { type: 'audio/webm' });

      await act(async () => {
        await result.current.transcribe(audioBlob);
      });

      expect(result.current.error).toBe('Connection lost');
      expect(result.current.transcript).toBeNull();
    });
  });

  describe('reset', () => {
    it('should clear transcript and error state', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ transcript: 'test' }),
      } as Response);

      const { result } = renderHook(() => useTranscription());
      const audioBlob = new Blob(['audio-data'], { type: 'audio/webm' });

      await act(async () => {
        await result.current.transcribe(audioBlob);
      });

      expect(result.current.transcript).toBe('test');

      act(() => {
        result.current.reset();
      });

      expect(result.current.transcript).toBeNull();
      expect(result.current.error).toBeNull();
    });
  });
});
