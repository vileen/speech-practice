import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_URL } from '../config/api.js';
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

export function useLessonSession() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [language, setLanguage] = useState<'japanese' | 'italian'>('japanese');
  const [gender, setGender] = useState<'male' | 'female'>('female');
  const [voiceStyle, setVoiceStyle] = useState<'normal' | 'anime'>('normal');
  const [simpleMode, setSimpleMode] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeLesson, setActiveLesson] = useState<{id: string; title: string} | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);

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
      }).catch(() => {
        navigate('/lessons');
      });
    }
  }, [id, navigate]);

  const initializeLessonChat = useCallback(async (effectivePassword: string) => {
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
        setIsLoadingSession(false);
      }
    } catch (error) {
      console.error('Error initializing lesson chat:', error);
      setIsLoadingSession(false);
    }
  }, [language, gender]);

  // Initialize lesson chat when id is available
  useEffect(() => {
    if (id && password) {
      initializeLessonChat(password);
    }
  }, [id, password, initializeLessonChat]);

  return {
    id,
    password,
    session,
    language,
    gender,
    voiceStyle,
    simpleMode,
    messages,
    setMessages,
    activeLesson,
    isLoadingSession,
  };
}
