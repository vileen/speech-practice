import React from 'react';
import { useFurigana } from '../../hooks/useFurigana.js';

interface FuriganaDisplayProps {
  text: string;
  showFurigana: boolean;
  className?: string;
}

export const FuriganaDisplay: React.FC<FuriganaDisplayProps> = ({ 
  text, 
  showFurigana, 
  className = '' 
}) => {
  const { furigana } = useFurigana(text, showFurigana);
  
  if (!showFurigana || !furigana) {
    return <span className={className}>{text}</span>;
  }
  
  return (
    <span 
      className={`furigana-text ${className}`}
      dangerouslySetInnerHTML={{ __html: furigana }}
    />
  );
};
