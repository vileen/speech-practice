import React from 'react';
import { Header } from '../Header/index.js';
import { ExerciseDisplay } from './ExerciseDisplay.js';
import {
  Exercise,
  PracticeType,
  AnswerMode,
  FeedbackState,
  ExerciseState,
  FORM_DISPLAY_NAMES,
} from './types.js';

interface ExerciseScreenProps {
  navigate: (path: string) => void;
  currentExercise: Exercise | null;
  state: ExerciseState;
  userAnswer: string;
  setUserAnswer: (answer: string) => void;
  feedback: FeedbackState | null;
  selectedPracticeType: PracticeType;
  answerMode: AnswerMode;
  showFurigana: boolean;
  setShowFurigana: (show: boolean) => void;
  streak: number;
  loadNextExercise: () => void;
  handleSubmit: () => void;
}

export const ExerciseScreen: React.FC<ExerciseScreenProps> = ({
  navigate,
  currentExercise,
  state,
  userAnswer,
  setUserAnswer,
  feedback,
  selectedPracticeType,
  answerMode,
  showFurigana,
  setShowFurigana,
  streak,
  loadNextExercise,
  handleSubmit,
}) => {
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
