import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { AuthenticatedRoute } from '../App.js';
import { API_URL } from '../config/api.js';
import { translateLessonTitle } from '../translations.js';

export function LessonPracticeSetup() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [, setPassword] = useState('');
  const [lessonTitle, setLessonTitle] = useState(location.state?.lessonTitle || '');
  const [simpleMode, setSimpleMode] = useState(() => {
    return localStorage.getItem('simpleMode') === 'true';
  });
  const [gender, setGender] = useState<'male' | 'female'>('female');
  const [voiceStyle, setVoiceStyle] = useState<'normal' | 'anime'>(() => {
    return localStorage.getItem('voiceStyle') as 'normal' | 'anime' || 'normal';
  });

  useEffect(() => {
    const savedPassword = localStorage.getItem('speech_practice_password') || '';
    setPassword(savedPassword);

    // Fetch lesson title if not provided
    if (!lessonTitle && id) {
      fetch(`${API_URL}/api/lessons/${id}`, {
        headers: { 'X-Password': savedPassword }
      }).then(r => r.json()).then(data => {
        setLessonTitle(data.title || '');
      }).catch(() => {
        navigate('/lessons');
      });
    }
  }, [id, lessonTitle, navigate]);

  const handleStartPractice = () => {
    localStorage.setItem('simpleMode', simpleMode.toString());
    localStorage.setItem('voiceStyle', voiceStyle);
    // Store practice settings
    localStorage.setItem('lessonPracticeSettings', JSON.stringify({
      gender,
      voiceStyle,
      simpleMode,
      lessonId: id,
      lessonTitle
    }));
    navigate(`/lessons/${id}/practice`);
  };

  const handleBack = () => {
    navigate('/lessons');
  };

  return (
    <AuthenticatedRoute>
      <div className="app">
        <header>
          <h1>🎤 Speech Practice</h1>
        </header>
        <main>
          <div className="practice-setup">
            <h2>📚 Practice Setup</h2>
            <p className="setup-lesson-title">{translateLessonTitle(lessonTitle)}</p>
            
            <div className="setup-options">
              <label className="setup-toggle">
                <input 
                  type="checkbox" 
                  checked={simpleMode} 
                  onChange={(e) => setSimpleMode(e.target.checked)} 
                />
                <span className="toggle-label">Simple Mode</span>
                <span className="toggle-description">Use basic vocabulary and short sentences</span>
              </label>
              
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
            >
              🚀 Start Practice
            </button>
            
            <button 
              className="cancel-practice-btn"
              onClick={handleBack}
            >
              ← Back to Lessons
            </button>
          </div>
        </main>
      </div>
    </AuthenticatedRoute>
  );
}
