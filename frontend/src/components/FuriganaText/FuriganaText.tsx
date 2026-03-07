import React from 'react';

interface FuriganaTextProps {
  text: string;
  furiganaHtml?: string | null;
  showFurigana?: boolean;
  className?: string;
}

/**
 * Displays Japanese text with optional furigana.
 * 
 * If furiganaHtml is provided and showFurigana is true, renders ruby tags.
 * Otherwise renders plain text.
 * 
 * Example furiganaHtml: "<ruby>好<rt>す</rt></ruby>き"
 */
export const FuriganaText: React.FC<FuriganaTextProps> = ({
  text,
  furiganaHtml,
  showFurigana = true,
  className = '',
}) => {
  if (!showFurigana || !furiganaHtml) {
    return <span className={className}>{text}</span>;
  }

  // Sanitize and render furigana HTML
  return (
    <span 
      className={`furigana-text ${className}`}
      dangerouslySetInnerHTML={{ __html: furiganaHtml }}
    />
  );
};
