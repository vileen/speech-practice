import { useState, useEffect } from 'react';

export function useVolume(storageKey = 'speechPracticeVolume', defaultValue = 0.8) {
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? parseFloat(saved) : defaultValue;
  });

  useEffect(() => {
    localStorage.setItem(storageKey, volume.toString());
  }, [volume, storageKey]);

  return [volume, setVolume] as const;
}
