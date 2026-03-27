import { useState, useRef, useCallback } from 'react';
import { API_URL } from '../config/api.js';

export interface ListeningPassage {
  id: number;
  title: string;
  level: string;
  audio_url: string;
  duration_seconds: number | null;
  difficulty_speed: string | null;
  topic_category: string | null;
  created_at: string;
}

export interface ListeningQuestion {
  id: number;
  passage_id: number;
  question_text: string;
  question_type: 'main_idea' | 'detail' | 'inference';
  options: string[];
  correct_answer: number;
  explanation: string;
}

export interface AnswerResult {
  questionId: number;
  selectedOption: number;
  isCorrect: boolean;
  correctAnswer: number;
  explanation: string;
  questionType: string;
}

export interface QuizResult {
  score: number;
  correctCount: number;
  totalQuestions: number;
  results: AnswerResult[];
  listeningTimeSeconds: number | null;
}

export function useListeningMode() {
  const [passages, setPassages] = useState<ListeningPassage[]>([]);
  const [currentPassage, setCurrentPassage] = useState<ListeningPassage | null>(null);
  const [questions, setQuestions] = useState<ListeningQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<QuizResult | null>(null);
  const [transcript, setTranscript] = useState<{ transcript: string; japaneseText: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const startTimeRef = useRef<Date | null>(null);
  const password = localStorage.getItem('speech_practice_password') || '';

  // Fetch all passages
  const fetchPassages = useCallback(async (level?: string) => {
    setLoading(true);
    setError(null);
    try {
      const url = level 
        ? `${API_URL}/api/listening/passages?level=${level}`
        : `${API_URL}/api/listening/passages`;
      
      const response = await fetch(url, {
        headers: { 'X-Password': password }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch passages');
      }
      
      const data = await response.json();
      setPassages(data.passages || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [password]);

  // Fetch a specific passage and its questions
  const fetchPassage = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      // Fetch passage
      const passageResponse = await fetch(`${API_URL}/api/listening/passages/${id}`, {
        headers: { 'X-Password': password }
      });
      
      if (!passageResponse.ok) {
        throw new Error('Failed to fetch passage');
      }
      
      const passageData = await passageResponse.json();
      setCurrentPassage(passageData.passage);
      
      // Fetch questions
      const questionsResponse = await fetch(`${API_URL}/api/listening/passages/${id}/questions`, {
        headers: { 'X-Password': password }
      });
      
      if (!questionsResponse.ok) {
        throw new Error('Failed to fetch questions');
      }
      
      const questionsData = await questionsResponse.json();
      setQuestions(questionsData.questions || []);
      
      // Reset state
      setAnswers({});
      setResult(null);
      setTranscript(null);
      startTimeRef.current = new Date();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [password]);

  // Select an answer
  const selectAnswer = useCallback((questionId: number, optionIndex: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  }, []);

  // Submit answers
  const submitAnswers = useCallback(async () => {
    if (!currentPassage || !startTimeRef.current) return;
    
    const endTime = new Date();
    
    const answersArray = Object.entries(answers).map(([questionId, selectedOption]) => ({
      questionId: parseInt(questionId),
      selectedOption,
    }));
    
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/listening/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Password': password
        },
        body: JSON.stringify({
          passageId: currentPassage.id,
          answers: answersArray,
          startTime: startTimeRef.current.toISOString(),
          endTime: endTime.toISOString()
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit answers');
      }
      
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [currentPassage, answers, password]);

  // Fetch transcript (after quiz completion)
  const fetchTranscript = useCallback(async () => {
    if (!currentPassage) return;
    
    try {
      const response = await fetch(`${API_URL}/api/listening/passages/${currentPassage.id}/transcript`, {
        headers: { 'X-Password': password }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch transcript');
      }
      
      const data = await response.json();
      setTranscript(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, [currentPassage, password]);

  // Reset state
  const reset = useCallback(() => {
    setCurrentPassage(null);
    setQuestions([]);
    setAnswers({});
    setResult(null);
    setTranscript(null);
    startTimeRef.current = null;
    setError(null);
  }, []);

  return {
    passages,
    currentPassage,
    questions,
    answers,
    result,
    transcript,
    loading,
    error,
    fetchPassages,
    fetchPassage,
    selectAnswer,
    submitAnswers,
    fetchTranscript,
    reset,
  };
}
