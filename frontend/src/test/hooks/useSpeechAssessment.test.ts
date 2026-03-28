import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useSpeechAssessment, useTranscription } from '../../hooks/useSpeechAssessment';
import { API_URL } from '../../config/api';

// Mock the API config
vi.mock('../../config/api', () => ({
  API_URL: 'https://test-api.example.com'
}));

describe('useSpeechAssessment', () => {
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFetch = vi.fn();
    global.fetch = mockFetch;
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const createMockBlob = () => new Blob(['test-audio'], { type: 'audio/webm' });

  const createMockAssessmentResponse = (): any => ({
    transcript: 'こんにちは',
    accuracyScore: 85,
    feedback: {
      overall: 'Good pronunciation with minor issues',
      errors: [
        {
          type: 'pronunciation',
          expected: 'に',
          actual: 'ni',
          position: 2
        }
      ],
      suggestions: ['Focus on the "chi" sound']
    },
    expected: 'こんにちは',
    expectedRomaji: 'konnichiwa'
  });

  describe('Initial State', () => {
    it('should initialize with correct default state', () => {
      const { result } = renderHook(() => useSpeechAssessment());

      expect(result.current.result).toBeNull();
      expect(result.current.isAssessing).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('assessPronunciation', () => {
    it('should set isAssessing to true while processing', async () => {
      mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves

      const { result } = renderHook(() => useSpeechAssessment());

      act(() => {
        result.current.assessPronunciation(createMockBlob(), 'こんにちは');
      });

      expect(result.current.isAssessing).toBe(true);
    });

    it('should clear previous result and error before new assessment', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(createMockAssessmentResponse())
        })
        .mockImplementation(() => new Promise(() => {}));

      const { result } = renderHook(() => useSpeechAssessment());

      // First assessment
      await act(async () => {
        await result.current.assessPronunciation(createMockBlob(), 'こんにちは');
      });

      expect(result.current.result).not.toBeNull();

      // Start second assessment
      act(() => {
        result.current.assessPronunciation(createMockBlob(), 'さようなら');
      });

      expect(result.current.result).toBeNull();
      expect(result.current.error).toBeNull();
    });

    it('should call API with correct form data', async () => {
      const mockResponse = createMockAssessmentResponse();
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const { result } = renderHook(() => useSpeechAssessment());
      const blob = createMockBlob();

      await act(async () => {
        await result.current.assessPronunciation(blob, 'こんにちは', 'konnichiwa');
      });

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_URL}/api/speech/assess`,
        expect.objectContaining({
          method: 'POST',
          body: expect.any(FormData)
        })
      );

      // Verify FormData contents
      const formData = mockFetch.mock.calls[0][1].body as FormData;
      expect(formData.get('audio')).toBeInstanceOf(Blob);
      expect(formData.get('target_text')).toBe('こんにちは');
      expect(formData.get('expected_romaji')).toBe('konnichiwa');
    });

    it('should call API without expectedRomaji when not provided', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(createMockAssessmentResponse())
      });

      const { result } = renderHook(() => useSpeechAssessment());

      await act(async () => {
        await result.current.assessPronunciation(createMockBlob(), 'こんにちは');
      });

      const formData = mockFetch.mock.calls[0][1].body as FormData;
      expect(formData.get('target_text')).toBe('こんにちは');
      expect(formData.get('expected_romaji')).toBeNull();
    });

    it('should set result on successful assessment', async () => {
      const mockResponse = createMockAssessmentResponse();
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const { result } = renderHook(() => useSpeechAssessment());

      await act(async () => {
        const assessment = await result.current.assessPronunciation(createMockBlob(), 'こんにちは');
        expect(assessment).toEqual(mockResponse);
      });

      expect(result.current.result).toEqual(mockResponse);
      expect(result.current.isAssessing).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle API error with message', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ message: 'Invalid audio format' })
      });

      const { result } = renderHook(() => useSpeechAssessment());

      await act(async () => {
        const assessment = await result.current.assessPronunciation(createMockBlob(), 'こんにちは');
        expect(assessment).toBeNull();
      });

      expect(result.current.error).toBe('Invalid audio format');
      expect(result.current.result).toBeNull();
      expect(result.current.isAssessing).toBe(false);
    });

    it('should handle API error without message', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.reject(new Error('Parse error'))
      });

      const { result } = renderHook(() => useSpeechAssessment());

      await act(async () => {
        await result.current.assessPronunciation(createMockBlob(), 'こんにちは');
      });

      expect(result.current.error).toBe('Assessment failed: 500');
    });

    it('should handle network error', async () => {
      mockFetch.mockRejectedValue(new Error('Network failure'));

      const { result } = renderHook(() => useSpeechAssessment());

      await act(async () => {
        await result.current.assessPronunciation(createMockBlob(), 'こんにちは');
      });

      expect(result.current.error).toBe('Network failure');
      expect(result.current.result).toBeNull();
      expect(result.current.isAssessing).toBe(false);
    });

    it('should handle unknown error type', async () => {
      mockFetch.mockRejectedValue('Unknown error string');

      const { result } = renderHook(() => useSpeechAssessment());

      await act(async () => {
        await result.current.assessPronunciation(createMockBlob(), 'こんにちは');
      });

      expect(result.current.error).toBe('Assessment failed');
    });
  });

  describe('reset', () => {
    it('should clear result, error, and isAssessing state', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(createMockAssessmentResponse())
      });

      const { result } = renderHook(() => useSpeechAssessment());

      // First, get some state
      await act(async () => {
        await result.current.assessPronunciation(createMockBlob(), 'こんにちは');
      });

      expect(result.current.result).not.toBeNull();

      // Then reset
      act(() => {
        result.current.reset();
      });

      expect(result.current.result).toBeNull();
      expect(result.current.error).toBeNull();
      expect(result.current.isAssessing).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle assessment with empty target text', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(createMockAssessmentResponse())
      });

      const { result } = renderHook(() => useSpeechAssessment());

      await act(async () => {
        await result.current.assessPronunciation(createMockBlob(), '');
      });

      const formData = mockFetch.mock.calls[0][1].body as FormData;
      expect(formData.get('target_text')).toBe('');
    });

    it('should handle assessment with special characters in target text', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(createMockAssessmentResponse())
      });

      const { result } = renderHook(() => useSpeechAssessment());
      const specialText = '日本語！？（テスト）';

      await act(async () => {
        await result.current.assessPronunciation(createMockBlob(), specialText);
      });

      const formData = mockFetch.mock.calls[0][1].body as FormData;
      expect(formData.get('target_text')).toBe(specialText);
    });

    it('should handle assessment result with zero accuracy score', async () => {
      const zeroScoreResponse = {
        ...createMockAssessmentResponse(),
        accuracyScore: 0
      };
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(zeroScoreResponse)
      });

      const { result } = renderHook(() => useSpeechAssessment());

      await act(async () => {
        await result.current.assessPronunciation(createMockBlob(), 'こんにちは');
      });

      expect(result.current.result?.accuracyScore).toBe(0);
    });

    it('should handle assessment result with empty errors array', async () => {
      const noErrorsResponse = {
        ...createMockAssessmentResponse(),
        feedback: {
          ...createMockAssessmentResponse().feedback,
          errors: []
        }
      };
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(noErrorsResponse)
      });

      const { result } = renderHook(() => useSpeechAssessment());

      await act(async () => {
        await result.current.assessPronunciation(createMockBlob(), 'こんにちは');
      });

      expect(result.current.result?.feedback.errors).toEqual([]);
    });
  });
});

describe('useTranscription', () => {
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFetch = vi.fn();
    global.fetch = mockFetch;
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const createMockBlob = () => new Blob(['test-audio'], { type: 'audio/webm' });

  describe('Initial State', () => {
    it('should initialize with correct default state', () => {
      const { result } = renderHook(() => useTranscription());

      expect(result.current.transcript).toBeNull();
      expect(result.current.isTranscribing).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('transcribe', () => {
    it('should set isTranscribing to true while processing', async () => {
      mockFetch.mockImplementation(() => new Promise(() => {}));

      const { result } = renderHook(() => useTranscription());

      act(() => {
        result.current.transcribe(createMockBlob());
      });

      expect(result.current.isTranscribing).toBe(true);
    });

    it('should call API with correct form data', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ transcript: 'こんにちは' })
      });

      const { result } = renderHook(() => useTranscription());
      const blob = createMockBlob();

      await act(async () => {
        await result.current.transcribe(blob);
      });

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_URL}/api/speech/transcribe`,
        expect.objectContaining({
          method: 'POST',
          body: expect.any(FormData)
        })
      );

      const formData = mockFetch.mock.calls[0][1].body as FormData;
      expect(formData.get('audio')).toBeInstanceOf(Blob);
    });

    it('should set transcript on successful transcription', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ transcript: 'こんにちは世界' })
      });

      const { result } = renderHook(() => useTranscription());

      await act(async () => {
        const transcript = await result.current.transcribe(createMockBlob());
        expect(transcript).toBe('こんにちは世界');
      });

      expect(result.current.transcript).toBe('こんにちは世界');
      expect(result.current.isTranscribing).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle API error', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500
      });

      const { result } = renderHook(() => useTranscription());

      await act(async () => {
        const transcript = await result.current.transcribe(createMockBlob());
        expect(transcript).toBeNull();
      });

      expect(result.current.error).toBe('Transcription failed: 500');
      expect(result.current.transcript).toBeNull();
    });

    it('should handle network error', async () => {
      mockFetch.mockRejectedValue(new Error('Connection timeout'));

      const { result } = renderHook(() => useTranscription());

      await act(async () => {
        await result.current.transcribe(createMockBlob());
      });

      expect(result.current.error).toBe('Connection timeout');
    });

    it('should handle empty transcript response', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ transcript: '' })
      });

      const { result } = renderHook(() => useTranscription());

      await act(async () => {
        const transcript = await result.current.transcribe(createMockBlob());
        expect(transcript).toBe('');
      });

      expect(result.current.transcript).toBe('');
    });
  });

  describe('reset', () => {
    it('should clear transcript and error state', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ transcript: 'テスト' })
      });

      const { result } = renderHook(() => useTranscription());

      await act(async () => {
        await result.current.transcribe(createMockBlob());
      });

      expect(result.current.transcript).toBe('テスト');

      act(() => {
        result.current.reset();
      });

      expect(result.current.transcript).toBeNull();
      expect(result.current.error).toBeNull();
    });
  });
});
