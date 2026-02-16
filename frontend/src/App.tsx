import { useState, useEffect } from 'react';
import './App.css';
import { LessonMode } from './LessonMode.js';
import './LessonMode.css';
import { VoiceRecorder } from './VoiceRecorder.js';
import './VoiceRecorder.css';
import { translateLessonTitle } from './translations.js';

interface Session {
  id: number;
  language: string;
  voice_gender: string;
  created_at: string;
}

interface PronunciationResult {
  target_text: string;
  transcription: string;
  score: number;
  feedback: string;
  text_with_furigana: string;
}

// API URL - use env var or default to GitHub Pages path
const API_URL = (import.meta.env.VITE_API_URL || 'https://eds-grow-delivered-spending.trycloudflare.com').replace(/\/$/, '');

// Practice phrases for "Repeat After Me" mode
const PRACTICE_PHRASES: Record<string, string[]> = {
  japanese: [
    'おはようございます',
    'こんにちは',
    'こんばんは',
    'ありがとうございます',
    'すみません',
    'お名前は何ですか',
    '私は学生です',
    '日本語を勉強しています',
    '今日は寒いです',
    '明日は火曜日です',
  ],
  italian: [
    'Buongiorno',
    'Buonasera',
    'Grazie mille',
    'Mi scusi',
    'Come si chiama',
    'Sono uno studente',
    'Studio italiano',
    'Oggi fa freddo',
    'Domani è martedì',
  ],
};

