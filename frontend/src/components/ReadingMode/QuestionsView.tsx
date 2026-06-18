import React from 'react';
import { Question } from './types.js';
import { TYPE_LABELS } from './constants.js';
import { FuriganaDisplay } from './FuriganaDisplay.js';

interface QuestionsViewProps {
  questions: Question[];
  answers: Record<number, number>;
  showFurigana: boolean;
  onAnswerSelect: (questionId: number, optionIndex: number) => void;
  onBack: () => void;
  onSubmit: () => void;
}

export const QuestionsView: React.FC<QuestionsViewProps> = ({
  questions,
  answers,
  showFurigana,
  onAnswerSelect,
  onBack,
  onSubmit,
}) => {
  return (
    <div className="questions-view">
      <div className="questions-header">
        <h2>Questions</h2>
        <span className="progress">
          {Object.keys(answers).length} / {questions.length} answered
        </span>
      </div>
      
      <div className="questions-list">
        {questions.map((question, index) => (
          <div 
            key={question.id} 
            className={`question-card ${answers[question.id] !== undefined ? 'answered' : ''}`}
          >
            <div className="question-header">
              <span className="question-number">{index + 1}</span>
              <span className="question-type">{TYPE_LABELS[question.question_type]}</span>
            </div>
            
            <p className="question-text">
              <FuriganaDisplay 
                text={question.question} 
                showFurigana={showFurigana}
              />
            </p>
            
            <div className="options-list">
              {question.options.map((option, optionIndex) => (
                <label 
                  key={optionIndex}
                  className={`option-label ${answers[question.id] === optionIndex ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    checked={answers[question.id] === optionIndex}
                    onChange={() => onAnswerSelect(question.id, optionIndex)}
                  />
                  <span className="option-letter">
                    {String.fromCharCode(65 + optionIndex)}
                  </span>
                  <span className="option-text">
                    <FuriganaDisplay 
                      text={option} 
                      showFurigana={showFurigana}
                    />
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div className="questions-actions">
        <button 
          className="back-btn"
          onClick={onBack}
        >
          ← Back to Passage
        </button>
        <button 
          className="submit-btn"
          onClick={onSubmit}
          disabled={Object.keys(answers).length === 0}
        >
          Submit Answers
        </button>
      </div>
    </div>
  );
};
