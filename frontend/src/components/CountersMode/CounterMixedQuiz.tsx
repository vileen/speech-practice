import type { Mode, QuizQuestion } from './types';

interface CounterMixedQuizProps {
  mode: Mode;
  mixedQuestions: QuizQuestion[];
  currentQuestionIndex: number;
  showAnswer: boolean;
  onSetMode: (mode: 'menu') => void;
  onSetShowAnswer: (show: boolean) => void;
  onHandleAnswer: (known: boolean) => void;
}

export function CounterMixedQuiz({
  mode,
  mixedQuestions,
  currentQuestionIndex,
  showAnswer,
  onSetMode,
  onSetShowAnswer,
  onHandleAnswer,
}: CounterMixedQuizProps) {
  const currentQ = mixedQuestions[currentQuestionIndex];
  const progress = `${currentQuestionIndex + 1} / ${mixedQuestions.length}`;
  const title = mode === 'category-quiz' ? '🎯 Category Quiz' : '🎯 Mixed Quiz';

  return (
    <div className="counters-mode">
      <header className="counters-header">
        <button className="back-btn" onClick={() => onSetMode('menu')}>← Menu</button>
        <h1>{title}</h1>
        <span className="quiz-progress">{progress}</span>
      </header>

      <div className="quiz-container">
        <div className="quiz-card">
          <div className="quiz-category">{currentQ.group.baseForm} — {currentQ.group.counts}</div>

          <div className="quiz-question">
            <p className="question-text">{currentQ.questionText}</p>
          </div>

          {!showAnswer ? (
            <button className="show-answer-btn" onClick={() => onSetShowAnswer(true)}>
              Show Answer
            </button>
          ) : (
            <div className="quiz-answer">
              <div className="answer-pattern">{currentQ.pattern.pattern}</div>
              {currentQ.pattern.examples?.[0] && (
                <div className="answer-example">
                  <p className="jp">{currentQ.pattern.examples[0].jp}</p>
                  <p className="en">{currentQ.pattern.examples[0].en}</p>
                  {currentQ.pattern.examples[0].romaji && (
                    <p className="romaji">{currentQ.pattern.examples[0].romaji}</p>
                  )}
                </div>
              )}

              <div className="answer-buttons">
                <button className="wrong-btn" onClick={() => onHandleAnswer(false)}>
                  ❌ Didn't know
                </button>
                <button className="correct-btn" onClick={() => onHandleAnswer(true)}>
                  ✅ Knew it
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
