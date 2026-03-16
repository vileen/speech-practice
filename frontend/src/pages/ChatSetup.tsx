import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthenticatedRoute } from '../App.js';
import { API_URL, getPassword } from '../config/api.js';
import { Header } from '../components/Header/index.js';

export function ChatSetup() {
  const navigate = useNavigate();
  const [gender, setGender] = useState<'male' | 'female'>('female');
  const [voiceStyle, setVoiceStyle] = useState<'normal' | 'anime'>(() => {
    return localStorage.getItem('voiceStyle') as 'normal' | 'anime' || 'normal';
  });

  const handleStartChat = async () => {
    try {
      const response = await fetch(`${API_URL}/api/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Password': getPassword(),
        },
        body: JSON.stringify({ language: 'japanese', voice_gender: gender }),
      });
      
      if (response.ok) {
        navigate('/chat', { state: { session: await response.json(), language: 'japanese', gender, voiceStyle } });
      }
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  return (
    <AuthenticatedRoute>
      <div className="app">
        <Header title="Speech Practice" icon="🎤" />
        <main>
          <div className="practice-setup">
            <h2>💬 Chat Setup</h2>
            <p className="setup-lesson-title">Configure your chat session</p>

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
              onClick={handleStartChat}
            >
              🚀 Start Chat
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
