import React from 'react';

interface KanjiCompleteProps {
  stats: { total: number; due: number };
  onPracticeMore: () => void;
}

export const KanjiComplete: React.FC<KanjiCompleteProps> = ({
  stats,
  onPracticeMore,
}) => {
  return (
    <div className="kanji-practice-complete">
      <h2>Practice Complete!</h2>
      <p>You've reviewed all due kanji for now.</p>

      <div className="kanji-practice-stats">
        <div className="stat-card">
          <span className="stat-value">{stats.total}</span>
          <span className="stat-label">Total Kanji</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats.due}</span>
          <span className="stat-label">Still Due</span>
        </div>
      </div>

      <button className="kanji-practice-start-btn" onClick={onPracticeMore}>
        Practice More
      </button>
    </div>
  );
};
