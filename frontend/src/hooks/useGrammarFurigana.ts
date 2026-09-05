import { useState, useEffect } from 'react';

const FURIGANA_STORAGE_KEY = 'grammar_show_furigana';

export function useGrammarFurigana(defaultValue: boolean = true): [boolean, (value: boolean) => void] {
  const [showFurigana, setShowFurigana] = useState(defaultValue);

  // Load furigana preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(FURIGANA_STORAGE_KEY);
    if (saved !== null) {
      setShowFurigana(saved === 'true');
    }
  }, []);

  // Save furigana preference to localStorage
  useEffect(() => {
    localStorage.setItem(FURIGANA_STORAGE_KEY, showFurigana.toString());
  }, [showFurigana]);

  return [showFurigana, setShowFurigana];
}
