import React from 'react';
import { JLPTLevel } from '../../hooks/useProgressData.js';

interface Props {
  levels: JLPTLevel[];
}

export const JLPTProgress: React.FC<Props> = ({ levels }) => {
  return (
    <section className="jlpt-section">
      <h2>JLPT Level Progress</h2>
      <div className="jlpt-levels">
        {levels.map(level => (
          <div key={level.level} className="jlpt-card">
            <div className="jlpt-header">
              <span className="jlpt-badge">{level.level}</span>
              <span className="jlpt-percentage">{level.overall.percentage}%</span>
            </div>
            <div className="jlpt-progress-bar">
              <div
                className="jlpt-progress-fill"
                style={{ width: `${level.overall.percentage}%` }}
              />
            </div>
            <div className="jlpt-stats">
              <div className="jlpt-stat">
                <span className="jlpt-stat-value">{level.grammar.mastered}/{level.grammar.total}</span>
                <span className="jlpt-stat-label">Grammar</span>
              </div>
              <div className="jlpt-stat">
                <span className="jlpt-stat-value">{level.kanji.mastered}/{level.kanji.total}</span>
                <span className="jlpt-stat-label">Kanji</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
