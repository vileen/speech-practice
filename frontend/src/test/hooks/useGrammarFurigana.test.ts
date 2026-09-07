import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGrammarFurigana } from '../../hooks/useGrammarFurigana';

const STORAGE_KEY = 'grammar_show_furigana';

describe('useGrammarFurigana', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(localStorage.getItem).mockReturnValue(null);
  });

  it('should default to true when no saved preference exists', () => {
    const { result } = renderHook(() => useGrammarFurigana());
    expect(result.current[0]).toBe(true);
  });

  it('should use provided defaultValue when no saved preference exists', () => {
    const { result } = renderHook(() => useGrammarFurigana(false));
    expect(result.current[0]).toBe(false);
  });

  it('should load saved preference "true" from localStorage', () => {
    vi.mocked(localStorage.getItem).mockImplementation((key: string) =>
      key === STORAGE_KEY ? 'true' : null
    );
    const { result } = renderHook(() => useGrammarFurigana(false));
    expect(result.current[0]).toBe(true);
  });

  it('should load saved preference "false" from localStorage', () => {
    vi.mocked(localStorage.getItem).mockImplementation((key: string) =>
      key === STORAGE_KEY ? 'false' : null
    );
    const { result } = renderHook(() => useGrammarFurigana(true));
    expect(result.current[0]).toBe(false);
  });

  it('should save preference to localStorage when toggled', () => {
    const { result } = renderHook(() => useGrammarFurigana());
    act(() => result.current[1](false));
    expect(result.current[0]).toBe(false);
    expect(localStorage.setItem).toHaveBeenCalledWith(STORAGE_KEY, 'false');
  });

  it('should update state when setShowFurigana is called', () => {
    const { result } = renderHook(() => useGrammarFurigana());
    act(() => result.current[1](false));
    expect(result.current[0]).toBe(false);
    act(() => result.current[1](true));
    expect(result.current[0]).toBe(true);
  });

  it('should persist initial defaultValue to localStorage on mount', () => {
    renderHook(() => useGrammarFurigana(true));
    expect(localStorage.setItem).toHaveBeenCalledWith(STORAGE_KEY, 'true');
  });

  it('should prefer saved value over defaultValue', () => {
    vi.mocked(localStorage.getItem).mockImplementation((key: string) =>
      key === STORAGE_KEY ? 'false' : null
    );
    const { result } = renderHook(() => useGrammarFurigana(true));
    expect(result.current[0]).toBe(false);
    // Persistence effect syncs the saved value back
    expect(localStorage.setItem).toHaveBeenCalledWith(STORAGE_KEY, 'false');
  });

  it('should read localStorage on mount only', () => {
    renderHook(() => useGrammarFurigana());
    expect(localStorage.getItem).toHaveBeenCalledWith(STORAGE_KEY);
  });
});
