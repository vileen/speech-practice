import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { VoiceRecorder } from '../VoiceRecorder';
import { JapanesePhrase } from './JapanesePhrase';
import { useFurigana } from '../hooks/useFurigana';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { usePronunciationCheck } from '../hooks/usePronunciationCheck';
import { PRACTICE_PHRASES } from '../App';

const API_URL = (import.meta.env.VITE_API_URL || 'https://trunk-sticks-connect-currency.trycloudflare.com').replace(/\/$/, '');

function getPassword(): string {
  return localStorage.getItem('speech_practice_password') || '';
}

export function RepeatMode() {
  const navigate = useNavigate();
  const language = 'japanese';
  const phrases = PRACTICE_PHRASES[language];
  const [_gender, setGender] = useState<'male' | 'female'>('female');
  const [_voiceStyle, setVoiceStyle] = useState<'normal' | 'anime'>('normal');
  const [currentPhrase, setCurrentPhrase] = useState<{ text: string; translation: string } | null>(null);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [vadResetCounter, setVadResetCounter] = useState(0);
  const [recordingMode, setRecordingMode] = useState<'push-to-talk' | 'voice-activated'>('push-to-talk');
  const [showTranslation, setShowTranslation] = useState(false);
  const [showFurigana, setShowFurigana] = useState(true);
  
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem('speechPracticeVolume');
    return saved ? parseFloat(saved) : 0.8;
  });

  console.log('[RepeatMode] render, currentPhrase:', currentPhrase?.text);
  
  const { furigana, isLoading: isFuriganaLoading } = useFurigana(
    currentPhrase?.text || '',
    language === 'japanese'
  );

  const { play, isPlaying } = useAudioPlayer(volume);
  const { result: pronunciationResult, isChecking, check, clear } = usePronunciationCheck();
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isFetchingAudio, setIsFetchingAudio] = useState(false);

  const isLoading = isFuriganaLoading || isFetchingAudio;

  // Load settings and first phrase on mount
  useEffect(() => {
    const settings = localStorage.getItem('repeatModeSettings');
    if (settings) {
      try {
        const parsed = JSON.parse(settings);
        setGender(parsed.gender || 'female');
        setVoiceStyle(parsed.voiceStyle || 'normal');
      } catch {
        // Use defaults
      }
    }
    
    // Load first phrase
    if (phrases.length > 0) {
      setCurrentPhrase(phrases[0]);
    }
  }, []);

  // Save volume
  useEffect(() => {
    localStorage.setItem('speechPracticeVolume', volume.toString());
  }, [volume]);

  // Spacebar shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat && !e.ctrlKey && !e.metaKey) {
        if (document.activeElement?.tagName === 'INPUT') return;
        if (isChecking || isLoading) return;

        e.preventDefault();
        nextPhrase();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isChecking, isLoading, phraseIndex]);

  const nextPhrase = useCallback(() => {
    if (phrases.length === 0) return;
    
    const nextIndex = (phraseIndex + 1) % phrases.length;
    setPhraseIndex(nextIndex);
    setCurrentPhrase(phrases[nextIndex]);
    setIsListening(false);
    setVadResetCounter(c => c + 1);
    clear();
    setShowTranslation(false);
  }, [phrases, phraseIndex, clear]);

  const handleRecordingComplete = useCallback(async (audioBlob: Blob) => {
    if (!currentPhrase) return;
    
    await check(audioBlob, currentPhrase.text, language);
  }, [currentPhrase, language, check]);

  const handleBack = () => {
    navigate('/');
  };

  // Fetch audio from API
  const fetchAndPlayAudio = useCallback(async () => {
    console.log('[RepeatMode] fetchAndPlayAudio called, currentPhrase:', currentPhrase?.text);
    if (!currentPhrase) {
      console.log('[RepeatMode] fetchAndPlayAudio early return - no currentPhrase');
      return;
    }

    // If we already have audio URL, just play it
    if (audioUrl) {
      console.log('[RepeatMode] Using cached audio URL:', audioUrl);
      play(audioUrl);
      return;
    }

    console.log('[RepeatMode] Fetching audio from API...');
    setIsFetchingAudio(true);
    try {
      const response = await fetch(`${API_URL}/api/repeat-after-me`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Password': getPassword(),
        },
        body: JSON.stringify({
          target_text: currentPhrase.text,
          language,
          gender: _gender,
          voiceStyle: _voiceStyle,
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        console.log('[RepeatMode] Audio fetched, blob size:', blob.size);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        play(url);
      } else {
        console.error('[RepeatMode] API error:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('[RepeatMode] Error fetching audio:', error);
    } finally {
      setIsFetchingAudio(false);
    }
  }, [currentPhrase, audioUrl, play, _gender, _voiceStyle, language]);

  // Initialize first phrase
  useEffect(() => {
    if (phrases.length > 0 && !currentPhrase) {
      setCurrentPhrase(phrases[0]);
    }
  }, [phrases, currentPhrase]);

  if (!currentPhrase) {
    return <div>Loading...</div>;
  }

  return (
    <div className="app repeat-mode">
      <header>
        <h1>🎯 Repeat After Me</h1>
        <div className="mode-controls">
          <button className="mode-btn" onClick={handleBack}>
            ← Back to Home
          </button>
        </div>
      </header>

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

          {language === 'japanese' && (
            <button
              className="toggle-furigana"
              onClick={() => setShowFurigana(!showFurigana)}
            >
              {showFurigana ? '🙈 Hide Furigana' : '👀 Show Furigana'}
            </button>
          )}

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
              onClick={() => setShowTranslation(!showTranslation)}
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
            <div className={`result-card score-${pronunciationResult.score}`}>
              <div className="score-display">
                <span className="score-number">{pronunciationResult.score}%</span>
                <span className="feedback">{pronunciationResult.feedback}</span>
              </div>
              
              <div className="transcription-comparison">
                <div className="expected">
                  <label>Expected:</label>
                  <span>{pronunciationResult.target_text}</span>
                </div>
                <div className="heard">
                  <label>Heard:</label>
                  <span>{pronunciationResult.transcription || '(nothing)'}</span>
                </div>
              </div>
              
              {pronunciationResult.errors && pronunciationResult.errors.length > 0 && (
                <div className="errors-section">
                  <label>💡 What to improve:</label>
                  <ul>
                    {pronunciationResult.errors.map((error: string, idx: number) => (
                      <li key={idx}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
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
              onStartListening={() => setIsListening(true)}
              onStopListening={() => setIsListening(false)}
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
