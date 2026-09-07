import React from 'react';
import { ActivityDay, getDayLabel } from '../../hooks/useProgressData.js';

interface Props {
  activity: ActivityDay[];
  maxValue: number;
}

export const ActivityChartSection: React.FC<Props> = ({ activity, maxValue }) => {
  return (
    <section className="activity-section">
      <h2>Last 7 Days</h2>
      <div className="activity-chart">
        {activity.map((day, _index) => (
          <div key={day.date} className="activity-bar-container">
            <div className="activity-bar-wrapper">
              {day.totalSessions > 0 && (
                <>
                  <div
                    className="activity-bar grammar-bar"
                    style={{
                      height: `${(day.grammarAttempts / maxValue) * 100}%`,
                      opacity: day.grammarAttempts > 0 ? 1 : 0
                    }}
                    title={`Grammar: ${day.grammarAttempts} attempts`}
                  />
                  <div
                    className="activity-bar kanji-bar"
                    style={{
                      height: `${(day.kanjiAttempts / maxValue) * 100}%`,
                      opacity: day.kanjiAttempts > 0 ? 1 : 0
                    }}
                    title={`Kanji: ${day.kanjiAttempts} attempts`}
                  />
                </>
              )}
              {day.totalSessions === 0 && (
                <div className="activity-bar empty-bar" />
              )}
            </div>
            <div className="activity-label">{getDayLabel(day.date)}</div>
            <div className="activity-value">{day.totalSessions}</div>
          </div>
        ))}
      </div>
      <div className="activity-legend">
        <div className="legend-item">
          <div className="legend-color grammar-color" />
          <span>Grammar</span>
        </div>
        <div className="legend-item">
          <div className="legend-color kanji-color" />
          <span>Kanji</span>
        </div>
      </div>
    </section>
  );
};
