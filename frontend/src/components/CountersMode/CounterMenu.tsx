import type { CounterGroup } from './types';

interface CounterMenuProps {
  counterGroups: CounterGroup[];
  selectedGroups: Set<string>;
  loading: boolean;
  onStartStudy: (group: CounterGroup) => void;
  onToggleGroupSelection: (baseForm: string, e: React.MouseEvent) => void;
  onStartMixedQuiz: () => void;
  onStartSelectedQuiz: () => void;
  onNavigateBack: () => void;
}

export function CounterMenu({
  counterGroups,
  selectedGroups,
  loading,
  onStartStudy,
  onToggleGroupSelection,
  onStartMixedQuiz,
  onStartSelectedQuiz,
  onNavigateBack,
}: CounterMenuProps) {
  return (
    <div className="counters-mode">
      <header className="counters-header">
        <button className="back-btn" onClick={onNavigateBack}>← Back</button>
        <h1>📊 Japanese Counters</h1>
        <div className="counters-stats">
          <span>{counterGroups.length} counter groups</span>
        </div>
      </header>

      <div className="counters-intro">
        <h2>What are counters?</h2>
        <p>
          In Japanese, counters (数詞 - sūshi) are special words used to count things.
          Depending on what you're counting (people, objects, minutes), you use a different counter.
        </p>
        <div className="counter-examples">
          <div className="counter-example">
            <span className="jp">ひとり</span>
            <span className="desc">1 person</span>
          </div>
          <div className="counter-example">
            <span className="jp">いっぽん</span>
            <span className="desc">1 long object (pencil)</span>
          </div>
          <div className="counter-example">
            <span className="jp">さんこ</span>
            <span className="desc">3 small objects (apples)</span>
          </div>
        </div>
      </div>

      <div className="mixed-quiz-banner" onClick={onStartMixedQuiz}>
        <div className="mixed-quiz-info">
          <span className="mixed-quiz-title">🎯 Mixed Quiz</span>
          <span className="mixed-quiz-desc">
            Test your knowledge with 20 random counters from all groups
          </span>
        </div>
        <button className="mixed-quiz-btn">Start →</button>
      </div>

      {loading ? (
        <div className="loading">Loading counters...</div>
      ) : (
        <div className="counter-groups">
          <h2>Select a group to study, or pick multiple for a quiz:</h2>
          <div className="groups-grid">
            {counterGroups.map(group => {
              const isSelected = selectedGroups.has(group.baseForm);
              return (
                <div
                  key={group.baseForm}
                  className={`group-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => onStartStudy(group)}
                >
                  <div className="group-card-header">
                    <h3>{group.baseForm}</h3>
                    <label
                      className="group-checkbox"
                      onClick={(e) => onToggleGroupSelection(group.baseForm, e)}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <span className="checkmark"></span>
                    </label>
                  </div>
                  <p className="group-counts">{group.counts}</p>
                  <div className="group-meta">
                    <span>{group.count} variants</span>
                    <button className="study-btn" onClick={(e) => { e.stopPropagation(); onStartStudy(group); }}>
                      Study →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Floating action: practice selected groups */}
      {selectedGroups.size > 0 && (
        <div className="selected-quiz-fab" onClick={onStartSelectedQuiz}>
          <span className="fab-label">🎯 Practice {selectedGroups.size} group{selectedGroups.size > 1 ? 's' : ''}</span>
          <span className="fab-count">{Array.from(selectedGroups).map(bf => counterGroups.find(g => g.baseForm === bf)?.count || 0).reduce((a, b) => a + b, 0)} cards</span>
        </div>
      )}
    </div>
  );
}
