import { useState, useEffect, useCallback } from 'react';
import { Rating } from '../../lib/fsrs.js';
import { useMemoryProgress, MemoryCard } from '../../hooks/useMemoryProgress.js';

const SELECTED_LESSONS_KEY = 'memoryModeSelectedLessons';

const loadSelectedLessons = (): string[] => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(SELECTED_LESSONS_KEY);
    try {
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }
  return [];
};

export interface UseMemorySessionResult {
  isLoading: boolean;
  stats: { total: number; due: number; new: number; review: number };
  getPreview: (phraseId: string, rating: Rating) => number;
  currentCard: MemoryCard | null;
  isRevealed: boolean;
  showSetup: boolean;
  selectedLessons: string[];
  setSelectedLessons: React.Dispatch<React.SetStateAction<string[]>>;
  isComplete: boolean;
  isStarting: boolean;
  toggleLesson: (lessonId: string) => void;
  handleReveal: () => void;
  handleReview: (rating: Rating) => void;
  startSession: () => Promise<void>;
  resetSession: () => void;
}

export const useMemorySession = (): UseMemorySessionResult => {
  const {
    cards,
    isLoading,
    getStats,
    getNextCard,
    review,
    getPreview,
    importUniqueVocabulary,
  } = useMemoryProgress();

  const [currentCard, setCurrentCard] = useState<MemoryCard | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [showSetup, setShowSetup] = useState(true);
  const [selectedLessons, setSelectedLessons] = useState<string[]>(loadSelectedLessons);
  const [isComplete, setIsComplete] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [hasImported, setHasImported] = useState(false);

  // Save selected lessons to localStorage when they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(SELECTED_LESSONS_KEY, JSON.stringify(selectedLessons));
    }
  }, [selectedLessons]);

  const toggleLesson = useCallback((lessonId: string) => {
    setSelectedLessons(prev =>
      prev.includes(lessonId)
        ? prev.filter(id => id !== lessonId)
        : [...prev, lessonId]
    );
  }, []);

  // Get next card when needed (filtered by selected lessons)
  useEffect(() => {
    if (!showSetup && !isRevealed && !isComplete) {
      const next = getNextCard(selectedLessons);
      if (next) {
        setCurrentCard(next);
      } else {
        setIsComplete(true);
      }
    }
  }, [showSetup, isRevealed, isComplete, getNextCard, cards.length, selectedLessons]);

  const handleReveal = useCallback(() => {
    setIsRevealed(true);
  }, []);

  const handleReview = useCallback((rating: Rating) => {
    if (currentCard) {
      review(currentCard.phraseId, rating);
      setIsRevealed(false);
      // Don't manually set next card here - let the useEffect handle it
      // This avoids race conditions and incorrect session end detection
    }
  }, [currentCard, review]);

  // Import cards when starting session
  const startSession = useCallback(async () => {
    setIsStarting(true);

    // Import unique vocabulary from selected lessons FIRST
    let imported = 0;

    if (selectedLessons.length > 0) {
      for (const lessonId of selectedLessons) {
        try {
          const result = await importUniqueVocabulary(lessonId);
          imported += result.imported;
          console.log('MemoryMode: Imported', result.imported, 'unique cards from', lessonId, '(', result.unique, 'of', result.total, 'total)');
        } catch (err) {
          console.error('MemoryMode: Failed to import from', lessonId, err);
        }
      }
    }

    console.log(`MemoryMode: Total imported ${imported} unique cards`);
    setHasImported(true);
    setShowSetup(false);
    setIsComplete(false);
  }, [selectedLessons, importUniqueVocabulary]);

  // Start session AFTER cards are imported (watch cards.length change)
  useEffect(() => {
    if (hasImported && !showSetup && !isComplete) {
      const next = getNextCard(selectedLessons);
      if (next) {
        setCurrentCard(next);
        // Scroll to top when card is loaded
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setIsComplete(true);
      }
      setIsStarting(false);
      setHasImported(false); // Reset for next time
    }
  }, [cards.length, hasImported, showSetup, isComplete, getNextCard, selectedLessons]);

  const resetSession = useCallback(() => {
    setShowSetup(true);
    setIsRevealed(false);
    setCurrentCard(null);
    setIsComplete(false);
    // Keep selectedLessons - they are persisted in localStorage
    setHasImported(false);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle shortcuts when in active session (not in setup/complete)
      if (showSetup || isComplete) return;

      const key = e.key;

      if (!isRevealed) {
        // Space reveals the answer
        if (key === ' ' || key === 'Spacebar') {
          e.preventDefault();
          handleReveal();
        }
      } else {
        // Rating shortcuts when answer is revealed
        switch (key) {
          case '1':
          case ' ':
          case 'Spacebar':
            e.preventDefault();
            handleReview('again');
            break;
          case '2':
            e.preventDefault();
            handleReview('hard');
            break;
          case '3':
            e.preventDefault();
            handleReview('good');
            break;
          case '4':
            e.preventDefault();
            handleReview('easy');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showSetup, isComplete, isRevealed, handleReveal, handleReview]);

  const stats = getStats(selectedLessons);

  return {
    isLoading,
    stats,
    getPreview,
    currentCard,
    isRevealed,
    showSetup,
    selectedLessons,
    setSelectedLessons,
    isComplete,
    isStarting,
    toggleLesson,
    handleReveal,
    handleReview,
    startSession,
    resetSession,
  };
};
