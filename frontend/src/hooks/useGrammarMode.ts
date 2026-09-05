import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGrammarCategorySelection } from './useGrammarCategorySelection.js';
import { useGrammarFurigana } from './useGrammarFurigana.js';
import { verifyAnswer } from '../lib/grammarAnswerVerification.js';
import * as grammarApi from '../lib/grammarApi.js';
import type {
  GrammarPattern,
  GrammarExercise,
  DiscriminationOption,
  DiscriminationAlert,
  ExerciseState,
  ReviewMode,
} from '../components/GrammarMode/types.js';

export function useGrammarMode() {
  const navigate = useNavigate();
  const { exerciseId } = useParams<{ exerciseId?: string }>();
  const [patterns, setPatterns] = useState<GrammarPattern[]>([]);
  const [currentPattern, setCurrentPattern] = useState<GrammarPattern | null>(null);
  const [exercise, setExercise] = useState<GrammarExercise | null>(null);
  const [state, setState] = useState<ExerciseState>('loading');
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<any>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [dueCount, setDueCount] = useState(0);
  const [duePatterns, setDuePatterns] = useState<GrammarPattern[]>([]);
  const [showFurigana, setShowFurigana] = useGrammarFurigana();
  const [comparisonPatterns, setComparisonPatterns] = useState<GrammarPattern[] | null>(null);
  const [discriminationAlert, setDiscriminationAlert] = useState<DiscriminationAlert | null>(null);
  const [reviewMode, setReviewMode] = useState<ReviewMode>('normal');
  const [confusionStats, setConfusionStats] = useState<{ patternId: number; count: number }[]>([]);
  const [showPatternGraph, setShowPatternGraph] = useState(false);
  const [returnToGraph, setReturnToGraph] = useState(false);
  const [reviewQueue, setReviewQueue] = useState<GrammarPattern[]>([]);
  const [reviewQueueIndex, setReviewQueueIndex] = useState(0);
  const [selectedDiscriminationOption, setSelectedDiscriminationOption] = useState<DiscriminationOption | null>(null);
  const [discriminationFeedback, setDiscriminationFeedback] = useState<{ isCorrect: boolean; explanation: string } | null>(null);

  const password = localStorage.getItem('speech_practice_password') || '';

  const {
    selectedCategories,
    activeGroup,
    expandedGroup,
    setExpandedGroup,
    toggleCategory,
    selectAllCategories,
    deselectAllCategories,
    clearCategorySelection,
    selectGroupCategories,
  } = useGrammarCategorySelection(categories);

  // Load patterns and stats on mount
  useEffect(() => {
    loadPatterns();
    loadDuePatterns();
    loadConfusionStats();
  }, []);

  // Load exercise from URL if exerciseId is present
  useEffect(() => {
    if (exerciseId && patterns.length > 0) {
      const id = parseInt(exerciseId, 10);
      if (!isNaN(id)) {
        loadExerciseById(id);
      }
    }
  }, [exerciseId, patterns]);

  // Reload due patterns count when selected categories change
  useEffect(() => {
    if (patterns.length > 0) {
      loadDuePatterns();
    }
  }, [selectedCategories]);

  // Keyboard shortcut: Space to submit or go to next
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== ' ') return;
      const activeElement = document.activeElement;
      if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
        return;
      }
      e.preventDefault();
      if (state === 'input' && userAnswer.trim()) {
        handleSubmit();
      } else if (state === 'feedback') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state, userAnswer]);

  const loadPatterns = async () => {
    try {
      const allPatterns = await grammarApi.fetchPatterns(password);
      setPatterns(allPatterns);
      const cats = [...new Set(allPatterns.map((p: GrammarPattern) => p.category))] as string[];
      setCategories(cats);
    } catch (err) {
      console.error('Failed to load patterns:', err);
    }
  };

  const loadDuePatterns = async () => {
    try {
      const data = await grammarApi.fetchDuePatterns(password);
      setDuePatterns(data.patterns);
      setDueCount(data.count);
    } catch (err) {
      console.error('Failed to load due patterns:', err);
    }
  };

  const loadConfusionStats = async () => {
    try {
      const stats = await grammarApi.fetchConfusionCounts(password, patterns);
      setConfusionStats(stats);
    } catch (err) {
      console.error('Failed to load confusion stats:', err);
    }
  };

  const resetExerciseInput = () => {
    setUserAnswer('');
    setDiscriminationAlert(null);
    setSelectedDiscriminationOption(null);
    setDiscriminationFeedback(null);
  };

  const startReview = async (useSelected: boolean = false, mixed: boolean = false) => {
    try {
      let patternsToReview: GrammarPattern[] = [];

      if (mixed) {
        patternsToReview = await grammarApi.fetchMixedReviewPatterns(password, selectedCategories);
        setReviewMode('mixed');
      } else if (useSelected && selectedCategories.length > 0) {
        patternsToReview = patterns.filter(p => selectedCategories.includes(p.category));
        patternsToReview = [...patternsToReview].sort(() => Math.random() - 0.5);
        setReviewMode('normal');
      } else {
        const data = await grammarApi.fetchDuePatterns(password);
        patternsToReview = data.patterns;
        setReviewMode('normal');
      }

      if (patternsToReview.length > 0) {
        setReviewQueue(patternsToReview);
        setReviewQueueIndex(0);
        const firstPattern = patternsToReview[0];
        setCurrentPattern(firstPattern);
        await loadExercise(firstPattern.id);
      } else {
        let message = 'No patterns available.';
        if (useSelected) {
          message = 'No patterns found in the selected categories.\n\nTry selecting different categories.';
        } else {
          const dueCategoriesList = duePatterns.map(p => p.category);
          const uniqueDueCategories = [...new Set(dueCategoriesList)];
          const categoryCounts = uniqueDueCategories.map(cat => {
            const count = duePatterns.filter(p => p.category === cat).length;
            return `${cat} (${count})`;
          });
          message = 'No patterns due for review.';
          if (duePatterns.length > 0 && categoryCounts.length > 0) {
            message += `\n\nThe ${duePatterns.length} due patterns are from:\n${categoryCounts.join(', ')}`;
          }
          message += '\n\nTry selecting different categories or browse patterns to learn new ones.';
        }
        alert(message);
      }
    } catch (err) {
      console.error('Failed to start review:', err);
    }
  };

  const startDiscriminationDrill = async () => {
    try {
      const eligiblePatterns = patterns.filter(p =>
        selectedCategories.includes(p.category) &&
        p.related_patterns &&
        p.related_patterns.length > 0
      );

      if (eligiblePatterns.length === 0) {
        alert('No patterns with relationships found in selected categories. Try selecting more categories.');
        return;
      }

      const basePattern = eligiblePatterns[Math.floor(Math.random() * eligiblePatterns.length)];
      setCurrentPattern(basePattern);
      await loadDiscriminationExercise(basePattern.id);
      setReviewMode('discrimination');
    } catch (err) {
      console.error('Failed to start discrimination drill:', err);
    }
  };

  const loadExercise = async (patternId: number) => {
    setState('loading');
    try {
      const exercise = await grammarApi.fetchPatternExercise(password, patternId);
      if (exercise) {
        setExercise(exercise);
        resetExerciseInput();
        setState('input');
        if (exercise.id) {
          navigate(`/grammar/${exercise.id}`, { replace: true });
        }
      }
    } catch (err) {
      console.error('Failed to load exercise:', err);
    }
  };

  const loadExerciseById = async (id: number) => {
    setState('loading');
    try {
      const exercise = await grammarApi.fetchExerciseById(password, id);
      if (exercise) {
        setExercise(exercise);
        const pattern = patterns.find(p => p.id === exercise.pattern_id);
        if (pattern) {
          setCurrentPattern(pattern);
        }
        resetExerciseInput();
        setState('input');
      } else {
        navigate('/grammar', { replace: true });
      }
    } catch (err) {
      console.error('Failed to load exercise by ID:', err);
      navigate('/grammar', { replace: true });
    }
  };

  const loadDiscriminationExercise = async (patternId: number) => {
    setState('loading');
    try {
      const exercise = await grammarApi.fetchDiscriminationExercise(password, patternId);
      if (exercise) {
        setExercise(exercise);
        resetExerciseInput();
        setState('discrimination_select');
      }
    } catch (err) {
      console.error('Failed to load discrimination exercise:', err);
    }
  };

  const startPattern = async (pattern: GrammarPattern) => {
    const patternsInCategories = selectedCategories.length > 0
      ? patterns.filter(p => selectedCategories.includes(p.category))
      : patterns;

    const shuffled = patternsInCategories
      .filter(p => p.id !== pattern.id)
      .sort(() => Math.random() - 0.5);
    const queue = [pattern, ...shuffled];

    setReviewQueue(queue);
    setReviewQueueIndex(0);

    if (pattern.isCounterGroup && pattern.pattern) {
      const variants = await grammarApi.fetchCounterVariants(password, pattern.pattern);
      if (variants.length > 0) {
        const randomVariant = variants[Math.floor(Math.random() * variants.length)];
        setCurrentPattern({
          ...randomVariant,
          base_form: pattern.pattern,
          variants: variants
        });
        await loadExercise(randomVariant.id);
        return;
      }
    }
    setCurrentPattern(pattern);
    await loadExercise(pattern.id);
  };

  const handleCompare = async (pattern: GrammarPattern) => {
    try {
      const related = await grammarApi.fetchRelatedPatterns(password, pattern.id);
      setComparisonPatterns([pattern, ...related].slice(0, 3));
    } catch (err) {
      console.error('Failed to load related patterns:', err);
    }
  };

  const handleDiscriminationSelect = async (option: DiscriminationOption, _pattern: GrammarPattern) => {
    setSelectedDiscriminationOption(option);
    setDiscriminationFeedback({
      isCorrect: option.is_correct,
      explanation: option.explanation
    });

    if (option.is_correct) {
      setTimeout(() => {
        setState('input');
      }, 2000);
    } else {
      if (currentPattern) {
        try {
          await grammarApi.postConfusion(password, {
            patternId: currentPattern.id,
            confusedWithPatternId: option.pattern_id,
            userSentence: `Discrimination error: selected ${option.pattern} instead of ${currentPattern.pattern}`
          });
          loadConfusionStats();
        } catch (err) {
          console.error('Failed to log confusion:', err);
        }
      }
    }
  };

  const handleSubmit = async () => {
    if (!userAnswer.trim()) return;

    setState('processing');

    const confusion = await grammarApi.checkConfusion(password, currentPattern?.id || 0, userAnswer);
    if (confusion) {
      setDiscriminationAlert(confusion);
    }

    const verification = verifyAnswer(userAnswer, exercise?.correct_answer || '');
    const isCorrect = verification.isCorrect;
    const result = isCorrect ? 'correct' : 'wrong';

    try {
      const data = await grammarApi.postProgress(password, {
        patternId: currentPattern?.id,
        exerciseId: exercise?.id,
        userSentence: userAnswer,
        result: result,
        confusedWithPatternId: confusion?.confusedWith?.id
      });

      if (data) {
        setFeedback({
          correct: isCorrect,
          userAnswer: userAnswer,
          correctAnswer: exercise?.correct_answer,
          progress: data.progress,
          confusion: confusion
        });
        setState('feedback');
        loadDuePatterns();
        loadConfusionStats();
      }
    } catch (err) {
      console.error('Failed to submit:', err);
      setState('input');
    }
  };

  const handleNext = () => {
    if (reviewMode === 'discrimination') {
      startDiscriminationDrill();
    } else if (reviewQueue.length > 0) {
      const nextIndex = (reviewQueueIndex + 1) % reviewQueue.length;
      setReviewQueueIndex(nextIndex);
      const nextPattern = reviewQueue[nextIndex];
      setCurrentPattern(nextPattern);
      loadExercise(nextPattern.id);
    } else if (currentPattern) {
      loadExercise(currentPattern.id);
    }
  };

  const handleHeaderBack = () => {
    if (currentPattern) {
      setCurrentPattern(null);
      setReviewMode('normal');
      setReviewQueue([]);
      setReviewQueueIndex(0);
      navigate('/grammar');
      if (returnToGraph) {
        setReturnToGraph(false);
        setShowPatternGraph(true);
      }
    } else {
      navigate('/');
    }
  };

  return {
    // Data
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
    reviewQueue,
    reviewQueueIndex,
    selectedDiscriminationOption,
    discriminationFeedback,
    // Category selection
    selectedCategories,
    activeGroup,
    expandedGroup,
    // Setters (for modal/inline UI that needs to set state directly)
    setExpandedGroup,
    setShowPatternGraph,
    setComparisonPatterns,
    setReturnToGraph,
    setShowFurigana,
    setUserAnswer,
    setDiscriminationAlert,
    // Actions
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
  };
}
