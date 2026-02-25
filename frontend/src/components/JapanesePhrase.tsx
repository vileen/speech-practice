import React from 'react';
import { FuriganaText } from './FuriganaText.js';
import { RomajiText } from './RomajiText.js';

interface JapanesePhraseProps {
  /** Japanese text (kanji/kana) */
  text: string;
  /** HTML with ruby tags for furigana */
  furiganaHtml?: string | null;
  /** Romaji reading */
  romaji?: string;
  /** English translation */
  translation?: string;
  /** Whether to show furigana */
  showFurigana?: boolean;
  /** Whether to show romaji */
  showRomaji?: boolean;
  /** Whether to show translation */
  showTranslation?: boolean;
  /** Additional CSS class */
  className?: string;
  /** Size variant */
  size?: 'small' | 'medium' | 'large';
}

/**
 * Complete Japanese phrase display with furigana, romaji, and translation.
 * 
 * This component centralizes all Japanese text display to ensure
 * consistent formatting and avoid code duplication.
 */
export const JapanesePhrase: React.FC<JapanesePhraseProps> = ({
  text,
  furiganaHtml,
  romaji,
  translation,
  showFurigana = true,
  showRomaji = true,
  showTranslation = false,
  className = '',
  size = 'medium',
}) => {
  const sizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-xl',
  };

  return (
    <div className={`japanese-phrase ${sizeClasses[size]} ${className}`}>
      {/* Main Japanese text with furigana */}
      <div className="phrase-jp">
        <FuriganaText 
          text={text} 
          furiganaHtml={furiganaHtml} 
          showFurigana={showFurigana}
        />
      </div>

      {/* Romaji reading */}
      {showRomaji && romaji && (
        <RomajiText romaji={romaji} className="phrase-romaji" />
      )}

      {/* English translation */}
      {showTranslation && translation && (
        <div className="phrase-en">
          {translation}
        </div>
      )}
    </div>
  );
};
