import { useState, useEffect, useCallback, useMemo } from 'react';
import { Rating, getDueCards } from '../lib/fsrs.js';
import { useKanjiProgress, KanjiCard } from './useKanjiProgress.js';

export interface PracticeSessionState {
  currentCard: KanjiCard | null;
  isRevealed: boolean;
  showSetup: boolean;
  selectedLessons: string[];
  isComplete: boolean;
  isStarting: boolean;
  hasImported: boolean;
  availableLessons: string[];
  isEditingMnemonic: boolean;
  editedMnemonic: string;
  filteredDueCount: number;
  intervals: Record<Rating, string>;
}

export interface PracticeSessionActions {
  handleReveal: () => void;
  handleReview: (rating: Rating) => void;
  handleEditMnemonic: () => void;
  handleSaveMnemonic: () => void;
  handleCancelEditMnemonic: () => void;
  handleStart: () => Promise<void>;
  handleReset: () => void;
  handleLessonChange: (lessonId: string) => void;
  handleMnemonicChange: (value: string) => void;
}

export interface PracticeSessionDeps {
  cards: KanjiCard[];
  isLoading: boolean;
  stats: { total: number; due: number; new: number; review: number };
  review: (kanjiId: string, rating: Rating) => void;
  getNextCard: (lessonIds?: string[]) => KanjiCard | null;
  getPreview: (kanjiId: string, rating: Rating) => number | null;
  importKanji: (options?: { lessonId?: string; limit?: number }) => Promise<KanjiCard[]>;
  updateCard: (kanjiId: string, updates: Partial<KanjiCard>) => void;
  getAvailableLessons: () => string[];
}

export function useKanjiPracticeSession(): {
  state: PracticeSessionState;
  actions: PracticeSessionActions;
  deps: PracticeSessionDeps;
} {
  const {
    cards,
    isLoading,
    stats,
    review,
    getNextCard,
    getPreview,
    importKanji,
    updateCard,
    getAvailableLessons,
  } = useKanjiProgress();

  const [currentCard, setCurrentCard] = useState<KanjiCard | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [showSetup, setShowSetup] = useState(true);
  const [selectedLessons, setSelectedLessons] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [hasImported, setHasImported] = useState(false);
  const [availableLessons, setAvailableLessons] = useState<string[]>([]);
  const [isEditingMnemonic, setIsEditingMnemonic] = useState(false);
  const [editedMnemonic, setEditedMnemonic] = useState('');

  // Compute filtered due count based on selected lessons
  const filteredDueCount = useMemo(() => {
    const dueCards = getDueCards(cards) as KanjiCard[];
    if (selectedLessons.length === 0) {
      return dueCards.length;
    }
    return dueCards.filter(
      (card) => card.lessonId && selectedLessons.includes(card.lessonId)
    ).length;
  }, [cards, selectedLessons]);

  // Auto-import kanji on mount (only if no kanji in localStorage)
  useEffect(() => {
    const autoImport = async () => {
      const stored = localStorage.getItem('speech-practice-kanji-progress');
      if (!stored) {
        await importKanji();
      }
      setHasImported(true);
    };
    autoImport();
  }, [importKanji]);

  // Load available lessons
  useEffect(() => {
    const lessons = getAvailableLessons();
    setAvailableLessons(lessons);
  }, [getAvailableLessons, cards]);

  // Get next card when needed
  useEffect(() => {
    if (!showSetup && !isRevealed && !isComplete) {
      const next = getNextCard(
        selectedLessons.length > 0 ? selectedLessons : undefined
      );
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

  const handleReview = useCallback(
    (rating: Rating) => {
      if (currentCard) {
        review(currentCard.kanjiId, rating);
        setIsRevealed(false);
        setIsEditingMnemonic(false);
      }
    },
    [currentCard, review]
  );

  const handleEditMnemonic = useCallback(() => {
    if (currentCard) {
      setEditedMnemonic(currentCard.mnemonic || '');
      setIsEditingMnemonic(true);
    }
  }, [currentCard]);

  const handleSaveMnemonic = useCallback(() => {
    if (currentCard) {
      updateCard(currentCard.kanjiId, { mnemonic: editedMnemonic });
      setIsEditingMnemonic(false);
      setCurrentCard((prev) =>
        prev ? { ...prev, mnemonic: editedMnemonic } : null
      );
    }
  }, [currentCard, editedMnemonic, updateCard]);

  const handleCancelEditMnemonic = useCallback(() => {
    setIsEditingMnemonic(false);
    setEditedMnemonic('');
  }, []);

  const handleStart = useCallback(async () => {
    setIsStarting(true);

    if (!hasImported) {
      await importKanji(
        selectedLessons.length > 0
          ? { lessonId: selectedLessons[0] }
          : undefined
      );
      setHasImported(true);
    }

    setShowSetup(false);
    setIsStarting(false);
  }, [hasImported, importKanji, selectedLessons]);

  const handleReset = useCallback(() => {
    setShowSetup(true);
    setIsComplete(false);
    setIsRevealed(false);
    setCurrentCard(null);
  }, []);

  const handleLessonChange = useCallback((lessonId: string) => {
    setSelectedLessons(lessonId ? [lessonId] : []);
  }, []);

  const handleMnemonicChange = useCallback((value: string) => {
    setEditedMnemonic(value);
  }, []);

  // Get preview intervals for current card
  const intervals = useMemo(() => {
    if (!currentCard) {
      return { again: '< 1m', hard: '', good: '', easy: '' } as Record<Rating, string>;
    }
    const result = {} as Record<Rating, string>;
    (['again', 'hard', 'good', 'easy'] as Rating[]).forEach((rating) => {
      const intervalDays = getPreview(currentCard.kanjiId, rating);
      if (intervalDays === null) {
        result[rating] = '';
        return;
      }
      const intervalMinutes = intervalDays * 24 * 60;
      if (intervalMinutes < 1) result[rating] = '< 1m';
      else if (intervalMinutes < 60)
        result[rating] = `${Math.round(intervalMinutes)}m`;
      else if (intervalMinutes < 1440)
        result[rating] = `${Math.round(intervalMinutes / 60)}h`;
      else result[rating] = `${Math.round(intervalMinutes / 1440)}d`;
    });
    return result;
  }, [currentCard, getPreview]);

  return {
    state: {
      currentCard,
      isRevealed,
      showSetup,
      selectedLessons,
      isComplete,
      isStarting,
      hasImported,
      availableLessons,
      isEditingMnemonic,
      editedMnemonic,
      filteredDueCount,
      intervals,
    },
    actions: {
      handleReveal,
      handleReview,
      handleEditMnemonic,
      handleSaveMnemonic,
      handleCancelEditMnemonic,
      handleStart,
      handleReset,
      handleLessonChange,
      handleMnemonicChange,
    },
    deps: {
      cards,
      isLoading,
      stats,
      review,
      getNextCard,
      getPreview,
      importKanji,
      updateCard,
      getAvailableLessons,
    },
  };
}
