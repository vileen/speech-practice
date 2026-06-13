import React from 'react';
import { ExerciseDisplay } from './ExerciseDisplay.js';
import { DiscriminationDrill } from './DiscriminationDrill.js';
import { GrammarErrorExplanation } from './GrammarErrorExplanation.js';
import type {
  GrammarPattern,
  GrammarExercise,
  DiscriminationOption,
  DiscriminationAlert,
  ExerciseState,
  ReviewMode,
} from './types.js';

interface ExerciseContainerProps {
  currentPattern: GrammarPattern;
  exercise: GrammarExercise | null;
  state: ExerciseState;
  userAnswer: string;
  feedback: any;
  showFurigana: boolean;
  reviewMode: ReviewMode;
  discriminationAlert: DiscriminationAlert | null;
  selectedDiscriminationOption: DiscriminationOption | null;
  discriminationFeedback: { isCorrect: boolean; explanation: string } | null;
  patterns: GrammarPattern[];
  onUserAnswerChange: (value: string) => void;
  onSubmit: () => void;
  onNext: () => void;
  onCompare: (pattern: GrammarPattern) => void;
  onDiscriminationSelect: (option: DiscriminationOption, pattern: GrammarPattern) => void;
  onSetComparisonPatterns: (patterns: GrammarPattern[]) => void;
}

export const ExerciseContainer: React.FC<ExerciseContainerProps> = ({
  currentPattern,
  exercise,
  state,
  userAnswer,
  feedback,
  showFurigana,
  reviewMode,
  discriminationAlert,
  selectedDiscriminationOption,
  discriminationFeedback,
  patterns,
  onUserAnswerChange,
  onSubmit,
  onNext,
  onCompare,
  onDiscriminationSelect,
  onSetComparisonPatterns,
}) => {
  return (
    <div className="exercise-container">
      {/* Review Mode Indicator */}
      {reviewMode === 'mixed' && (
        <div className="mixed-mode-badge">🎯 Mixed Review Mode</div>
      )}
      {reviewMode === 'discrimination' && (
        <div className="discrimination-mode-badge">🎭 Discrimination Drill</div>
      )}

      <div className="pattern-info">
        <h3>
          <ExerciseDisplay text={currentPattern.pattern} showFurigana={showFurigana} />
        </h3>
        <p className="category">{currentPattern.category}</p>

        {/* Confusion Warning */}
        {currentPattern.confusion_pairs && currentPattern.confusion_pairs.length > 0 && (
          <div className="confusion-warning">
            ⚠️ Often confused with: {currentPattern.confusion_pairs.map(id => {
              const p = patterns.find(pt => pt.id === id);
              return p ? p.pattern : id;
            }).join(', ')}
            <button
              className="compare-link"
              onClick={() => onCompare(currentPattern)}
            >
              Compare →
            </button>
          </div>
        )}
      </div>

      {state === 'loading' && <div className="loading">Loading exercise...</div>}

      {state === 'discrimination_select' && exercise && (
        <div className="discrimination-container">
          <DiscriminationDrill
            exercise={exercise}
            patterns={patterns}
            showFurigana={showFurigana}
            onSelectOption={onDiscriminationSelect}
          />

          {discriminationFeedback && (
            <div className={`discrimination-feedback ${discriminationFeedback.isCorrect ? 'correct' : 'incorrect'}`}>
              <div className="discrimination-feedback-icon">
                {discriminationFeedback.isCorrect ? '✅' : '❌'}
              </div>
              <div className="discrimination-feedback-content">
                <p className="discrimination-feedback-title">
                  {discriminationFeedback.isCorrect ? 'Correct pattern!' : 'Wrong pattern!'}
                </p>
                <p className="discrimination-feedback-explanation">
                  {discriminationFeedback.explanation}
                </p>
                {!discriminationFeedback.isCorrect && (
                  <button
                    className="compare-btn-inline"
                    onClick={() => {
                      if (selectedDiscriminationOption && currentPattern) {
                        const otherPattern = patterns.find(p => p.id === selectedDiscriminationOption.pattern_id);
                        if (otherPattern) {
                          onSetComparisonPatterns([currentPattern, otherPattern]);
                        }
                      }
                    }}
                  >
                    Compare Patterns →
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {state === 'input' && exercise && (
        <div className="exercise-prompt">
          {/* Confusion Alert */}
          {discriminationAlert && (
            <div className="confusion-alert">
              <div className="confusion-alert-icon">⚠️</div>
              <div className="confusion-alert-content">
                <p className="confusion-alert-title">Possible Confusion Detected!</p>
                <p className="confusion-alert-message">{discriminationAlert.message}</p>
                <button
                  className="compare-alert-btn"
                  onClick={() => onCompare(currentPattern)}
                >
                  Compare Patterns
                </button>
              </div>
            </div>
          )}

          <div className="prompt-type">{exercise.type.replace('_', ' ')}</div>
          <p className="prompt-text">
            <ExerciseDisplay text={exercise.prompt} showFurigana={showFurigana} />
          </p>
          {exercise.context && (
            <p className="context">
              <ExerciseDisplay text={exercise.context} showFurigana={showFurigana} />
            </p>
          )}

          <div className="input-section">
            <p>Type your answer:</p>
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => onUserAnswerChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
              placeholder="Your answer in Japanese..."
              className="answer-input"
              autoFocus
            />
            <button
              className="submit-btn"
              onClick={onSubmit}
              disabled={!userAnswer.trim()}
            >
              Submit
            </button>
          </div>
        </div>
      )}

      {state === 'processing' && <div className="processing">Checking...</div>}

      {state === 'feedback' && feedback && (
        <div className={`feedback ${feedback.correct ? 'correct' : 'incorrect'}`}>
          <div className="feedback-result">
            {feedback.correct ? '✅ Correct!' : '❌ Not quite'}
          </div>

          {/* Confusion Feedback */}
          {feedback.confusion && (
            <div className="confusion-feedback">
              <div className="confusion-feedback-icon">💡</div>
              <p>
                You used the pattern for <strong>{feedback.confusion.confusedWith.pattern}</strong>,
                but the exercise is asking for <strong>{currentPattern?.pattern}</strong>.
              </p>
              <button
                className="compare-feedback-btn"
                onClick={() => onCompare(currentPattern)}
              >
                See Comparison
              </button>
            </div>
          )}

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

          {/* Error Explanation */}
          {!feedback.correct && currentPattern && (
            <GrammarErrorExplanation
              currentPattern={currentPattern}
            />
          )}

          {feedback.progress && (
            <div className="progress-update">
              <span>Streak: {feedback.progress.streak}</span>
              <span>Next review: {feedback.progress.interval_days} days</span>
            </div>
          )}

          <button className="next-btn" onClick={onNext}>
            Next Exercise →
          </button>
        </div>
      )}
    </div>
  );
};
