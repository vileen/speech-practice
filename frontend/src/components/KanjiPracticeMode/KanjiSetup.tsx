import React from 'react';

interface KanjiSetupProps {
  stats: { total: number; due: number; new: number };
  availableLessons: string[];
  selectedLessons: string[];
  filteredDueCount: number;
  isStarting: boolean;
  onLessonChange: (lessonId: string) => void;
  onStart: () => void;
}

export const KanjiSetup: React.FC<KanjiSetupProps> = ({
  stats,
  availableLessons,
  selectedLessons,
  filteredDueCount,
  isStarting,
  onLessonChange,
  onStart,
}) => {
  return (
    <div className="kanji-practice-setup">
      <p className="kanji-practice-description">
        Learn kanji using the Kodansha Kanji Learner's Course method.
        See the kanji, recall the meaning, then check your answer.
      </p>

      <div className="kanji-practice-stats">
        <div className="stat-card">
          <span className="stat-value">{stats.total}</span>
          <span className="stat-label">Total Kanji</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats.due}</span>
          <span className="stat-label">Due for Review</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats.new}</span>
          <span className="stat-label">New</span>
        </div>
      </div>

      {availableLessons.length > 0 && (
        <div className="kanji-practice-filters">
          <label>Filter by Lesson:</label>
          <select
            value={selectedLessons[0] || ''}
            onChange={(e) => onLessonChange(e.target.value)}
          >
            <option value="">All Lessons</option>
            {availableLessons.map((lessonId) => (
              <option key={lessonId} value={lessonId}>
                Lesson {lessonId}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="kanji-practice-shortcuts">
        <h4>Keyboard Shortcuts:</h4>
        <ul>
          <li>
            <kbd>Space</kbd> - Reveal answer / Again
          </li>
          <li>
            <kbd>2</kbd> - Hard
          </li>
          <li>
            <kbd>3</kbd> - Good
          </li>
          <li>
            <kbd>4</kbd> - Easy
          </li>
        </ul>
      </div>

      <button
        className="kanji-practice-start-btn"
        onClick={onStart}
        disabled={isStarting}
      >
        {isStarting ? 'Loading...' : `Start Practice (${filteredDueCount} due)`}
      </button>
    </div>
  );
};
