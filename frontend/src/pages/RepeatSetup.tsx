import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthenticatedRoute } from '../App.js';

export function RepeatSetup() {
  const navigate = useNavigate();
  const [gender, setGender] = useState<'male' | 'female'>('female');
  const [voiceStyle, setVoiceStyle] = useState<'normal' | 'anime'>(() => {
    return localStorage.getItem('voiceStyle') as 'normal' | 'anime' || 'normal';
  });
  const [isCheckingPronunciation, setIsCheckingPronunciation] = useState(false);

  const handleStartPractice = async () => {
    if (isCheckingPronunciation) return;
    setIsCheckingPronunciation(true);
    // Store settings in localStorage or state for RepeatMode to access
    localStorage.setItem('repeatModeSettings', JSON.stringify({ gender, voiceStyle }));
    navigate('/repeat');
  };

  return (
    <AuthenticatedRoute>
      <div className="app">
        <header>
          <h1>🎤 Speech Practice</h1>
        </header>
        <main>
          <div className="practice-setup">
            <h2>🎯 Repeat After Me Setup</h2>
            <p className="setup-lesson-title">Practice pronunciation</p>

            <div className="setup-options">
              <div className="setup-section">
                <span className="setup-section-label">Voice</span>
                <div className="setup-voice-select">
                  <button
                    className={gender === 'male' ? 'active' : ''}
                    onClick={() => setGender('male')}
                  >
                    ♂️ Male
                  </button>
                  <button
                    className={gender === 'female' ? 'active' : ''}
                    onClick={() => setGender('female')}
                  >
                    ♀️ Female
                  </button>
                </div>
              </div>

              <div className="setup-section">
                <span className="setup-section-label">Voice Style</span>
                <div className="setup-voice-select">
                  <button
                    className={voiceStyle === 'normal' ? 'active' : ''}
                    onClick={() => setVoiceStyle('normal')}
                  >
                    🎙️ Normal
                  </button>
                  <button
                    className={voiceStyle === 'anime' ? 'active' : ''}
                    onClick={() => setVoiceStyle('anime')}
                  >
                    ✨ Anime
                  </button>
                </div>
                <small className="setup-hint">
                  {voiceStyle === 'anime'
                    ? "Anime-style expressive voice"
                    : "Natural conversational voice"}
                </small>
              </div>
            </div>

            <button
              className="start-practice-btn"
              onClick={handleStartPractice}
              disabled={isCheckingPronunciation}
            >
              {isCheckingPronunciation ? '⏳ Loading...' : '🚀 Start Practice'}
            </button>

            <Link to="/" className="cancel-practice-btn">
              ← Back to Home
            </Link>
          </div>
        </main>
      </div>
    </AuthenticatedRoute>
  );
}
