import { useState, useEffect, useRef } from 'react';
import { Routes, Route, Link, useNavigate, useParams, Navigate, useLocation } from 'react-router-dom';
import './App.css';
import { LessonMode } from './LessonMode.js';
import './LessonMode.css';
import { VoiceRecorder } from './VoiceRecorder.js';
import './VoiceRecorder.css';
import { translateLessonTitle } from './translations.js';
import { HighlightedText } from './HighlightedText.js';
import './HighlightedText.css';
// TODO: Use new components and hooks to reduce code duplication
// import { JapanesePhrase } from './components/JapanesePhrase.js';
// import { useFurigana } from './hooks/useFurigana.js';
// import { useAudioPlayer } from './hooks/useAudioPlayer.js';
// import { usePronunciationCheck } from './hooks/usePronunciationCheck.js';

// Types
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

// API URL - use env var or default to Cloudflare backend
const API_URL = (import.meta.env.VITE_API_URL || 'https://trunk-sticks-connect-currency.trycloudflare.com').replace(/\/$/, '');

// Helper to get password from localStorage
const getPassword = () => localStorage.getItem('speech_practice_password') || '';

// Practice phrases for "Repeat After Me" mode
// Audio Player Component with progress bar
interface AudioPlayerProps {
  audioUrl: string;
  volume: number;
  isActive: boolean;
  onPlay: (audio: HTMLAudioElement) => void;
  onStop: () => void;
  onStopOthers: () => void;
}

