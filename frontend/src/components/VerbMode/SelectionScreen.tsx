import React from 'react';
import { Header } from '../Header/index.js';
import { PracticeType, AnswerMode } from './types.js';

interface SelectionScreenProps {
  navigate: (path: string) => void;
  selectedPracticeType: PracticeType;
  setSelectedPracticeType: (type: PracticeType) => void;
  answerMode: AnswerMode;
  setAnswerMode: (mode: AnswerMode) => void;
  selectedGroups: string[];
  toggleGroup: (group: string) => void;
  selectAllGroups: () => void;
  deselectAllGroups: () => void;
  showFurigana: boolean;
  setShowFurigana: (show: boolean) => void;
  streak: number;
  score: { correct: number; total: number };
  loadNextExercise: () => void;
}

export const SelectionScreen: React.FC<SelectionScreenProps> = ({
  navigate,
  selectedPracticeType,
  setSelectedPracticeType,
  answerMode,
  setAnswerMode,
  selectedGroups,
  toggleGroup,
  selectAllGroups,
  deselectAllGroups,
  showFurigana,
  setShowFurigana,
  streak,
  score,
  loadNextExercise,
}) => {
  return (
    <div className="app">
      <Header
        title="Verb Conjugation Practice"
        icon="🎯"
        onBack={() => navigate('/')}
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

      <main className="verb-mode-container">
        <div className="verb-selection">
          <div className="practice-type-section">
            <h3>Practice Type</h3>
            <div className="practice-type-options">
              <button
                className={`practice-type-btn ${selectedPracticeType === 'recognition' ? 'active' : ''}`}
                onClick={() => setSelectedPracticeType('recognition')}
              >
                <span className="btn-title">🧠 Recognition</span>
                <span className="btn-desc">"Which form is 食べて?"</span>
              </button>
              <button
                className={`practice-type-btn ${selectedPracticeType === 'construction' ? 'active' : ''}`}
                onClick={() => setSelectedPracticeType('construction')}
              >
                <span className="btn-title">🔨 Construction</span>
                <span className="btn-desc">"Conjugate 食べる to TE-form"</span>
              </button>
              <button
                className={`practice-type-btn ${selectedPracticeType === 'transformation' ? 'active' : ''}`}
                onClick={() => setSelectedPracticeType('transformation')}
              >
                <span className="btn-title">🔄 Transformation</span>
                <span className="btn-desc">"Change 食べる → 食べます"</span>
              </button>
            </div>
          </div>

          <div className="answer-mode-section">
            <h3>Answer Mode</h3>
            <div className="answer-mode-options">
              <button
                className={`answer-mode-btn ${answerMode === 'multiple-choice' ? 'active' : ''}`}
                onClick={() => setAnswerMode('multiple-choice')}
              >
                Multiple Choice
              </button>
              <button
                className={`answer-mode-btn ${answerMode === 'input' ? 'active' : ''}`}
                onClick={() => setAnswerMode('input')}
              >
                Type Answer
              </button>
            </div>
          </div>

          <div className="group-filter">
            <div className="group-filter-header">
              <h3>Verb Groups</h3>
              <div className="filter-actions">
                <button className="filter-btn" onClick={selectAllGroups}>All</button>
                <button className="filter-btn" onClick={deselectAllGroups}>None</button>
              </div>
            </div>
            <div className="group-checkboxes">
              {['I', 'II', 'III'].map(group => (
                <label key={group} className="group-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedGroups.includes(group)}
                    onChange={() => toggleGroup(group)}
                  />
                  <span className={`group-badge group-${group.toLowerCase()}`}>
                    Group {group}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {score.total > 0 && (
            <div className="practice-stats">
              <div className="stat-item">
                <span className="stat-label">Score</span>
                <span className="stat-value">{score.correct}/{score.total}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Accuracy</span>
                <span className="stat-value">{Math.round((score.correct / score.total) * 100)}%</span>
              </div>
              {streak > 0 && (
                <div className="stat-item streak">
                  <span className="stat-label">Streak</span>
                  <span className="stat-value">🔥 {streak}</span>
                </div>
              )}
            </div>
          )}

          <button
            className="start-practice-btn"
            onClick={loadNextExercise}
            disabled={selectedGroups.length === 0}
          >
            Start Practice →
          </button>
        </div>
      </main>
    </div>
  );
};
