import React, { useState, useEffect, useCallback } from 'react';
import { Rating } from '../../lib/fsrs.js';
import { useKanjiProgress, KanjiCard } from '../../hooks/useKanjiProgress.js';
import { Header } from '../Header/index.js';
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

  // Auto-import kanji on mount (only once)
  useEffect(() => {
    const autoImport = async () => {
      if (!hasImported && cards.length === 0) {
        await importKanji();
        setHasImported(true);
      }
    };
    autoImport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load available lessons
  useEffect(() => {
    const lessons = getAvailableLessons();
    setAvailableLessons(lessons);
  }, [getAvailableLessons, cards]);

  // Get next card when needed
  useEffect(() => {
    if (!showSetup && !isRevealed && !isComplete) {
      const next = getNextCard();
      if (next) {
        setCurrentCard(next);
      } else {
        setIsComplete(true);
      }
    }
  }, [showSetup, isRevealed, isComplete, getNextCard, cards.length]);

  const handleReveal = useCallback(() => {
    setIsRevealed(true);
  }, []);

  const handleReview = useCallback((rating: Rating) => {
    if (currentCard) {
      review(currentCard.kanjiId, rating);
      setIsRevealed(false);
    }
  }, [currentCard, review]);

  const handleStart = async () => {
    setIsStarting(true);
    
    // Import kanji if not already done
    if (!hasImported) {
      await importKanji(selectedLessons.length > 0 
        ? { lessonId: selectedLessons[0] } 
        : undefined
      );
      setHasImported(true);
    }
    
    setShowSetup(false);
    setIsStarting(false);
  };

  const handleReset = () => {
    setShowSetup(true);
    setIsComplete(false);
    setIsRevealed(false);
    setCurrentCard(null);
  };

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

  // Get preview for current card with specific rating
  const getIntervalForRating = (rating: Rating): string => {
    if (!currentCard) return '';
    const interval = getPreview(currentCard.kanjiId, rating);
    if (interval === null) return '';
    if (interval < 1) return '< 1m';
    if (interval < 60) return `${Math.round(interval)}m`;
    if (interval < 1440) return `${Math.round(interval / 60)}h`;
    return `${Math.round(interval / 1440)}d`;
  };

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

  // Setup screen
  if (showSetup) {
    return (
      <>
        <Header title="Kanji Practice" icon="🈁" subtitle="Kodansha Kanji Learner's Course" />
        <div className="kanji-practice-setup">
          <p className="kanji-practice-description">
            Learn kanji using the Kodansha Kanji Learner's Course method.
            See the kanji, recall the meaning, then check your answer.
          </p>

        <div className="kanji-practice-stats">
          <div className="stat-card">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total Kanji</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.due}</span>
            <span className="stat-label">Due for Review</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.new}</span>
            <span className="stat-label">New</span>
          </div>
        </div>

        {availableLessons.length > 0 && (
          <div className="kanji-practice-filters">
            <label>Filter by Lesson:</label>
            <select 
              value={selectedLessons[0] || ''} 
              onChange={(e) => setSelectedLessons(e.target.value ? [e.target.value] : [])}
            >
              <option value="">All Lessons</option>
              {availableLessons.map(lessonId => (
                <option key={lessonId} value={lessonId}>Lesson {lessonId}</option>
              ))}
            </select>
          </div>
        )}

        <div className="kanji-practice-shortcuts">
          <h4>Keyboard Shortcuts:</h4>
          <ul>
            <li><kbd>Space</kbd> - Reveal answer / Again</li>
            <li><kbd>2</kbd> - Hard</li>
            <li><kbd>3</kbd> - Good</li>
            <li><kbd>4</kbd> - Easy</li>
          </ul>
        </div>

        <button
          className="kanji-practice-start-btn"
          onClick={handleStart}
          disabled={isStarting}
        >
          {isStarting ? 'Loading...' : `Start Practice (${stats.due} due)`}
        </button>
        </div>
      </>
    );
  }

  // Completion screen
  if (isComplete) {
    return (
      <>
        <Header title="Practice Complete" icon="🎉" showBackButton={false} />
        <div className="kanji-practice-complete">
          <h2>Practice Complete!</h2>
          <p>You've reviewed all due kanji for now.</p>

          <div className="kanji-practice-stats">
            <div className="stat-card">
              <span className="stat-value">{stats.total}</span>
              <span className="stat-label">Total Kanji</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{stats.due}</span>
              <span className="stat-label">Still Due</span>
            </div>
          </div>

          <button className="kanji-practice-start-btn" onClick={handleReset}>
            Practice More
          </button>
        </div>
      </>
    );
  }

  // Main practice screen
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
      <div className={`kanji-card ${isRevealed ? 'revealed' : ''}`}>
        {/* Front of card - only kanji */}
        <div className="kanji-card-front">
          <div className="kanji-character">{currentCard.character}</div>
          <div className="kanji-hint">
            {!isRevealed && <p>Recall the meaning...</p>}
          </div>
        </div>

        {/* Back of card - revealed info */}
        {isRevealed && (
          <div className="kanji-card-back">
            <div className="kanji-meanings">
              <h3>Meanings:</h3>
              <ul>
                {currentCard.meanings.map((meaning, idx) => (
                  <li key={idx} className="kanji-meaning">{meaning}</li>
                ))}
              </ul>
            </div>

            <div className="kanji-readings">
              <h3>Readings:</h3>
              <div className="readings-list">
                {currentCard.readings.filter(r => r.type === 'kun').map((r, idx) => (
                  <span key={`kun-${idx}`} className="reading kun">{r.reading}</span>
                ))}
                {currentCard.readings.filter(r => r.type === 'on').map((r, idx) => (
                  <span key={`on-${idx}`} className="reading on">{r.reading}</span>
                ))}
              </div>
            </div>

            {currentCard.mnemonic && (
              <div className="kanji-mnemonic">
                <h3>Mnemonic (KLC):</h3>
                <p>{currentCard.mnemonic}</p>
              </div>
            )}

            {currentCard.examples && currentCard.examples.length > 0 && (
              <div className="kanji-examples">
                <h3>Examples from Lessons:</h3>
                <ul>
                  {currentCard.examples.map((ex, idx) => (
                    <li key={idx} className="example-item">
                      <span className="example-word">{ex.word}</span>
                      <span className="example-reading">({ex.reading})</span>
                      <span className="example-meaning">- {ex.meaning}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {currentCard.lessonId && (
              <div className="kanji-lesson-tag">
                <span>Lesson: {currentCard.lessonId}</span>
              </div>
            )}
          </div>
        )}
      </div>

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
          <div className="kanji-rating-buttons">
            <button 
              className="rating-btn again"
              onClick={() => handleReview('again')}
            >
              <span className="rating-key">1</span>
              <span className="rating-label">Again</span>
              <span className="rating-interval">&lt; 1m</span>
            </button>
            <button 
              className="rating-btn hard"
              onClick={() => handleReview('hard')}
            >
              <span className="rating-key">2</span>
              <span className="rating-label">Hard</span>
              <span className="rating-interval">{getIntervalForRating('hard')}</span>
            </button>
            <button 
              className="rating-btn good"
              onClick={() => handleReview('good')}
            >
              <span className="rating-key">3</span>
              <span className="rating-label">Good</span>
              <span className="rating-interval">{getIntervalForRating('good')}</span>
            </button>
            <button 
              className="rating-btn easy"
              onClick={() => handleReview('easy')}
            >
              <span className="rating-key">4</span>
              <span className="rating-label">Easy</span>
              <span className="rating-interval">{getIntervalForRating('easy')}</span>
            </button>
          </div>
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
