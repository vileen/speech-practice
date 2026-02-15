import { useState, useRef } from 'react';
import './App.css';

interface Session {
  id: number;
  language: string;
  voice_gender: string;
  created_at: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function App() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [language, setLanguage] = useState<'japanese' | 'italian'>('japanese');
  const [gender, setGender] = useState<'male' | 'female'>('female');
  const [showTranslation, setShowTranslation] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Array<{role: string, text: string, audioUrl?: string}>>([]);
  const [inputText, setInputText] = useState('');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const handleLogin = async () => {
    // Simple check - backend will validate
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
      console.error('Error starting session:', error);
    }
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
        setMessages(prev => [...prev, { role: 'assistant', text, audioUrl }]);
      }
    } catch (error) {
      console.error('Error generating TTS:', error);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mp3' });
        // Upload to backend
        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.mp3');
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
            await response.json();
            setMessages(prev => [...prev, { role: 'user', text: '[Your recording]', audioUrl: URL.createObjectURL(audioBlob) }]);
          }
        } catch (error) {
          console.error('Error uploading recording:', error);
        }
      };
      
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    generateTTS(inputText);
    setInputText('');
  };

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
          />
          <button onClick={handleLogin}>Enter</button>
        </div>
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
            
            <div className="options">
              <label>
                <input 
                  type="checkbox" 
                  checked={showTranslation}
                  onChange={(e) => setShowTranslation(e.target.checked)}
                />
                Show English translations
              </label>
            </div>
            
            <button className="start-btn" onClick={startSession}>
              Start Session
            </button>
          </div>
        )}
      </header>

      {session && (
        <main>
          <div className="session-info">
            <span>🌍 {language === 'japanese' ? 'Japanese' : 'Italian'}</span>
            <span>🎭 {gender === 'male' ? 'Male' : 'Female'} voice</span>
            <button className="end-btn" onClick={() => setSession(null)}>End Session</button>
          </div>

          <div className="messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`message ${msg.role}`}>
                <div className="text">{msg.text}</div>
                {msg.audioUrl && (
                  <audio controls src={msg.audioUrl} />
                )}
              </div>
            ))}
          </div>

          <div className="input-area">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type text to speak..."
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button onClick={handleSendMessage}>Send</button>
            
            <button 
              className={`record-btn ${isRecording ? 'recording' : ''}`}
              onClick={isRecording ? stopRecording : startRecording}
            >
              {isRecording ? '⏹️ Stop' : '🎙️ Record'}
            </button>
          </div>
        </main>
      )}
    </div>
  );
}

export default App;
