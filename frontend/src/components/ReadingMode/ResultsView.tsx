import React from 'react';
import { Question, ReadingResult } from './types.js';
import { TYPE_LABELS } from './constants.js';
import { FuriganaDisplay } from './FuriganaDisplay.js';

interface ResultsViewProps {
  result: ReadingResult;
  questions: Question[];
  showFurigana: boolean;
  onBack: () => void;
  onNext: () => void;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  result,
  questions,
  showFurigana,
  onBack,
  onNext,
}) => {
  return (
    <div className="results-view">
      <div className="results-header">
        <h2>Results</h2>
        <div className="score-circle" style={{
          background: `conic-gradient(
            ${result.score >= 80 ? '#4ade80' : result.score >= 60 ? '#fbbf24' : '#f87171'} 
            ${result.score * 3.6}deg, 
            #374151 0deg
          )`
        }}>
          <span className="score-value">{result.score}%</span>
        </div>
      </div>
      
      <div className="results-stats">
        <div className="stat-item">
          <span className="stat-label">Correct</span>
          <span className="stat-value correct">
            {result.correctCount} / {result.totalQuestions}
          </span>
        </div>
        {result.readingTimeSeconds && (
          <div className="stat-item">
            <span className="stat-label">Reading Time</span>
            <span className="stat-value">{formatTime(result.readingTimeSeconds)}</span>
          </div>
        )}
        {result.charsPerMinute && (
          <div className="stat-item">
            <span className="stat-label">Speed</span>
            <span className="stat-value">{result.charsPerMinute} chars/min</span>
          </div>
        )}
      </div>
      
      <div className="answers-review">
        <h3>Review Answers</h3>
        {result.results.map((answer, index) => {
          const question = questions.find(q => q.id === answer.questionId);
          if (!question) return null;
          
          return (
            <div 
              key={answer.questionId}
              className={`answer-review ${answer.isCorrect ? 'correct' : 'incorrect'}`}
            >
              <div className="answer-review-header">
                <span className="question-number">{index + 1}</span>
                <span className="answer-status">
                  {answer.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                </span>
                <span className="question-type">{TYPE_LABELS[answer.questionType]}</span>
              </div>
              
              <p className="question-text">
                <FuriganaDisplay 
                  text={question.question} 
                  showFurigana={showFurigana}
                />
              </p>
              
              <div className="answer-details">
                <div className="your-answer">
                  <span className="label">Your answer:</span>
                  <span className={`value ${answer.isCorrect ? 'correct' : 'wrong'}`}>
                    {String.fromCharCode(65 + answer.selectedOption)}. {' '}
                    <FuriganaDisplay 
                      text={question.options[answer.selectedOption] || ''} 
                      showFurigana={showFurigana}
                    />
                  </span>
                </div>
                
                {!answer.isCorrect && (
                  <div className="correct-answer">
                    <span className="label">Correct answer:</span>
                    <span className="value correct">
                      {String.fromCharCode(65 + answer.correctAnswer)}. {' '}
                      <FuriganaDisplay 
                        text={question.options[answer.correctAnswer] || ''} 
                        showFurigana={showFurigana}
                      />
                    </span>
                  </div>
                )}
              </div>
              
              <div className="explanation">
                <span className="label">Explanation:</span>
                <p>
                  <FuriganaDisplay 
                    text={answer.explanation} 
                    showFurigana={showFurigana}
                  />
                </p>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="results-actions">
        <button 
          className="back-btn"
          onClick={onBack}
        >
          ← Back to List
        </button>
        <button 
          className="next-btn"
          onClick={onNext}
        >
          Next Passage →
        </button>
      </div>
    </div>
  );
};
