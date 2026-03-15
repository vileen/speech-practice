import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthenticatedRoute } from '../App.js';
import { API_URL, getPassword } from '../config/api.js';
import { translateLessonTitle } from '../translations.js';
import { AudioPlayer } from '../components/AudioPlayer/index.js';
import { VoiceRecorder } from '../components/VoiceRecorder/index.js';
import { HighlightedText } from '../components/HighlightedText/index.js';
import { useVolume } from '../hooks/useVolume.js';
import { useShowFurigana } from '../hooks/useShowFurigana.js';
import { useTTS } from '../hooks/useTTS.js';
import { useChatSession } from '../hooks/useChatSession.js';

export function ChatSession() {
  const navigate = useNavigate();
  const {
    session,
    language,
    voiceStyle,
    messages,
    setMessages,
    isLoadingSession,
    clearSession,
  } = useChatSession();

  const [volume] = useVolume();
  const [showFurigana, setShowFurigana] = useShowFurigana();
  const { fetchTTS } = useTTS(voiceStyle);
  
  const [inputText, setInputText] = useState('');
  const [recordingMode] = useState<'push-to-talk' | 'voice-activated'>('push-to-talk');
  const [isListening, setIsListening] = useState(false);
  const [playingAudio, setPlayingAudio] = useState<{id: number, audio: HTMLAudioElement} | null>(null);
  const [activeLesson] = useState<{id: string; title: string} | null>(null);

  // Get furigana for text
  const getFurigana = useCallback(async (text: string): Promise<string> => {
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
  }, []);

  const generateTTS = useCallback(async (text: string) => {
    if (!session) return;
    
    const withFurigana = language === 'japanese' ? await getFurigana(text) : text;
    
    const translations: Record<string, Record<string, string>> = {
      japanese: {
        'はい、理解しました。続けてください。': 'Yes, I understand. Please continue.',
      },
    };
    const translation = translations[session.language]?.[text];
    
    setMessages(prev => [...prev, { 
      role: 'assistant', 
      text, 
      translation,
      showTranslation: false,
      withFurigana,
    }]);
  }, [session, language, getFurigana, setMessages]);

  const generateAIResponse = useCallback(async (userText: string) => {
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
  }, [session, fetchTTS, setMessages]);

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    generateTTS(inputText);
    setInputText('');
  };

  const handleEndSession = () => {
    if (playingAudio?.audio) {
      playingAudio.audio.pause();
      playingAudio.audio.currentTime = 0;
    }
    setPlayingAudio(null);
    clearSession();
    navigate('/');
  };

  if (isLoadingSession) {
    return (
      <div className="login-container">
        <h1>Speech Practice</h1>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <AuthenticatedRoute>
      <div className="app">
        <header>
          <h1>Speech Practice</h1>
        </header>

        {session && (
          <main>
            <div className="session-info">
              <div className="session-left">
                <span>{'Japanese'}</span>
                {activeLesson && (
                  <span className="active-lesson">{translateLessonTitle(activeLesson.title)}</span>
                )}
              </div>
              <div className="session-right">
                {language === 'japanese' && (
                  <label className="furigana-toggle">
                    <input
                      type="checkbox"
                      checked={showFurigana}
                      onChange={(e) => setShowFurigana(e.target.checked)}
                    />
                    <span>Furigana</span>
                  </label>
                )}
                <button className="end-btn" onClick={handleEndSession}>End</button>
              </div>
            </div>

            <div className="messages">
              {messages.map((msg, idx) => (
                <div key={idx} className={`message ${msg.role}`}>
                  <div className="message-header">
                    <span className="role-badge">{msg.role === 'user' ? 'You' : 'Teacher'}</span>
                  </div>
                  <div className="text">
                    <div className="jp-text">
                      {showFurigana && msg.withFurigana && !playingAudio?.audio ? (
                        <span dangerouslySetInnerHTML={{ __html: msg.withFurigana }} />
                      ) : playingAudio?.audio && playingAudio?.id === idx ? (
                        <HighlightedText
                          text={msg.text}
                          audioElement={playingAudio.audio}
                          isPlaying={true}
                        />
                      ) : (
                        msg.text
                      )}
                    </div>
                  </div>
                  {msg.audioUrl && (
                    <AudioPlayer 
                      audioUrl={msg.audioUrl}
                      volume={volume}
                      isActive={playingAudio?.id === idx}
                      onPlay={(audio) => setPlayingAudio({ id: idx, audio })}
                      onStop={() => setPlayingAudio(null)}
                      onStopOthers={() => {}}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="input-area">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type your message..."
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <button onClick={handleSendMessage}>Send</button>
            </div>
            
            <VoiceRecorder
              mode={recordingMode}
              isListening={isListening}
              onStartListening={() => setIsListening(true)}
              onStopListening={() => setIsListening(false)}
              onRecordingComplete={async (audioBlob: Blob) => {
                const transcription = "[Voice message]";
                generateAIResponse(transcription);
                console.log('Recording complete', audioBlob);
              }}
            />
          </main>
        )}
      </div>
    </AuthenticatedRoute>
  );
}
