import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../Header/index.js';
import { useMemorySession } from './useMemorySession.js';
import { MemoryModeSetup } from './MemoryModeSetup.js';
import { MemoryModeStudy } from './MemoryModeStudy.js';
import { MemoryModeComplete } from './MemoryModeComplete.js';
import { getTypeLabel, getCardStatus } from './memoryModeUtils.js';
import './MemoryMode.css';
import type { Lesson } from '../../types/index.js';


interface MemoryModeProps {
  lessons?: Lesson[]; // Kept for backwards compatibility, but not used
}

export const MemoryMode: React.FC<MemoryModeProps> = ({ lessons }) => {
  const navigate = useNavigate();
  const {
    isLoading,
    stats,
    getPreview,
    currentCard,
    isRevealed,
    showSetup,
    selectedLessons,
    isComplete,
    isStarting,
    toggleLesson,
    handleReveal,
    handleReview,
    startSession,
    resetSession,
  } = useMemorySession();

  // Calculate total vocabulary count from selected lessons
  const selectedVocabCount = selectedLessons.reduce((total, lessonId) => {
    const lesson = lessons?.find(l => l.id === lessonId);
    return total + (lesson?.vocabCount || 0);
  }, 0);

  // Get interval previews
  const previews = currentCard ? {
    again: getPreview(currentCard.phraseId, 'again'),
    hard: getPreview(currentCard.phraseId, 'hard'),
    good: getPreview(currentCard.phraseId, 'good'),
    easy: getPreview(currentCard.phraseId, 'easy'),
  } : null;

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
          <MemoryModeSetup
            lessons={lessons}
            stats={stats}
            selectedLessons={selectedLessons}
            selectedVocabCount={selectedVocabCount}
            onToggleLesson={toggleLesson}
            onStart={startSession}
          />
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
          <MemoryModeComplete onReset={resetSession} />
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
        <MemoryModeStudy
          currentCard={currentCard}
          stats={stats}
          isRevealed={isRevealed}
          previews={previews}
          onReveal={handleReveal}
          onReview={handleReview}
        />
      </main>
    </div>
  );
};

export default MemoryMode;
