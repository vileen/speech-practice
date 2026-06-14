import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config/api.js';
import { useVerbExercises } from './useVerbExercises.js';
import { useAnswerChecker } from './useAnswerChecker.js';
import {
  Verb,
  Exercise,
  PracticeType,
  AnswerMode,
  FeedbackState,
  ExerciseState,
  FORM_DESCRIPTIONS,
} from '../components/VerbMode/types.js';

const STORAGE_KEY = 'verb_practice_settings';
const FURIGANA_STORAGE_KEY = 'verb_show_furigana';

export function useVerbMode() {
  const navigate = useNavigate();
  const [verbs] = useState<Verb[]>([]);
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
  const [state, setState] = useState<ExerciseState>('selection');
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [selectedPracticeType, setSelectedPracticeType] = useState<PracticeType>('construction');
  const [answerMode, setAnswerMode] = useState<AnswerMode>('multiple-choice');
  const [selectedGroups, setSelectedGroups] = useState<string[]>(['I', 'II', 'III']);
  const [showFurigana, setShowFurigana] = useState(true);
  const [streak, setStreak] = useState(0);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  const { generateExercise } = useVerbExercises();
  const { checkAnswer } = useAnswerChecker();
  const password = localStorage.getItem('speech_practice_password') || '';

  // Load settings on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.practiceType) setSelectedPracticeType(parsed.practiceType);
        if (parsed.answerMode) setAnswerMode(parsed.answerMode);
        if (parsed.groups) setSelectedGroups(parsed.groups);
      } catch (e) {
        console.error('Failed to parse saved settings:', e);
      }
    }

    const savedFurigana = localStorage.getItem(FURIGANA_STORAGE_KEY);
    if (savedFurigana !== null) {
      setShowFurigana(savedFurigana === 'true');
    }
  }, []);

  // Save settings when they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      practiceType: selectedPracticeType,
      answerMode: answerMode,
      groups: selectedGroups,
    }));
  }, [selectedPracticeType, answerMode, selectedGroups]);

  useEffect(() => {
    localStorage.setItem(FURIGANA_STORAGE_KEY, showFurigana.toString());
  }, [showFurigana]);

  const loadRandomVerb = useCallback(async (): Promise<Verb | null> => {
    try {
      const response = await fetch(`${API_URL}/api/verbs/random?groups=${selectedGroups.join(',')}`, {
        headers: { 'X-Password': password }
      });
      if (response.ok) {
        const data = await response.json();
        return data.verb;
      }
    } catch (err) {
      console.error('Failed to load random verb:', err);
    }
    return null;
  }, [selectedGroups, password]);

  const loadNextExercise = useCallback(async () => {
    setState('loading');
    setUserAnswer('');
    setFeedback(null);

    const verb = await loadRandomVerb();
    if (verb) {
      const exercise = generateExercise(verb, selectedPracticeType, answerMode, verbs);
      setCurrentExercise(exercise);
      setState('input');
    }
  }, [loadRandomVerb, generateExercise, selectedPracticeType, answerMode, verbs]);

  const handleSubmit = useCallback(async () => {
    if (!userAnswer.trim() || !currentExercise) return;

    setState('processing');

    const { isCorrect } = checkAnswer(userAnswer, currentExercise.correctAnswer);

    // Send result to backend
    try {
      const response = await fetch(`${API_URL}/api/verbs/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Password': password
        },
        body: JSON.stringify({
          verbId: currentExercise.verb.id,
          fromForm: currentExercise.sourceForm || 'dictionary_form',
          toForm: currentExercise.targetForm,
          userAnswer: userAnswer,
          isCorrect,
        })
      });

      if (response.ok) {
        const data = await response.json();

        setScore(prev => ({
          correct: prev.correct + (isCorrect ? 1 : 0),
          total: prev.total + 1
        }));

        if (isCorrect) {
          setStreak(prev => prev + 1);
        } else {
          setStreak(0);
        }

        setFeedback({
          correct: isCorrect,
          userAnswer,
          correctAnswer: currentExercise.correctAnswer,
          explanation: FORM_DESCRIPTIONS[currentExercise.targetForm],
          streak: data.progress?.streak
        });
        setState('feedback');
      }
    } catch (err) {
      console.error('Failed to submit answer:', err);
      setScore(prev => ({
        correct: prev.correct + (isCorrect ? 1 : 0),
        total: prev.total + 1
      }));
      if (isCorrect) {
        setStreak(prev => prev + 1);
      } else {
        setStreak(0);
      }
      setFeedback({
        correct: isCorrect,
        userAnswer,
        correctAnswer: currentExercise.correctAnswer,
        explanation: FORM_DESCRIPTIONS[currentExercise.targetForm],
      });
      setState('feedback');
    }
  }, [userAnswer, currentExercise, checkAnswer, password]);

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
        loadNextExercise();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state, userAnswer, handleSubmit, loadNextExercise]);

  const toggleGroup = useCallback((group: string) => {
    setSelectedGroups(prev =>
      prev.includes(group)
        ? prev.filter(g => g !== group)
        : [...prev, group]
    );
  }, []);

  const selectAllGroups = useCallback(() => setSelectedGroups(['I', 'II', 'III']), []);
  const deselectAllGroups = useCallback(() => setSelectedGroups([]), []);

  return {
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
  };
}
