import React from 'react';
import { useVerbMode } from '../../hooks/useVerbMode.js';
import { SelectionScreen } from './SelectionScreen.js';
import { ExerciseScreen } from './ExerciseScreen.js';
import {
  Verb,
  ConjugationMap,
  PracticeType,
  AnswerMode,
  Exercise,
  FeedbackState,
  ExerciseState,
} from './types.js';
import './VerbMode.css';

export type { Verb, ConjugationMap, PracticeType, AnswerMode, Exercise, FeedbackState, ExerciseState };
export { ExerciseDisplay } from './ExerciseDisplay.js';
export { SelectionScreen } from './SelectionScreen.js';
export { ExerciseScreen } from './ExerciseScreen.js';

export const VerbMode: React.FC = () => {
  const {
    navigate,
    currentExercise,
    state,
    userAnswer,
    setUserAnswer,
    feedback,
    selectedPracticeType,
    setSelectedPracticeType,
    answerMode,
    setAnswerMode,
    selectedGroups,
    showFurigana,
    setShowFurigana,
    streak,
    score,
    loadNextExercise,
    handleSubmit,
    toggleGroup,
    selectAllGroups,
    deselectAllGroups,
  } = useVerbMode();

  if (state === 'selection') {
    return (
      <SelectionScreen
        navigate={navigate}
        selectedPracticeType={selectedPracticeType}
        setSelectedPracticeType={setSelectedPracticeType}
        answerMode={answerMode}
        setAnswerMode={setAnswerMode}
        selectedGroups={selectedGroups}
        toggleGroup={toggleGroup}
        selectAllGroups={selectAllGroups}
        deselectAllGroups={deselectAllGroups}
        showFurigana={showFurigana}
        setShowFurigana={setShowFurigana}
        streak={streak}
        score={score}
        loadNextExercise={loadNextExercise}
      />
    );
  }

  return (
    <ExerciseScreen
      navigate={navigate}
      currentExercise={currentExercise}
      state={state}
      userAnswer={userAnswer}
      setUserAnswer={setUserAnswer}
      feedback={feedback}
      selectedPracticeType={selectedPracticeType}
      answerMode={answerMode}
      showFurigana={showFurigana}
      setShowFurigana={setShowFurigana}
      streak={streak}
      loadNextExercise={loadNextExercise}
      handleSubmit={handleSubmit}
    />
  );
};

export default VerbMode;
