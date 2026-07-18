import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useKanjiKeyboardShortcuts } from '../../hooks/useKanjiKeyboardShortcuts';

describe('useKanjiKeyboardShortcuts', () => {
  const onReveal = vi.fn();
  const onReview = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const dispatchKey = (key: string) => {
    const event = new KeyboardEvent('keydown', { key });
    const preventDefault = vi.spyOn(event, 'preventDefault');
    window.dispatchEvent(event);
    return preventDefault;
  };

  it('should ignore all keys when showSetup is true', () => {
    renderHook(() =>
      useKanjiKeyboardShortcuts({
        showSetup: true,
        isComplete: false,
        isRevealed: true,
        onReveal,
        onReview,
      })
    );

    dispatchKey(' ');
    dispatchKey('1');
    dispatchKey('4');

    expect(onReveal).not.toHaveBeenCalled();
    expect(onReview).not.toHaveBeenCalled();
  });

  it('should ignore all keys when isComplete is true', () => {
    renderHook(() =>
      useKanjiKeyboardShortcuts({
        showSetup: false,
        isComplete: true,
        isRevealed: true,
        onReveal,
        onReview,
      })
    );

    dispatchKey(' ');
    dispatchKey('2');
    dispatchKey('3');

    expect(onReveal).not.toHaveBeenCalled();
    expect(onReview).not.toHaveBeenCalled();
  });

  it('should call onReveal when Space is pressed while not revealed', () => {
    renderHook(() =>
      useKanjiKeyboardShortcuts({
        showSetup: false,
        isComplete: false,
        isRevealed: false,
        onReveal,
        onReview,
      })
    );

    const preventDefault = dispatchKey(' ');

    expect(onReveal).toHaveBeenCalledTimes(1);
    expect(onReview).not.toHaveBeenCalled();
    expect(preventDefault).toHaveBeenCalled();
  });

  it('should call onReveal when Spacebar is pressed while not revealed', () => {
    renderHook(() =>
      useKanjiKeyboardShortcuts({
        showSetup: false,
        isComplete: false,
        isRevealed: false,
        onReveal,
        onReview,
      })
    );

    dispatchKey('Spacebar');

    expect(onReveal).toHaveBeenCalledTimes(1);
    expect(onReview).not.toHaveBeenCalled();
  });

  it('should ignore non-space keys while not revealed', () => {
    renderHook(() =>
      useKanjiKeyboardShortcuts({
        showSetup: false,
        isComplete: false,
        isRevealed: false,
        onReveal,
        onReview,
      })
    );

    dispatchKey('1');
    dispatchKey('2');
    dispatchKey('Enter');
    dispatchKey('a');

    expect(onReveal).not.toHaveBeenCalled();
    expect(onReview).not.toHaveBeenCalled();
  });

  it('should review "again" when Space is pressed while revealed', () => {
    renderHook(() =>
      useKanjiKeyboardShortcuts({
        showSetup: false,
        isComplete: false,
        isRevealed: true,
        onReveal,
        onReview,
      })
    );

    const preventDefault = dispatchKey(' ');

    expect(onReview).toHaveBeenCalledTimes(1);
    expect(onReview).toHaveBeenCalledWith('again');
    expect(onReveal).not.toHaveBeenCalled();
    expect(preventDefault).toHaveBeenCalled();
  });

  it('should review "again" when Spacebar is pressed while revealed', () => {
    renderHook(() =>
      useKanjiKeyboardShortcuts({
        showSetup: false,
        isComplete: false,
        isRevealed: true,
        onReveal,
        onReview,
      })
    );

    dispatchKey('Spacebar');

    expect(onReview).toHaveBeenCalledTimes(1);
    expect(onReview).toHaveBeenCalledWith('again');
  });

  it('should review with correct ratings when 1/2/3/4 are pressed while revealed', () => {
    renderHook(() =>
      useKanjiKeyboardShortcuts({
        showSetup: false,
        isComplete: false,
        isRevealed: true,
        onReveal,
        onReview,
      })
    );

    dispatchKey('1');
    expect(onReview).toHaveBeenLastCalledWith('again');

    dispatchKey('2');
    expect(onReview).toHaveBeenLastCalledWith('hard');

    dispatchKey('3');
    expect(onReview).toHaveBeenLastCalledWith('good');

    dispatchKey('4');
    expect(onReview).toHaveBeenLastCalledWith('easy');

    expect(onReview).toHaveBeenCalledTimes(4);
    expect(onReveal).not.toHaveBeenCalled();
  });

  it('should prevent default for handled rating keys', () => {
    renderHook(() =>
      useKanjiKeyboardShortcuts({
        showSetup: false,
        isComplete: false,
        isRevealed: true,
        onReveal,
        onReview,
      })
    );

    ['1', '2', '3', '4'].forEach((key) => {
      const preventDefault = dispatchKey(key);
      expect(preventDefault).toHaveBeenCalled();
    });
  });

  it('should ignore other keys while revealed', () => {
    renderHook(() =>
      useKanjiKeyboardShortcuts({
        showSetup: false,
        isComplete: false,
        isRevealed: true,
        onReveal,
        onReview,
      })
    );

    dispatchKey('Enter');
    dispatchKey('a');
    dispatchKey('5');

    expect(onReview).not.toHaveBeenCalled();
    expect(onReveal).not.toHaveBeenCalled();
  });

  it('should remove event listener on unmount', () => {
    const { unmount } = renderHook(() =>
      useKanjiKeyboardShortcuts({
        showSetup: false,
        isComplete: false,
        isRevealed: false,
        onReveal,
        onReview,
      })
    );

    unmount();
    dispatchKey(' ');

    expect(onReveal).not.toHaveBeenCalled();
    expect(onReview).not.toHaveBeenCalled();
  });

  it('should update behavior when dependencies change', () => {
    const { rerender } = renderHook(
      ({ isRevealed }) =>
        useKanjiKeyboardShortcuts({
          showSetup: false,
          isComplete: false,
          isRevealed,
          onReveal,
          onReview,
        }),
      { initialProps: { isRevealed: false } }
    );

    dispatchKey(' ');
    expect(onReveal).toHaveBeenCalledTimes(1);

    rerender({ isRevealed: true });

    dispatchKey(' ');
    expect(onReview).toHaveBeenCalledWith('again');
    expect(onReview).toHaveBeenCalledTimes(1);
  });
});
