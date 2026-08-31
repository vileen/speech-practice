import type { CounterGroup } from './types';

interface CounterTableProps {
  selectedGroup: CounterGroup;
  onSetMode: (mode: 'menu' | 'study') => void;
  onStartQuiz: () => void;
}

export function CounterTable({
  selectedGroup,
  onSetMode,
  onStartQuiz,
}: CounterTableProps) {
  return (
    <div className="counters-mode">
      <header className="counters-header">
        <button className="back-btn" onClick={() => onSetMode('menu')}>← Menu</button>
        <h1>{selectedGroup.baseForm} - {selectedGroup.counts}</h1>
        <div className="study-actions">
          <button className="table-btn active" onClick={() => onSetMode('study')}>📋 Cards</button>
          <button className="quiz-btn" onClick={onStartQuiz}>🎯 Quiz</button>
        </div>
      </header>

      <div className="table-container">
        <table className="counter-table">
          <thead>
            <tr>
              <th>Counter</th>
              <th>Meaning</th>
              <th>Rule</th>
            </tr>
          </thead>
          <tbody>
            {selectedGroup.patterns.map(p => {
              const ex = p.examples?.[0];
              const rule = p.formation_rules?.[0]?.rule || '';
              return (
                <tr key={p.id}>
                  <td className="col-counter">
                    <span className="table-pattern">{p.pattern}</span>
                    {ex?.romaji && <span className="table-romaji">{ex.romaji}</span>}
                  </td>
                  <td className="col-meaning">{ex?.en || '-'}</td>
                  <td className="col-rule">{rule}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
