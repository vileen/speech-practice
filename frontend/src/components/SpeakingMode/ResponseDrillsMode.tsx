import React from 'react';
import { VoiceRecorder } from '../VoiceRecorder/VoiceRecorder';
import { useResponseDrills } from './hooks/useResponseDrills';

export const ResponseDrillsMode: React.FC = () => {
  const {
    drills,
    currentDrill,
    loading,
    timeLeft,
    isActive,
    evaluation,
    startDrill,
    handleRecordingComplete,
    goBack,
    getTimerClass,
  } = useResponseDrills();

  if (loading) return <div className="loading">Loading drills...</div>;

  if (!currentDrill) {
    return (
      <div>
        <h2>Response Drills</h2>
        <p style={{ marginBottom: '20px', color: '#666' }}>
          Listen to the cue and respond quickly! You'll have a limited time to answer.
        </p>
        <div className="exercise-list">
          {drills.map((drill) => (
            <div
              key={drill.id}
              className="exercise-item"
              onClick={() => startDrill(drill)}
            >
              <h4>{drill.category}</h4>
              <p style={{ margin: '8px 0', color: '#555', fontSize: '14px' }}>
                {drill.cue_text.substring(0, 80)}...
              </p>
              <div className="exercise-meta">
                <span>{drill.difficulty}</span>
                <span>{drill.time_limit_seconds}s</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <button className="back-button" onClick={goBack}>
        ← Back to Drills
      </button>

      <div className="cue-card">
        <h3>Scenario</h3>
        <p className="cue-text">{currentDrill.cue_text}</p>
      </div>

      <div className="timer-display">
        <div className={`timer ${getTimerClass()}`}>
          {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
        </div>
        <div className="timer-label">seconds remaining</div>
      </div>

      {isActive && (
        <div className="recording-section">
          <VoiceRecorder
            onRecordingComplete={handleRecordingComplete}
            isListening={false}
            onStartListening={() => {}}
            onStopListening={() => {}}
            mode="push-to-talk"
          />
        </div>
      )}

      {evaluation && (
        <div className={`evaluation-result ${
          evaluation.score >= 80 ? 'excellent' :
          evaluation.score >= 50 ? 'good' : 'needs-work'
        }`}>
          <h4>{evaluation.score >= 80 ? '🎉 Excellent!' : evaluation.score >= 50 ? '👍 Good!' : '💪 Keep Practicing!'}</h4>
          <p>{evaluation.feedback}</p>
        </div>
      )}

      <div className="suggested-response">
        <h4>Suggested Response</h4>
        <p>{currentDrill.suggested_response}</p>
      </div>
    </div>
  );
};
