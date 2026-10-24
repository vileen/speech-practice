import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, fireEvent } from '@testing-library/react';
import { useKanjiKeyboardShortcuts } from '../../hooks/useKanjiKeyboardShortcuts';

function renderShortcuts(overrides: Partial<Parameters<typeof useKanjiKeyboardShortcuts>[0]> = {}) {
  const onReveal = vi.fn();
  const onReview = vi.fn();
  const props = {
    showSetup: false,
    isComplete: false,
    isRevealed: false,
    onReveal,
    onReview,
    ...overrides,
  };
  return { onReveal, onReview, props };
}

describe('useKanjiKeyboardShortcuts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls onReveal and prevents default when Space is pressed before reveal', () => {
    const { onReveal, onReview, props } = renderShortcuts();

    renderHook(() => useKanjiKeyboardShortcuts(props));

    const event = new KeyboardEvent('keydown', { key: ' ', cancelable: true });
    const prevented = !window.dispatchEvent(event);

    expect(prevented).toBe(true);
    expect(onReveal).toHaveBeenCalledTimes(1);
    expect(onReview).not.toHaveBeenCalled();
  });

  it('maps keys 1/2/3/4 to again/hard/good/easy after reveal', () => {
    const cases: Array<[string, 'again' | 'hard' | 'good' | 'easy']> = [
      ['1', 'again'],
      ['2', 'hard'],
      ['3', 'good'],
      ['4', 'easy'],
    ];

    for (const [key, rating] of cases) {
      const { onReveal, onReview, props } = renderShortcuts({ isRevealed: true });
      renderHook(() => useKanjiKeyboardShortcuts(props));

      const event = new KeyboardEvent('keydown', { key, cancelable: true });
      window.dispatchEvent(event);

      expect(onReview).toHaveBeenCalledWith(rating);
      expect(onReveal).not.toHaveBeenCalled();
      vi.clearAllMocks();
    }
  });

  it("maps Space after reveal to 'again'", () => {
    const { onReveal, onReview, props } = renderShortcuts({ isRevealed: true });

    renderHook(() => useKanjiKeyboardShortcuts(props));

    const event = new KeyboardEvent('keydown', { key: ' ', cancelable: true });
    const prevented = !window.dispatchEvent(event);

    expect(prevented).toBe(true);
    expect(onReview).toHaveBeenCalledTimes(1);
    expect(onReview).toHaveBeenCalledWith('again');
    expect(onReveal).not.toHaveBeenCalled();
  });

  it('is inert when showSetup or isComplete is true', () => {
    for (const override of [{ showSetup: true }, { isComplete: true }]) {
      const { onReveal, onReview, props } = renderShortcuts({ ...override, isRevealed: true });
      renderHook(() => useKanjiKeyboardShortcuts(props));

      fireEvent.keyDown(window, { key: '1' });
      fireEvent.keyDown(window, { key: ' ' });

      expect(onReview).not.toHaveBeenCalled();
      expect(onReveal).not.toHaveBeenCalled();
      vi.clearAllMocks();
    }
  });

  it('removes the keydown listener on unmount', () => {
    const { onReveal, onReview, props } = renderShortcuts();

    const { unmount } = renderHook(() => useKanjiKeyboardShortcuts(props));

    unmount();
    fireEvent.keyDown(window, { key: ' ' });

    expect(onReveal).not.toHaveBeenCalled();
    expect(onReview).not.toHaveBeenCalled();
  });
});
