import React from 'react';
import type { Lesson } from '../../types/index.js';

interface MemoryModeSetupProps {
  lessons?: Lesson[];
  stats: { total: number; due: number; new: number; review: number };
  selectedLessons: string[];
  selectedVocabCount: number;
  onToggleLesson: (lessonId: string) => void;
  onStart: () => void;
}

export const MemoryModeSetup: React.FC<MemoryModeSetupProps> = ({
  lessons,
  stats,
  selectedLessons,
  selectedVocabCount,
  onToggleLesson,
  onStart,
}) => {
  return (
    <div className="memory-mode-setup">
      <div className="memory-card">
        <h2>🧠 Memory Mode</h2>
        <p className="description">
          Test your recall by translating from English to Japanese.
        </p>
        <p className="subtitle">
          Uses FSRS (Free Spaced Repetition Scheduler) to optimize your learning.
        </p>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-box">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Cards</div>
          </div>
          <div className="stat-box due">
            <div className="stat-value">{stats.due}</div>
            <div className="stat-label">Due Now</div>
          </div>
          <div className="stat-box new">
            <div className="stat-value">{stats.new}</div>
            <div className="stat-label">New</div>
          </div>
          <div className="stat-box review">
            <div className="stat-value">{stats.review}</div>
            <div className="stat-label">In Review</div>
          </div>
        </div>

        {/* Lesson Selection */}
        <div className="lesson-selection">
          <h3>Select Lessons to Study <small>(only cards from selected lessons)</small></h3>
          <div className="lesson-chips">
            {import.meta.env.DEV && (
              <div style={{fontSize: '12px', color: '#888', marginBottom: '10px'}}>
                Debug: lessons type={typeof lessons}, isArray={Array.isArray(lessons)?.toString()},
                length={lessons?.length}
              </div>
            )}
            {Array.isArray(lessons) && lessons.length > 0 ? (
              [...lessons]
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .map((lesson, index) => (
                  <button
                    key={lesson.id}
                    className={`lesson-chip ${selectedLessons.includes(lesson.id) ? 'selected' : ''}`}
                    onClick={() => onToggleLesson(lesson.id)}
                  >
                    <span className="lesson-number">#{index + 1}</span>
                    <span className="lesson-title">{lesson.title || `Lesson ${lesson.id}`}</span>
                  </button>
                ))
            ) : (
              <p className="no-lessons">No lessons available. Please check your connection.</p>
            )}
          </div>
        </div>

        <button
          className="start-btn"
          onClick={onStart}
          disabled={selectedLessons.length === 0}
          title={selectedLessons.length === 0 ? 'Select at least one lesson to study' : ''}
        >
          {stats.due > 0
            ? `Study ${stats.due} Due Cards${selectedVocabCount > 0 ? ` (+${selectedVocabCount} new)` : ''}`
            : `Start New Session${selectedVocabCount > 0 ? ` (${selectedVocabCount} words)` : ''}`}
        </button>

        <p className={`hint ${selectedLessons.length > 0 ? 'hint-hidden' : ''}`}>
          Select at least one lesson above to start studying.
        </p>
      </div>
    </div>
  );
};
