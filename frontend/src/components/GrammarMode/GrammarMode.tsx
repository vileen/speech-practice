import React from 'react';
import { Header } from '../Header/index.js';
import { PatternGraph } from './PatternGraph.js';
import { ComparisonView } from './ComparisonView.js';
import { PatternSelection } from './PatternSelection.js';
import { ExerciseContainer } from './ExerciseContainer.js';
import { useGrammarMode } from '../../hooks/useGrammarMode.js';
import './GrammarMode.css';

// Re-export types for backward compatibility with existing imports
export type {
  GrammarPattern,
  GrammarExercise,
  DiscriminationOption,
  DiscriminationAlert,
} from './types.js';

export const GrammarMode: React.FC = () => {
  const {
    patterns,
    currentPattern,
    exercise,
    state,
    userAnswer,
    feedback,
    categories,
    dueCount,
    duePatterns,
    showFurigana,
    comparisonPatterns,
    discriminationAlert,
    reviewMode,
    confusionStats,
    showPatternGraph,
    returnToGraph,
    selectedDiscriminationOption,
    discriminationFeedback,
    selectedCategories,
    activeGroup,
    expandedGroup,
    setExpandedGroup,
    setShowPatternGraph,
    setComparisonPatterns,
    setReturnToGraph,
    setShowFurigana,
    setUserAnswer,
    toggleCategory,
    selectAllCategories,
    deselectAllCategories,
    clearCategorySelection,
    selectGroupCategories,
    startReview,
    startDiscriminationDrill,
    startPattern,
    handleCompare,
    handleDiscriminationSelect,
    handleSubmit,
    handleNext,
    handleHeaderBack,
  } = useGrammarMode();

  return (
    <div className="grammar-mode">
      <Header
        title="Grammar Drills"
        icon="📚"
        onBack={currentPattern || dueCount > 0 ? handleHeaderBack : undefined}
        showBackButton={true}
        actions={
          <>
            {!currentPattern && (
              <div className="grammar-stats">
                {dueCount > 0 && (
                  <span className="due-badge">{dueCount} due</span>
                )}
                <span>{patterns.length} patterns</span>
              </div>
            )}
            <button
              className="furigana-toggle"
              onClick={() => setShowFurigana(!showFurigana)}
              title={showFurigana ? 'Hide furigana' : 'Show furigana'}
            >
              {showFurigana ? 'あ' : '漢'}
            </button>
          </>
        }
      />

      {/* Comparison Modal */}
      {comparisonPatterns && (
        <ComparisonView
          patterns={comparisonPatterns}
          showFurigana={showFurigana}
          onClose={() => {
            setComparisonPatterns(null);
            if (returnToGraph) {
              setReturnToGraph(false);
              setShowPatternGraph(true);
            }
          }}
          onSelectPattern={(pattern) => {
            setComparisonPatterns(null);
            setReturnToGraph(false);
            startPattern(pattern);
          }}
        />
      )}

      {/* Pattern Graph Modal */}
      {showPatternGraph && (
        <PatternGraph
          patterns={patterns}
          confusionStats={confusionStats}
          onSelectPattern={(pattern) => {
            setShowPatternGraph(false);
            setReturnToGraph(false);
            startPattern(pattern);
          }}
          onComparePatterns={(pats) => {
            setShowPatternGraph(false);
            setReturnToGraph(true);
            setComparisonPatterns(pats);
          }}
          onClose={() => setShowPatternGraph(false)}
        />
      )}

      {!currentPattern ? (
        <PatternSelection
          patterns={patterns}
          categories={categories}
          selectedCategories={selectedCategories}
          dueCount={dueCount}
          duePatterns={duePatterns}
          confusionStats={confusionStats}
          showFurigana={showFurigana}
          expandedGroup={expandedGroup}
          activeGroup={activeGroup}
          onToggleCategory={toggleCategory}
          onSelectAll={selectAllCategories}
          onDeselectAll={deselectAllCategories}
          onClearSelection={clearCategorySelection}
          onSelectGroup={selectGroupCategories}
          onToggleGroupAccordion={() => setExpandedGroup(expandedGroup === 'groups' ? null : 'groups')}
          onStartReview={startReview}
          onStartDiscrimination={startDiscriminationDrill}
          onShowPatternGraph={() => setShowPatternGraph(true)}
          onStartPattern={startPattern}
          onComparePattern={handleCompare}
        />
      ) : (
        <ExerciseContainer
          currentPattern={currentPattern}
          exercise={exercise}
          state={state}
          userAnswer={userAnswer}
          feedback={feedback}
          showFurigana={showFurigana}
          reviewMode={reviewMode}
          discriminationAlert={discriminationAlert}
          selectedDiscriminationOption={selectedDiscriminationOption}
          discriminationFeedback={discriminationFeedback}
          patterns={patterns}
          onUserAnswerChange={setUserAnswer}
          onSubmit={handleSubmit}
          onNext={handleNext}
          onCompare={handleCompare}
          onDiscriminationSelect={handleDiscriminationSelect}
          onSetComparisonPatterns={setComparisonPatterns}
        />
      )}
    </div>
  );
};

export default GrammarMode;
