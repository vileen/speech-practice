import { useState, useEffect, useCallback } from 'react';
import { API_URL } from '../config/api.js';import { useNavigate, useLocation } from 'react-router-dom';
import type { Session } from '../types/index.js';

interface ChatMessage {
  id?: number;
  role: string;
  text: string;
  audioUrl?: string;
  showTranslation?: boolean;
  translation?: string;
  withFurigana?: string;
  romaji?: string;
  isLoading?: boolean;
  isTyping?: boolean;
  isTranslating?: boolean;
}

export function useChatSession() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [password, setPassword] = useState('');
  const [session, setSession] = useState<Session | null>(null);
  const [language, setLanguage] = useState<'japanese'>('japanese');
  const [gender, setGender] = useState<'male' | 'female'>('female');
  const [voiceStyle, setVoiceStyle] = useState<'normal' | 'anime'>('normal');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  // Load session on mount
  useEffect(() => {
    const savedPassword = localStorage.getItem('speech_practice_password') || '';
    setPassword(savedPassword);

    if (location.state?.session) {
      setSession(location.state.session);
      setLanguage(location.state.language || 'japanese');
      setGender(location.state.gender || 'female');
      setVoiceStyle(location.state.voiceStyle || 'normal');
      setIsLoadingSession(false);
    } else {
      const savedSession = localStorage.getItem('speech_practice_session');
      if (savedSession) {
        try {
          const parsed = JSON.parse(savedSession);
          setSession(parsed.session);
          setLanguage(parsed.language || 'japanese');
          setGender(parsed.gender || 'female');
          setVoiceStyle(parsed.voiceStyle || 'normal');
          
          const savedMessages = localStorage.getItem('speech_practice_messages');
          if (savedMessages) {
            setMessages(JSON.parse(savedMessages));
          } else {
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

  // Save session to localStorage
  useEffect(() => {
    if (session) {
      localStorage.setItem('speech_practice_session', JSON.stringify({ session, language, gender, voiceStyle }));
    }
  }, [session, language, gender, voiceStyle]);

  // Save messages to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('speech_practice_messages', JSON.stringify(messages));
    }
  }, [messages]);

  const fetchSessionHistory = useCallback(async (sessionId: number, pwd: string) => {
    try {
      const response = await fetch(`${API_URL}/api/sessions/${sessionId}`, {
        headers: { 'X-Password': pwd },
      });
      if (response.ok) {
        const data = await response.json();
        const loadedMessages = data.messages.map((m: any) => ({
          id: m.id,
          role: m.role,
          text: m.content,
          withFurigana: m.content,
        }));
        setMessages(loadedMessages);
        localStorage.setItem('speech_practice_messages', JSON.stringify(loadedMessages));
      }
    } catch (error) {
      console.error('Error fetching session history:', error);
    }
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem('speech_practice_session');
    localStorage.removeItem('speech_practice_messages');
  }, []);

  return {
    password,
    session,
    language,
    gender,
    voiceStyle,
    messages,
    setMessages,
    isLoadingSession,
    clearSession,
  };
}
