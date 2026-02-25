import { useState, useCallback } from 'react';

const API_URL = (import.meta.env.VITE_API_URL || 'https://trunk-sticks-connect-currency.trycloudflare.com').replace(/\/$/, '');

interface PronunciationResult {
  target_text: string;
  transcription: string;
  score: number;
  feedback: string;
  text_with_furigana: string;
  errors?: string[];
}

interface UsePronunciationCheckResult {
  result: PronunciationResult | null;
  isChecking: boolean;
  error: string | null;
  check: (audioBlob: Blob, targetText: string, language: string) => Promise<void>;
  clear: () => void;
}

export function usePronunciationCheck(): UsePronunciationCheckResult {
  const [result, setResult] = useState<PronunciationResult | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const check = useCallback(async (audioBlob: Blob, targetText: string, language: string) => {
    setIsChecking(true);
    setError(null);

    try {
      const password = localStorage.getItem('speech_practice_password') || '';
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('target_text', targetText);
      formData.append('language', language);

      const response = await fetch(`${API_URL}/api/pronunciation`, {
        method: 'POST',
        headers: {
          'X-Password': password,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Pronunciation check failed');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setResult(null);
    } finally {
      setIsChecking(false);
    }
  }, []);

  const clear = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return {
    result,
    isChecking,
    error,
    check,
    clear,
  };
}
