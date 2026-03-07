import { useState, useEffect } from 'react';

export function useShowFurigana(storageKey = 'speechPracticeShowFurigana', defaultValue = true) {
  const [showFurigana, setShowFurigana] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? saved === 'true' : defaultValue;
  });

  useEffect(() => {
    localStorage.setItem(storageKey, showFurigana.toString());
  }, [showFurigana, storageKey]);

  return [showFurigana, setShowFurigana] as const;
}
