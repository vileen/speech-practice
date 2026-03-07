import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthenticatedRoute } from '../App.js';
import { API_URL, getPassword } from '../config/api.js';
import type { Session } from '../types/index.js';
import { translateLessonTitle } from '../translations.js';
import { HighlightedText } from '../components/HighlightedText.js';
import { AudioPlayer } from '../components/AudioPlayer.js';
import { VoiceRecorder } from '../components/VoiceRecorder.js';

export function LessonPractice() {
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
        setActiveLesson({ id: id || '', title: '' });
      }
    } else {
      setActiveLesson({ id: id || '', title: '' });
    }

    if (id) {
      fetch(`${API_URL}/api/lessons/${id}`, {
        headers: { 'X-Password': savedPassword }
      }).then(r => r.json()).then(lessonData => {
        setActiveLesson(prev => prev ? { ...prev, title: lessonData.title || '' } : { id: id || '', title: lessonData.title || '' });
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

  const initializeLessonChat = async (lessonId: string, effectivePassword: string, _lessonTitle: string) => {
    try {
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
    if (!inputText.trim()) return;
    generateAIResponse(inputText, language);
    setInputText('');
  };

  const handleBack = () => {
    navigate(`/lessons/${id}/setup`);
  };

  const handleEndSession = () => {
    if (playingAudio?.audio) {
      playingAudio.audio.pause();
      playingAudio.audio.currentTime = 0;
    }
    setPlayingAudio(null);
    navigate('/lessons');
  };

  if (isLoadingSession) {
    return (
      <div className="login-container">
        <h1>🎤 Speech Practice</h1>
        <p>Loading lesson...</p>
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
