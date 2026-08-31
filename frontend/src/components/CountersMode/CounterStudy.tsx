import type { CounterGroup, CounterPattern } from './types';

interface CounterStudyProps {
  selectedGroup: CounterGroup;
  currentPattern: CounterPattern;
  onSetMode: (mode: 'menu' | 'table') => void;
  onStartQuiz: () => void;
  onSetCurrentPattern: (pattern: CounterPattern) => void;
}

export function CounterStudy({
  selectedGroup,
  currentPattern,
  onSetMode,
  onStartQuiz,
  onSetCurrentPattern,
}: CounterStudyProps) {
  const currentIdx = selectedGroup.patterns.indexOf(currentPattern);

  return (
    <div className="counters-mode">
      <header className="counters-header">
        <button className="back-btn" onClick={() => onSetMode('menu')}>← Menu</button>
        <h1>{selectedGroup.baseForm} - {selectedGroup.counts}</h1>
        <div className="study-actions">
          <button className="table-btn" onClick={() => onSetMode('table')}>📋 Table</button>
          <button className="quiz-btn" onClick={onStartQuiz}>🎯 Quiz</button>
        </div>
      </header>

      <div className="study-container">
        <div className="counter-card">
          <div className="counter-pattern-large">{currentPattern.pattern}</div>

          <div className="counter-info-section">
            <h3>{selectedGroup.counts}</h3>
          </div>

          {currentPattern.examples?.length > 0 && (
            <div className="counter-examples-section">
              <h4>Examples:</h4>
              {currentPattern.examples.slice(0, 2).map((ex: any, i: number) => (
                <div key={i} className="example-item">
                  <p className="jp">{ex.jp}</p>
                  <p className="en">{ex.en}</p>
                  {ex.romaji && <p className="romaji">{ex.romaji}</p>}
                </div>
              ))}
            </div>
          )}

          <div className="counter-navigation">
            <button onClick={() => {
              if (currentIdx > 0) onSetCurrentPattern(selectedGroup.patterns[currentIdx - 1]);
            }} disabled={currentIdx === 0}>
              ← Previous
            </button>
            <span>{currentIdx + 1} / {selectedGroup.patterns.length}</span>
            <button onClick={() => {
              if (currentIdx < selectedGroup.patterns.length - 1) onSetCurrentPattern(selectedGroup.patterns[currentIdx + 1]);
            }} disabled={currentIdx === selectedGroup.patterns.length - 1}>
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
