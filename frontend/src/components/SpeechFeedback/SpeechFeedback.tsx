import React, { useState, useRef } from 'react';
import type { AssessmentResult } from '../../hooks/useSpeechAssessment';
import './SpeechFeedback.css';

interface SpeechFeedbackProps {
  assessment: AssessmentResult;
  audioBlob?: Blob | null;
  onRetry?: () => void;
  onContinue?: () => void;
}

export const SpeechFeedback: React.FC<SpeechFeedbackProps> = ({
  assessment,
  audioBlob,
  onRetry,
  onContinue,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playRecording = () => {
    if (!audioBlob) return;
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const audio = new Audio(URL.createObjectURL(audioBlob));
    audioRef.current = audio;
    
    audio.onplay = () => setIsPlaying(true);
    audio.onended = () => setIsPlaying(false);
    audio.onpause = () => setIsPlaying(false);
    
    audio.play();
  };

  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'excellent';
    if (score >= 80) return 'good';
    if (score >= 60) return 'fair';
    return 'needs-work';
  };

  const getScoreMessage = (score: number): string => {
    if (score >= 90) return '🌟 Excellent!';
    if (score >= 80) return '✨ Great job!';
    if (score >= 60) return '👍 Good attempt!';
    return '💪 Keep practicing!';
  };

  const scoreClass = getScoreColor(assessment.accuracyScore);
  const scoreMessage = getScoreMessage(assessment.accuracyScore);

  return (
    <div className="speech-feedback">
      {/* Score Section */}
      <div className={`score-section ${scoreClass}`}>
        <div className="score-circle">
          <span className="score-value">{assessment.accuracyScore}</span>
          <span className="score-percent">%</span>
        </div>
        <div className="score-message">{scoreMessage}</div>
        <p className="score-description">{assessment.feedback.overall}</p>
      </div>

      {/* Audio Playback */}
      {audioBlob && (
        <div className="playback-section">
          <button
            className={`playback-button ${isPlaying ? 'playing' : ''}`}
            onClick={playRecording}
          >
            {isPlaying ? '⏸ Pause' : '▶ Play Your Recording'}
          </button>
        </div>
      )}

      {/* Transcription Comparison */}
      <div className="comparison-section">
        <h4>What you said:</h4>
        <div className="transcript-box user">
          <span className="label">Your speech:</span>
          <p className="transcript-text">{assessment.transcript || '(no speech detected)'}</p>
        </div>
        
        <div className="transcript-box expected">
          <span className="label">Expected:</span>
          <p className="transcript-text">{assessment.expected}</p>
          {assessment.expectedRomaji && (
            <p className="romaji-text">{assessment.expectedRomaji}</p>
          )}
        </div>
      </div>

      {/* Error Details */}
      {assessment.feedback.errors.length > 0 && (
        <div className="errors-section">
          <h4>Areas to improve:</h4>
          <ul className="error-list">
            {assessment.feedback.errors.map((error, index) => (
              <li key={index} className={`error-item ${error.type}`}>
                <span className="error-type">
                  {error.type === 'omission' && '⚠️ Missing:'}
                  {error.type === 'insertion' && '⚠️ Extra:'}
                  {error.type === 'substitution' && '⚠️ Different:'}
                </span>
                <span className="error-detail">
                  {error.type === 'omission' && (
                    <>Expected "<strong>{error.expected}</strong>"</>
                  )}
                  {error.type === 'insertion' && (
                    <>Said "<strong>{error.actual}</strong>" instead of nothing</>
                  )}
                  {error.type === 'substitution' && (
                    <>Said "<strong>{error.actual}</strong>" instead of "<strong>{error.expected}</strong>"</>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Suggestions */}
      {assessment.feedback.suggestions.length > 0 && (
        <div className="suggestions-section">
          <h4>💡 Tips:</h4>
          <ul className="suggestion-list">
            {assessment.feedback.suggestions.map((suggestion, index) => (
              <li key={index}>{suggestion}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Buttons */}
      <div className="feedback-actions">
        {onRetry && (
          <button className="btn-secondary" onClick={onRetry}>
            🔄 Try Again
          </button>
        )}
        {onContinue && (
          <button className="btn-primary" onClick={onContinue}>
            Continue →
          </button>
        )}
      </div>
    </div>
  );
};
