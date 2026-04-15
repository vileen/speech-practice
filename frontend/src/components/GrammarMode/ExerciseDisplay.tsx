import React from 'react';
import { useFurigana } from '../../hooks/useFurigana.js';

export const ExerciseDisplay: React.FC<{
  text: string;
  showFurigana: boolean;
  className?: string;
}> = React.memo(({ text, showFurigana, className = '' }) => {
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