function App() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [language, setLanguage] = useState<'japanese' | 'italian'>('japanese');
  const [gender, setGender] = useState<'male' | 'female'>('female');
  // Recording state managed by VoiceRecorder component
  const [session, setSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Array<{role: string, text: string, audioUrl?: string, showTranslation?: boolean, translation?: string, withFurigana?: string}>>([]);
  const [inputText, setInputText] = useState('');
  const [showFurigana, setShowFurigana] = useState(true);
  
  // Repeat After Me mode
  const [isRepeatMode, setIsRepeatMode] = useState(false);
  const [currentPhrase, setCurrentPhrase] = useState('');
  const [currentFurigana, setCurrentFurigana] = useState('');
  const [pronunciationResult, setPronunciationResult] = useState<PronunciationResult | null>(null);
  const [isListening, setIsListening] = useState(false);
  
  // Lesson Mode
  const [isLessonMode, setIsLessonMode] = useState(false);
  const [activeLesson, setActiveLesson] = useState<{id: string; title: string} | null>(null);
  
  // Recording mode: 'push-to-talk' | 'voice-activated'
  const [recordingMode, setRecordingMode] = useState<'push-to-talk' | 'voice-activated'>('voice-activated');
  
  // Refs for audio recording are now handled by VoiceRecorder component
  const [isLoading, setIsLoading] = useState(true);

  // Load password from localStorage on mount and auto-login if exists
  useEffect(() => {
    const savedPassword = localStorage.getItem('speech_practice_password');
    if (savedPassword) {
      setPassword(savedPassword);
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const handleLogin = async () => {
    localStorage.setItem('speech_practice_password', password);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('speech_practice_password');
    setIsAuthenticated(false);
    setPassword('');
    setSession(null);
    setIsRepeatMode(false);
  };

  const startSession = async () => {
    try {
      const response = await fetch(`${API_URL}/api/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Password': password,
        },
        body: JSON.stringify({ language, voice_gender: gender }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setSession(data);
        setMessages([]);
      }
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  // Get furigana for text
  const getFurigana = async (text: string): Promise<string> => {
    try {
      const response = await fetch(`${API_URL}/api/furigana`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Password': password,
        },
        body: JSON.stringify({ text }),
      });
      if (response.ok) {
        const data = await response.json();
        return data.with_furigana;
      }
    } catch (error) {
      console.error('Error getting furigana:', error);
    }
    return text;
  };

  const generateTTS = async (text: string) => {
    if (!session) return;
    
    try {
      const response = await fetch(`${API_URL}/api/tts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Password': password,
        },
        body: JSON.stringify({
          text,
          language: session.language,
          gender: session.voice_gender,
        }),
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const audioUrl = URL.createObjectURL(blob);
        
        // Get furigana for display
        const withFurigana = language === 'japanese' ? await getFurigana(text) : text;
        
        const translations: Record<string, Record<string, string>> = {
          japanese: {
            'はい、理解しました。続けてください。': 'Yes, I understand. Please continue.',
          },
          italian: {
            'Sì, ho capito. Continua pure.': 'Yes, I understand. Please continue.',
          },
        };
        const translation = translations[session.language]?.[text];
        
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          text, 
          audioUrl,
          translation,
          showTranslation: false,
          withFurigana,
        }]);
      }
    } catch (error) {
      console.error('Error generating TTS:', error);
    }
  };

  // Repeat After Me functions
  const startRepeatMode = () => {
    setIsRepeatMode(true);
    setPronunciationResult(null);
    nextPhrase();
  };

  const nextPhrase = async () => {
    const phrases = PRACTICE_PHRASES[language];
    const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
    setCurrentPhrase(randomPhrase);
    setPronunciationResult(null);
    
    // Get furigana
    const withFurigana = language === 'japanese' ? await getFurigana(randomPhrase) : randomPhrase;
    setCurrentFurigana(withFurigana);
    
    // Auto-play the phrase
    playPhrase(randomPhrase);
  };

  const playPhrase = async (text: string) => {
    try {
      const response = await fetch(`${API_URL}/api/repeat-after-me`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Password': password,
        },
        body: JSON.stringify({
          target_text: text,
          language,
        }),
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const audioUrl = URL.createObjectURL(blob);
        const audio = new Audio(audioUrl);
        audio.play();
      }
    } catch (error) {
      console.error('Error playing phrase:', error);
    }
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    generateTTS(inputText);
    setInputText('');
  };

  const generateAIResponse = async (_userText: string, lang: string) => {
    const responses: Record<string, string> = {
      japanese: 'はい、理解しました。続けてください。',
      italian: 'Sì, ho capito. Continua pure.',
    };
    const responseText = responses[lang] || 'OK, understood. Please continue.';
    
    await new Promise(resolve => setTimeout(resolve, 500));
    await generateTTS(responseText);
  };

  // Initialize lesson chat with system prompt
  const initializeLessonChat = async (lessonId: string) => {
    try {
      // First create a session
      const sessionResponse = await fetch(`${API_URL}/api/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Password': password,
        },
        body: JSON.stringify({ language, voice_gender: gender }),
      });
      
      if (sessionResponse.ok) {
        const sessionData = await sessionResponse.json();
        setSession(sessionData);
        
        // Then load lesson context
        const response = await fetch(`${API_URL}/api/lessons/${lessonId}/start`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Password': password,
          },
          body: JSON.stringify({ relaxed: true }),
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('Lesson system prompt loaded:', data.system_prompt);
          
          // Generate initial greeting (use English/short title)
          const lessonTitle = translateLessonTitle(data.lesson.title);
          const initialGreetings: Record<string, string> = {
            japanese: `このレッスンを練習しましょう。何か話しましょう！`,
            italian: `Pratichiamo questa lezione. Parliamo!`,
          };
          const greeting = initialGreetings[language] || `Let's practice "${lessonTitle}". What would you like to talk about?`;
          
          // Add greeting as first message
          setMessages([{
            role: 'assistant',
            text: greeting,
            withFurigana: greeting,
          }]);
          
          // Generate TTS for greeting
          await generateTTS(greeting);
        }
      }
    } catch (error) {
      console.error('Error initializing lesson chat:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="login-container">
        <h1>🎤 Speech Practice</h1>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="login-container">
        <h1>🎤 Speech Practice</h1>
        <div className="login-form">
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
          />
          <button onClick={handleLogin}>Enter</button>
        </div>
      </div>
    );
  }

  // Lesson Mode
  if (isLessonMode) {
    return (
      <LessonMode
        password={password}
        onBack={() => setIsLessonMode(false)}
        onStartLessonChat={(lessonId, lessonTitle) => {
          setIsLessonMode(false);
          setActiveLesson({ id: lessonId, title: lessonTitle });
          // Initialize lesson chat with system prompt
          initializeLessonChat(lessonId);
        }}
      />
    );
  }

  // Repeat After Me Mode
  if (isRepeatMode) {
    return (
      <div className="app repeat-mode">
        <header>
          <h1>🎯 Repeat After Me</h1>
          <div className="mode-controls">
            <button className="mode-btn" onClick={() => setIsRepeatMode(false)}>
              ← Back to Chat
            </button>
            <button className="mode-btn" onClick={handleLogout}>
              🚪 Logout
            </button>
          </div>
        </header>

        <main className="repeat-main">
          <div className="phrase-card">
            <div className="phrase-display">
              {showFurigana && currentFurigana ? (
                <div 
                  className="furigana-text"
                  dangerouslySetInnerHTML={{ __html: currentFurigana }}
                />
              ) : (
                <div className="plain-text">{currentPhrase}</div>
              )}
            </div>
            
            {language === 'japanese' && (
              <button 
                className="toggle-furigana"
                onClick={() => setShowFurigana(!showFurigana)}
              >
                {showFurigana ? '🙈 Hide Furigana' : '👀 Show Furigana'}
              </button>
            )}
            
            <div className="phrase-controls">
              <button className="play-btn large" onClick={() => playPhrase(currentPhrase)}>
                🔊 Listen Again
              </button>
            </div>
          </div>

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
            </div>
          )}

          <div className="repeat-controls">
            {/* Voice Recorder with VAD for Repeat After Me */}
            <div className="voice-recorder-section" style={{ width: '100%', maxWidth: '400px' }}>
              <div className="mode-toggle">
                <button 
                  className={recordingMode === 'voice-activated' ? 'active' : ''}
                  onClick={() => setRecordingMode('voice-activated')}
                >
                  🎤 Voice Activated
                </button>
                <button 
                  className={recordingMode === 'push-to-talk' ? 'active' : ''}
                  onClick={() => setRecordingMode('push-to-talk')}
                >
                  🎙️ Push to Talk
                </button>
              </div>
              
              <VoiceRecorder
                mode={recordingMode}
                isListening={isListening}
                onStartListening={() => {
                  setIsListening(true);
                }}
                onStopListening={() => {
                  setIsListening(false);
                }}
                onRecordingComplete={async (audioBlob) => {
                  // Submit for pronunciation check
                  const formData = new FormData();
                  formData.append('audio', audioBlob, 'recording.webm');
                  formData.append('target_text', currentPhrase);
                  formData.append('language', language);
                  
                  try {
                    const response = await fetch(`${API_URL}/api/repeat-after-me`, {
                      method: 'POST',
                      headers: {
                        'X-Password': password,
                      },
                      body: formData,
                    });
                    
                    if (response.ok) {
                      const result = await response.json();
                      setPronunciationResult(result);
                    }
                  } catch (error) {
                    console.error('Error checking pronunciation:', error);
                  }
                }}
              />
            </div>
            
            <button className="next-btn" onClick={nextPhrase}>
              Next Phrase →
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app">
      <header>
        <h1>🎤 Speech Practice</h1>
        {!session && (
          <div className="setup">
            <div className="language-select">
              <button 
                className={language === 'japanese' ? 'active' : ''}
                onClick={() => setLanguage('japanese')}
              >
                🇯🇵 Japanese
              </button>
              <button 
                className={language === 'italian' ? 'active' : ''}
                onClick={() => setLanguage('italian')}
              >
                🇮🇹 Italian
              </button>
            </div>
            
            <div className="gender-select">
              <button 
                className={gender === 'male' ? 'active' : ''}
                onClick={() => setGender('male')}
              >
                ♂️ Male Voice
              </button>
              <button 
                className={gender === 'female' ? 'active' : ''}
                onClick={() => setGender('female')}
              >
                ♀️ Female Voice
              </button>
            </div>
            
            <button className="start-btn" onClick={startSession}>
              Start Session
            </button>
            
            {language === 'japanese' && (
              <>
                <button className="repeat-mode-btn" onClick={startRepeatMode}>
                  🎯 Repeat After Me
                </button>
                
                <button className="lesson-mode-btn" onClick={() => setIsLessonMode(true)}>
                  📚 Lesson Mode
                </button>
              </>
            )}
          </div>
        )}
      </header>

      {session && (
        <main>
          <div className="session-info">
            <span>🌍 {language === 'japanese' ? 'Japanese' : 'Italian'}</span>
            <span>🎭 {gender === 'male' ? 'Male' : 'Female'} voice</span>
            {activeLesson && (
              <span className="active-lesson">📚 {translateLessonTitle(activeLesson.title)}</span>
            )}
            <button className="mode-btn" onClick={startRepeatMode}>
              🎯 Practice Mode
            </button>
            <button className="end-btn" onClick={() => {
              setSession(null);
              setActiveLesson(null);
            }}>End Session</button>
          </div>

          <div className="messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`message ${msg.role}`}>
                <div className="message-header">
                  <span className="role-badge">{msg.role === 'user' ? 'You' : 'AI'}</span>
                  {msg.translation && (
                    <button 
                      className="translate-toggle"
                      onClick={() => {
                        setMessages(prev => prev.map((m, i) => 
                          i === idx ? { ...m, showTranslation: !m.showTranslation } : m
                        ));
                      }}
                    >
                      {msg.showTranslation ? '🇯🇵 Original' : '🇬🇧 Translate'}
                    </button>
                  )}
                </div>
                <div className="text">
                  {msg.showTranslation && msg.translation 
                    ? msg.translation 
                    : (showFurigana && msg.withFurigana ? (
                      <span dangerouslySetInnerHTML={{ __html: msg.withFurigana }} />
                    ) : msg.text)
                  }
                </div>
                {msg.audioUrl && (
                  <div className="audio-player">
                    <button 
                      className="play-btn"
                      onClick={() => {
                        const audio = new Audio(msg.audioUrl);
                        audio.play();
                      }}
                    >
                      ▶️ Play
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Help text for new users */}
          {messages.length <= 1 && (
            <div className="help-text">
              💡 <strong>How to practice:</strong> Click 🎤 and speak in Japanese, or type your message below. The AI will respond and correct your mistakes.
            </div>
          )}

          <div className="input-area">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type in Japanese or English..."
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button onClick={handleSendMessage}>Send</button>
          </div>
          
          <div className="voice-recorder-section">
            {/* Recording mode toggle */}
            <div className="mode-toggle">
              <button 
                className={recordingMode === 'voice-activated' ? 'active' : ''}
                onClick={() => setRecordingMode('voice-activated')}
              >
                🎤 Voice Activated
              </button>
              <button 
                className={recordingMode === 'push-to-talk' ? 'active' : ''}
                onClick={() => setRecordingMode('push-to-talk')}
              >
                🎙️ Push to Talk
              </button>
            </div>
            
            {/* Voice Recorder with VAD */}
            <VoiceRecorder
              mode={recordingMode}
              isListening={isListening}
              onStartListening={() => {
                setIsListening(true);
              }}
              onStopListening={() => {
                setIsListening(false);
              }}
              onRecordingComplete={async (audioBlob) => {
                // Upload the recorded audio
                const formData = new FormData();
                formData.append('audio', audioBlob, 'recording.webm');
                formData.append('session_id', session?.id.toString() || '');
                formData.append('target_language', language);
                
                try {
                  const response = await fetch(`${API_URL}/api/upload`, {
                    method: 'POST',
                    headers: {
                      'X-Password': password,
                    },
                    body: formData,
                  });
                  
                  if (response.ok) {
                    const data = await response.json();
                    const displayText = data.transcription || '[Your recording]';
                    const audioUrl = URL.createObjectURL(audioBlob);
                    setMessages(prev => [...prev, { role: 'user', text: displayText, audioUrl }]);
                    
                    if (data.transcription) {
                      await generateAIResponse(data.transcription, language);
                    }
                  }
                } catch (error) {
                  console.error('Error uploading recording:', error);
                }
              }}
            />
          </div>
        </main>
      )}
    </div>
  );
}

export default App;
// Build: Mon Feb 16 15:51:09 CET 2026
