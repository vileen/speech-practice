import { useState, useEffect, useCallback } from 'react';
import { API_URL } from '../../config/api.js';
import { Passage, Question, ReadingResult, ViewState } from './types.js';
import { FURIGANA_STORAGE_KEY } from './constants.js';

export function useReadingMode() {
  const [viewState, setViewState] = useState<ViewState>('list');
  const [passages, setPassages] = useState<Passage[]>([]);
  const [currentPassage, setCurrentPassage] = useState<Passage | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [showFurigana, setShowFurigana] = useState(true);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<ReadingResult | null>(null);
  const [loading, setLoading] = useState(false);

  const password = localStorage.getItem('speech_practice_password') || '';

  // Load furigana preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(FURIGANA_STORAGE_KEY);
    if (saved !== null) {
      setShowFurigana(saved === 'true');
    }
  }, []);

  // Save furigana preference to localStorage
  useEffect(() => {
    localStorage.setItem(FURIGANA_STORAGE_KEY, showFurigana.toString());
  }, [showFurigana]);

  const loadPassages = useCallback(async () => {
    setLoading(true);
    try {
      const url = selectedLevel 
        ? `${API_URL}/api/reading/passages?level=${selectedLevel}`
        : `${API_URL}/api/reading/passages`;
      
      const response = await fetch(url, {
        headers: { 'X-Password': password }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPassages(data.passages || []);
      }
    } catch (err) {
      console.error('Failed to load passages:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedLevel, password]);

  // Load passages on mount and when level filter changes
  useEffect(() => {
    loadPassages();
  }, [loadPassages]);

  const startReading = useCallback(async (passage: Passage) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/reading/passages/${passage.id}`, {
        headers: { 'X-Password': password }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCurrentPassage(data.passage);
        setQuestions(data.questions || []);
        setStartTime(new Date());
        setAnswers({});
        setSubmitted(false);
        setResult(null);
        setViewState('reading');
      }
    } catch (err) {
      console.error('Failed to load passage:', err);
    } finally {
      setLoading(false);
    }
  }, [password]);

  const handleAnswerSelect = useCallback((questionId: number, optionIndex: number) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  }, [submitted]);

  const submitAnswers = useCallback(async () => {
    if (!currentPassage || !startTime) return;
    
    // Check if all questions are answered
    const unansweredQuestions = questions.filter(q => answers[q.id] === undefined);
    if (unansweredQuestions.length > 0) {
      if (!window.confirm(`You have ${unansweredQuestions.length} unanswered question(s). Submit anyway?`)) {
        return;
      }
    }
    
    const endTime = new Date();
    
    const answersArray = Object.entries(answers).map(([questionId, selectedOption]) => ({
      questionId: parseInt(questionId),
      selectedOption,
    }));
    
    try {
      const response = await fetch(`${API_URL}/api/reading/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Password': password
        },
        body: JSON.stringify({
          passageId: currentPassage.id,
          answers: answersArray,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString()
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setResult(data);
        setSubmitted(true);
        setViewState('results');
      }
    } catch (err) {
      console.error('Failed to submit answers:', err);
    }
  }, [currentPassage, startTime, questions, answers, password]);

  const goToNextPassage = useCallback(() => {
    if (!currentPassage) return;
    
    const currentIndex = passages.findIndex(p => p.id === currentPassage.id);
    const nextPassage = passages[currentIndex + 1];
    
    if (nextPassage) {
      startReading(nextPassage);
    } else {
      setViewState('list');
      setCurrentPassage(null);
    }
  }, [currentPassage, passages, startReading]);

  const goToQuestions = useCallback(() => {
    setViewState('questions');
  }, []);

  const goBack = useCallback(() => {
    if (viewState === 'reading') setViewState('list');
    else if (viewState === 'questions') setViewState('reading');
    else if (viewState === 'results') setViewState('list');
  }, [viewState]);

  return {
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
    goToQuestions,
    goBack,
  };
}
