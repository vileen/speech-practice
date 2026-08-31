import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../config/api.js';
import type { CounterPattern, CounterGroup, Mode, QuizQuestion } from './types';

export function useCountersMode() {
  const navigate = useNavigate();
  const password = localStorage.getItem('speech_practice_password') || '';

  const [mode, setMode] = useState<Mode>('menu');
  const [counterGroups, setCounterGroups] = useState<CounterGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<CounterGroup | null>(null);
  const [currentPattern, setCurrentPattern] = useState<CounterPattern | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);

  // Quiz state
  const [quizQuestion, setQuizQuestion] = useState<QuizQuestion | null>(null);

  // Mixed quiz state
  const [mixedQuestions, setMixedQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Category selection state
  const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadCounterGroups();
  }, []);

  const loadCounterGroups = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/counters/groups`, {
        headers: { 'X-Password': password }
      });
      if (response.ok) {
        const data = await response.json();
        setCounterGroups(data.groups);
      }
    } catch (err) {
      console.error('Failed to load counters:', err);
    } finally {
      setLoading(false);
    }
  };

  const getQuestionText = (pattern: CounterPattern, group: CounterGroup): string => {
    // Use example English if available
    const ex = pattern.examples?.[0];
    if (ex?.en) {
      return `How do you say: "${ex.en}"?`;
    }
    // Fallback to group description + pattern
    return `What is the reading for ${group.counts}?`;
  };

  const startStudy = (group: CounterGroup) => {
    setSelectedGroup(group);
    setMode('study');
    if (group.patterns.length > 0) {
      setCurrentPattern(group.patterns[0]);
    }
  };

  const startQuiz = () => {
    setMode('quiz');
    pickRandomQuestion();
  };

  const pickRandomQuestion = useCallback(() => {
    if (selectedGroup) {
      const random = selectedGroup.patterns[Math.floor(Math.random() * selectedGroup.patterns.length)];
      setCurrentPattern(random);
      setQuizQuestion({
        pattern: random,
        group: selectedGroup,
        questionText: getQuestionText(random, selectedGroup)
      });
      setShowAnswer(false);
    }
  }, [selectedGroup]);

  const handleAnswer = (_known: boolean) => {
    if (mode === 'mixed' || mode === 'category-quiz') {
      nextMixedQuestion();
    } else {
      pickRandomQuestion();
    }
  };

  // Toggle group selection for category quiz
  const toggleGroupSelection = (baseForm: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedGroups(prev => {
      const next = new Set(prev);
      if (next.has(baseForm)) {
        next.delete(baseForm);
      } else {
        next.add(baseForm);
      }
      return next;
    });
  };

  // Start quiz from selected groups only
  const startSelectedQuiz = () => {
    const questions: QuizQuestion[] = [];
    const targetCount = 20;

    const selectedPatterns: { pattern: CounterPattern; group: CounterGroup }[] = [];
    counterGroups.forEach(group => {
      if (selectedGroups.has(group.baseForm)) {
        group.patterns.forEach(pattern => {
          selectedPatterns.push({ pattern, group });
        });
      }
    });

    const shuffled = selectedPatterns.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(targetCount, shuffled.length));

    selected.forEach(({ pattern, group }) => {
      questions.push({
        pattern,
        group,
        questionText: getQuestionText(pattern, group)
      });
    });

    setMixedQuestions(questions);
    setCurrentQuestionIndex(0);
    setMode('category-quiz');
    setShowAnswer(false);
  };

  // Generate mixed quiz questions from all groups
  const startMixedQuiz = () => {
    const questions: QuizQuestion[] = [];
    const targetCount = 20;

    // Get all available patterns from all groups
    const allPatterns: { pattern: CounterPattern; group: CounterGroup }[] = [];
    counterGroups.forEach(group => {
      group.patterns.forEach(pattern => {
        allPatterns.push({ pattern, group });
      });
    });

    // Shuffle and pick 20 (or all if less than 20)
    const shuffled = allPatterns.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(targetCount, shuffled.length));

    selected.forEach(({ pattern, group }) => {
      questions.push({
        pattern,
        group,
        questionText: getQuestionText(pattern, group)
      });
    });

    setMixedQuestions(questions);
    setCurrentQuestionIndex(0);
    setMode('mixed');
    setShowAnswer(false);
  };

  const nextMixedQuestion = () => {
    if (currentQuestionIndex < mixedQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setShowAnswer(false);
    } else {
      setMode('menu');
    }
  };

  return {
    // Navigation
    navigate,
    // State
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
    // Actions
    startStudy,
    startQuiz,
    handleAnswer,
    toggleGroupSelection,
    startSelectedQuiz,
    startMixedQuiz,
    nextMixedQuestion,
  };
}
