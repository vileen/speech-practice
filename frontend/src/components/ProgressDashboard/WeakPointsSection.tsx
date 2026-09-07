import React from 'react';
import {
  WeakCategory,
  WeakPattern,
  ConfusedPair,
  getAccuracyColor,
} from '../../hooks/useProgressData.js';

interface Props {
  weakCategories: WeakCategory[];
  weakPatterns: WeakPattern[];
  confusedPairs: ConfusedPair[];
  onPractice: (path: string) => void;
}

export const WeakPointsSection: React.FC<Props> = ({
  weakCategories,
  weakPatterns,
  confusedPairs,
  onPractice,
}) => {
  return (
    <section className="weak-points-section">
      <h2>Areas to Improve</h2>

      {weakCategories.length > 0 && (
        <div className="weak-categories">
          <h3>Weakest Categories</h3>
          <div className="weak-categories-grid">
            {weakCategories.map(cat => (
              <div key={cat.category} className="weak-category-card">
                <div className="weak-category-name">{cat.category}</div>
                <div className="weak-category-accuracy" style={{ color: getAccuracyColor(cat.accuracy) }}>
                  {cat.accuracy}%
                </div>
                <div className="weak-category-meta">
                  {cat.totalAttempts} attempts across {cat.totalPatterns} patterns
                </div>
                <button
                  className="practice-btn"
                  onClick={() => onPractice(`/grammar?category=${encodeURIComponent(cat.category)}`)}
                >
                  Practice
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {weakPatterns.length > 0 && (
        <div className="weak-patterns">
          <h3>Patterns to Review</h3>
          <div className="weak-patterns-list">
            {weakPatterns.slice(0, 5).map(pattern => (
              <div key={pattern.id} className="weak-pattern-item">
                <div className="weak-pattern-info">
                  <span className="weak-pattern-name">{pattern.pattern}</span>
                  <span className="weak-pattern-category">{pattern.category}</span>
                </div>
                <div className="weak-pattern-stats">
                  <span className="weak-pattern-accuracy" style={{ color: getAccuracyColor(pattern.accuracy) }}>
                    {pattern.accuracy}%
                  </span>
                  <span className="weak-pattern-attempts">{pattern.correct}/{pattern.attempts}</span>
                </div>
                <button
                  className="practice-btn small"
                  onClick={() => onPractice(`/grammar?pattern=${pattern.id}`)}
                >
                  Practice
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {confusedPairs.length > 0 && (
        <div className="confused-pairs">
          <h3>Often Confused</h3>
          <div className="confused-pairs-list">
            {confusedPairs.slice(0, 3).map((pair, _index) => (
              <div key={_index} className="confused-pair-item">
                <div className="confused-pair-patterns">
                  <span className="pattern-name">{pair.patternName}</span>
                  <span className="confused-arrow">↔️</span>
                  <span className="pattern-name">{pair.confusedWithName}</span>
                </div>
                <div className="confused-pair-meta">
                  <span className="confused-count">{pair.count} confusions</span>
                  <span className="confused-category">{pair.patternCategory}</span>
                </div>
                <button
                  className="practice-btn small"
                  onClick={() => onPractice(`/grammar?pattern=${pair.patternId}`)}
                >
                  Practice
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {weakCategories.length === 0 && weakPatterns.length === 0 && confusedPairs.length === 0 && (
        <div className="empty-weak-points">
          <p>🎉 Great job! No weak points detected yet.</p>
          <p>Keep practicing to build up your data and identify areas for improvement.</p>
        </div>
      )}
    </section>
  );
};
