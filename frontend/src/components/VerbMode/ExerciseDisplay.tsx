import React from 'react';
import { useFurigana } from '../../hooks/useFurigana.js';

interface ExerciseDisplayProps {
  text: string;
  showFurigana: boolean;
  className?: string;
}

export const ExerciseDisplay: React.FC<ExerciseDisplayProps> = React.memo(({ text, showFurigana, className = '' }) => {
  const { furigana } = useFurigana(text, showFurigana);

  return (
    <span className={className}>
      {showFurigana && furigana ? (
        <span dangerouslySetInnerHTML={{ __html: furigana }} />
      ) : (
        text
      )}
    </span>
  );
});

ExerciseDisplay.displayName = 'ExerciseDisplay';
