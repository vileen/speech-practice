import { useState, useEffect, useCallback } from 'react';

interface UseFuriganaResult {
  furigana: string | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

const API_URL = (import.meta.env.VITE_API_URL || 'https://trunk-sticks-connect-currency.trycloudflare.com').replace(/\/$/, '');

export function useFurigana(text: string, enabled: boolean = true): UseFuriganaResult {
  const [furigana, setFurigana] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFurigana = useCallback(async () => {
    if (!text || !enabled) return;
    
    // Check if text has kanji
    const hasKanji = /[\u4e00-\u9faf]/.test(text);
    if (!hasKanji) {
      setFurigana(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const password = localStorage.getItem('speech_practice_password') || '';
      const response = await fetch(`${API_URL}/api/furigana`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Password': password,
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch furigana');
      }

      const data = await response.json();
      setFurigana(data.with_furigana);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setFurigana(null);
    } finally {
      setIsLoading(false);
    }
  }, [text, enabled]);

  useEffect(() => {
    fetchFurigana();
  }, [fetchFurigana]);

  return {
    furigana,
    isLoading,
    error,
    refresh: fetchFurigana,
  };
}
