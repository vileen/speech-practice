import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Rating } from '../../lib/fsrs.js';
import { useMemoryProgress, MemoryCard } from '../../hooks/useMemoryProgress.js';
import { JapanesePhrase } from '../JapanesePhrase/index.js';
import { Header } from '../Header/index.js';
import './MemoryMode.css';
import type { Lesson } from '../../types/index.js';


interface MemoryModeProps {
  lessons?: Lesson[]; // Kept for backwards compatibility, but not used
}

export const MemoryMode: React.FC<MemoryModeProps> = ({ lessons }) => {
  const navigate = useNavigate();
  const {
    cards,
    isLoading,
    getStats,
    review,
    getNextCard,
    getPreview,
    importUniqueVocabulary,
  } = useMemoryProgress();

  const [currentCard, setCurrentCard] = useState<MemoryCard | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [showSetup, setShowSetup] = useState(true);
  const [selectedLessons, setSelectedLessons] = useState<string[]>(() => {
    // Load from localStorage on init
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('memoryModeSelectedLessons');
      try {
        return saved ? JSON.parse(saved) : [];
      } catch {
        return [];
      }
    }
    return [];
  });
  const [isComplete, setIsComplete] = useState(false);

  // Save selected lessons to localStorage when they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('memoryModeSelectedLessons', JSON.stringify(selectedLessons));
    }
  }, [selectedLessons]);
  
  // Get filtered stats based on selected lessons
  const stats = getStats(selectedLessons);
  const [isStarting, setIsStarting] = useState(false);
  const [hasImported, setHasImported] = useState(false);

  // Calculate total vocabulary count from selected lessons
  const selectedVocabCount = selectedLessons.reduce((total, lessonId) => {
    const lesson = lessons?.find(l => l.id === lessonId);
    console.log('MemoryMode: Finding lesson', lessonId, 'vocabCount:', lesson?.vocabCount);
    return total + (lesson?.vocabCount || 0);
  }, 0);
  
  console.log('MemoryMode: selectedVocabCount =', selectedVocabCount, 'selectedLessons:', selectedLessons);



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
      console.log('MemoryMode: Cards imported, checking for next card. Total cards:', cards.length, 'Selected lessons:', selectedLessons);
      const next = getNextCard(selectedLessons);
      console.log('MemoryMode: Next card:', next);
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

  // Get interval previews
  const previews = currentCard ? {
    again: getPreview(currentCard.phraseId, 'again'),
    hard: getPreview(currentCard.phraseId, 'hard'),
    good: getPreview(currentCard.phraseId, 'good'),
    easy: getPreview(currentCard.phraseId, 'easy'),
  } : null;

  // Format interval for display (handles minutes for new cards)
  const formatInterval = (days: number): string => {
    // Convert days to minutes if less than 1 day
    if (days < 1 / 24) {
      const minutes = Math.round(days * 24 * 60);
      if (minutes < 1) return '< 1m';
      return `${minutes}m`;
    }
    if (days < 1) {
      const hours = Math.round(days * 24);
      return `${hours}h`;
    }
    if (days === 1) return '1d';
    if (days < 30) return `${Math.round(days)}d`;
    if (days < 365) return `${Math.round(days / 30)}mo`;
    return `${Math.round(days / 365)}y`;
  };

  // Get card type label
  const getTypeLabel = (card: MemoryCard): string => {
    return card.phraseType === 'vocabulary' ? 'Vocabulary' : 'Grammar';
  };

  // Get card status
  const getCardStatus = (card: MemoryCard): string => {
    if (card.state === 'new') return 'New';
    if (card.state === 'learning') return 'Learning';
    if (card.state === 'relearning') return 'Relearning';
    return `Review (${card.reps}x)`;
  };

  if (isLoading || isStarting) {
    return (
      <div className="app">
        <Header title="Memory Mode" icon="🧠" onBack={() => navigate('/')} />
        <main>
          <div className="memory-mode-loading">
            <div className="spinner">{isStarting ? 'Preparing cards...' : 'Loading...'}</div>
          </div>
        </main>
      </div>
    );
  }

  // Setup screen
  if (showSetup) {
    return (
      <div className="app">
        <Header title="Memory Mode" icon="🧠" onBack={() => navigate('/')} />
        <main>
          <div className="memory-mode-setup">
            <div className="memory-card">
              <h2>🧠 Memory Mode</h2>
              <p className="description">
                Test your recall by translating from English to Japanese.
              </p>
              <p className="subtitle">
                Uses FSRS (Free Spaced Repetition Scheduler) to optimize your learning.
              </p>

              {/* Stats */}
              <div className="stats-grid">
                <div className="stat-box">
                  <div className="stat-value">{stats.total}</div>
                  <div className="stat-label">Total Cards</div>
                </div>
                <div className="stat-box due">
                  <div className="stat-value">{stats.due}</div>
                  <div className="stat-label">Due Now</div>
                </div>
                <div className="stat-box new">
                  <div className="stat-value">{stats.new}</div>
                  <div className="stat-label">New</div>
                </div>
                <div className="stat-box review">
                  <div className="stat-value">{stats.review}</div>
                  <div className="stat-label">In Review</div>
                </div>
              </div>

              {/* Lesson Selection */}
              <div className="lesson-selection">
                <h3>Select Lessons to Study <small>(only cards from selected lessons)</small></h3>
                <div className="lesson-chips">
                  {import.meta.env.DEV && (
                    <div style={{fontSize: '12px', color: '#888', marginBottom: '10px'}}>
                      Debug: lessons type={typeof lessons}, isArray={Array.isArray(lessons)?.toString()},
                      length={lessons?.length}
                    </div>
                  )}
                  {Array.isArray(lessons) && lessons.length > 0 ? (
                    [...lessons]
                      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                      .map((lesson, index) => (
                        <button
                          key={lesson.id}
                          className={`lesson-chip ${selectedLessons.includes(lesson.id) ? 'selected' : ''}`}
                          onClick={() => {
                            if (selectedLessons.includes(lesson.id)) {
                              setSelectedLessons(prev => prev.filter(id => id !== lesson.id));
                            } else {
                              setSelectedLessons(prev => [...prev, lesson.id]);
                            }
                          }}
                        >
                          <span className="lesson-number">#{index + 1}</span>
                          <span className="lesson-title">{lesson.title || `Lesson ${lesson.id}`}</span>
                        </button>
                      ))
                  ) : (
                    <p className="no-lessons">No lessons available. Please check your connection.</p>
                  )}
                </div>
              </div>

              <button
                className="start-btn"
                onClick={startSession}
                disabled={selectedLessons.length === 0}
                title={selectedLessons.length === 0 ? 'Select at least one lesson to study' : ''}
              >
                {stats.due > 0
                  ? `Study ${stats.due} Due Cards${selectedVocabCount > 0 ? ` (+${selectedVocabCount} new)` : ''}`
                  : `Start New Session${selectedVocabCount > 0 ? ` (${selectedVocabCount} words)` : ''}`}
              </button>

              <p className={`hint ${selectedLessons.length > 0 ? 'hint-hidden' : ''}`}>
                Select at least one lesson above to start studying.
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Complete screen
  if (isComplete) {
    return (
      <div className="app">
        <Header title="Memory Mode" icon="🧠" onBack={() => navigate('/')} />
        <main>
          <div className="memory-mode-complete">
            <div className="complete-icon">✓</div>
            <h2>Session Complete!</h2>
            <p>Great job. Come back when more cards are due for review.</p>
            <button className="start-btn" onClick={resetSession}>
              New Session
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Main study screen
  if (!currentCard) {
    return (
      <div className="memory-mode-loading">
        <p>No cards available. Select lessons to study.</p>
      </div>
    );
  }

  return (
    <div className="app">
      <Header
        title="Memory Mode"
        icon="🧠"
        onBack={resetSession}
        actions={
          <div className="memory-header-chips">
            <span className="chip">{getTypeLabel(currentCard)}</span>
            <span className="chip status">{getCardStatus(currentCard)}</span>
          </div>
        }
      />
      <main>
        <div className="memory-mode-study">
          <div className="memory-card">

        {/* Progress */}
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${((stats.total - stats.new - stats.due + 1) / Math.max(1, stats.total)) * 100}%` }}
          />
        </div>

        {/* Question (Hidden) */}
        <div className="question">
          <div className="question-label">Translate to Japanese</div>
          <div className="question-text">{currentCard.en}</div>
        </div>

        {/* Reveal or Answer */}
        {!isRevealed ? (
          <div className="reveal-section">
            <button className="reveal-btn" onClick={handleReveal}>
              Reveal Answer
            </button>
            <p className="reveal-hint">
              Try to say the Japanese phrase out loud before revealing
              <br />
              <kbd>Space</kbd> to reveal
            </p>
          </div>
        ) : (
          <div className="answer-section">
            <div className="answer-box">
              <JapanesePhrase
                text={currentCard.jp}
                furiganaHtml={undefined}
                romaji={currentCard.romaji}
                showFurigana={true}
                showRomaji={true}
                size="large"
              />
            </div>

            {/* Voice Recorder - placeholder for now */}
            <div className="recorder-section">
              <p className="recorder-hint">💡 Practice saying: {currentCard.jp}</p>
            </div>

            {/* Self Assessment */}
            <div className="assessment">
              <p className="assessment-label">How well did you know it?</p>
              <div className="assessment-buttons">
                <button
                  className="assessment-btn again"
                  onClick={() => handleReview('again')}
                >
                  <span className="btn-key">1</span>
                  Again {previews && `(${formatInterval(previews.again)})`}
                </button>
                <button
                  className="assessment-btn hard"
                  onClick={() => handleReview('hard')}
                >
                  <span className="btn-key">2</span>
                  Hard {previews && `(${formatInterval(previews.hard)})`}
                </button>
                <button
                  className="assessment-btn good"
                  onClick={() => handleReview('good')}
                >
                  <span className="btn-key">3</span>
                  Good {previews && `(${formatInterval(previews.good)})`}
                </button>
                <button
                  className="assessment-btn easy"
                  onClick={() => handleReview('easy')}
                >
                  <span className="btn-key">4</span>
                  Easy {previews && `(${formatInterval(previews.easy)})`}
                </button>
              </div>
              <p className="keyboard-hint">Space or 1 · 2 · 3 · 4</p>
            </div>
          </div>
        )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default MemoryMode;
