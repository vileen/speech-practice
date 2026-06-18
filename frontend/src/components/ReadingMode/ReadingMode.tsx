import React from 'react';
import { Header } from '../Header/index.js';
import { useReadingMode } from './useReadingMode.js';
import { PassageList } from './PassageList.js';
import { ReadingView } from './ReadingView.js';
import { QuestionsView } from './QuestionsView.js';
import { ResultsView } from './ResultsView.js';
import './ReadingMode.css';

export const ReadingMode: React.FC = () => {
  const {
    viewState,
    passages,
    currentPassage,
    questions,
    selectedLevel,
    showFurigana,
    answers,
    result,
    loading,
    setSelectedLevel,
    setShowFurigana,
    startReading,
    handleAnswerSelect,
    submitAnswers,
    goToNextPassage,
    goBack,
    goToQuestions,
  } = useReadingMode();

  return (
    <div className="app">
      <Header
        title="Reading Practice"
        icon="📖"
        onBack={viewState !== 'list' ? goBack : undefined}
        showBackButton={true}
        actions={
          <button
            className="furigana-toggle"
            onClick={() => setShowFurigana(!showFurigana)}
            title={showFurigana ? 'Hide furigana' : 'Show furigana'}
          >
            {showFurigana ? 'あ' : '漢'}
          </button>
        }
      />
      
      <main className="reading-mode-container">
        {viewState === 'list' && (
          <PassageList
            passages={passages}
            selectedLevel={selectedLevel}
            loading={loading}
            onLevelChange={setSelectedLevel}
            onPassageSelect={startReading}
          />
        )}
        {viewState === 'reading' && currentPassage && (
          <ReadingView
            passage={currentPassage}
            showFurigana={showFurigana}
            onContinue={goToQuestions}
          />
        )}
        {viewState === 'questions' && currentPassage && (
          <QuestionsView
            questions={questions}
            answers={answers}
            showFurigana={showFurigana}
            onAnswerSelect={handleAnswerSelect}
            onBack={goBack}
            onSubmit={submitAnswers}
          />
        )}
        {viewState === 'results' && result && currentPassage && (
          <ResultsView
            result={result}
            questions={questions}
            showFurigana={showFurigana}
            onBack={goBack}
            onNext={goToNextPassage}
          />
        )}
      </main>
    </div>
  );
};

export default ReadingMode;
