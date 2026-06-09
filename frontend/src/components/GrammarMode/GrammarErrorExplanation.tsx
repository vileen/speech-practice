import React from 'react';
import type { GrammarPattern } from './GrammarMode.js';

interface GrammarErrorExplanationProps {
  currentPattern: GrammarPattern;
}

export const GrammarErrorExplanation: React.FC<GrammarErrorExplanationProps> = ({
  currentPattern,
}) => {
  return (
    <div className="error-explanation">
      <div className="explanation-header">💡 Why this is the correct answer:</div>

      {/* Formation Rule */}
      {currentPattern.formation_rules?.filter((r: any) => r.rule).map((rule: any, i: number) => (
        <p key={i} className="formation-rule">{rule.rule}</p>
      ))}

      {/* Usage Context */}
      {currentPattern.formation_rules?.find((r: any) => r.usage)?.usage && (
        <p className="usage-context">
          <strong>Usage:</strong> {currentPattern.formation_rules.find((r: any) => r.usage)?.usage}
        </p>
      )}

      {/* Common Mistakes */}
      {currentPattern.common_mistakes?.length > 0 && (
        <div className="common-mistakes">
          <strong>Common mistakes to avoid:</strong>
          <ul>
            {currentPattern.common_mistakes.slice(0, 2).map((m: any, i: number) => (
              <li key={i}>
                {m.mistake && <span className="mistake-example">❌ {m.mistake}</span>}
                {m.explanation && <span className="mistake-explanation"> → {m.explanation}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Pattern-specific hints based on category */}
      {currentPattern.category === 'Verb Conjugation' && (
        <p className="pattern-hint">
          <strong>Hint:</strong> {currentPattern.pattern.includes('Godan')
            ? 'Godan (Group I) verbs change their final syllable before adding endings.'
            : currentPattern.pattern.includes('Ichidan')
            ? 'Ichidan (Group II) verbs simply drop る and add the ending.'
            : 'This is an irregular verb - memorize its forms!'}
        </p>
      )}
      {currentPattern.category === 'Counters' && (
        <p className="pattern-hint">
          <strong>Hint:</strong> Counter readings change based on the number (some use Japanese readings, others Chinese, with sound changes).
        </p>
      )}
      {currentPattern.category === 'Particles' && (
        <p className="pattern-hint">
          <strong>Hint:</strong> Particles mark the grammatical function of words in a sentence.
        </p>
      )}
    </div>
  );
};

export default GrammarErrorExplanation;
