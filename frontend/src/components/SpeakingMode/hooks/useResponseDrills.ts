import { useState, useEffect, useRef } from 'react';
import { API_URL } from '../../../config/api.js';

export interface ResponseDrill {
  id: number;
  cue_text: string;
  suggested_response: string;
  time_limit_seconds: number;
  difficulty: string;
  category: string;
}

export function useResponseDrills() {
  const [drills, setDrills] = useState<ResponseDrill[]>([]);
  const [currentDrill, setCurrentDrill] = useState<ResponseDrill | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [evaluation, setEvaluation] = useState<{ score: number; feedback: string } | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetchDrills();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft]);

  const fetchDrills = async () => {
    try {
      const response = await fetch(`${API_URL}/api/speaking/response-drills`);
      const data = await response.json();
      setDrills(data);
    } catch (error) {
      console.error('Failed to fetch response drills:', error);
    } finally {
      setLoading(false);
    }
  };

  const startDrill = (drill: ResponseDrill) => {
    setCurrentDrill(drill);
    setTimeLeft(drill.time_limit_seconds);
    setIsActive(true);
    setEvaluation(null);
  };

  const handleRecordingComplete = async (_blob: Blob) => {
    setIsActive(false);
    if (timerRef.current) clearInterval(timerRef.current);

    if (currentDrill) {
      try {
        const response = await fetch(`${API_URL}/api/speaking/evaluate-response`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userResponse: '[recorded audio]',
            suggestedResponse: currentDrill.suggested_response,
            drillId: currentDrill.id
          })
        });
        const result = await response.json();
        setEvaluation(result);
      } catch (error) {
        console.error('Evaluation failed:', error);
      }
    }
  };

  const goBack = () => {
    setCurrentDrill(null);
    setIsActive(false);
    setEvaluation(null);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const getTimerClass = () => {
    if (timeLeft <= 5) return 'danger';
    if (timeLeft <= 10) return 'warning';
    return '';
  };

  return {
    drills,
    currentDrill,
    loading,
    timeLeft,
    isActive,
    evaluation,
    startDrill,
    handleRecordingComplete,
    goBack,
    getTimerClass,
  };
}
