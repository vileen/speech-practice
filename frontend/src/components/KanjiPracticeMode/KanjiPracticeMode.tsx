import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Rating, getDueCards } from '../../lib/fsrs.js';
import { useKanjiProgress, KanjiCard } from '../../hooks/useKanjiProgress.js';
import { Header } from '../Header/index.js';
import { KanjiSetup } from './KanjiSetup.js';
import { KanjiComplete } from './KanjiComplete.js';
import { KanjiCardView } from './KanjiCardView.js';
import { KanjiRatingButtons } from './KanjiRatingButtons.js';
import './KanjiPracticeMode.css';

export const KanjiPracticeMode: React.FC = () => {
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

  const handleStart = async () => {
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
  };

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

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showSetup || isComplete) return;

      const key = e.key;

      if (!isRevealed) {
        if (key === ' ' || key === 'Spacebar') {
          e.preventDefault();
          handleReveal();
        }
      } else {
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

  if (isLoading) {
    return (
      <>
        <Header title="Kanji Practice" icon="🈁" />
        <div className="kanji-practice-loading">
          <div className="spinner" />
          <p>Loading kanji...</p>
        </div>
      </>
    );
  }

  if (showSetup) {
    return (
      <>
        <Header title="Kanji Practice" icon="🈁" subtitle="Kodansha Kanji Learner's Course" />
        <KanjiSetup
          stats={stats}
          availableLessons={availableLessons}
          selectedLessons={selectedLessons}
          filteredDueCount={filteredDueCount}
          isStarting={isStarting}
          onLessonChange={handleLessonChange}
          onStart={handleStart}
        />
      </>
    );
  }

  if (isComplete) {
    return (
      <>
        <Header title="Practice Complete" icon="🎉" showBackButton={false} />
        <KanjiComplete stats={stats} onPracticeMore={handleReset} />
      </>
    );
  }

  if (!currentCard) {
    return (
      <>
        <Header title="Kanji Practice" icon="🈁" />
        <div className="kanji-practice-empty">
          <p>No kanji available. Import some kanji first!</p>
          <button className="kanji-practice-start-btn" onClick={handleReset}>
            Back to Setup
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Kanji Practice" icon="🈁" />
      <div className="kanji-practice-container">
        {/* Progress bar */}
        <div className="kanji-practice-progress">
          <div className="progress-stats">
            <span>Due: {stats.due}</span>
            <span>New: {stats.new}</span>
            <span>Review: {stats.review}</span>
          </div>
        </div>

        {/* Main card */}
        <KanjiCardView
          card={currentCard}
          isRevealed={isRevealed}
          isEditingMnemonic={isEditingMnemonic}
          editedMnemonic={editedMnemonic}
          onEditMnemonic={handleEditMnemonic}
          onSaveMnemonic={handleSaveMnemonic}
          onCancelEditMnemonic={handleCancelEditMnemonic}
          onMnemonicChange={handleMnemonicChange}
        />

        {/* Controls */}
        <div className="kanji-practice-controls">
          {!isRevealed ? (
            <button
              className="kanji-reveal-btn"
              onClick={handleReveal}
              autoFocus
            >
              Reveal Answer (Space)
            </button>
          ) : (
            <KanjiRatingButtons intervals={intervals} onReview={handleReview} />
          )}
        </div>

        {/* Navigation */}
        <div className="kanji-practice-nav">
          <button className="nav-btn" onClick={handleReset}>
            End Session
          </button>
        </div>
      </div>
    </>
  );
};
