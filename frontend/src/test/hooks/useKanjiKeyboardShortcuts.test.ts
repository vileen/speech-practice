import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useKanjiKeyboardShortcuts } from '../../hooks/useKanjiKeyboardShortcuts';
import type { Rating } from '../../lib/fsrs.js';

function createKeyEvent(key: string, options: Partial<KeyboardEvent> = {}): KeyboardEvent {
  return new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...options });
}

describe('useKanjiKeyboardShortcuts', () => {
  const defaultOptions = {
    showSetup: false,
    isComplete: false,
    isRevealed: false,
    onReveal: vi.fn(),
    onReview: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should register and remove window keydown listener', () => {
    const addSpy = vi.spyOn(window, 'addEventListener');
    const removeSpy = vi.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() => useKanjiKeyboardShortcuts(defaultOptions));

    expect(addSpy).toHaveBeenCalledWith('keydown', expect.any(Function));

    unmount();

    expect(removeSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
  });

  describe('when card is not revealed', () => {
    it('calls onReveal and prevents default when Space is pressed', () => {
      renderHook(() => useKanjiKeyboardShortcuts(defaultOptions));

      const event = createKeyEvent(' ');
      window.dispatchEvent(event);

      expect(defaultOptions.onReveal).toHaveBeenCalledTimes(1);
      expect(defaultOptions.onReview).not.toHaveBeenCalled();
      expect(event.defaultPrevented).toBe(true);
    });

    it('calls onReveal when legacy Spacebar key is pressed', () => {
      renderHook(() => useKanjiKeyboardShortcuts(defaultOptions));

      const event = createKeyEvent('Spacebar');
      window.dispatchEvent(event);

      expect(defaultOptions.onReveal).toHaveBeenCalledTimes(1);
      expect(event.defaultPrevented).toBe(true);
    });

    it('does nothing for rating keys', () => {
      renderHook(() => useKanjiKeyboardShortcuts(defaultOptions));

      const event = createKeyEvent('1');
      window.dispatchEvent(event);

      expect(defaultOptions.onReveal).not.toHaveBeenCalled();
      expect(defaultOptions.onReview).not.toHaveBeenCalled();
      expect(event.defaultPrevented).toBe(false);
    });
  });

  describe('when card is revealed', () => {
    const revealedOptions = { ...defaultOptions, isRevealed: true };

    it.each([
      ['1', 'again'],
      [' ', 'again'],
      ['Spacebar', 'again'],
      ['2', 'hard'],
      ['3', 'good'],
      ['4', 'easy'],
    ] as [string, Rating][])('pressing "%s" reviews as "%s"', (key, rating) => {
      renderHook(() => useKanjiKeyboardShortcuts(revealedOptions));

      const event = createKeyEvent(key);
      window.dispatchEvent(event);

      expect(revealedOptions.onReview).toHaveBeenCalledTimes(1);
      expect(revealedOptions.onReview).toHaveBeenCalledWith(rating);
      expect(revealedOptions.onReveal).not.toHaveBeenCalled();
      expect(event.defaultPrevented).toBe(true);
    });

    it('ignores unmapped keys', () => {
      renderHook(() => useKanjiKeyboardShortcuts(revealedOptions));

      const event = createKeyEvent('a');
      window.dispatchEvent(event);

      expect(revealedOptions.onReview).not.toHaveBeenCalled();
      expect(revealedOptions.onReveal).not.toHaveBeenCalled();
      expect(event.defaultPrevented).toBe(false);
    });
  });

  describe('when setup is shown', () => {
    const setupOptions = { ...defaultOptions, showSetup: true };

    it('does nothing when Space is pressed', () => {
      renderHook(() => useKanjiKeyboardShortcuts(setupOptions));

      const event = createKeyEvent(' ');
      window.dispatchEvent(event);

      expect(setupOptions.onReveal).not.toHaveBeenCalled();
      expect(setupOptions.onReview).not.toHaveBeenCalled();
      expect(event.defaultPrevented).toBe(false);
    });
  });

  describe('when session is complete', () => {
    const completeOptions = { ...defaultOptions, isComplete: true, isRevealed: true };

    it('does nothing when rating keys are pressed', () => {
      renderHook(() => useKanjiKeyboardShortcuts(completeOptions));

      const event = createKeyEvent('3');
      window.dispatchEvent(event);

      expect(completeOptions.onReview).not.toHaveBeenCalled();
      expect(completeOptions.onReveal).not.toHaveBeenCalled();
      expect(event.defaultPrevented).toBe(false);
    });
  });
});
