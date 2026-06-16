import { useState, useEffect } from 'react';
import { useSpeechAssessment } from '../../../hooks/useSpeechAssessment';
import { API_URL } from '../../../config/api.js';

export interface ShadowingExercise {
  id: number;
  title: string;
  audio_url: string;
  japanese_text: string;
  level: string;
  duration_seconds: number;
}

export function useShadowingMode() {
  const [exercises, setExercises] = useState<ShadowingExercise[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<ShadowingExercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [showAssessment, setShowAssessment] = useState(false);

  const { result: assessmentResult, isAssessing, assessPronunciation, reset: resetAssessment } = useSpeechAssessment();

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    try {
      const response = await fetch(`${API_URL}/api/speaking/shadowing`);
      const data = await response.json();
      setExercises(data);
    } catch (error) {
      console.error('Failed to fetch shadowing exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecordingComplete = async (blob: Blob) => {
    setAudioBlob(blob);
    setShowAssessment(false);
    if (selectedExercise) {
      await assessPronunciation(blob, selectedExercise.japanese_text);
      setShowAssessment(true);
    }
  };

  const handleRetry = () => {
    setAudioBlob(null);
    setShowAssessment(false);
    resetAssessment();
  };

  const handleContinue = () => {
    setSelectedExercise(null);
    setAudioBlob(null);
    setShowAssessment(false);
    resetAssessment();
  };

  const playNativeAudio = () => {
    if (selectedExercise) {
      const utterance = new SpeechSynthesisUtterance(selectedExercise.japanese_text);
      utterance.lang = 'ja-JP';
      speechSynthesis.speak(utterance);
    }
  };

  const goBack = () => {
    setSelectedExercise(null);
    setAudioBlob(null);
    setShowAssessment(false);
    resetAssessment();
  };

  return {
    exercises,
    selectedExercise,
    loading,
    audioBlob,
    showAssessment,
    assessmentResult,
    isAssessing,
    setSelectedExercise,
    handleRecordingComplete,
    handleRetry,
    handleContinue,
    playNativeAudio,
    goBack,
  };
}
