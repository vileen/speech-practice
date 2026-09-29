import { VoiceRecorder } from '../VoiceRecorder/index.js';
import { JapanesePhrase } from '../JapanesePhrase/index.js';
import { Header } from '../Header/index.js';
import { useRepeatMode } from '../../hooks/useRepeatMode';
import { PronunciationResultCard } from './PronunciationResultCard';

export function RepeatMode() {
  const {
    currentPhrase,
    furigana,
    isPlaying,
    isLoading,
    volume,
    setVolume,
    showTranslation,
    toggleTranslation,
    showFurigana,
    toggleFurigana,
    recordingMode,
    setRecordingMode,
    isListening,
    vadResetCounter,
    pronunciationResult,
    isChecking,
    nextPhrase,
    fetchAndPlayAudio,
    handleRecordingComplete,
    handleStartListening,
    handleStopListening,
  } = useRepeatMode();

  if (!currentPhrase) {
    return <div>Loading...</div>;
  }

  return (
    <div className="app repeat-mode">
      <Header title="Repeat After Me" icon="🎯" />

      <main className="repeat-main">
        <div className="phrase-card">
          <JapanesePhrase
            text={currentPhrase.text}
            furiganaHtml={furigana}
            translation={currentPhrase.translation}
            showFurigana={showFurigana}
            showTranslation={showTranslation}
            size="large"
          />

          <button
            className="toggle-furigana"
            onClick={toggleFurigana}
          >
            {showFurigana ? '🙈 Hide Furigana' : '👀 Show Furigana'}
          </button>

          <div className="phrase-controls">
            <button
              className="play-btn large"
              onClick={fetchAndPlayAudio}
              disabled={isLoading || !currentPhrase}
            >
              🔊 {isLoading ? 'Loading...' : isPlaying ? 'Playing...' : 'Listen'}
            </button>
            <button
              className="translate-btn"
              onClick={toggleTranslation}
            >
              {showTranslation ? '🙈 Hide Translation' : '🇬🇧 Show Translation'}
            </button>
          </div>

          {isChecking && (
            <div className="checking-pronunciation">
              <div className="loading-typing">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <p>Checking pronunciation...</p>
            </div>
          )}

          {pronunciationResult && (
            <PronunciationResultCard result={pronunciationResult} />
          )}
        </div>

        <div className="repeat-controls">
          <div className="voice-recorder-section">
            <div className="volume-control">
              <label>🔊 Volume:</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                disabled={isChecking || isLoading}
              />
              <span>{Math.round(volume * 100)}%</span>
            </div>

            <div className="mode-toggle">
              <button
                className={recordingMode === 'voice-activated' ? 'active' : ''}
                onClick={() => setRecordingMode('voice-activated')}
                disabled={isChecking || isLoading}
              >
                🎤 Voice Activated
              </button>
              <button
                className={recordingMode === 'push-to-talk' ? 'active' : ''}
                onClick={() => setRecordingMode('push-to-talk')}
                disabled={isChecking || isLoading}
              >
                🎙️ Push to Talk
              </button>
            </div>

            <VoiceRecorder
              key={vadResetCounter}
              mode={recordingMode}
              disabled={isChecking || isLoading}
              isListening={isListening}
              onStartListening={handleStartListening}
              onStopListening={handleStopListening}
              onRecordingComplete={handleRecordingComplete}
            />
          </div>

          <button
            className="next-btn"
            onClick={nextPhrase}
            disabled={isChecking || isLoading}
          >
            <div>Next Phrase →</div>
            <small className="shortcut-hint">(space)</small>
          </button>
        </div>
      </main>
    </div>
  );
}
