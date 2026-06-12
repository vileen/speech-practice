import { useVoiceRecorder } from '../../hooks/useVoiceRecorder';

interface RecordingControlsProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  isListening: boolean;
  onStartListening: () => void;
  onStopListening: () => void;
  mode: 'push-to-talk' | 'voice-activated';
  disabled?: boolean;
}

export function RecordingControls({
  onRecordingComplete,
  isListening,
  onStartListening,
  onStopListening,
  mode,
  disabled = false,
}: RecordingControlsProps) {
  const {
    audioLevel,
    isSpeaking,
    silenceTimer,
    displaySilenceTimer,
    isReady,
    hasDetectedVoiceState,
    isProcessing,
    initError,
    isPushToTalk,
    startPushToTalk,
    stopRecording,
    restartRecording,
  } = useVoiceRecorder({
    onRecordingComplete,
    isListening,
    onStartListening,
    onStopListening,
    mode,
    disabled,
  });

  return (
    <div className="voice-recorder">
      {/* Audio level indicator - always visible */}
      <div className="audio-meter">
        <div
          className={`audio-level ${isSpeaking ? 'speaking' : ''} ${hasDetectedVoiceState ? 'active' : ''}`}
          style={{ width: `${Math.min((audioLevel / 50) * 100, 100)}%` }}
        />
      </div>

      {/* Status text */}
      <div className="mode-indicator">
        {mode === 'voice-activated' && (
          <span className="vad-status">
            {initError ? (
              <span style={{ color: '#f87171' }}>❌ {initError}</span>
            ) : isProcessing ? (
              <>✅ Processing... Click to speak again</>
            ) : !isReady ? (
              <>Initializing microphone (auto-retrying)...</>
            ) : hasDetectedVoiceState ? (
              displaySilenceTimer > 0 ? (
                <>⏱️ Auto-stop in {Math.max(0, Math.ceil((2000 - silenceTimer) / 100) / 10)}s</>
              ) : (
                <>🎤 Recording... ({Math.ceil(silenceTimer / 100) / 10}s)</>
              )
            ) : (
              <>👂 Speak to start recording...</>
            )}
          </span>
        )}
      </div>

      {/* Restart button - show after voice-activated recording or error */}
      {(!isPushToTalk && (isProcessing || initError)) && (
        <button
          className="record-btn"
          onClick={restartRecording}
        >
          🎤 {initError ? 'Retry' : 'Start New Recording'}
        </button>
      )}

      {/* Push to talk button - toggle mode (click to start/stop) */}
      {isPushToTalk && (
        <button
          className={`record-btn ${isListening ? 'recording' : ''} ${isSpeaking ? 'speaking' : ''} ${disabled ? 'disabled' : ''}`}
          onClick={disabled ? undefined : (isListening ? stopRecording : startPushToTalk)}
          disabled={disabled}
        >
          {disabled ? (
            <>⏳ Wait...</>
          ) : isListening ? (
            <>🔴 Stop Recording</>
          ) : (
            <>🎙️ Start Recording</>
          )}
        </button>
      )}

      {/* Instructions */}
      <div className="instructions">
        {isPushToTalk ? (
          <small>Click to start/stop recording</small>
        ) : (
          <small>Just start speaking - I'll detect your voice automatically</small>
        )}
      </div>
    </div>
  );
}
