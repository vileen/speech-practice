import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useKanjiKeyboardShortcuts } from '../../hooks/useKanjiKeyboardShortcuts';
import type { Rating } from '../../lib/fsrs.js';

describe('useKanjiKeyboardShortcuts', () => {
  const onReveal = vi.fn();
  const onReview = vi.fn();

  beforeEach(() => {
    onReveal.mockClear();
    onReview.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const dispatchKeydown = (key: string, options?: { showSetup?: boolean; isComplete?: boolean; isRevealed?: boolean }) => {
    const event = new KeyboardEvent('keydown', { key, cancelable: true });

    renderHook(() =>
      useKanjiKeyboardShortcuts({
        showSetup: options?.showSetup ?? false,
        isComplete: options?.isComplete ?? false,
        isRevealed: options?.isRevealed ?? true,
        onReveal,
        onReview,
      })
    );

    act(() => {
      window.dispatchEvent(event);
    });

    return event;
  };

  const dispatchKeydownWithLifecycle = (key: string, options?: { showSetup?: boolean; isComplete?: boolean; isRevealed?: boolean }) => {
    const event = new KeyboardEvent('keydown', { key, cancelable: true });

    const { unmount } = renderHook(() =>
      useKanjiKeyboardShortcuts({
        showSetup: options?.showSetup ?? false,
        isComplete: options?.isComplete ?? false,
        isRevealed: options?.isRevealed ?? true,
        onReveal,
        onReview,
      })
    );

    act(() => {
      window.dispatchEvent(event);
    });

    return { event, unmount };
  };

  describe('hidden card', () => {
    it('reveals the card when Space is pressed', () => {
      dispatchKeydown(' ', { isRevealed: false });

      expect(onReveal).toHaveBeenCalledTimes(1);
      expect(onReview).not.toHaveBeenCalled();
    });

    it('prevents default browser scrolling for Space on a hidden card', () => {
      const event = dispatchKeydown(' ', { isRevealed: false });

      expect(event.defaultPrevented).toBe(true);
    });

    it('does nothing when a non-Space key is pressed on a hidden card', () => {
      dispatchKeydown('1', { isRevealed: false });

      expect(onReveal).not.toHaveBeenCalled();
      expect(onReview).not.toHaveBeenCalled();
    });
  });

  describe('revealed card', () => {
    it.each([
      ['1', 'again'],
      [' ', 'again'],
      ['2', 'hard'],
      ['3', 'good'],
      ['4', 'easy'],
    ] as [string, Rating][])('submits "%s" rating as %s', (key, expectedRating) => {
      dispatchKeydown(key, { isRevealed: true });

      expect(onReview).toHaveBeenCalledTimes(1);
      expect(onReview).toHaveBeenCalledWith(expectedRating);
      expect(onReveal).not.toHaveBeenCalled();
    });

    it('prevents default behavior for rating keys', () => {
      const event = dispatchKeydown('1', { isRevealed: true });

      expect(event.defaultPrevented).toBe(true);
    });

    it('does nothing for unrecognized keys', () => {
      dispatchKeydown('a', { isRevealed: true });

      expect(onReview).not.toHaveBeenCalled();
      expect(onReveal).not.toHaveBeenCalled();
    });
  });

  describe('blocked states', () => {
    it('ignores all keys while the setup modal is open', () => {
      dispatchKeydown(' ', { showSetup: true, isRevealed: false });

      expect(onReveal).not.toHaveBeenCalled();
      expect(onReview).not.toHaveBeenCalled();
    });

    it('ignores all keys when the session is complete', () => {
      dispatchKeydown('1', { isComplete: true, isRevealed: true });

      expect(onReview).not.toHaveBeenCalled();
      expect(onReveal).not.toHaveBeenCalled();
    });
  });

  describe('lifecycle', () => {
    it('removes the keydown listener on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

      const { unmount } = dispatchKeydownWithLifecycle('1', { isRevealed: true });

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    });
  });
});
