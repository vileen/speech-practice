import React from 'react';

interface Props {
  onNavigate: (path: string) => void;
}

export const QuickActions: React.FC<Props> = ({ onNavigate }) => {
  return (
    <section className="quick-actions">
      <h2>Quick Actions</h2>
      <div className="action-buttons">
        <button className="action-btn" onClick={() => onNavigate('/grammar')}>
          <span className="action-icon">📖</span>
          <span>Grammar Drills</span>
        </button>
        <button className="action-btn" onClick={() => onNavigate('/kanji')}>
          <span className="action-icon">🈁</span>
          <span>Kanji Practice</span>
        </button>
        <button className="action-btn" onClick={() => onNavigate('/lessons')}>
          <span className="action-icon">📚</span>
          <span>Lessons</span>
        </button>
        <button className="action-btn" onClick={() => onNavigate('/counters')}>
          <span className="action-icon">🔢</span>
          <span>Counters</span>
        </button>
      </div>
    </section>
  );
};
