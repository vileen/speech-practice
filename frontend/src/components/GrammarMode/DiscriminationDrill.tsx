import React, { useState } from 'react';
import type { GrammarExercise, GrammarPattern, DiscriminationOption } from './GrammarMode.js';
import { ExerciseDisplay } from './ExerciseDisplay.js';

export const DiscriminationDrill: React.FC<{
  exercise: GrammarExercise;
  patterns: GrammarPattern[];
  showFurigana: boolean;
  onSelectOption: (option: DiscriminationOption, pattern: GrammarPattern) => void;
}> = ({ exercise, patterns, showFurigana, onSelectOption }) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  if (!exercise.options || exercise.options.length === 0) {
    return <div className="discrimination-error">No options available for this drill.</div>;
  }

  return (
    <div className="discrimination-drill">
      <div className="discrimination-context">
        <p className="discrimination-prompt">
          <ExerciseDisplay text={exercise.prompt} showFurigana={showFurigana} />
        </p>
        {exercise.context && (
          <p className="discrimination-hint">
            <ExerciseDisplay text={exercise.context} showFurigana={showFurigana} />
          </p>
        )}
      </div>

      <div className="discrimination-question">
        <p>Choose the correct pattern:</p>
      </div>

      <div className="discrimination-options">
        {exercise.options.map((option, index) => {
          const pattern = patterns.find(p => p.id === option.pattern_id);
          if (!pattern) return null;

          const isSelected = selectedOption === option.pattern_id;

          return (
            <button
              key={option.pattern_id}
              className={`discrimination-option ${isSelected ? 'selected' : ''}`}
              onClick={() => {
                setSelectedOption(option.pattern_id);
                onSelectOption(option, pattern);
              }}
            >
              <span className="option-letter">{String.fromCharCode(65 + index)}</span>
              <div className="option-content">
                <span className="option-pattern">
                  <ExerciseDisplay text={option.pattern} showFurigana={showFurigana} />
                </span>
                <span className="option-category">{option.category}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
