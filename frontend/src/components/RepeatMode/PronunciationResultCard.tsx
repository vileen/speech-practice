import type { PronunciationResult } from '../../hooks/usePronunciationCheck';

interface PronunciationResultCardProps {
  result: PronunciationResult;
}

export function PronunciationResultCard({ result }: PronunciationResultCardProps) {
  return (
    <div className={`result-card score-${result.score}`}>
      <div className="score-display">
        <span className="score-number">{result.score}%</span>
        <span className="feedback">{result.feedback}</span>
      </div>

      <div className="transcription-comparison">
        <div className="expected">
          <label>Expected:</label>
          <span>{result.target_text}</span>
        </div>
        <div className="heard">
          <label>Heard:</label>
          <span>{result.transcription || '(nothing)'}</span>
        </div>
      </div>

      {result.errors && result.errors.length > 0 && (
        <div className="errors-section">
          <label>💡 What to improve:</label>
          <ul>
            {result.errors.map((error: string, idx: number) => (
              <li key={idx}>{error}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
