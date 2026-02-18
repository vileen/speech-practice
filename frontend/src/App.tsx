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
  errors?: string[];
}

// API URL - use env var or default to GitHub Pages path
const API_URL = (import.meta.env.VITE_API_URL || 'https://eds-grow-delivered-spending.trycloudflare.com').replace(/\/$/, '');

// Practice phrases for "Repeat After Me" mode
interface PracticePhrase {
  text: string;
  translation: string;
}

const PRACTICE_PHRASES: Record<string, PracticePhrase[]> = {
  japanese: [
    { text: 'おはようございます', translation: 'Good morning' },
    { text: 'こんにちは', translation: 'Hello / Good afternoon' },
    { text: 'こんばんは', translation: 'Good evening' },
    { text: 'ありがとうございます', translation: 'Thank you (polite)' },
    { text: 'すみません', translation: 'Excuse me / Sorry' },
    { text: 'お名前は何ですか', translation: 'What is your name?' },
    { text: '私は学生です', translation: 'I am a student' },
    { text: '日本語を勉強しています', translation: 'I am studying Japanese' },
    { text: '今日は寒いです', translation: 'Today is cold' },
    { text: '明日は火曜日です', translation: 'Tomorrow is Tuesday' },
    { text: '犬と猫とどちらの方が好きですか', translation: 'Which do you prefer, dogs or cats?' },
    { text: '寿司とラーメンとどちらがいいですか', translation: 'Which is better, sushi or ramen?' },
    { text: '京都と東京とどちらが好きですか', translation: 'Which do you like more, Kyoto or Tokyo?' },
    { text: 'ポーランドの方がイタリアより好きです', translation: 'I prefer Poland over Italy' },
    { text: 'ラーメンの方がおいしいです', translation: 'Ramen is tastier' },
    { text: '伝統的な町が好きですから', translation: 'Because I like traditional towns' },
  ],
  italian: [
    { text: 'Buongiorno', translation: 'Good morning' },
    { text: 'Buonasera', translation: 'Good evening' },
    { text: 'Grazie mille', translation: 'Thank you very much' },
    { text: 'Mi scusi', translation: 'Excuse me' },
    { text: 'Come si chiama', translation: 'What is your name?' },
    { text: 'Sono uno studente', translation: 'I am a student' },
    { text: 'Studio italiano', translation: 'I study Italian' },
    { text: 'Oggi fa freddo', translation: 'Today it is cold' },
    { text: 'Domani è martedì', translation: 'Tomorrow is Tuesday' },
  ],
};

