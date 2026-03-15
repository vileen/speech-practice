import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useVolume } from '../../hooks/useVolume';

describe('useVolume', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should use default value when localStorage is empty', () => {
    vi.mocked(localStorage.getItem).mockReturnValue(null);
    
    const { result } = renderHook(() => useVolume());
    expect(result.current[0]).toBe(0.8);
  });

  it('should use custom default value when provided', () => {
    vi.mocked(localStorage.getItem).mockReturnValue(null);
    
    const { result } = renderHook(() => useVolume('customKey', 0.5));
    expect(result.current[0]).toBe(0.5);
  });

  it('should load volume from localStorage', () => {
    vi.mocked(localStorage.getItem).mockImplementation((key: string) => {
      if (key === 'speechPracticeVolume') return '0.6';
      return null;
    });
    
    const { result } = renderHook(() => useVolume());
    expect(result.current[0]).toBe(0.6);
  });

  it('should load from custom storage key', () => {
    vi.mocked(localStorage.getItem).mockImplementation((key: string) => {
      if (key === 'customVolumeKey') return '0.9';
      return null;
    });
    
    const { result } = renderHook(() => useVolume('customVolumeKey'));
    expect(result.current[0]).toBe(0.9);
  });

  it('should update volume state', () => {
    const { result } = renderHook(() => useVolume());
    
    act(() => {
      result.current[1](0.3);
    });

    expect(result.current[0]).toBe(0.3);
  });

  it('should handle multiple volume changes', () => {
    const { result } = renderHook(() => useVolume());

    act(() => {
      result.current[1](0.2);
    });
    expect(result.current[0]).toBe(0.2);

    act(() => {
      result.current[1](0.5);
    });
    expect(result.current[0]).toBe(0.5);
  });

  it('should handle edge values', () => {
    const { result } = renderHook(() => useVolume());

    act(() => {
      result.current[1](0);
    });
    expect(result.current[0]).toBe(0);

    act(() => {
      result.current[1](1);
    });
    expect(result.current[0]).toBe(1);
  });

  it('should handle volume above 1', () => {
    const { result } = renderHook(() => useVolume());

    act(() => {
      result.current[1](1.5);
    });
    expect(result.current[0]).toBe(1.5);
  });
});