function AudioPlayer({ audioUrl, volume, isActive, onPlay, onStop, onStopOthers }: AudioPlayerProps) {
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  // Initialize audio when URL changes
  useEffect(() => {
    const audio = new Audio(audioUrl);
    audio.volume = volume;
    audio.preload = 'auto';
    
    // Track if audio is actually playing (not just isActive prop)
    let isActuallyPlaying = false;
    
    audio.addEventListener('loadedmetadata', () => {
      if (isFinite(audio.duration) && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    });
    
    audio.addEventListener('canplay', () => {
      if (isFinite(audio.duration) && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    });
    
    audio.addEventListener('ended', () => {
      isActuallyPlaying = false;
      onStop();
      setProgress(0);
      setCurrentTime(0);
    });
    
    audio.addEventListener('pause', () => {
      isActuallyPlaying = false;
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    });
    
    audio.addEventListener('play', () => {
      isActuallyPlaying = true;
      // Start progress animation
      const updateProgress = () => {
        if (audioRef.current && isActuallyPlaying) {
          const current = audioRef.current.currentTime;
          const dur = audioRef.current.duration;
          if (isFinite(dur) && !isNaN(dur) && dur > 0) {
            setCurrentTime(current);
            setDuration(dur);
            setProgress((current / dur) * 100);
          }
          rafRef.current = requestAnimationFrame(updateProgress);
        }
      };
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      rafRef.current = requestAnimationFrame(updateProgress);
    });
    
    audioRef.current = audio;
    
    return () => {
      isActuallyPlaying = false;
      audio.pause();
      audio.src = '';
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [audioUrl]);

  // Update volume when prop changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const isPlayingRef = useRef(false);
  
  const handlePlayClick = async () => {
    if (!audioRef.current) {
      console.error('Audio not initialized');
      return;
    }
    
    if (isActive && isPlayingRef.current) {
      // Already active and playing - toggle pause
      if (audioRef.current.paused) {
        try {
          await audioRef.current.play();
        } catch (err) {
          console.error('Failed to resume:', err);
        }
      } else {
        audioRef.current.pause();
      }
    } else {
      // Starting new playback
      onStopOthers();
      try {
        // Reset to beginning if at end
        if (audioRef.current.currentTime >= (audioRef.current.duration || 0) - 0.1) {
          audioRef.current.currentTime = 0;
        }
        isPlayingRef.current = true;
        onPlay(audioRef.current);
        await audioRef.current.play();
      } catch (err) {
        console.error('Failed to play:', err);
        isPlayingRef.current = false;
      }
    }
  };

  const handleStopClick = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      onStop();
      setProgress(0);
      setCurrentTime(0);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !audioRef.current || !duration || !isFinite(duration)) return;
    
    const rect = progressBarRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    const newTime = percentage * duration;
    
    audioRef.current.currentTime = newTime;
    setProgress(percentage * 100);
    setCurrentTime(newTime);
  };

  const formatTime = (time: number) => {
    if (!isFinite(time) || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const [isLocallyPlaying, setIsLocallyPlaying] = useState(false);
  
  // Sync local playing state with actual audio state
  useEffect(() => {
    if (!audioRef.current) return;
    
    const updatePlayingState = () => {
      setIsLocallyPlaying(!audioRef.current!.paused);
    };
    
    audioRef.current.addEventListener('play', updatePlayingState);
    audioRef.current.addEventListener('pause', updatePlayingState);
    
    return () => {
      audioRef.current?.removeEventListener('play', updatePlayingState);
      audioRef.current?.removeEventListener('pause', updatePlayingState);
    };
  }, [audioUrl]);

  return (
    <div className="audio-player-with-progress">
      <button 
        className={`play-btn ${isActive ? 'playing' : ''}`}
        onClick={handlePlayClick}
        title={isLocallyPlaying ? 'Pause' : 'Play'}
      >
        {isLocallyPlaying ? '⏸️' : '▶️'}
      </button>
      {isActive && (
        <button 
          className="stop-btn"
          onClick={handleStopClick}
          title="Stop"
        >
          ⏹️
        </button>
      )}
      <div className="progress-container">
        <div 
          className="progress-bar"
          ref={progressBarRef}
          onClick={handleSeek}
        >
          <div 
            className="progress-fill"
            style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
          />
          <div 
            className="progress-handle" 
            style={{ 
              left: `${Math.max(0, Math.min(100, progress))}%`,
              opacity: isActive ? 1 : 0.5
            }} 
          />
        </div>
        <div className="time-display">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
}

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

// Main App wrapper with router
function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/chat/setup" element={<ChatSetup />} />
      <Route path="/chat" element={<ChatSession />} />
      <Route path="/repeat/setup" element={<RepeatSetup />} />
      <Route path="/repeat" element={<RepeatMode />} />
      <Route path="/lessons" element={<LessonList />} />
      <Route path="/lessons/:id" element={<LessonDetail />} />
      <Route path="/lessons/:id/setup" element={<LessonPracticeSetup />} />
      <Route path="/lessons/:id/practice" element={<LessonPractice />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// Helper component for authenticated routes
function AuthenticatedRoute({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedPassword = localStorage.getItem('speech_practice_password');
    if (savedPassword) {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="login-container">
        <h1>🎤 Speech Practice</h1>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return <>{children}</>;
}

// Login component
function Login() {
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    localStorage.setItem('speech_practice_password', password);
    // Reload to trigger auth check
    window.location.reload();
  };

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

// Home component
function Home() {
  const [language, setLanguage] = useState<'japanese' | 'italian'>('japanese');
  const navigate = useNavigate();

  return (
    <AuthenticatedRoute>
      <div className="app">
        <header>
          <h1>🎤 Speech Practice</h1>
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
              
              <button className="start-btn" onClick={() => navigate('/chat/setup')}>
                💬 Start Chat
              </button>
              
              {language === 'japanese' && (
                <>
                  <button className="repeat-mode-btn" onClick={() => navigate('/repeat/setup')}>
                    🎯 Repeat After Me
                  </button>
                  
                  <button className="lesson-mode-btn" onClick={() => navigate('/lessons')}>
                    📚 Lesson Mode
                  </button>
                </>
              )}
            </div>
        </header>
      </div>
    </AuthenticatedRoute>
  );
}

// Chat Setup component
function ChatSetup() {
  const navigate = useNavigate();
  const [language, setLanguage] = useState<'japanese' | 'italian'>('japanese');
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
        body: JSON.stringify({ language, voice_gender: gender }),
      });
      
      if (response.ok) {
        // Store session info in state or context
        navigate('/chat', { state: { session: await response.json(), language, gender, voiceStyle } });
      }
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  return (
    <AuthenticatedRoute>
      <div className="app">
        <header>
          <h1>🎤 Speech Practice</h1>
        </header>
        <main>
          <div className="practice-setup">
            <h2>💬 Chat Setup</h2>
            <p className="setup-lesson-title">Configure your chat session</p>

            <div className="setup-options">
              <div className="setup-section">
                <span className="setup-section-label">Language</span>
                <div className="setup-voice-select">
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
              </div>

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

// Chat Session component
function ChatSession() {
  const navigate = useNavigate();
  const location = useLocation();
  const [password, setPassword] = useState('');
  const [session, setSession] = useState<Session | null>(null);
  const [language, setLanguage] = useState<'japanese' | 'italian'>('japanese');
  const [gender, setGender] = useState<'male' | 'female'>('female');
  const [voiceStyle, setVoiceStyle] = useState<'normal' | 'anime'>('normal');
  const [messages, setMessages] = useState<Array<{id?: number, role: string, text: string, audioUrl?: string, showTranslation?: boolean, translation?: string, withFurigana?: string, romaji?: string, isLoading?: boolean, isTyping?: boolean, isTranslating?: boolean}>>([]);
  const [inputText, setInputText] = useState('');
  const [showFurigana, setShowFurigana] = useState(() => {
    const saved = localStorage.getItem('speechPracticeShowFurigana');
    return saved ? saved === 'true' : true;
  });

  // Save furigana preference to localStorage
  useEffect(() => {
    localStorage.setItem('speechPracticeShowFurigana', showFurigana.toString());
  }, [showFurigana]);

  const [recordingMode, setRecordingMode] = useState<'push-to-talk' | 'voice-activated'>('push-to-talk');
  const [isListening, setIsListening] = useState(false);
  const [playingAudio, setPlayingAudio] = useState<{id: number, audio: HTMLAudioElement} | null>(null);
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem('speechPracticeVolume');
    return saved ? parseFloat(saved) : 0.8;
  });
  const [activeLesson] = useState<{id: string; title: string} | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  // Load password and restore session from location state or localStorage
  useEffect(() => {
    const savedPassword = localStorage.getItem('speech_practice_password') || '';
    setPassword(savedPassword);

    // Try to get session from location state
    if (location.state?.session) {
      setSession(location.state.session);
      setLanguage(location.state.language || 'japanese');
      setGender(location.state.gender || 'female');
      setVoiceStyle(location.state.voiceStyle || 'normal');
      setIsLoadingSession(false);
    } else {
      // Try to restore from localStorage
      const savedSession = localStorage.getItem('speech_practice_session');
      if (savedSession) {
        try {
          const parsed = JSON.parse(savedSession);
          setSession(parsed.session);
          setLanguage(parsed.language || 'japanese');
          setGender(parsed.gender || 'female');
          setVoiceStyle(parsed.voiceStyle || 'normal');
          
          // Restore messages from localStorage
          const savedMessages = localStorage.getItem('speech_practice_messages');
          if (savedMessages) {
            setMessages(JSON.parse(savedMessages));
          } else {
            // Fetch from server if not in localStorage
            fetchSessionHistory(parsed.session.id, savedPassword);
          }
        } catch {
          navigate('/chat/setup');
        }
      } else {
        navigate('/chat/setup');
      }
      setIsLoadingSession(false);
    }
  }, [location.state, navigate]);
  
  // Fetch session history from server
  const fetchSessionHistory = async (sessionId: number, password: string) => {
    try {
      const response = await fetch(`${API_URL}/api/sessions/${sessionId}`, {
        headers: { 'X-Password': password },
      });
      if (response.ok) {
        const data = await response.json();
        // Convert server messages to frontend format
        const loadedMessages = data.messages.map((m: any) => ({
          id: m.id,
          role: m.role,
          text: m.content,
          withFurigana: m.content,
        }));
        setMessages(loadedMessages);
        // Save to localStorage for future restores
        localStorage.setItem('speech_practice_messages', JSON.stringify(loadedMessages));
      }
    } catch (error) {
      console.error('Error fetching session history:', error);
    }
  };

  // Save session to localStorage when it changes
  useEffect(() => {
    if (session) {
      localStorage.setItem('speech_practice_session', JSON.stringify({ session, language, gender, voiceStyle }));
    }
  }, [session, language, gender, voiceStyle]);

  // Save messages to localStorage when they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('speech_practice_messages', JSON.stringify(messages));
    }
  }, [messages]);

  // Save volume to localStorage
  useEffect(() => {
    localStorage.setItem('speechPracticeVolume', volume.toString());
    if (playingAudio?.audio) {
      playingAudio.audio.volume = volume;
    }
  }, [volume, playingAudio]);

  // Get furigana for text
  const getFurigana = async (text: string): Promise<string> => {
    try {
      const response = await fetch(`${API_URL}/api/furigana`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Password': getPassword(),
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

  // Fetch TTS and return audio URL
  const fetchTTS = async (text: string, sessionData?: { language: string, voice_gender: string }): Promise<string | null> => {
    const activeSession = sessionData || session;
    if (!activeSession) return null;

    // Get password from localStorage directly to avoid race condition
    const effectivePassword = password || localStorage.getItem('speech_practice_password') || '';
    if (!effectivePassword) return null;

    try {
      const response = await fetch(`${API_URL}/api/tts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Password': effectivePassword,
        },
        body: JSON.stringify({
          text,
          language: activeSession.language,
          gender: activeSession.voice_gender,
          voiceStyle,
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
    
    // Get password from localStorage directly to avoid race condition
    const effectivePassword = password || localStorage.getItem('speech_practice_password') || '';
    if (!effectivePassword) return;
    
    try {
      const response = await fetch(`${API_URL}/api/tts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Password': effectivePassword,
        },
        body: JSON.stringify({
          text,
          language: session.language,
          gender: session.voice_gender,
          voiceStyle,
        }),
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const audioUrl = URL.createObjectURL(blob);
        
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

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    generateTTS(inputText);
    setInputText('');
  };

  const generateAIResponse = async (userText: string, _lang: string) => {
    if (!session) return;
    
    const tempMessageId = Date.now();
    setMessages(prev => [...prev, {
      id: tempMessageId,
      role: 'assistant',
      text: '',
      isLoading: true,
      isTyping: true,
    }]);
    
    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Password': getPassword(),
        },
        body: JSON.stringify({
          session_id: session.id,
          message: userText,
        }),
      });
      
      if (response.ok) {
        const aiData = await response.json();
        
        setMessages(prev => prev.map(msg => 
          (msg as any).id === tempMessageId 
            ? { 
                ...msg, 
                text: aiData.text,
                withFurigana: aiData.text_with_furigana || aiData.text,
                romaji: aiData.romaji,
                translation: aiData.translation,
                isTyping: false,
              }
            : msg
        ));
        
        const audioUrl = await fetchTTS(aiData.text);
        
        setMessages(prev => prev.map(msg => 
          (msg as any).id === tempMessageId 
            ? { ...msg, audioUrl: audioUrl || undefined, isLoading: false }
            : msg
        ));
      } else {
        setMessages(prev => prev.filter(msg => (msg as any).id !== tempMessageId));
      }
    } catch (error) {
      console.error('Error generating AI response:', error);
    }
  };

  const handleEndSession = () => {
    if (playingAudio?.audio) {
      playingAudio.audio.pause();
      playingAudio.audio.currentTime = 0;
    }
    setPlayingAudio(null);
    localStorage.removeItem('speech_practice_session');
    localStorage.removeItem('speech_practice_messages');
    navigate('/');
  };

  if (isLoadingSession) {
    return (
      <div className="login-container">
        <h1>🎤 Speech Practice</h1>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <AuthenticatedRoute>
      <div className="app">
        <header>
          <h1>🎤 Speech Practice</h1>
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
                {language === 'japanese' && (
                  <label className="furigana-toggle" style={{display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.9em'}}>
                    <input
                      type="checkbox"
                      checked={showFurigana}
                      onChange={(e) => setShowFurigana(e.target.checked)}
                    />
                    <span>🈳 Furigana</span>
                  </label>
                )}
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
                {activeLesson && (
                  <button className="back-btn" onClick={() => navigate('/lessons')}>
                    ← Back
                  </button>
                )}
                <button className="mode-btn" onClick={() => navigate('/repeat')}>
                  🎯 Practice
                </button>
                <button className="end-btn" onClick={handleEndSession}>End</button>
              </div>
            </div>

            <div className="messages">
              {messages.map((msg, idx) => (
                <div key={idx} className={`message ${msg.role}`}>
                  <div className="message-header">
                    <span className="role-badge">{msg.role === 'user' ? 'You' : 'Teacher'}</span>
                    {msg.role === 'assistant' && !(msg as any).isTyping && (
                      <button 
                        className="translate-toggle"
                        onClick={async () => {
                          if (msg.showTranslation && msg.translation) {
                            setMessages(prev => prev.map((m, i) => 
                              i === idx ? { ...m, showTranslation: false } : m
                            ));
                            return;
                          }
                          
                          if (msg.translation) {
                            setMessages(prev => prev.map((m, i) => 
                              i === idx ? { ...m, showTranslation: true } : m
                            ));
                            return;
                          }
                          
                          try {
                            setMessages(prev => prev.map((m, i) => 
                              i === idx ? { ...m, isTranslating: true } : m
                            ));
                            
                            const response = await fetch(`${API_URL}/api/translate`, {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                                'X-Password': getPassword(),
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
                        <div className="jp-text">
                          {showFurigana && msg.withFurigana && !playingAudio?.audio ? (
                            <span dangerouslySetInnerHTML={{ __html: msg.withFurigana }} />
                          ) : playingAudio?.audio ? (
                            <HighlightedText 
                              text={msg.text}
                              audioElement={playingAudio?.id === idx ? playingAudio.audio : null}
                              isPlaying={playingAudio?.id === idx}
                            />
                          ) : (
                            msg.text
                          )}
                        </div>
                        {msg.romaji && (
                          <div className="romaji-text" style={{fontStyle: 'italic', color: '#666', fontSize: '0.9em', marginTop: '4px'}}>
                            {msg.romaji}
                          </div>
                        )}
                        {msg.showTranslation && msg.translation && (
                          <div className="translation-text">
                            🇬🇧 {msg.translation}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  {(msg as any).isLoading && (
                    <div className="audio-loading">
                      <span className="loading-dots">Generating audio</span>
                    </div>
                  )}
                  {msg.audioUrl && (
                    <AudioPlayer 
                      audioUrl={msg.audioUrl}
                      volume={volume}
                      isActive={playingAudio?.id === idx}
                      onPlay={(audio) => setPlayingAudio({ id: idx, audio })}
                      onStop={() => setPlayingAudio(null)}
                      onStopOthers={() => {
                        if (playingAudio && playingAudio.id !== idx) {
                          playingAudio.audio.pause();
                          playingAudio.audio.currentTime = 0;
                        }
                      }}
                    />
                  )}
                </div>
              ))}
            </div>

            {messages.length <= 1 && (
              <div className="help-text">
                💡 <strong>How to practice:</strong> {recordingMode === 'voice-activated' ? 'Just start speaking in Japanese!' : 'Hold 🎙️ to speak'} or type your message below. The teacher will respond and correct your mistakes.
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
              
              {(() => {
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
                      const formData = new FormData();
                      formData.append('audio', audioBlob, 'recording.webm');
                      formData.append('session_id', session?.id.toString() || '');
                      formData.append('target_language', language);
                      
                      try {
                        const response = await fetch(`${API_URL}/api/upload`, {
                          method: 'POST',
                          headers: {
                            'X-Password': getPassword(),
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
    </AuthenticatedRoute>
  );
}

// Repeat Setup component
function RepeatSetup() {
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

// Repeat Mode component
function RepeatMode() {
  const navigate = useNavigate();
  const [language] = useState<'japanese' | 'italian'>('japanese');
  const [gender, setGender] = useState<'male' | 'female'>('female');
  const [voiceStyle, setVoiceStyle] = useState<'normal' | 'anime'>('normal');
  const [currentPhrase, setCurrentPhrase] = useState('');
  const [currentFurigana, setCurrentFurigana] = useState('');
  const [currentTranslation, setCurrentTranslation] = useState('');
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);
  const [pronunciationResult, setPronunciationResult] = useState<PronunciationResult | null>(null);
  const [isCheckingPronunciation, setIsCheckingPronunciation] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [vadResetCounter, setVadResetCounter] = useState(0);
  const [playingAudio, setPlayingAudio] = useState<{id: number, audio: HTMLAudioElement} | null>(null);
  const [phrasePlayed, setPhrasePlayed] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [showFurigana, setShowFurigana] = useState(true);
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem('speechPracticeVolume');
    return saved ? parseFloat(saved) : 0.8;
  });
  const [recordingMode, setRecordingMode] = useState<'push-to-talk' | 'voice-activated'>('push-to-talk');
  const [isAudioLoading, setIsAudioLoading] = useState(false);

  // Load settings on mount
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
    nextPhrase();
  }, []);

  // Spacebar shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat && !e.ctrlKey && !e.metaKey) {
        if (document.activeElement?.tagName === 'INPUT') return;
        if (isCheckingPronunciation) return;

        e.preventDefault();
        nextPhrase();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCheckingPronunciation, currentPhrase, currentAudioUrl]);

  // Save volume
  useEffect(() => {
    localStorage.setItem('speechPracticeVolume', volume.toString());
    if (playingAudio?.audio) {
      playingAudio.audio.volume = volume;
    }
  }, [volume, playingAudio]);

  // Get furigana for text
  const getFurigana = async (text: string): Promise<string> => {
    try {
      const response = await fetch(`${API_URL}/api/furigana`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Password': getPassword(),
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

  const nextPhrase = async () => {
    const phrases = PRACTICE_PHRASES[language];
    const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];

    if (currentAudioUrl) {
      URL.revokeObjectURL(currentAudioUrl);
      setCurrentAudioUrl(null);
    }

    setIsAudioLoading(true);
    setCurrentPhrase(randomPhrase.text);
    setCurrentTranslation(randomPhrase.translation);
    setPronunciationResult(null);
    setShowTranslation(false);
    setPhrasePlayed(false);

    setIsListening(false);
    setVadResetCounter(c => c + 1);

    try {
      const withFurigana = language === 'japanese' ? await getFurigana(randomPhrase.text) : randomPhrase.text;
      setCurrentFurigana(withFurigana);

      await playPhrase(randomPhrase.text, true);
    } finally {
      setIsAudioLoading(false);
    }
  };

  const playPhrase = async (text: string, forceNew: boolean = false): Promise<void> => {
    try {
      if (!forceNew && currentAudioUrl && text === currentPhrase) {
        const audio = new Audio(currentAudioUrl);
        audio.volume = volume;
        await audio.play();
        setPhrasePlayed(true);
        return;
      }

      // Note: isAudioLoading is managed by the caller (nextPhrase)
      const response = await fetch(`${API_URL}/api/repeat-after-me`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Password': getPassword(),
        },
        body: JSON.stringify({
          target_text: text,
          language,
          gender,
          voiceStyle,
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const audioUrl = URL.createObjectURL(blob);
        setCurrentAudioUrl(audioUrl);
        const audio = new Audio(audioUrl);
        audio.volume = volume;
        await audio.play();
        setPhrasePlayed(true);
      }
    } catch (error) {
      console.error('Error playing phrase:', error);
      throw error; // Re-throw so caller knows there was an error
    }
  };

  const handleBack = () => {
    if (currentAudioUrl) {
      URL.revokeObjectURL(currentAudioUrl);
    }
    if (playingAudio?.audio) {
      playingAudio.audio.pause();
      playingAudio.audio.currentTime = 0;
    }
    setPlayingAudio(null);
    navigate('/');
  };

  return (
    <AuthenticatedRoute>
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
            
            {showTranslation && currentTranslation && (
              <div className="translation-display">
                🇬🇧 {currentTranslation}
              </div>
            )}
            
            <div className="phrase-controls">
              <button
                className="play-btn large"
                onClick={() => playPhrase(currentPhrase)}
                disabled={isCheckingPronunciation || !currentPhrase || isAudioLoading}
              >
                🔊 {isAudioLoading ? 'Loading...' : phrasePlayed ? 'Listen Again' : 'Listen'}
              </button>
              <button 
                className="translate-btn"
                onClick={() => setShowTranslation(!showTranslation)}
              >
                {showTranslation ? '🙈 Hide Translation' : '🇬🇧 Show Translation'}
              </button>
            </div>
          </div>

          {(isCheckingPronunciation || !currentPhrase) && (
            <div className="checking-pronunciation">
              <div className="loading-typing">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <p>{isCheckingPronunciation ? 'Checking pronunciation...' : 'Loading phrase...'}</p>
            </div>
          )}

          {pronunciationResult && (
            <div className={`result-card score-${pronunciationResult.score}`}>
              <div className="score-display">
                <span className="score-number">{pronunciationResult.score}%</span>
                <span className="feedback">{pronunciationResult.feedback}</span>
              </div>
              
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
            <div className="voice-recorder-section" style={{ width: '100%', maxWidth: '400px' }}>
              <div className="volume-control">
                <label>🔊 Volume:</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  disabled={isCheckingPronunciation || isAudioLoading}
                />
                <span>{Math.round(volume * 100)}%</span>
              </div>

              <div className="mode-toggle">
                <button
                  className={recordingMode === 'voice-activated' ? 'active' : ''}
                  onClick={() => setRecordingMode('voice-activated')}
                  disabled={isCheckingPronunciation || isAudioLoading || !currentPhrase}
                >
                  🎤 Voice Activated
                </button>
                <button
                  className={recordingMode === 'push-to-talk' ? 'active' : ''}
                  onClick={() => setRecordingMode('push-to-talk')}
                  disabled={isCheckingPronunciation || isAudioLoading || !currentPhrase}
                >
                  🎙️ Push to Talk
                </button>
              </div>

              <VoiceRecorder
                key={vadResetCounter}
                mode={recordingMode}
                disabled={isCheckingPronunciation || isAudioLoading || !currentPhrase}
                isListening={isListening}
                onStartListening={() => {
                  setIsListening(true);
                }}
                onStopListening={() => {
                  setIsListening(false);
                }}
                onRecordingComplete={async (audioBlob) => {
                  setIsCheckingPronunciation(true);
                  const formData = new FormData();
                  formData.append('audio', audioBlob, 'recording.webm');
                  formData.append('target_text', currentPhrase);
                  formData.append('language', language);

                  try {
                    const response = await fetch(`${API_URL}/api/repeat-after-me`, {
                      method: 'POST',
                      headers: {
                        'X-Password': getPassword(),
                      },
                      body: formData,
                    });

                    if (response.ok) {
                      const result = await response.json();
                      setPronunciationResult(result);
                    }
                  } catch (error) {
                    console.error('Error checking pronunciation:', error);
                  } finally {
                    setIsCheckingPronunciation(false);
                  }
                }}
              />
            </div>
            
            <button className="next-btn" onClick={nextPhrase} disabled={isCheckingPronunciation || isAudioLoading}>
              <div>Next Phrase →</div>
              <small className="shortcut-hint">(space)</small>
            </button>
          </div>
        </main>
      </div>
    </AuthenticatedRoute>
  );
}

// Lesson List component
function LessonList() {
  const navigate = useNavigate();

  const handleStartLessonChat = (lessonId: string, lessonTitle: string) => {
    navigate(`/lessons/${lessonId}/setup`, { state: { lessonTitle } });
  };

  return (
    <AuthenticatedRoute>
      <LessonMode
        password={localStorage.getItem('speech_practice_password') || ''}
        onBack={() => navigate('/')}
        onStartLessonChat={handleStartLessonChat}
        selectedLessonId={undefined}
        onSelectLesson={(id) => {
          if (id) navigate(`/lessons/${id}`);
        }}
      />
    </AuthenticatedRoute>
  );
}

// Lesson Detail component
function LessonDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const handleStartLessonChat = (lessonId: string, lessonTitle: string) => {
    navigate(`/lessons/${lessonId}/setup`, { state: { lessonTitle } });
  };

  return (
    <AuthenticatedRoute>
      <LessonMode
        password={localStorage.getItem('speech_practice_password') || ''}
        onBack={() => navigate('/lessons')}
        onStartLessonChat={handleStartLessonChat}
        selectedLessonId={id}
        onSelectLesson={(selectedId) => {
          if (selectedId && selectedId !== id) {
            navigate(`/lessons/${selectedId}`);
          } else if (!selectedId) {
            navigate('/lessons');
          }
        }}
      />
    </AuthenticatedRoute>
  );
}

// Lesson Practice Setup component
function LessonPracticeSetup() {
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

// Lesson Practice component
function LessonPractice() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [language, setLanguage] = useState<'japanese' | 'italian'>('japanese');
  const [gender, setGender] = useState<'male' | 'female'>('female');
  const [voiceStyle, setVoiceStyle] = useState<'normal' | 'anime'>('normal');
  const [simpleMode, setSimpleMode] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Array<{id?: number, role: string, text: string, audioUrl?: string, showTranslation?: boolean, translation?: string, withFurigana?: string, romaji?: string, isLoading?: boolean, isTyping?: boolean, isTranslating?: boolean}>>([]);
  const [inputText, setInputText] = useState('');
  const [showFurigana, setShowFurigana] = useState(() => {
    const saved = localStorage.getItem('speechPracticeShowFurigana');
    return saved ? saved === 'true' : true;
  });
  const [recordingMode, setRecordingMode] = useState<'push-to-talk' | 'voice-activated'>('push-to-talk');
  const [isListening, setIsListening] = useState(false);
  const [playingAudio, setPlayingAudio] = useState<{id: number, audio: HTMLAudioElement} | null>(null);
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem('speechPracticeVolume');
    return saved ? parseFloat(saved) : 0.8;
  });
  const [activeLesson, setActiveLesson] = useState<{id: string; title: string} | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  // Save furigana preference to localStorage
  useEffect(() => {
    localStorage.setItem('speechPracticeShowFurigana', showFurigana.toString());
  }, [showFurigana]);

  // Load settings and initialize
  useEffect(() => {
    const savedPassword = localStorage.getItem('speech_practice_password') || '';
    setPassword(savedPassword);

    const settings = localStorage.getItem('lessonPracticeSettings');
    if (settings) {
      try {
        const parsed = JSON.parse(settings);
        setGender(parsed.gender || 'female');
        setVoiceStyle(parsed.voiceStyle || 'normal');
        setSimpleMode(parsed.simpleMode || false);
        setActiveLesson({ id: parsed.lessonId || id || '', title: parsed.lessonTitle || '' });
      } catch {
        // Use defaults
        setActiveLesson({ id: id || '', title: '' });
      }
    } else {
      setActiveLesson({ id: id || '', title: '' });
    }

    // Fetch lesson title if needed
    if (id) {
      fetch(`${API_URL}/api/lessons/${id}`, {
        headers: { 'X-Password': savedPassword }
      }).then(r => r.json()).then(lessonData => {
        setActiveLesson(prev => prev ? { ...prev, title: lessonData.title || '' } : { id: id || '', title: lessonData.title || '' });
        // Initialize lesson chat
        initializeLessonChat(id, savedPassword, lessonData.title || '');
      }).catch(() => {
        navigate('/lessons');
      });
    }
  }, [id, navigate]);

  // Save volume
  useEffect(() => {
    localStorage.setItem('speechPracticeVolume', volume.toString());
    if (playingAudio?.audio) {
      playingAudio.audio.volume = volume;
    }
  }, [volume, playingAudio]);

  // Fetch TTS and return audio URL
  const fetchTTS = async (text: string, sessionData?: { language: string, voice_gender: string }): Promise<string | null> => {
    const activeSession = sessionData || session;
    if (!activeSession) return null;

    // Get password from localStorage directly to avoid race condition
    const effectivePassword = password || localStorage.getItem('speech_practice_password') || '';
    if (!effectivePassword) return null;

    try {
      const response = await fetch(`${API_URL}/api/tts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Password': effectivePassword,
        },
        body: JSON.stringify({
          text,
          language: activeSession.language,
          gender: activeSession.voice_gender,
          voiceStyle,
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

  // Initialize lesson chat with system prompt
  const initializeLessonChat = async (lessonId: string, effectivePassword: string, _lessonTitle: string) => {
    try {
      // Create a session
      const sessionResponse = await fetch(`${API_URL}/api/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Password': effectivePassword,
        },
        body: JSON.stringify({ language, voice_gender: gender }),
      });
      
      if (sessionResponse.ok) {
        const sessionData = await sessionResponse.json();
        setSession(sessionData);
        setLanguage(sessionData.language);
        
        // Load lesson context
        const response = await fetch(`${API_URL}/api/lessons/${lessonId}/start`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Password': effectivePassword,
          },
          body: JSON.stringify({ relaxed: true, session_id: sessionData.id, simpleMode }),
        });
        
        if (response.ok) {
          await response.json();
          
          const messageId = Date.now();
          setMessages([{
            id: messageId,
            role: 'assistant',
            text: '',
            isLoading: true,
            isTyping: true,
          }]);
          
          const aiResponse = await fetch(`${API_URL}/api/chat`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Password': password || effectivePassword,
            },
            body: JSON.stringify({
              session_id: sessionData.id,
              message: '[START_CONVERSATION]',
            }),
          });
          
          if (aiResponse.ok) {
            const aiData = await aiResponse.json();
            
            setMessages([{
              id: messageId,
              role: 'assistant',
              text: aiData.text,
              withFurigana: aiData.text_with_furigana || aiData.text,
              romaji: aiData.romaji,
              translation: aiData.translation,
              isTyping: false,
              isLoading: true,
            }]);
            
            const audioUrl = await fetchTTS(aiData.text, sessionData);
            
            setMessages([{
              id: messageId,
              role: 'assistant',
              text: aiData.text,
              withFurigana: aiData.text_with_furigana || aiData.text,
              romaji: aiData.romaji,
              translation: aiData.translation,
              audioUrl: audioUrl || undefined,
              isLoading: false,
            }]);
          } else {
            setMessages([]);
          }
        }
      }
    } catch (error) {
      console.error('Error initializing lesson chat:', error);
    } finally {
      setIsLoadingSession(false);
    }
  };

  const generateAIResponse = async (userText: string, _lang: string) => {
    if (!session) return;
    
    const tempMessageId = Date.now();
    setMessages(prev => [...prev, {
      id: tempMessageId,
      role: 'assistant',
      text: '',
      isLoading: true,
      isTyping: true,
    }]);
    
    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Password': getPassword(),
        },
        body: JSON.stringify({
          session_id: session.id,
          message: userText,
        }),
      });
      
      if (response.ok) {
        const aiData = await response.json();
        
        setMessages(prev => prev.map(msg => 
          (msg as any).id === tempMessageId 
            ? { 
                ...msg, 
                text: aiData.text,
                withFurigana: aiData.text_with_furigana || aiData.text,
                romaji: aiData.romaji,
                translation: aiData.translation,
                isTyping: false,
              }
            : msg
        ));
        
        const audioUrl = await fetchTTS(aiData.text);
        
        setMessages(prev => prev.map(msg => 
          (msg as any).id === tempMessageId 
            ? { ...msg, audioUrl: audioUrl || undefined, isLoading: false }
            : msg
        ));
      } else {
        setMessages(prev => prev.filter(msg => (msg as any).id !== tempMessageId));
      }
    } catch (error) {
      console.error('Error generating AI response:', error);
    }
  };

  const handleSendMessage = () => {
    if (!inputText.trim() || !session) return;
    
    const tempMessageId = Date.now();
    setMessages(prev => [...prev, {
      id: tempMessageId,
      role: 'user',
      text: inputText,
    }]);
    
    generateAIResponse(inputText, language);
    setInputText('');
  };

  const handleBack = () => {
    if (playingAudio?.audio) {
      playingAudio.audio.pause();
      playingAudio.audio.currentTime = 0;
    }
    setPlayingAudio(null);
    navigate('/lessons');
  };

  const handleEndSession = () => {
    if (playingAudio?.audio) {
      playingAudio.audio.pause();
      playingAudio.audio.currentTime = 0;
    }
    setPlayingAudio(null);
    localStorage.removeItem('speech_practice_session');
    localStorage.removeItem('speech_practice_messages');
    navigate('/');
  };

  if (isLoadingSession) {
    return (
      <div className="login-container">
        <h1>🎤 Speech Practice</h1>
        <div className="loading">
          <div className="loading-typing">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <p>Loading practice session...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthenticatedRoute>
      <div className="app">
        <header>
          <h1>🎤 Speech Practice</h1>
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
                {language === 'japanese' && (
                  <label className="furigana-toggle" style={{display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.9em'}}>
                    <input
                      type="checkbox"
                      checked={showFurigana}
                      onChange={(e) => setShowFurigana(e.target.checked)}
                    />
                    <span>🈳 Furigana</span>
                  </label>
                )}
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
                <button className="back-btn" onClick={handleBack}>
                  ← Back
                </button>
                <button className="end-btn" onClick={handleEndSession}>End</button>
              </div>
            </div>

            <div className="messages">
              {messages.map((msg, idx) => (
                <div key={idx} className={`message ${msg.role}`}>
                  <div className="message-header">
                    <span className="role-badge">{msg.role === 'user' ? 'You' : 'Teacher'}</span>
                    {msg.role === 'assistant' && !(msg as any).isTyping && (
                      <button 
                        className="translate-toggle"
                        onClick={async () => {
                          if (msg.showTranslation && msg.translation) {
                            setMessages(prev => prev.map((m, i) => 
                              i === idx ? { ...m, showTranslation: false } : m
                            ));
                            return;
                          }
                          
                          if (msg.translation) {
                            setMessages(prev => prev.map((m, i) => 
                              i === idx ? { ...m, showTranslation: true } : m
                            ));
                            return;
                          }
                          
                          try {
                            setMessages(prev => prev.map((m, i) => 
                              i === idx ? { ...m, isTranslating: true } : m
                            ));
                            
                            const response = await fetch(`${API_URL}/api/translate`, {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                                'X-Password': getPassword(),
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
                        <div className="jp-text">
                          {showFurigana && msg.withFurigana && !playingAudio?.audio ? (
                            <span dangerouslySetInnerHTML={{ __html: msg.withFurigana }} />
                          ) : playingAudio?.audio ? (
                            <HighlightedText 
                              text={msg.text}
                              audioElement={playingAudio?.id === idx ? playingAudio.audio : null}
                              isPlaying={playingAudio?.id === idx}
                            />
                          ) : (
                            msg.text
                          )}
                        </div>
                        {msg.romaji && (
                          <div className="romaji-text" style={{fontStyle: 'italic', color: '#666', fontSize: '0.9em', marginTop: '4px'}}>
                            {msg.romaji}
                          </div>
                        )}
                        {msg.showTranslation && msg.translation && (
                          <div className="translation-text">
                            🇬🇧 {msg.translation}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  {(msg as any).isLoading && (
                    <div className="audio-loading">
                      <span className="loading-dots">Generating audio</span>
                    </div>
                  )}
                  {msg.audioUrl && (
                    <AudioPlayer 
                      audioUrl={msg.audioUrl}
                      volume={volume}
                      isActive={playingAudio?.id === idx}
                      onPlay={(audio) => setPlayingAudio({ id: idx, audio })}
                      onStop={() => setPlayingAudio(null)}
                      onStopOthers={() => {
                        if (playingAudio && playingAudio.id !== idx) {
                          playingAudio.audio.pause();
                          playingAudio.audio.currentTime = 0;
                        }
                      }}
                    />
                  )}
                </div>
              ))}
            </div>

            {messages.length <= 1 && (
              <div className="help-text">
                💡 <strong>How to practice:</strong> {recordingMode === 'voice-activated' ? 'Just start speaking in Japanese!' : 'Hold 🎙️ to speak'} or type your message below. The teacher will respond and correct your mistakes.
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
              
              {(() => {
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
                      const formData = new FormData();
                      formData.append('audio', audioBlob, 'recording.webm');
                      formData.append('session_id', session?.id.toString() || '');
                      formData.append('target_language', language);
                      
                      try {
                        const response = await fetch(`${API_URL}/api/upload`, {
                          method: 'POST',
                          headers: {
                            'X-Password': getPassword(),
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
    </AuthenticatedRoute>
  );
}

export default App;
// Build: Mon Feb 16 15:51:09 CET 2026
