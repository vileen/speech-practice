import React from 'react';
import { Passage } from './types.js';
import { LEVEL_COLORS } from './constants.js';
import { FuriganaDisplay } from './FuriganaDisplay.js';

interface ReadingViewProps {
  passage: Passage;
  showFurigana: boolean;
  onContinue: () => void;
}

export const ReadingView: React.FC<ReadingViewProps> = ({
  passage,
  showFurigana,
  onContinue,
}) => {
  return (
    <div className="reading-view">
      <div className="passage-info">
        <h2>{passage.title}</h2>
        <div className="passage-badges">
          <span 
            className="level-badge"
            style={{ backgroundColor: LEVEL_COLORS[passage.level] }}
          >
            {passage.level}
          </span>
          {passage.topic && (
            <span className="topic-badge">{passage.topic}</span>
          )}
          <span className="char-count-badge">
            {passage.character_count} characters
          </span>
        </div>
      </div>
      
      <div className="passage-content">
        <FuriganaDisplay 
          text={passage.content} 
          showFurigana={showFurigana}
          className="passage-text"
        />
      </div>
      
      <div className="reading-actions">
        <button 
          className="continue-btn"
          onClick={onContinue}
        >
          Continue to Questions →
        </button>
      </div>
    </div>
  );
};
