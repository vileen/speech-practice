import React from 'react';
import { Header } from '../Header/index.js';
import { useVerbMode } from '../../hooks/useVerbMode.js';
import { ExerciseDisplay } from './ExerciseDisplay.js';
import {
  Verb,
  ConjugationMap,
  PracticeType,
  AnswerMode,
  Exercise,
  FeedbackState,
  ExerciseState,
  FORM_DISPLAY_NAMES,
} from './types.js';
import './VerbMode.css';

export type { Verb, ConjugationMap, PracticeType, AnswerMode, Exercise, FeedbackState, ExerciseState };
export { ExerciseDisplay };

export const VerbMode: React.FC = () => {
  const {
    navigate,
    currentExercise,
    state,
    userAnswer,
    setUserAnswer,
    feedback,
    selectedPracticeType,
    setSelectedPracticeType,
    answerMode,
    setAnswerMode,
    selectedGroups,
    showFurigana,
    setShowFurigana,
    streak,
    score,
    loadNextExercise,
    handleSubmit,
    toggleGroup,
    selectAllGroups,
    deselectAllGroups,
  } = useVerbMode();

  // Selection screen
  if (state === 'selection') {
    return (
      <div className="app">
        <Header
          title="Verb Conjugation Practice"
          icon="🎯"
          onBack={() => navigate('/')}
          showBackButton={true}
          actions={
            <button
              className="furigana-toggle"
              onClick={() => setShowFurigana(!showFurigana)}
              title={showFurigana ? 'Hide furigana' : 'Show furigana'}
            >
              {showFurigana ? 'あ' : '漢'}
            </button>
          }
        />

        <main className="verb-mode-container">
          <div className="verb-selection">
            <div className="practice-type-section">
              <h3>Practice Type</h3>
              <div className="practice-type-options">
                <button
                  className={`practice-type-btn ${selectedPracticeType === 'recognition' ? 'active' : ''}`}
                  onClick={() => setSelectedPracticeType('recognition')}
                >
                  <span className="btn-title">🧠 Recognition</span>
                  <span className="btn-desc">"Which form is 食べて?"</span>
                </button>
                <button
                  className={`practice-type-btn ${selectedPracticeType === 'construction' ? 'active' : ''}`}
                  onClick={() => setSelectedPracticeType('construction')}
                >
                  <span className="btn-title">🔨 Construction</span>
                  <span className="btn-desc">"Conjugate 食べる to TE-form"</span>
                </button>
                <button
                  className={`practice-type-btn ${selectedPracticeType === 'transformation' ? 'active' : ''}`}
                  onClick={() => setSelectedPracticeType('transformation')}
                >
                  <span className="btn-title">🔄 Transformation</span>
                  <span className="btn-desc">"Change 食べる → 食べます"</span>
                </button>
              </div>
            </div>

            <div className="answer-mode-section">
              <h3>Answer Mode</h3>
              <div className="answer-mode-options">
                <button
                  className={`answer-mode-btn ${answerMode === 'multiple-choice' ? 'active' : ''}`}
                  onClick={() => setAnswerMode('multiple-choice')}
                >
                  Multiple Choice
                </button>
                <button
                  className={`answer-mode-btn ${answerMode === 'input' ? 'active' : ''}`}
                  onClick={() => setAnswerMode('input')}
                >
                  Type Answer
                </button>
              </div>
            </div>

            <div className="group-filter">
              <div className="group-filter-header">
                <h3>Verb Groups</h3>
                <div className="filter-actions">
                  <button className="filter-btn" onClick={selectAllGroups}>All</button>
                  <button className="filter-btn" onClick={deselectAllGroups}>None</button>
                </div>
              </div>
              <div className="group-checkboxes">
                {['I', 'II', 'III'].map(group => (
                  <label key={group} className="group-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedGroups.includes(group)}
                      onChange={() => toggleGroup(group)}
                    />
                    <span className={`group-badge group-${group.toLowerCase()}`}>
                      Group {group}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {score.total > 0 && (
              <div className="practice-stats">
                <div className="stat-item">
                  <span className="stat-label">Score</span>
                  <span className="stat-value">{score.correct}/{score.total}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Accuracy</span>
                  <span className="stat-value">{Math.round((score.correct / score.total) * 100)}%</span>
                </div>
                {streak > 0 && (
                  <div className="stat-item streak">
                    <span className="stat-label">Streak</span>
                    <span className="stat-value">🔥 {streak}</span>
                  </div>
                )}
              </div>
            )}

            <button
              className="start-practice-btn"
              onClick={loadNextExercise}
              disabled={selectedGroups.length === 0}
            >
              Start Practice →
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Exercise screen
  return (
    <div className="app">
      <Header
        title="Verb Conjugation"
        icon="🎯"
        onBack={() => navigate('/')}
        showBackButton={true}
        actions={
          <>
            {streak > 0 && (
              <span className="streak-badge">🔥 {streak}</span>
            )}
            <button
              className="furigana-toggle"
              onClick={() => setShowFurigana(!showFurigana)}
              title={showFurigana ? 'Hide furigana' : 'Show furigana'}
            >
              {showFurigana ? 'あ' : '漢'}
            </button>
          </>
        }
      />

      <main className="verb-mode-container">
        <div className="exercise-container">
          {state === 'loading' && (
            <div className="loading">Loading exercise...</div>
          )}

          {currentExercise && (state === 'input' || state === 'processing') && (
            <div className="exercise-prompt">
              <div className="verb-info-card">
                <div className="verb-info-main">
                  <h2 className="verb-dictionary-form">
                    <ExerciseDisplay
                      text={currentExercise.verb.dictionary_form}
                      showFurigana={showFurigana}
                    />
                  </h2>
                  <div className="verb-meta">
                    <span className={`verb-group-badge group-${currentExercise.verb.group.toLowerCase()}`}>
                      Group {currentExercise.verb.group}
                    </span>
                    <span className="verb-meaning-text">
                      {currentExercise.verb.meaning}
                    </span>
                  </div>
                </div>
                {currentExercise.sourceForm && (
                  <div className="source-form-display">
                    <span className="source-label">From:</span>
                    <span className="source-value">
                      {currentExercise.sourceForm === 'dictionary_form'
                        ? currentExercise.verb.dictionary_form
                        : (currentExercise.verb.conjugations[currentExercise.sourceForm] || '')
                      }
                    </span>
                    <span className="source-form-name">
                      ({FORM_DISPLAY_NAMES[currentExercise.sourceForm] || currentExercise.sourceForm})
                    </span>
                  </div>
                )}
              </div>

              <div className="question-section">
                <div className="question-type-badge">
                  {selectedPracticeType === 'recognition' && '🧠 Recognition'}
                  {selectedPracticeType === 'construction' && '🔨 Construction'}
                  {selectedPracticeType === 'transformation' && '🔄 Transformation'}
                </div>
                <p className="question-prompt">{currentExercise.prompt}</p>
                {answerMode === 'input' && (
                  <p className="target-form-hint">
                    Target: <strong>{FORM_DISPLAY_NAMES[currentExercise.targetForm] || currentExercise.targetForm}</strong>
                  </p>
                )}
              </div>

              <div className="answer-section">
                {answerMode === 'multiple-choice' && currentExercise.options ? (
                  <div className="multiple-choice-options">
                    {currentExercise.options.map((option, index) => (
                      <button
                        key={index}
                        className="choice-btn"
                        onClick={() => {
                          setUserAnswer(option);
                          handleSubmit();
                        }}
                      >
                        <span className="choice-letter">{String.fromCharCode(65 + index)}</span>
                        <span className="choice-text">
                          <ExerciseDisplay text={option} showFurigana={showFurigana} />
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="input-section">
                    <input
                      type="text"
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                      placeholder="Type your answer in Japanese..."
                      className="answer-input"
                      autoFocus
                      disabled={state === 'processing'}
                    />
                    <button
                      className="submit-btn"
                      onClick={handleSubmit}
                      disabled={!userAnswer.trim() || state === 'processing'}
                    >
                      {state === 'processing' ? 'Checking...' : 'Submit'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {state === 'feedback' && feedback && (
            <div className={`feedback ${feedback.correct ? 'correct' : 'incorrect'}`}>
              <div className="feedback-result">
                {feedback.correct ? '✅ Correct!' : '❌ Not quite'}
              </div>

              <div className="answer-comparison">
                <div className="your-answer">
                  <label>Your answer:</label>
                  <p>
                    <ExerciseDisplay text={feedback.userAnswer} showFurigana={showFurigana} />
                  </p>
                </div>
                {!feedback.correct && (
                  <div className="correct-answer">
                    <label>Correct answer:</label>
                    <p>
                      <ExerciseDisplay text={feedback.correctAnswer} showFurigana={showFurigana} />
                    </p>
                  </div>
                )}
              </div>

              {feedback.explanation && (
                <div className="explanation">
                  <h4>💡 Explanation</h4>
                  <p>{feedback.explanation}</p>
                </div>
              )}

              {feedback.streak !== undefined && feedback.streak > 0 && (
                <div className="streak-update">
                  <span>🔥 Streak: {feedback.streak}</span>
                </div>
              )}

              <button className="next-btn" onClick={loadNextExercise}>
                Next Exercise →
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default VerbMode;
