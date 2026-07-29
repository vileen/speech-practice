import React, { useState } from 'react';
import { KanjiPracticeMode } from '../components/KanjiPracticeMode';
import { KanjiList } from '../components/KanjiList';

export const KanjiPracticePage: React.FC = () => {
  const [isPracticing, setIsPracticing] = useState(false);

  const handleStartPractice = () => {
    setIsPracticing(true);
  };

  const handleEndPractice = () => {
    setIsPracticing(false);
  };

  if (isPracticing) {
    return <KanjiPracticeMode onEndSession={handleEndPractice} />;
  }

  return <KanjiList onStartPractice={handleStartPractice} />;
};