function App() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [language, setLanguage] = useState<'japanese' | 'italian'>('japanese');
  const [gender, setGender] = useState<'male' | 'female'>('female');
  // Recording state managed by VoiceRecorder component
  const [session, setSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Array<{id?: number, role: string, text: string, audioUrl?: string, showTranslation?: boolean, translation?: string, withFurigana?: string, isLoading?: boolean, isTyping?: boolean, isTranslating?: boolean}>>([]);
  const [inputText, setInputText] = useState('');
  const [showFurigana, setShowFurigana] = useState(true);
  
  // Repeat After Me mode
  const [isRepeatMode, setIsRepeatMode] = useState(false);
  const [currentPhrase, setCurrentPhrase] = useState('');
  const [currentFurigana, setCurrentFurigana] = useState('');
  const [currentTranslation, setCurrentTranslation] = useState('');
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);
  const [pronunciationResult, setPronunciationResult] = useState<PronunciationResult | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [vadResetCounter, setVadResetCounter] = useState(0); // Force VAD reset on Next Phrase
  const [playingAudio, setPlayingAudio] = useState<{id: number, audio: HTMLAudioElement} | null>(null); // Track currently playing audio
  
  // Repeat After Me - track if phrase has been played (for disabling recorder)
  const [phrasePlayed, setPhrasePlayed] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [volume, setVolume] = useState(() => {
    // Read from localStorage on initial load
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('speechPracticeVolume');
      return saved ? parseFloat(saved) : 0.8; // Default 80%
    }
    return 0.8;
  });
  
  // Save volume to localStorage when it changes and update currently playing audio
  useEffect(() => {
    localStorage.setItem('speechPracticeVolume', volume.toString());
    // Update volume for currently playing audio
    if (playingAudio?.audio) {
      playingAudio.audio.volume = volume;
    }
  }, [volume, playingAudio]);
  
  // Lesson Mode - use URL hash for persistence
  const [isLessonMode, setIsLessonModeState] = useState(false);
  const [activeLesson, setActiveLesson] = useState<{id: string; title: string} | null>(null);
  
  // Check if hash is a lesson URL (either list or specific lesson)
  const isLessonHash = (hash: string): boolean => {
    return hash.startsWith('#/lessons');
  };
  
  // Check if we're in practice mode (lesson chat)
  const isPracticeHash = (hash: string): boolean => {
    return hash.includes('/practice');
  };
  
  // Parse lesson ID from hash
  const getLessonIdFromHash = (hash: string): string | null => {
    const match = hash.match(/#\/lessons\/([^\/]+)/);
    return match ? match[1] : null;
  };
  
  // Read initial state from URL hash
  useEffect(() => {
    const hash = window.location.hash;
    setIsLessonModeState(isLessonHash(hash));
    
    // If in practice mode on refresh, restore the lesson
    if (isPracticeHash(hash)) {
      const lessonId = getLessonIdFromHash(hash);
      if (lessonId) {
        // Fetch lesson title first
        fetch(`${API_URL}/api/lessons/${lessonId}`, {
          headers: { 'X-Password': password }
        }).then(r => r.json()).then(data => {
          setActiveLesson({ id: lessonId, title: data.title || '' });
          setTimeout(() => initializeLessonChat(lessonId), 100);
        }).catch(() => {
          // Fallback if fetch fails
          setActiveLesson({ id: lessonId, title: '' });
          setTimeout(() => initializeLessonChat(lessonId), 100);
        });
      }
    }
  }, []);
  
  // Listen for hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      setIsLessonModeState(isLessonHash(hash) && !isPracticeHash(hash));
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);
  
  // Wrapper to update URL hash when entering/exiting lesson mode
  const setIsLessonMode = (value: boolean, keepHash = false) => {
    setIsLessonModeState(value);
    if (value) {
      // Only set default hash if not already on a lesson page
      const currentHash = window.location.hash;
      if (!isLessonHash(currentHash)) {
        window.location.hash = '#/lessons';
      }
    } else if (!keepHash) {
      window.location.hash = '';
    }
  };
  
  // Recording mode: 'push-to-talk' | 'voice-activated'
  const [recordingMode, setRecordingMode] = useState<'push-to-talk' | 'voice-activated'>('push-to-talk');
  
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

  // Spacebar shortcut for Next Phrase in Repeat After Me mode
  useEffect(() => {
    if (!isRepeatMode) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat && !e.ctrlKey && !e.metaKey) {
        // Don't trigger if user is typing in an input
        if (document.activeElement?.tagName === 'INPUT') return;
        
        e.preventDefault();
        nextPhrase();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRepeatMode]);

  const handleLogin = async () => {
    localStorage.setItem('speech_practice_password', password);
    setIsAuthenticated(true);
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

  // Fetch TTS and return audio URL without adding to messages
  const fetchTTS = async (text: string, sessionData?: { language: string, voice_gender: string }): Promise<string | null> => {
    const activeSession = sessionData || session;
    if (!activeSession) return null;
    
    try {
      const response = await fetch(`${API_URL}/api/tts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Password': password,
        },
        body: JSON.stringify({
          text,
          language: activeSession.language,
          gender: activeSession.voice_gender,
        }),
      });
      
      if (response.ok) {
        const blob = await response.blob();
        return URL.createObjectURL(blob);
      }
    } catch (error) {
      console.error('Error fetching TTS:', error);
    }
    return null;
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
    
    // Clear cached audio for new phrase
    if (currentAudioUrl) {
      URL.revokeObjectURL(currentAudioUrl);
      setCurrentAudioUrl(null);
    }
    
    setCurrentPhrase(randomPhrase.text);
    setCurrentTranslation(randomPhrase.translation);
    setPronunciationResult(null);
    setShowTranslation(false);
    setPhrasePlayed(false);
    
    // Reset all voice recorder states to force fresh initialization
    setIsListening(false);
    setVadResetCounter(c => c + 1); // Force VoiceRecorder full reset
    
    // Get furigana
    const withFurigana = language === 'japanese' ? await getFurigana(randomPhrase.text) : randomPhrase.text;
    setCurrentFurigana(withFurigana);
    
    // Auto-play the phrase (will fetch new audio)
    playPhrase(randomPhrase.text, true);
    
    // Auto-start voice recording for new phrase (after a short delay)
    setTimeout(() => {
      setIsListening(true);
    }, 500);
  };

  const playPhrase = async (text: string, forceNew: boolean = false) => {
    try {
      // Use cached audio if available and not forcing new
      if (!forceNew && currentAudioUrl && text === currentPhrase) {
        const audio = new Audio(currentAudioUrl);
        audio.volume = volume;
        audio.play();
        setPhrasePlayed(true);
        return;
      }
      
      // Fetch new audio
      const response = await fetch(`${API_URL}/api/repeat-after-me`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Password': password,
        },
        body: JSON.stringify({
          target_text: text,
          language,
          gender,
        }),
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const audioUrl = URL.createObjectURL(blob);
        setCurrentAudioUrl(audioUrl);
        const audio = new Audio(audioUrl);
        audio.volume = volume;
        audio.play();
        setPhrasePlayed(true);
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

  const generateAIResponse = async (userText: string, _lang: string) => {
    if (!session) return;
    
    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Password': password,
        },
        body: JSON.stringify({
          session_id: session.id,
          message: userText,
        }),
      });
      
      // Add temporary "AI is typing" message
      const tempMessageId = Date.now();
      setMessages(prev => [...prev, {
        id: tempMessageId,
        role: 'assistant',
        text: '',
        isLoading: true,
        isTyping: true,
      }]);
      
      if (response.ok) {
        const aiData = await response.json();
        
        // Update the temporary message with actual content
        setMessages(prev => prev.map(msg => 
          (msg as any).id === tempMessageId 
            ? { 
                ...msg, 
                text: aiData.text,
                withFurigana: aiData.text_with_furigana || aiData.text,
                translation: aiData.translation,
                isTyping: false,
              }
            : msg
        ));
        
        // Generate TTS for AI response
        const audioUrl = await fetchTTS(aiData.text);
        
        // Update message with audio (remove loading state)
        setMessages(prev => prev.map(msg => 
          (msg as any).id === tempMessageId 
            ? { ...msg, audioUrl: audioUrl || undefined, isLoading: false }
            : msg
        ));
      } else {
        // Remove temporary message on error
        setMessages(prev => prev.filter(msg => (msg as any).id !== tempMessageId));
      }
    } catch (error) {
      console.error('Error generating AI response:', error);
    }
  };

  // Initialize lesson chat with system prompt
  const initializeLessonChat = async (lessonId: string) => {
    try {
      // Update URL to indicate practice mode
      window.location.hash = `#/lessons/${lessonId}/practice`;
      
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
          body: JSON.stringify({ relaxed: true, session_id: sessionData.id }),
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('Lesson system prompt loaded:', data.system_prompt);
          
          // Add placeholder message immediately
          const messageId = Date.now();
          setMessages([{
            id: messageId,
            role: 'assistant',
            text: '',
            isLoading: true,
            isTyping: true,
          }]);
          
          // AI will start the conversation - send empty user message to trigger first response
          const aiResponse = await fetch(`${API_URL}/api/chat`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Password': password,
            },
            body: JSON.stringify({
              session_id: sessionData.id,
              message: '[START_CONVERSATION]', // Special trigger for AI to start
            }),
          });
          
          if (aiResponse.ok) {
            const aiData = await aiResponse.json();
            
            // Update placeholder with AI response
            setMessages([{
              id: messageId,
              role: 'assistant',
              text: aiData.text,
              withFurigana: aiData.text_with_furigana || aiData.text,
              translation: aiData.translation,
              isTyping: false,
              isLoading: true,
            }]);
            
            // Fetch TTS for AI's opening message (pass sessionData directly since setSession is async)
            const audioUrl = await fetchTTS(aiData.text, sessionData);
            
            // Update message with audio (remove loading state)
            setMessages([{
              id: messageId,
              role: 'assistant',
              text: aiData.text,
              withFurigana: aiData.text_with_furigana || aiData.text,
              translation: aiData.translation,
              audioUrl: audioUrl || undefined,
              isLoading: false,
            }]);
          } else {
            // Remove placeholder on error
            setMessages([]);
          }
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
          setIsLessonMode(false, true); // Keep hash when going to chat
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
            <button className="mode-btn" onClick={() => {
              // Clean up cached audio when leaving
              if (currentAudioUrl) {
                URL.revokeObjectURL(currentAudioUrl);
                setCurrentAudioUrl(null);
              }
              setIsRepeatMode(false);
            }}>
              ← Back to Chat
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
            
            {/* Translation display */}
            {showTranslation && currentTranslation && (
              <div className="translation-display">
                🇬🇧 {currentTranslation}
              </div>
            )}
            
            <div className="phrase-controls">
              <button className="play-btn large" onClick={() => playPhrase(currentPhrase)}>
                🔊 {phrasePlayed ? 'Listen Again' : 'Listen'}
              </button>
              <button 
                className="translate-btn"
                onClick={() => setShowTranslation(!showTranslation)}
              >
                {showTranslation ? '🙈 Hide Translation' : '🇬🇧 Show Translation'}
              </button>
            </div>
          </div>

          {pronunciationResult && (
            <div className={`result-card score-${pronunciationResult.score}`}>
              <div className="score-display">
                <span className="score-number">{pronunciationResult.score}%</span>
                <span className="feedback">{pronunciationResult.feedback}</span>
              </div>
              
              {/* Expected phrase with furigana and translation */}
              <div className="result-phrase-section">
                <label>Target Phrase:</label>
                <div 
                  className="result-furigana-text"
                  style={{ fontSize: '150%' }}
                  dangerouslySetInnerHTML={{ __html: currentFurigana || pronunciationResult.target_text }}
                />
                {currentTranslation && (
                  <div className="result-translation">
                    🇬🇧 {currentTranslation}
                  </div>
                )}
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

          <div className="repeat-controls">
            {/* Voice Recorder with VAD for Repeat After Me */}
            <div className="voice-recorder-section" style={{ width: '100%', maxWidth: '400px' }}>
              {/* Volume control */}
              <div className="volume-control">
                <label>🔊 Volume:</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                />
                <span>{Math.round(volume * 100)}%</span>
              </div>
              
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

              {!phrasePlayed ? (
                <div className="recorder-disabled">
                  <p>👆 Click "Listen" first to hear the phrase</p>
                </div>
              ) : (
                <VoiceRecorder
                  key={`${currentPhrase}-${vadResetCounter}`}
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
              )}
            </div>
            
            <button className="next-btn" onClick={nextPhrase}>
              <div>Next Phrase →</div>
              <small className="shortcut-hint">(space)</small>
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
            <div className="session-left">
              <span>🌍 {language === 'japanese' ? 'Japanese' : 'Italian'}</span>
              <span>🎭 {gender === 'male' ? 'Male' : 'Female'}</span>
              {activeLesson && (
                <span className="active-lesson">📚 {translateLessonTitle(activeLesson.title)}</span>
              )}
            </div>
            <div className="session-right">
              {/* Global volume control */}
              <div className="global-volume" title={`Volume: ${Math.round(volume * 100)}%`}>
                <span>{volume === 0 ? '🔇' : volume < 0.5 ? '🔉' : '🔊'}</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                />
              </div>
              <button className="mode-btn" onClick={startRepeatMode}>
                🎯 Practice
              </button>
              <button className="end-btn" onClick={() => {
                setSession(null);
                setActiveLesson(null);
              }}>End</button>
            </div>
          </div>

          <div className="messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`message ${msg.role}`}>
                <div className="message-header">
                  <span className="role-badge">{msg.role === 'user' ? 'You' : 'AI'}</span>
                  {/* Show translate button for all assistant messages */}
                  {msg.role === 'assistant' && (
                    <button 
                      className="translate-toggle"
                      onClick={async () => {
                        // If already showing translation, just toggle back
                        if (msg.showTranslation && msg.translation) {
                          setMessages(prev => prev.map((m, i) => 
                            i === idx ? { ...m, showTranslation: false } : m
                          ));
                          return;
                        }
                        
                        // If we already have translation, just show it
                        if (msg.translation) {
                          setMessages(prev => prev.map((m, i) => 
                            i === idx ? { ...m, showTranslation: true } : m
                          ));
                          return;
                        }
                        
                        // Otherwise fetch translation
                        try {
                          setMessages(prev => prev.map((m, i) => 
                            i === idx ? { ...m, isTranslating: true } : m
                          ));
                          
                          const response = await fetch(`${API_URL}/api/translate`, {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                              'X-Password': password,
                            },
                            body: JSON.stringify({ text: msg.text }),
                          });
                          
                          if (response.ok) {
                            const data = await response.json();
                            setMessages(prev => prev.map((m, i) => 
                              i === idx ? { 
                                ...m, 
                                translation: data.translation,
                                showTranslation: true,
                                isTranslating: false 
                              } : m
                            ));
                          }
                        } catch (error) {
                          console.error('Error fetching translation:', error);
                          setMessages(prev => prev.map((m, i) => 
                            i === idx ? { ...m, isTranslating: false } : m
                          ));
                        }
                      }}
                      disabled={(msg as any).isTranslating}
                    >
                      {(msg as any).isTranslating ? (
                        '⏳...'
                      ) : msg.showTranslation ? (
                        '🇯🇵 Original'
                      ) : (
                        '🇬🇧 Translate'
                      )}
                    </button>
                  )}
                </div>
                <div className="text">
                  {(msg as any).isTyping ? (
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  ) : (
                    <>
                      {/* Japanese text (always shown) */}
                      <div className="jp-text">
                        {showFurigana && msg.withFurigana ? (
                          <span dangerouslySetInnerHTML={{ __html: msg.withFurigana }} />
                        ) : msg.text}
                      </div>
                      {/* Translation shown below when toggled */}
                      {msg.showTranslation && msg.translation && (
                        <div className="translation-text">
                          🇬🇧 {msg.translation}
                        </div>
                      )}
                    </>
                  )}
                </div>
                {(msg as any).isLoading && msg.text && (
                  <div className="audio-loading">
                    <span className="loading-dots">Generating audio</span>
                  </div>
                )}
                {msg.audioUrl && (
                  <div className="audio-player">
                    <button 
                      className={`play-btn ${playingAudio?.id === idx ? 'playing' : ''}`}
                      onClick={() => {
                        if (playingAudio?.id === idx) {
                          // Stop current audio
                          playingAudio.audio.pause();
                          playingAudio.audio.currentTime = 0;
                          setPlayingAudio(null);
                        } else {
                          // Stop any playing audio first
                          if (playingAudio) {
                            playingAudio.audio.pause();
                            playingAudio.audio.currentTime = 0;
                          }
                          // Play new audio with global volume
                          const audio = new Audio(msg.audioUrl);
                          audio.volume = volume;
                          audio.onended = () => setPlayingAudio(null);
                          audio.onpause = () => setPlayingAudio(null);
                          audio.play();
                          setPlayingAudio({ id: idx, audio });
                        }
                      }}
                    >
                      {playingAudio?.id === idx ? '⏹️ Stop' : '▶️ Play'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Help text for new users */}
          {messages.length <= 1 && (
            <div className="help-text">
              💡 <strong>How to practice:</strong> {recordingMode === 'voice-activated' ? 'Just start speaking in Japanese!' : 'Hold 🎙️ to speak'} or type your message below. The AI will respond and correct your mistakes.
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
            
            {/* Voice Recorder with VAD - disabled when waiting for AI */}
            {(() => {
              // Check if any AI message is currently loading (waiting for response)
              const isWaitingForAI = messages.some(m => m.role === 'assistant' && m.isLoading);
              
              return (
                <VoiceRecorder
                  mode={recordingMode}
                  isListening={isListening}
                  disabled={isWaitingForAI}
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
              );
            })()}
          </div>
        </main>
      )}
    </div>
  );
}

export default App;
// Build: Mon Feb 16 15:51:09 CET 2026
