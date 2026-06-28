import { useEffect } from 'react';
import { Rating } from '../lib/fsrs.js';

interface KeyboardShortcutOptions {
  showSetup: boolean;
  isComplete: boolean;
  isRevealed: boolean;
  onReveal: () => void;
  onReview: (rating: Rating) => void;
}

export function useKanjiKeyboardShortcuts({
  showSetup,
  isComplete,
  isRevealed,
  onReveal,
  onReview,
}: KeyboardShortcutOptions): void {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showSetup || isComplete) return;

      const key = e.key;

      if (!isRevealed) {
        if (key === ' ' || key === 'Spacebar') {
          e.preventDefault();
          onReveal();
        }
      } else {
        switch (key) {
          case '1':
          case ' ':
          case 'Spacebar':
            e.preventDefault();
            onReview('again');
            break;
          case '2':
            e.preventDefault();
            onReview('hard');
            break;
          case '3':
            e.preventDefault();
            onReview('good');
            break;
          case '4':
            e.preventDefault();
            onReview('easy');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showSetup, isComplete, isRevealed, onReveal, onReview]);
}
