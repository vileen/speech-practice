import React from 'react';
import { OverviewStats, getStreakEmoji, formatTime } from '../../hooks/useProgressData.js';

interface Props {
  overview: OverviewStats;
}

export const OverviewCards: React.FC<Props> = ({ overview }) => {
  return (
    <section className="overview-section">
      <h2>Overview</h2>
      <div className="overview-cards">
        <div className="stat-card streak-card">
          <div className="stat-icon">{getStreakEmoji(overview.streak)}</div>
          <div className="stat-content">
            <div className="stat-value">{overview.streak}</div>
            <div className="stat-label">Day Streak</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⏱️</div>
          <div className="stat-content">
            <div className="stat-value">{formatTime(overview.studyTime.thisWeek)}</div>
            <div className="stat-label">This Week</div>
            <div className="stat-sublabel">{formatTime(overview.studyTime.allTime)} total</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📖</div>
          <div className="stat-content">
            <div className="stat-value">{overview.grammar.mastered}</div>
            <div className="stat-label">Grammar Mastered</div>
            <div className="stat-sublabel">of {overview.grammar.total} patterns</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🈁</div>
          <div className="stat-content">
            <div className="stat-value">{overview.kanji.learned}</div>
            <div className="stat-label">Kanji Learned</div>
            <div className="stat-sublabel">of {overview.kanji.total} characters</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-content">
            <div className="stat-value">{overview.lessons.completed}</div>
            <div className="stat-label">Lessons</div>
            <div className="stat-sublabel">of {overview.lessons.total} completed</div>
          </div>
        </div>
      </div>
    </section>
  );
};
