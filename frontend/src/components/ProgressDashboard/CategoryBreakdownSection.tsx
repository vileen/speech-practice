import React from 'react';
import { CategoryBreakdown, getAccuracyColor } from '../../hooks/useProgressData.js';

interface Props {
  categories: CategoryBreakdown[];
}

export const CategoryBreakdownSection: React.FC<Props> = ({ categories }) => {
  const filtered = categories.filter(c => c.totalAttempts > 0);

  return (
    <section className="categories-section">
      <h2>Category Breakdown</h2>
      <div className="categories-list">
        {filtered.slice(0, 8).map(cat => (
          <div key={cat.category} className="category-item">
            <div className="category-info">
              <span className="category-name">{cat.category}</span>
              <span className="category-attempts">{cat.totalAttempts} attempts</span>
            </div>
            <div className="category-bar-container">
              <div
                className="category-bar"
                style={{
                  width: `${cat.accuracy}%`,
                  backgroundColor: getAccuracyColor(cat.accuracy)
                }}
              />
            </div>
            <div className="category-accuracy" style={{ color: getAccuracyColor(cat.accuracy) }}>
              {cat.accuracy}%
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="empty-message">No practice data yet. Start practicing to see your progress!</p>
        )}
      </div>
    </section>
  );
};
