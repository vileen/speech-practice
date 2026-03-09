import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { usePronunciationCheck } from '../../hooks/usePronunciationCheck';

describe('usePronunciationCheck', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('should initialize with idle state', () => {
    const { result } = renderHook(() => usePronunciationCheck());
    
    expect(result.current.result).toBeNull();
    expect(result.current.isChecking).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should set isChecking to true when starting check', async () => {
    global.fetch = vi.fn().mockImplementation(() => new Promise(() => {}));
    
    const { result } = renderHook(() => usePronunciationCheck());
    
    const audioBlob = new Blob(['audio data'], { type: 'audio/webm' });
    
    act(() => {
      result.current.check(audioBlob, 'test text', 'ja');
    });
    
    expect(result.current.isChecking).toBe(true);
  });

  it('should handle successful pronunciation check', async () => {
    const mockResponse = {
      target_text: '学校',
      transcription: 'がっこう',
      score: 85,
      feedback: 'Good pronunciation!',
      text_with_furigana: '学校[がっこう]',
    };
    
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    } as Response);
    
    const { result } = renderHook(() => usePronunciationCheck());
    
    const audioBlob = new Blob(['audio data'], { type: 'audio/webm' });
    
    await act(async () => {
      await result.current.check(audioBlob, '学校', 'ja');
    });
    
    expect(result.current.isChecking).toBe(false);
    expect(result.current.result).toEqual(mockResponse);
    expect(result.current.error).toBeNull();
  });

  it('should handle API error response', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    } as Response);
    
    const { result } = renderHook(() => usePronunciationCheck());
    
    const audioBlob = new Blob(['audio data'], { type: 'audio/webm' });
    
    await act(async () => {
      await result.current.check(audioBlob, 'test', 'ja');
    });
    
    expect(result.current.isChecking).toBe(false);
    expect(result.current.error).toBe('Pronunciation check failed');
    expect(result.current.result).toBeNull();
  });

  it('should handle network error', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
    
    const { result } = renderHook(() => usePronunciationCheck());
    
    const audioBlob = new Blob(['audio data'], { type: 'audio/webm' });
    
    await act(async () => {
      await result.current.check(audioBlob, 'test', 'ja');
    });
    
    expect(result.current.isChecking).toBe(false);
    expect(result.current.error).toBe('Network error');
    expect(result.current.result).toBeNull();
  });



  it('should send FormData with correct fields', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ score: 80 }),
    } as Response);
    
    const { result } = renderHook(() => usePronunciationCheck());
    
    const audioBlob = new Blob(['audio data'], { type: 'audio/webm' });
    
    await act(async () => {
      await result.current.check(audioBlob, '学校', 'ja');
    });
    
    const fetchCall = (global.fetch as any).mock.calls[0];
    expect(fetchCall[1].body).toBeInstanceOf(FormData);
    expect(fetchCall[1].method).toBe('POST');
  });

  it('should clear state when calling clear', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ score: 90 }),
    } as Response);
    
    const { result } = renderHook(() => usePronunciationCheck());
    
    const audioBlob = new Blob(['audio data'], { type: 'audio/webm' });
    
    await act(async () => {
      await result.current.check(audioBlob, 'test', 'ja');
    });
    
    expect(result.current.result).not.toBeNull();
    
    act(() => {
      result.current.clear();
    });
    
    expect(result.current.result).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should handle errors with non-Error objects', async () => {
    global.fetch = vi.fn().mockRejectedValue('String error');
    
    const { result } = renderHook(() => usePronunciationCheck());
    
    const audioBlob = new Blob(['audio data'], { type: 'audio/webm' });
    
    await act(async () => {
      await result.current.check(audioBlob, 'test', 'ja');
    });
    
    expect(result.current.error).toBe('Unknown error');
  });

  it('should handle empty password in localStorage', async () => {
    localStorage.removeItem('speech_practice_password');
    
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ score: 90 }),
    } as Response);
    
    const { result } = renderHook(() => usePronunciationCheck());
    
    const audioBlob = new Blob(['audio data'], { type: 'audio/webm' });
    
    await act(async () => {
      await result.current.check(audioBlob, 'test', 'ja');
    });
    
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
