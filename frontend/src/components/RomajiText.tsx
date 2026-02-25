import React from 'react';

interface RomajiTextProps {
  romaji?: string;
  className?: string;
}

/**
 * Displays romaji reading below Japanese text.
 * Styled consistently across the app.
 */
export const RomajiText: React.FC<RomajiTextProps> = ({
  romaji,
  className = '',
}) => {
  if (!romaji) return null;

  return (
    <div className={`romaji-text ${className}`}>
      {romaji}
    </div>
  );
};
