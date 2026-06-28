import React from 'react';
import { Header } from '../Header/index.js';
import { KanjiSetup } from './KanjiSetup.js';
import { KanjiComplete } from './KanjiComplete.js';
import { KanjiCardView } from './KanjiCardView.js';
import { KanjiRatingButtons } from './KanjiRatingButtons.js';
import { useKanjiPracticeSession } from '../../hooks/useKanjiPracticeSession.js';
import { useKanjiKeyboardShortcuts } from '../../hooks/useKanjiKeyboardShortcuts.js';
import './KanjiPracticeMode.css';

export const KanjiPracticeMode: React.FC = () => {
  const { state, actions, deps } = useKanjiPracticeSession();

  useKanjiKeyboardShortcuts({
    showSetup: state.showSetup,
    isComplete: state.isComplete,
    isRevealed: state.isRevealed,
    onReveal: actions.handleReveal,
    onReview: actions.handleReview,
  });

  if (deps.isLoading) {
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

  if (state.showSetup) {
    return (
      <>
        <Header title="Kanji Practice" icon="🈁" subtitle="Kodansha Kanji Learner's Course" />
        <KanjiSetup
          stats={deps.stats}
          availableLessons={state.availableLessons}
          selectedLessons={state.selectedLessons}
          filteredDueCount={state.filteredDueCount}
          isStarting={state.isStarting}
          onLessonChange={actions.handleLessonChange}
          onStart={actions.handleStart}
        />
      </>
    );
  }

  if (state.isComplete) {
    return (
      <>
        <Header title="Practice Complete" icon="🎉" showBackButton={false} />
        <KanjiComplete stats={deps.stats} onPracticeMore={actions.handleReset} />
      </>
    );
  }

  if (!state.currentCard) {
    return (
      <>
        <Header title="Kanji Practice" icon="🈁" />
        <div className="kanji-practice-empty">
          <p>No kanji available. Import some kanji first!</p>
          <button className="kanji-practice-start-btn" onClick={actions.handleReset}>
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
            <span>Due: {deps.stats.due}</span>
            <span>New: {deps.stats.new}</span>
            <span>Review: {deps.stats.review}</span>
          </div>
        </div>

        {/* Main card */}
        <KanjiCardView
          card={state.currentCard}
          isRevealed={state.isRevealed}
          isEditingMnemonic={state.isEditingMnemonic}
          editedMnemonic={state.editedMnemonic}
          onEditMnemonic={actions.handleEditMnemonic}
          onSaveMnemonic={actions.handleSaveMnemonic}
          onCancelEditMnemonic={actions.handleCancelEditMnemonic}
          onMnemonicChange={actions.handleMnemonicChange}
        />

        {/* Controls */}
        <div className="kanji-practice-controls">
          {!state.isRevealed ? (
            <button
              className="kanji-reveal-btn"
              onClick={actions.handleReveal}
              autoFocus
            >
              Reveal Answer (Space)
            </button>
          ) : (
            <KanjiRatingButtons intervals={state.intervals} onReview={actions.handleReview} />
          )}
        </div>

        {/* Navigation */}
        <div className="kanji-practice-nav">
          <button className="nav-btn" onClick={actions.handleReset}>
            End Session
          </button>
        </div>
      </div>
    </>
  );
};
