import React from 'react';
import type { GrammarPattern } from './GrammarMode.js';
import { ExerciseDisplay } from './ExerciseDisplay.js';

export const ComparisonView: React.FC<{
  patterns: GrammarPattern[];
  showFurigana: boolean;
  onClose: () => void;
  onSelectPattern: (pattern: GrammarPattern) => void;
}> = ({ patterns, showFurigana, onClose, onSelectPattern }) => {
  return (
    <div className="comparison-modal">
      <div className="comparison-content">
        <div className="comparison-header">
          <h3>🔍 Pattern Comparison</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="comparison-grid">
          {patterns.map((pattern, index) => (
            <div key={pattern.id} className="comparison-card">
              <div className="comparison-index">{index + 1}</div>
              <h4>
                <ExerciseDisplay text={pattern.pattern} showFurigana={showFurigana} />
              </h4>
              <span className="comparison-category">{pattern.category}</span>

              {/* What this counter counts */}
              {pattern.formation_rules?.some((r: any) => r.counts) && (
                <div className="counter-info">
                  <span className="counter-label">Liczy:</span>
                  <span className="counter-value">
                    {pattern.formation_rules.find((r: any) => r.counts)?.counts}
                  </span>
                  {pattern.formation_rules.find((r: any) => r.usage)?.usage && (
                    <span className="counter-usage">
                      ({pattern.formation_rules.find((r: any) => r.usage)?.usage})
                    </span>
                  )}
                </div>
              )}

              <div className="formation-rules">
                <h5>Formation:</h5>
                <ul>
                  {pattern.formation_rules?.filter((r: any) => r.rule).map((rule: any, i: number) => (
                    <li key={i}>
                      {rule.step && <span className="step-num">{rule.step}.</span>}
                      <ExerciseDisplay text={rule.rule} showFurigana={showFurigana} />
                    </li>
                  ))}
                </ul>
              </div>

              <div className="examples">
                <h5>Examples:</h5>
                {pattern.examples?.slice(0, 2).map((ex, i) => (
                  <div key={i} className="example">
                    <p className="jp">
                      <ExerciseDisplay text={ex.jp} showFurigana={showFurigana} />
                    </p>
                    <p className="en">{ex.en}</p>
                  </div>
                ))}
              </div>

              {pattern.common_mistakes?.length > 0 && (
                <div className="common-mistakes">
                  <h5>⚠️ Common Mistakes:</h5>
                  {pattern.common_mistakes?.slice(0, 1).map((m, i) => (
                    <div key={i} className="mistake">
                      <p className="mistake-name">{m.mistake}</p>
                      <p className="mistake-expl">{m.explanation}</p>
                    </div>
                  ))}
                </div>
              )}

              <button
                className="practice-this-btn"
                onClick={() => onSelectPattern(pattern)}
              >
                Practice This →
              </button>
            </div>
          ))}
        </div>

        {patterns.length === 2 && (
          <div className="comparison-diff">
            <h4>🎯 Key Differences</h4>
            <div className="diff-grid">
              <div className="diff-item">
                <span className="diff-pattern">
                  <ExerciseDisplay text={patterns[0].pattern} showFurigana={showFurigana} />
                </span>
                <span className="diff-desc">{patterns[0].category}</span>
              </div>
              <div className="diff-vs">vs</div>
              <div className="diff-item">
                <span className="diff-pattern">
                  <ExerciseDisplay text={patterns[1].pattern} showFurigana={showFurigana} />
                </span>
                <span className="diff-desc">{patterns[1].category}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
