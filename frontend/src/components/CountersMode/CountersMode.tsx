import { useCountersMode } from './useCountersMode';
import { CounterMenu } from './CounterMenu';
import { CounterStudy } from './CounterStudy';
import { CounterTable } from './CounterTable';
import { CounterQuiz } from './CounterQuiz';
import { CounterMixedQuiz } from './CounterMixedQuiz';
import './CountersMode.css';

export function CountersMode() {
  const {
    navigate,
    mode,
    setMode,
    counterGroups,
    selectedGroup,
    currentPattern,
    setCurrentPattern,
    showAnswer,
    setShowAnswer,
    loading,
    quizQuestion,
    mixedQuestions,
    currentQuestionIndex,
    selectedGroups,
    startStudy,
    startQuiz,
    handleAnswer,
    toggleGroupSelection,
    startSelectedQuiz,
    startMixedQuiz,
  } = useCountersMode();

  if (mode === 'menu') {
    return (
      <CounterMenu
        counterGroups={counterGroups}
        selectedGroups={selectedGroups}
        loading={loading}
        onStartStudy={startStudy}
        onToggleGroupSelection={toggleGroupSelection}
        onStartMixedQuiz={startMixedQuiz}
        onStartSelectedQuiz={startSelectedQuiz}
        onNavigateBack={() => navigate('/')}
      />
    );
  }

  if (mode === 'study' && selectedGroup && currentPattern) {
    return (
      <CounterStudy
        selectedGroup={selectedGroup}
        currentPattern={currentPattern}
        onSetMode={setMode}
        onStartQuiz={startQuiz}
        onSetCurrentPattern={setCurrentPattern}
      />
    );
  }

  if (mode === 'table' && selectedGroup) {
    return (
      <CounterTable
        selectedGroup={selectedGroup}
        onSetMode={setMode}
        onStartQuiz={startQuiz}
      />
    );
  }

  if (mode === 'quiz' && selectedGroup && quizQuestion) {
    return (
      <CounterQuiz
        selectedGroup={selectedGroup}
        quizQuestion={quizQuestion}
        showAnswer={showAnswer}
        onSetMode={setMode}
        onSetShowAnswer={setShowAnswer}
        onHandleAnswer={handleAnswer}
      />
    );
  }

  if ((mode === 'mixed' || mode === 'category-quiz') && mixedQuestions.length > 0) {
    return (
      <CounterMixedQuiz
        mode={mode}
        mixedQuestions={mixedQuestions}
        currentQuestionIndex={currentQuestionIndex}
        showAnswer={showAnswer}
        onSetMode={setMode}
        onSetShowAnswer={setShowAnswer}
        onHandleAnswer={handleAnswer}
      />
    );
  }

  return null;
}
