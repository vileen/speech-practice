import { useState, useCallback } from 'react';
import { API_URL } from '../config/api.js';

export interface AssessmentResult {
  transcript: string;
  accuracyScore: number;
  feedback: {
    overall: string;
    errors: Array<{
      type: 'substitution' | 'omission' | 'insertion' | 'pronunciation';
      expected: string;
      actual: string;
      position: number;
    }>;
    suggestions: string[];
  };
  expected: string;
  expectedRomaji?: string;
}

interface UseSpeechAssessmentReturn {
  result: AssessmentResult | null;
  isAssessing: boolean;
  error: string | null;
  assessPronunciation: (
    audioBlob: Blob,
    targetText: string,
    expectedRomaji?: string
  ) => Promise<AssessmentResult | null>;
  reset: () => void;
}

/**
 * Hook for speech pronunciation assessment
 */
export function useSpeechAssessment(): UseSpeechAssessmentReturn {
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [isAssessing, setIsAssessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const assessPronunciation = useCallback(async (
    audioBlob: Blob,
    targetText: string,
    expectedRomaji?: string
  ): Promise<AssessmentResult | null> => {
    setIsAssessing(true);
    setError(null);
    setResult(null);

    try {
      // Create form data
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('target_text', targetText);
      if (expectedRomaji) {
        formData.append('expected_romaji', expectedRomaji);
      }

      const response = await fetch(`${API_URL}/api/speech/assess`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Assessment failed: ${response.status}`);
      }

      const assessment: AssessmentResult = await response.json();
      setResult(assessment);
      return assessment;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Assessment failed';
      setError(message);
      console.error('Speech assessment error:', err);
      return null;
    } finally {
      setIsAssessing(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setIsAssessing(false);
  }, []);

  return {
    result,
    isAssessing,
    error,
    assessPronunciation,
    reset,
  };
}

/**
 * Hook for simple audio transcription (no comparison)
 */
export function useTranscription() {
  const [transcript, setTranscript] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const transcribe = useCallback(async (audioBlob: Blob): Promise<string | null> => {
    setIsTranscribing(true);
    setError(null);
    setTranscript(null);

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      const response = await fetch(`${API_URL}/api/speech/transcribe`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Transcription failed: ${response.status}`);
      }

      const result = await response.json();
      setTranscript(result.transcript);
      return result.transcript;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Transcription failed';
      setError(message);
      return null;
    } finally {
      setIsTranscribing(false);
    }
  }, []);

  return {
    transcript,
    isTranscribing,
    error,
    transcribe,
    reset: () => {
      setTranscript(null);
      setError(null);
    },
  };
}
