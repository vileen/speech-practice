import type { CounterGroup, QuizQuestion } from './types';

interface CounterQuizProps {
  selectedGroup: CounterGroup;
  quizQuestion: QuizQuestion;
  showAnswer: boolean;
  onSetMode: (mode: 'study') => void;
  onSetShowAnswer: (show: boolean) => void;
  onHandleAnswer: (known: boolean) => void;
}

export function CounterQuiz({
  selectedGroup,
  quizQuestion,
  showAnswer,
  onSetMode,
  onSetShowAnswer,
  onHandleAnswer,
}: CounterQuizProps) {
  return (
    <div className="counters-mode">
      <header className="counters-header">
        <button className="back-btn" onClick={() => onSetMode('study')}>← Study</button>
        <h1>🎯 Quiz: {selectedGroup.baseForm}</h1>
      </header>

      <div className="quiz-container">
        <div className="quiz-card">
          <div className="quiz-question">
            <p className="question-text">{quizQuestion.questionText}</p>
          </div>

          {!showAnswer ? (
            <button className="show-answer-btn" onClick={() => onSetShowAnswer(true)}>
              Show Answer
            </button>
          ) : (
            <div className="quiz-answer">
              <div className="answer-pattern">{quizQuestion.pattern.pattern}</div>
              {quizQuestion.pattern.examples?.[0] && (
                <div className="answer-example">
                  <p className="jp">{quizQuestion.pattern.examples[0].jp}</p>
                  <p className="en">{quizQuestion.pattern.examples[0].en}</p>
                  {quizQuestion.pattern.examples[0].romaji && (
                    <p className="romaji">{quizQuestion.pattern.examples[0].romaji}</p>
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
