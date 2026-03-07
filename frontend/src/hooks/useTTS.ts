import { useCallback } from 'react';
import { API_URL } from '../config/api.js';

interface SessionData {
  language: string;
  voice_gender: string;
}

export function useTTS(voiceStyle: string) {
  const fetchTTS = useCallback(async (
    text: string, 
    sessionData?: SessionData,
    currentSession?: SessionData
  ): Promise<string | null> => {
    const activeSession = sessionData || currentSession;
    if (!activeSession) return null;

    const effectivePassword = localStorage.getItem('speech_practice_password') || '';
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
  }, [voiceStyle]);

  return { fetchTTS };
}
