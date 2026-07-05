import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useKanjiKeyboardShortcuts } from '../../hooks/useKanjiKeyboardShortcuts';

describe('useKanjiKeyboardShortcuts', () => {
  let mockOnReveal: ReturnType<typeof vi.fn>;
  let mockOnReview: ReturnType<typeof vi.fn>;
  let keydownHandler: ((e: KeyboardEvent) => void) | null = null;

  const defaultOptions = {
    showSetup: false,
    isComplete: false,
    isRevealed: false,
    onReveal: () => {},
    onReview: () => {},
  };

  beforeEach(() => {
    mockOnReveal = vi.fn();
    mockOnReview = vi.fn();
    keydownHandler = null;

    // Capture the event listener so we can trigger it manually
    vi.spyOn(window, 'addEventListener').mockImplementation((event, handler) => {
      if (event === 'keydown') {
        keydownHandler = handler as (e: KeyboardEvent) => void;
      }
    });

    vi.spyOn(window, 'removeEventListener').mockImplementation((event, handler) => {
      if (event === 'keydown' && handler === keydownHandler) {
        keydownHandler = null;
      }
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Helper to trigger keydown events
  const triggerKeyDown = (key: string, options: Partial<KeyboardEventInit> = {}) => {
    const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...options });
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
    
    if (keydownHandler) {
      keydownHandler(event);
    }
    
    return { event, preventDefaultSpy };
  };

  describe('initialization', () => {
    it('should register keydown listener on mount', () => {
      renderHook(() => useKanjiKeyboardShortcuts(defaultOptions));
      expect(window.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
    });

    it('should remove keydown listener on unmount', () => {
      const { unmount } = renderHook(() => useKanjiKeyboardShortcuts(defaultOptions));
      unmount();
      expect(window.removeEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
    });
  });

  describe('when showSetup is true', () => {
    it('should not call onReveal when space is pressed', () => {
      renderHook(() =>
        useKanjiKeyboardShortcuts({
          ...defaultOptions,
          showSetup: true,
          onReveal: mockOnReveal,
        })
      );

      triggerKeyDown(' ');
      expect(mockOnReveal).not.toHaveBeenCalled();
    });

    it('should not call onReview when number keys are pressed', () => {
      renderHook(() =>
        useKanjiKeyboardShortcuts({
          ...defaultOptions,
          showSetup: true,
          isRevealed: true,
          onReview: mockOnReview,
        })
      );

      triggerKeyDown('1');
      triggerKeyDown('2');
      triggerKeyDown('3');
      triggerKeyDown('4');
      expect(mockOnReview).not.toHaveBeenCalled();
    });
  });

  describe('when isComplete is true', () => {
    it('should not call onReveal when space is pressed', () => {
      renderHook(() =>
        useKanjiKeyboardShortcuts({
          ...defaultOptions,
          isComplete: true,
          onReveal: mockOnReveal,
        })
      );

      triggerKeyDown(' ');
      expect(mockOnReveal).not.toHaveBeenCalled();
    });

    it('should not call onReview when number keys are pressed', () => {
      renderHook(() =>
        useKanjiKeyboardShortcuts({
          ...defaultOptions,
          isComplete: true,
          isRevealed: true,
          onReview: mockOnReview,
        })
      );

      triggerKeyDown('1');
      expect(mockOnReview).not.toHaveBeenCalled();
    });
  });

  describe('when not revealed', () => {
    it('should call onReveal when space is pressed', () => {
      renderHook(() =>
        useKanjiKeyboardShortcuts({
          ...defaultOptions,
          onReveal: mockOnReveal,
        })
      );

      const { preventDefaultSpy } = triggerKeyDown(' ');
      expect(mockOnReveal).toHaveBeenCalledTimes(1);
      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('should call onReveal when Spacebar (legacy) is pressed', () => {
      renderHook(() =>
        useKanjiKeyboardShortcuts({
          ...defaultOptions,
          onReveal: mockOnReveal,
        })
      );

      const { preventDefaultSpy } = triggerKeyDown('Spacebar');
      expect(mockOnReveal).toHaveBeenCalledTimes(1);
      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('should not call onReview when number keys are pressed', () => {
      renderHook(() =>
        useKanjiKeyboardShortcuts({
          ...defaultOptions,
          onReview: mockOnReview,
        })
      );

      triggerKeyDown('1');
      triggerKeyDown('2');
      triggerKeyDown('3');
      triggerKeyDown('4');
      expect(mockOnReview).not.toHaveBeenCalled();
    });

    it('should not call onReveal for unhandled keys', () => {
      renderHook(() =>
        useKanjiKeyboardShortcuts({
          ...defaultOptions,
          onReveal: mockOnReveal,
        })
      );

      triggerKeyDown('Enter');
      triggerKeyDown('Escape');
      triggerKeyDown('a');
      expect(mockOnReveal).not.toHaveBeenCalled();
    });
  });

  describe('when revealed', () => {
    it('should call onReview with "again" when 1 is pressed', () => {
      renderHook(() =>
        useKanjiKeyboardShortcuts({
          ...defaultOptions,
          isRevealed: true,
          onReview: mockOnReview,
        })
      );

      const { preventDefaultSpy } = triggerKeyDown('1');
      expect(mockOnReview).toHaveBeenCalledWith('again');
      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('should call onReview with "hard" when 2 is pressed', () => {
      renderHook(() =>
        useKanjiKeyboardShortcuts({
          ...defaultOptions,
          isRevealed: true,
          onReview: mockOnReview,
        })
      );

      const { preventDefaultSpy } = triggerKeyDown('2');
      expect(mockOnReview).toHaveBeenCalledWith('hard');
      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('should call onReview with "good" when 3 is pressed', () => {
      renderHook(() =>
        useKanjiKeyboardShortcuts({
          ...defaultOptions,
          isRevealed: true,
          onReview: mockOnReview,
        })
      );

      const { preventDefaultSpy } = triggerKeyDown('3');
      expect(mockOnReview).toHaveBeenCalledWith('good');
      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('should call onReview with "easy" when 4 is pressed', () => {
      renderHook(() =>
        useKanjiKeyboardShortcuts({
          ...defaultOptions,
          isRevealed: true,
          onReview: mockOnReview,
        })
      );

      const { preventDefaultSpy } = triggerKeyDown('4');
      expect(mockOnReview).toHaveBeenCalledWith('easy');
      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('should call onReview with "again" when space is pressed', () => {
      renderHook(() =>
        useKanjiKeyboardShortcuts({
          ...defaultOptions,
          isRevealed: true,
          onReview: mockOnReview,
        })
      );

      const { preventDefaultSpy } = triggerKeyDown(' ');
      expect(mockOnReview).toHaveBeenCalledWith('again');
      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('should call onReview with "again" when Spacebar (legacy) is pressed', () => {
      renderHook(() =>
        useKanjiKeyboardShortcuts({
          ...defaultOptions,
          isRevealed: true,
          onReview: mockOnReview,
        })
      );

      const { preventDefaultSpy } = triggerKeyDown('Spacebar');
      expect(mockOnReview).toHaveBeenCalledWith('again');
      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('should not call onReveal when space is pressed while revealed', () => {
      renderHook(() =>
        useKanjiKeyboardShortcuts({
          ...defaultOptions,
          isRevealed: true,
          onReveal: mockOnReveal,
          onReview: mockOnReview,
        })
      );

      triggerKeyDown(' ');
      expect(mockOnReveal).not.toHaveBeenCalled();
      expect(mockOnReview).toHaveBeenCalledWith('again');
    });

    it('should not call onReview for unhandled keys', () => {
      renderHook(() =>
        useKanjiKeyboardShortcuts({
          ...defaultOptions,
          isRevealed: true,
          onReview: mockOnReview,
        })
      );

      triggerKeyDown('5');
      triggerKeyDown('Enter');
      triggerKeyDown('Escape');
      triggerKeyDown('a');
      expect(mockOnReview).not.toHaveBeenCalled();
    });
  });

  describe('dependency updates', () => {
    it('should update handler when isRevealed changes', () => {
      const { rerender } = renderHook(
        ({ isRevealed }) =>
          useKanjiKeyboardShortcuts({
            ...defaultOptions,
            isRevealed,
            onReveal: mockOnReveal,
            onReview: mockOnReview,
          }),
        { initialProps: { isRevealed: false } }
      );

      // Initially not revealed - space should call onReveal
      triggerKeyDown(' ');
      expect(mockOnReveal).toHaveBeenCalledTimes(1);

      // Change to revealed - space should call onReview with 'again'
      rerender({ isRevealed: true });
      triggerKeyDown(' ');
      expect(mockOnReview).toHaveBeenCalledWith('again');
    });

    it('should update handler when showSetup changes', () => {
      const { rerender } = renderHook(
        ({ showSetup }) =>
          useKanjiKeyboardShortcuts({
            ...defaultOptions,
            showSetup,
            isRevealed: true,
            onReview: mockOnReview,
          }),
        { initialProps: { showSetup: true } }
      );

      // showSetup=true - keys should not work
      triggerKeyDown('1');
      expect(mockOnReview).not.toHaveBeenCalled();

      // Change to showSetup=false - keys should work
      rerender({ showSetup: false });
      triggerKeyDown('1');
      expect(mockOnReview).toHaveBeenCalledWith('again');
    });
  });
});
