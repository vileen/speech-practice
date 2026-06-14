import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useVerbMode } from '../../hooks/useVerbMode';
import * as ReactRouter from 'react-router-dom';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

describe('useVerbMode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (localStorage.getItem as any).mockReturnValue(null);
  });

  it('loads settings from localStorage on mount', () => {
    (localStorage.getItem as any).mockImplementation((key: string) => {
      if (key === 'verb_practice_settings') {
        return JSON.stringify({ practiceType: 'recognition', answerMode: 'input', groups: ['I'] });
      }
      if (key === 'verb_show_furigana') {
        return 'false';
      }
      return null;
    });

    const { result } = renderHook(() => useVerbMode());
    expect(result.current.selectedPracticeType).toBe('recognition');
    expect(result.current.answerMode).toBe('input');
    expect(result.current.selectedGroups).toEqual(['I']);
    expect(result.current.showFurigana).toBe(false);
  });

  it('saves settings to localStorage when changed', () => {
    const { result } = renderHook(() => useVerbMode());
    act(() => {
      result.current.setSelectedPracticeType('recognition');
    });
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'verb_practice_settings',
      expect.stringContaining('recognition')
    );
  });

  it('saves furigana setting to localStorage', () => {
    const { result } = renderHook(() => useVerbMode());
    act(() => {
      result.current.setShowFurigana(false);
    });
    expect(localStorage.setItem).toHaveBeenCalledWith('verb_show_furigana', 'false');
  });

  it('calls loadNextExercise and sets exercise', async () => {
    const mockVerb = {
      id: 1,
      dictionary_form: '食べる',
      reading: 'たべる',
      meaning: 'to eat',
      group: 'II',
      jlpt_level: 'N5',
      conjugations: { te_form: '食べて' }
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ verb: mockVerb })
    });

    const { result } = renderHook(() => useVerbMode());
    await act(async () => {
      await result.current.loadNextExercise();
    });

    await waitFor(() => {
      expect(result.current.currentExercise).not.toBeNull();
    });
    expect(result.current.state).toBe('input');
    expect(result.current.currentExercise!.verb).toEqual(mockVerb);
  });

  it('calls handleSubmit and checks answer', async () => {
    const mockVerb = {
      id: 1,
      dictionary_form: '食べる',
      reading: 'たべる',
      meaning: 'to eat',
      group: 'II',
      jlpt_level: 'N5',
      conjugations: { te_form: '食べて' }
    };

    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ verb: mockVerb })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ progress: { streak: 1 } })
      });

    const { result } = renderHook(() => useVerbMode());
    await act(async () => {
      await result.current.loadNextExercise();
    });

    await waitFor(() => {
      expect(result.current.currentExercise).not.toBeNull();
    });

    act(() => {
      result.current.setUserAnswer('食べて');
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    await waitFor(() => {
      expect(result.current.state).toBe('feedback');
    });
    expect(result.current.feedback).not.toBeNull();
    expect(result.current.feedback!.correct).toBe(true);
  });

  it('toggles group selection', () => {
    const { result } = renderHook(() => useVerbMode());
    expect(result.current.selectedGroups).toEqual(['I', 'II', 'III']);

    act(() => {
      result.current.toggleGroup('I');
    });
    expect(result.current.selectedGroups).toEqual(['II', 'III']);

    act(() => {
      result.current.toggleGroup('I');
    });
    expect(result.current.selectedGroups).toEqual(['II', 'III', 'I']);
  });

  it('selectAllGroups selects all groups', () => {
    const { result } = renderHook(() => useVerbMode());
    act(() => {
      result.current.deselectAllGroups();
    });
    expect(result.current.selectedGroups).toEqual([]);

    act(() => {
      result.current.selectAllGroups();
    });
    expect(result.current.selectedGroups).toEqual(['I', 'II', 'III']);
  });

  it('deselectAllGroups clears all groups', () => {
    const { result } = renderHook(() => useVerbMode());
    act(() => {
      result.current.deselectAllGroups();
    });
    expect(result.current.selectedGroups).toEqual([]);
  });
});
