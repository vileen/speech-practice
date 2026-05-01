import React from 'react';
import type { GrammarPattern } from './GrammarMode.js';
import { PatternCard } from './PatternCard.js';

// Category Groups for Quick Select
interface CategoryGroup {
  name: string;
  categories: string[];
}

export const CATEGORY_GROUPS: Record<string, CategoryGroup> = {
  particles: {
    name: 'Particles',
    categories: ['Particles']
  },
  permission: {
    name: 'Permission/Obligation',
    categories: ['Permission', 'Prohibition', 'Obligation', 'Lack of Obligation']
  },
  adjectives: {
    name: 'Adjectives',
    categories: ['I-Adjectives', 'Na-Adjectives']
  },
  actions: {
    name: 'Actions',
    categories: ['Desire', 'Ability', 'Invitation', 'Suggestion']
  },
  all: {
    name: 'All',
    categories: [] // Populated dynamically based on available categories
  }
};

export interface PatternSelectionProps {
  patterns: GrammarPattern[];
  categories: string[];
  selectedCategories: string[];
  dueCount: number;
  duePatterns: GrammarPattern[];
  confusionStats: { patternId: number; count: number }[];
  showFurigana: boolean;
  expandedGroup: string | null;
  activeGroup: string | null;
  onToggleCategory: (category: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onClearSelection: () => void;
  onSelectGroup: (groupKey: string) => void;
  onToggleGroupAccordion: () => void;
  onStartReview: (useSelected: boolean, mixed?: boolean) => void;
  onStartDiscrimination: () => void;
  onShowPatternGraph: () => void;
  onStartPattern: (pattern: GrammarPattern) => void;
  onComparePattern: (pattern: GrammarPattern) => void;
}

export const PatternSelection: React.FC<PatternSelectionProps> = ({
  patterns,
  categories,
  selectedCategories,
  dueCount,
  duePatterns,
  confusionStats,
  showFurigana,
  expandedGroup,
  activeGroup,
  onToggleCategory,
  onSelectAll,
  onDeselectAll,
  onClearSelection,
  onSelectGroup,
  onToggleGroupAccordion,
  onStartReview,
  onStartDiscrimination,
  onShowPatternGraph,
  onStartPattern,
  onComparePattern,
}) => {
  const filteredPatterns = patterns.filter(p => selectedCategories.includes(p.category));

  // Calculate due patterns breakdown by category
  const dueByCategory = React.useMemo(() => {
    const breakdown: Record<string, number> = {};
    duePatterns.forEach(p => {
      breakdown[p.category] = (breakdown[p.category] || 0) + 1;
    });
    return Object.entries(breakdown).sort((a, b) => b[1] - a[1]);
  }, [duePatterns]);

  const selectedPatternsCount = selectedCategories.length > 0
    ? patterns.filter(p => selectedCategories.includes(p.category)).length
    : 0;

  const hasConfusion = (patternId: number) => {
    return confusionStats.some(c => c.patternId === patternId && c.count > 0);
  };

  return (
    <div className="pattern-selection">
      {dueCount > 0 && (
        <div className="review-banner">
          <div className="review-banner-content">
            <span className="review-banner-title">🔥 {dueCount} patterns ready for review</span>
            {dueByCategory.length > 0 && (
              <div className="due-categories">
                {dueByCategory.map(([category, count]) => (
                  <span
                    key={category}
                    className={`due-category-pill ${selectedCategories.includes(category) ? 'selected' : ''}`}
                    title={selectedCategories.includes(category) ? 'Selected' : 'Not selected'}
                  >
                    {category} ({count})
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="review-actions">
            <button
              className="review-btn practice-selected-btn"
              onClick={() => onStartReview(true)}
              disabled={selectedCategories.length === 0 || selectedPatternsCount === 0}
            >
              Practice Selected ({selectedPatternsCount} patterns)
            </button>
            <button className="review-btn" onClick={() => onStartReview(false)}>
              Practice All
            </button>
          </div>
        </div>
      )}

      {/* Mixed Review Banner */}
      <div className="mixed-review-banner">
        <div className="mixed-review-content">
          <span className="mixed-review-title">🎯 Mixed Review Mode</span>
          <span className="mixed-review-desc">
            Practice shuffled patterns from selected categories to improve discrimination
          </span>
        </div>
        <button
          className="mixed-review-btn"
          onClick={() => {
            if (selectedCategories.length === 0) {
              alert('Please select at least one category first. Use Quick Select Groups or select categories manually.');
              return;
            }
            onStartReview(true, true);
          }}
          disabled={selectedPatternsCount === 0}
        >
          Start Mixed Review
        </button>
      </div>

      {/* Discrimination Drill Banner */}
      <div className="discrimination-banner">
        <div className="discrimination-content">
          <span className="discrimination-title">🎭 Discrimination Drills</span>
          <span className="discrimination-desc">
            Choose between similar patterns in context - trains you to pick the right one under pressure
          </span>
        </div>
        <button
          className="discrimination-btn"
          onClick={onStartDiscrimination}
          disabled={selectedPatternsCount === 0}
        >
          Start Discrimination Drill
        </button>
      </div>

      {/* Pattern Graph Button */}
      <div className="pattern-graph-banner">
        <div className="pattern-graph-info">
          <span className="pattern-graph-title">🕸️ Pattern Relationship Graph</span>
          <span className="pattern-graph-desc">
            Visual map showing how patterns connect - opposites, similarities, and your mastery status
          </span>
        </div>
        <button
          className="pattern-graph-open-btn"
          onClick={onShowPatternGraph}
        >
          View Graph
        </button>
      </div>

      {/* Quick Select Groups Accordion */}
      <div className="category-groups-accordion">
        <div
          className="accordion-header"
          onClick={onToggleGroupAccordion}
        >
          <span className="accordion-icon">📁</span>
          <span className="accordion-title">Quick Select Groups</span>
          <span className="accordion-toggle">
            {expandedGroup === 'groups' ? '▼' : '▶'}
          </span>
        </div>

        {expandedGroup === 'groups' && (
          <div className="accordion-content">
            {Object.entries(CATEGORY_GROUPS).map(([key, group]) => {
              const availableCount = key === 'all'
                ? categories.length
                : group.categories.filter(cat => categories.includes(cat)).length;
              const isActive = activeGroup === key;

              return (
                <div
                  key={key}
                  className={`group-item ${isActive ? 'active' : ''}`}
                  onClick={() => onSelectGroup(key)}
                >
                  <span className="group-name">{group.name}</span>
                  <span className="group-count">({availableCount})</span>
                  {isActive && <span className="group-check">✓</span>}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="category-filter">
        <div className="category-filter-header">
          <label className="filter-label">Categories:</label>
          <div className="filter-actions">
            <button className="filter-btn" onClick={onSelectAll}>Select All</button>
            <button className="filter-btn" onClick={onDeselectAll}>Deselect All</button>
          </div>
        </div>
        <div className="category-checkboxes">
          {categories.map(cat => (
            <label key={cat} className="category-checkbox">
              <input
                type="checkbox"
                checked={selectedCategories.includes(cat)}
                onChange={() => onToggleCategory(cat)}
              />
              <span>{cat}</span>
            </label>
          ))}
        </div>
        {selectedCategories.length > 0 && (
          <div className="selected-categories">
            <div className="selected-categories-header">
              <span className="selected-label">Selected ({selectedPatternsCount} patterns):</span>
              <button className="clear-categories-btn" onClick={onClearSelection}>
                All Categories
              </button>
            </div>
            <div className="selected-pills">
              {selectedCategories.map(cat => (
                <span key={cat} className="category-pill">
                  {cat}
                  <button
                    className="remove-pill"
                    onClick={() => onToggleCategory(cat)}
                    title={`Remove ${cat}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {selectedCategories.length === 0 ? (
        <div className="no-selection">
          <p>Select at least one category to see patterns</p>
        </div>
      ) : (
        <div className="patterns-grid">
          {filteredPatterns.map(pattern => (
            <PatternCard
              key={pattern.id}
              pattern={pattern}
              showFurigana={showFurigana}
              onClick={() => onStartPattern(pattern)}
              onCompare={() => onComparePattern(pattern)}
              hasConfusion={hasConfusion(pattern.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
