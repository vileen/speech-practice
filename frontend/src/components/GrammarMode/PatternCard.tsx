import React from 'react';
import { useFurigana } from '../../hooks/useFurigana.js';
import type { GrammarPattern } from './GrammarMode.js';

export const PatternCard: React.FC<{
  pattern: GrammarPattern;
  showFurigana: boolean;
  onClick: () => void;
  onCompare?: () => void;
  hasConfusion?: boolean;
}> = React.memo(({ pattern, showFurigana, onClick, onCompare, hasConfusion }) => {
  const { furigana } = useFurigana(pattern.pattern, showFurigana);

  return (
    <div className={`pattern-card ${hasConfusion ? 'has-confusion' : ''}`} onClick={onClick}>
      <div className="pattern-header">
        <span className="pattern-text">
          {showFurigana && furigana ? (
            <span dangerouslySetInnerHTML={{ __html: furigana }} />
          ) : (
            pattern.pattern
          )}
        </span>
        <span className="pattern-level">{pattern.jlpt_level}</span>
      </div>
      <div className="pattern-category">{pattern.category}</div>
      {(pattern.streak ?? 0) > 0 && (
        <div className="pattern-streak">🔥 {pattern.streak}</div>
      )}
      {hasConfusion && (
        <div className="confusion-badge">⚠️</div>
      )}
      {onCompare && pattern.related_patterns && pattern.related_patterns.length > 0 && (
        <button
          className="compare-btn"
          onClick={(e) => { e.stopPropagation(); onCompare(); }}
          title="Compare with similar patterns"
        >
          Compare
        </button>
      )}
    </div>
  );
});
