import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useKanjiKeyboardShortcuts } from '../../hooks/useKanjiKeyboardShortcuts';
import { Rating } from '../../lib/fsrs.js';

describe('useKanjiKeyboardShortcuts', () => {
  let originalAddEventListener: typeof window.addEventListener;
  let originalRemoveEventListener: typeof window.removeEventListener;
  let eventListeners: Map<string, EventListener[]>;

  const triggerKeyDown = (key: string, options: Partial<KeyboardEventInit> = {}) => {
    const event = new KeyboardEvent('keydown', { key, bubbles: true, ...options });
    window.dispatchEvent(event);
    return event;
  };

  const getWindowListeners = () => {
    const listeners = eventListeners.get('keydown') || [];
    return listeners.filter((fn): fn is EventListener => typeof fn === 'function');
  };

  beforeEach(() => {
    eventListeners = new Map();
    originalAddEventListener = window.addEventListener.bind(window);
    originalRemoveEventListener = window.removeEventListener.bind(window);

    vi.spyOn(window, 'addEventListener').mockImplementation((type, listener, options) => {
      if (!eventListeners.has(type)) {
        eventListeners.set(type, []);
      }
      eventListeners.get(type)!.push(listener as EventListener);
      originalAddEventListener(type, listener as EventListener, options);
    });
    vi.spyOn(window, 'removeEventListener').mockImplementation((type, listener, options) => {
      const listeners = eventListeners.get(type) || [];
      const index = listeners.indexOf(listener as EventListener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
      originalRemoveEventListener(type, listener as EventListener, options);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should register a window keydown listener on mount', () => {
    renderHook(() =>
      useKanjiKeyboardShortcuts({
        showSetup: false,
        isComplete: false,
        isRevealed: false,
        onReveal: vi.fn(),
        onReview: vi.fn(),
      })
    );

    expect(window.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
    expect(getWindowListeners()).toHaveLength(1);
  });

  it('should remove the window keydown listener on unmount', () => {
    const { unmount } = renderHook(() =>
      useKanjiKeyboardShortcuts({
        showSetup: false,
        isComplete: false,
        isRevealed: false,
        onReveal: vi.fn(),
        onReview: vi.fn(),
      })
    );

    unmount();

    expect(window.removeEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
    expect(getWindowListeners()).toHaveLength(0);
  });

  describe('when card is not revealed', () => {
    it('calls onReveal when Space is pressed', () => {
      const onReveal = vi.fn();
      const onReview = vi.fn();

      renderHook(() =>
        useKanjiKeyboardShortcuts({
          showSetup: false,
          isComplete: false,
          isRevealed: false,
          onReveal,
          onReview,
        })
      );

      triggerKeyDown(' ');

      expect(onReveal).toHaveBeenCalledTimes(1);
      expect(onReview).not.toHaveBeenCalled();
    });

    it('calls onReveal when Spacebar (legacy) is pressed', () => {
      const onReveal = vi.fn();

      renderHook(() =>
        useKanjiKeyboardShortcuts({
          showSetup: false,
          isComplete: false,
          isRevealed: false,
          onReveal,
          onReview: vi.fn(),
        })
      );

      triggerKeyDown('Spacebar');

      expect(onReveal).toHaveBeenCalledTimes(1);
    });

    it('does not call onReview for rating keys when not revealed', () => {
      const onReview = vi.fn();

      renderHook(() =>
        useKanjiKeyboardShortcuts({
          showSetup: false,
          isComplete: false,
          isRevealed: false,
          onReveal: vi.fn(),
          onReview,
        })
      );

      ['1', '2', '3', '4'].forEach((key) => triggerKeyDown(key));

      expect(onReview).not.toHaveBeenCalled();
    });
  });

  describe('when card is revealed', () => {
    const cases: { key: string; rating: Rating }[] = [
      { key: '1', rating: 'again' },
      { key: '2', rating: 'hard' },
      { key: '3', rating: 'good' },
      { key: '4', rating: 'easy' },
    ];

    it.each(cases)('calls onReview($rating) when $key is pressed', ({ key, rating }) => {
      const onReview = vi.fn();

      renderHook(() =>
        useKanjiKeyboardShortcuts({
          showSetup: false,
          isComplete: false,
          isRevealed: true,
          onReveal: vi.fn(),
          onReview,
        })
      );

      triggerKeyDown(key);

      expect(onReview).toHaveBeenCalledTimes(1);
      expect(onReview).toHaveBeenCalledWith(rating);
    });

    it('calls onReview("again") when Space is pressed while revealed', () => {
      const onReview = vi.fn();

      renderHook(() =>
        useKanjiKeyboardShortcuts({
          showSetup: false,
          isComplete: false,
          isRevealed: true,
          onReveal: vi.fn(),
          onReview,
        })
      );

      triggerKeyDown(' ');

      expect(onReview).toHaveBeenCalledTimes(1);
      expect(onReview).toHaveBeenCalledWith('again');
    });

    it('does not call onReveal when Space is pressed while revealed', () => {
      const onReveal = vi.fn();
      const onReview = vi.fn();

      renderHook(() =>
        useKanjiKeyboardShortcuts({
          showSetup: false,
          isComplete: false,
          isRevealed: true,
          onReveal,
          onReview,
        })
      );

      triggerKeyDown(' ');

      expect(onReveal).not.toHaveBeenCalled();
      expect(onReview).toHaveBeenCalledWith('again');
    });

    it('ignores unknown keys', () => {
      const onReveal = vi.fn();
      const onReview = vi.fn();

      renderHook(() =>
        useKanjiKeyboardShortcuts({
          showSetup: false,
          isComplete: false,
          isRevealed: true,
          onReveal,
          onReview,
        })
      );

      triggerKeyDown('a');

      expect(onReveal).not.toHaveBeenCalled();
      expect(onReview).not.toHaveBeenCalled();
    });
  });

  describe('when setup is shown or session is complete', () => {
    it('ignores all key presses when showSetup is true', () => {
      const onReveal = vi.fn();
      const onReview = vi.fn();

      renderHook(() =>
        useKanjiKeyboardShortcuts({
          showSetup: true,
          isComplete: false,
          isRevealed: false,
          onReveal,
          onReview,
        })
      );

      triggerKeyDown(' ');
      triggerKeyDown('1');
      triggerKeyDown('2');

      expect(onReveal).not.toHaveBeenCalled();
      expect(onReview).not.toHaveBeenCalled();
    });

    it('ignores all key presses when isComplete is true', () => {
      const onReveal = vi.fn();
      const onReview = vi.fn();

      renderHook(() =>
        useKanjiKeyboardShortcuts({
          showSetup: false,
          isComplete: true,
          isRevealed: true,
          onReveal,
          onReview,
        })
      );

      triggerKeyDown(' ');
      triggerKeyDown('1');
      triggerKeyDown('4');

      expect(onReveal).not.toHaveBeenCalled();
      expect(onReview).not.toHaveBeenCalled();
    });
  });

  describe('dependency changes', () => {
    it('re-attaches listener when options change', () => {
      const initialProps = {
        showSetup: false,
        isComplete: false,
        isRevealed: false,
        onReveal: vi.fn(),
        onReview: vi.fn(),
      };

      const { rerender } = renderHook((props) => useKanjiKeyboardShortcuts(props), {
        initialProps,
      });

      expect(getWindowListeners()).toHaveLength(1);

      rerender({
        ...initialProps,
        isRevealed: true,
      });

      expect(window.removeEventListener).toHaveBeenCalled();
      expect(window.addEventListener).toHaveBeenCalledTimes(2);
      expect(getWindowListeners()).toHaveLength(1);
    });
  });
});
