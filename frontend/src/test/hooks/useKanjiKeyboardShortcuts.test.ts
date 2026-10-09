import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useKanjiKeyboardShortcuts } from '../../hooks/useKanjiKeyboardShortcuts';
import type { Rating } from '../../lib/fsrs.js';

describe('useKanjiKeyboardShortcuts', () => {
  let onReveal: ReturnType<typeof vi.fn>;
  let onReview: ReturnType<typeof vi.fn>;

  const pressKey = (key: string) => {
    const event = new KeyboardEvent('keydown', { key, cancelable: true });
    window.dispatchEvent(event);
    return event;
  };

  const renderShortcuts = (overrides: Partial<Parameters<typeof useKanjiKeyboardShortcuts>[0]> = {}) => {
    const options = {
      showSetup: false,
      isComplete: false,
      isRevealed: false,
      onReveal,
      onReview,
      ...overrides,
    };
    return renderHook(() => useKanjiKeyboardShortcuts(options));
  };

  beforeEach(() => {
    onReveal = vi.fn();
    onReview = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Reveal phase (not yet revealed)', () => {
    it('should call onReveal when Space is pressed', () => {
      renderShortcuts({ isRevealed: false });
      pressKey(' ');
      expect(onReveal).toHaveBeenCalledTimes(1);
      expect(onReview).not.toHaveBeenCalled();
    });

    it('should call onReveal when Spacebar (legacy key) is pressed', () => {
      renderShortcuts({ isRevealed: false });
      pressKey('Spacebar');
      expect(onReveal).toHaveBeenCalledTimes(1);
    });

    it('should prevent default on Space to avoid page scroll', () => {
      renderShortcuts({ isRevealed: false });
      const event = pressKey(' ');
      expect(event.defaultPrevented).toBe(true);
    });

    it('should not call onReview for rating keys before reveal', () => {
      renderShortcuts({ isRevealed: false });
      ['1', '2', '3', '4'].forEach(pressKey);
      expect(onReview).not.toHaveBeenCalled();
    });

    it('should ignore unrelated keys', () => {
      renderShortcuts({ isRevealed: false });
      pressKey('a');
      pressKey('Enter');
      expect(onReveal).not.toHaveBeenCalled();
      expect(onReview).not.toHaveBeenCalled();
    });
  });

  describe('Review phase (revealed)', () => {
    it('should call onReview("again") for key 1', () => {
      renderShortcuts({ isRevealed: true });
      pressKey('1');
      expect(onReview).toHaveBeenCalledWith('again');
    });

    it('should call onReview("again") for Space', () => {
      renderShortcuts({ isRevealed: true });
      pressKey(' ');
      expect(onReview).toHaveBeenCalledWith('again');
    });

    it('should call onReview("hard") for key 2', () => {
      renderShortcuts({ isRevealed: true });
      pressKey('2');
      expect(onReview).toHaveBeenCalledWith('hard');
    });

    it('should call onReview("good") for key 3', () => {
      renderShortcuts({ isRevealed: true });
      pressKey('3');
      expect(onReview).toHaveBeenCalledWith('good');
    });

    it('should call onReview("easy") for key 4', () => {
      renderShortcuts({ isRevealed: true });
      pressKey('4');
      expect(onReview).toHaveBeenCalledWith('easy');
    });

    it('should prevent default for rating keys', () => {
      renderShortcuts({ isRevealed: true });
      expect(pressKey('1').defaultPrevented).toBe(true);
      expect(pressKey('2').defaultPrevented).toBe(true);
      expect(pressKey('3').defaultPrevented).toBe(true);
      expect(pressKey('4').defaultPrevented).toBe(true);
      expect(pressKey(' ').defaultPrevented).toBe(true);
    });

    it('should not call onReveal when revealed', () => {
      renderShortcuts({ isRevealed: true });
      pressKey(' ');
      expect(onReveal).not.toHaveBeenCalled();
    });

    it('should ignore unrelated keys when revealed', () => {
      renderShortcuts({ isRevealed: true });
      pressKey('5');
      pressKey('x');
      pressKey('Enter');
      expect(onReview).not.toHaveBeenCalled();
    });
  });

  describe('Ignore-when-typing behavior', () => {
    it('should not react when showSetup is true', () => {
      renderShortcuts({ showSetup: true, isRevealed: false });
      pressKey(' ');
      expect(onReveal).not.toHaveBeenCalled();
    });

    it('should not react when session is complete', () => {
      renderShortcuts({ isComplete: true, isRevealed: false });
      pressKey(' ');
      expect(onReveal).not.toHaveBeenCalled();
    });

    it('should not react to rating keys when showSetup is true', () => {
      renderShortcuts({ showSetup: true, isRevealed: true });
      ['1', '2', '3', '4'].forEach(pressKey);
      expect(onReview).not.toHaveBeenCalled();
    });
  });

  describe('Cleanup and rebinding', () => {
    it('should remove listener on unmount', () => {
      const { unmount } = renderShortcuts({ isRevealed: false });
      unmount();
      pressKey(' ');
      expect(onReveal).not.toHaveBeenCalled();
    });

    it('should use latest callbacks when state changes', () => {
      const { rerender } = renderHook(
        ({ revealed }) =>
          useKanjiKeyboardShortcuts({
            showSetup: false,
            isComplete: false,
            isRevealed: revealed,
            onReveal,
            onReview,
          }),
        { initialProps: { revealed: false } }
      );

      pressKey(' ');
      expect(onReveal).toHaveBeenCalledTimes(1);

      rerender({ revealed: true });
      pressKey('3');
      expect(onReview).toHaveBeenCalledWith('good');
    });

    it('should call the new callback when callback identity changes', () => {
      const onReveal2 = vi.fn();
      const { rerender } = renderHook(
        ({ onRevealFn }) =>
          useKanjiKeyboardShortcuts({
            showSetup: false,
            isComplete: false,
            isRevealed: false,
            onReveal: onRevealFn,
            onReview,
          }),
        { initialProps: { onRevealFn: onReveal } }
      );

      rerender({ onRevealFn: onReveal2 });
      pressKey(' ');
      expect(onReveal2).toHaveBeenCalledTimes(1);
      expect(onReveal).not.toHaveBeenCalled();
    });
  });

  describe('Type safety (Rating values)', () => {
    it('should pass a Rating type value for each binding', () => {
      renderShortcuts({ isRevealed: true });
      const expected: Record<string, Rating> = {
        '1': 'again',
        '2': 'hard',
        '3': 'good',
        '4': 'easy',
      };
      Object.entries(expected).forEach(([key, rating]) => {
        pressKey(key);
        expect(onReview).toHaveBeenLastCalledWith(rating);
      });
    });
  });
});
