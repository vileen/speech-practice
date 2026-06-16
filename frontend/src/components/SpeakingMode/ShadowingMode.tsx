import React from 'react';
import { VoiceRecorder } from '../VoiceRecorder/VoiceRecorder';
import { SpeechFeedback } from '../SpeechFeedback/SpeechFeedback';
import { useShadowingMode } from './hooks/useShadowingMode';

export const ShadowingMode: React.FC = () => {
  const {
    exercises,
    selectedExercise,
    loading,
    audioBlob,
    showAssessment,
    assessmentResult,
    isAssessing,
    setSelectedExercise,
    handleRecordingComplete,
    handleRetry,
    handleContinue,
    playNativeAudio,
    goBack,
  } = useShadowingMode();

  if (loading) return <div className="loading">Loading exercises...</div>;

  if (!selectedExercise) {
    return (
      <div>
        <h2>Select an Exercise</h2>
        <div className="exercise-list">
          {exercises.map((exercise) => (
            <div
              key={exercise.id}
              className="exercise-item"
              onClick={() => setSelectedExercise(exercise)}
            >
              <h4>{exercise.title}</h4>
              <div className="exercise-meta">
                <span>Level: {exercise.level}</span>
                <span>{exercise.duration_seconds}s</span>
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
        ← Back to List
      </button>

      <h2>{selectedExercise.title}</h2>

      <div className="shadowing-player">
        <button
          className="play-button"
          onClick={playNativeAudio}
        >
          ▶ Play Native Audio
        </button>

        <div className="japanese-text-display">
          <p>{selectedExercise.japanese_text}</p>
        </div>
      </div>

      <div className="recording-section">
        <h3>Your Turn - Record Yourself</h3>

        {!showAssessment && (
          <VoiceRecorder
            onRecordingComplete={handleRecordingComplete}
            isListening={false}
            onStartListening={() => {}}
            onStopListening={() => {}}
            mode="push-to-talk"
          />
        )}

        {isAssessing && <p>🎙️ Transcribing and analyzing your pronunciation...</p>}

        {assessmentResult && showAssessment && (
          <SpeechFeedback
            assessment={assessmentResult}
            audioBlob={audioBlob}
            onRetry={handleRetry}
            onContinue={handleContinue}
          />
        )}
      </div>
    </div>
  );
};
