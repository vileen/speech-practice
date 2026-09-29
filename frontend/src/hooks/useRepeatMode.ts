import { useState, useEffect, useCallback } from 'react';
import { useFurigana } from './useFurigana';
import { useAudioPlayer } from './useAudioPlayer';
import { usePronunciationCheck } from './usePronunciationCheck';
import { useVolume } from './useVolume';
import { API_URL } from '../config/api.js';
import { PRACTICE_PHRASES, type PracticePhrase } from '../components/RepeatMode/practicePhrases';

const LANGUAGE = 'japanese';

export interface UseRepeatModeResult {
  phrases: PracticePhrase[];
  currentPhrase: PracticePhrase | null;
  furigana: string | null;
  isFuriganaLoading: boolean;
  isPlaying: boolean;
  isLoading: boolean;
  volume: number;
  setVolume: (volume: number) => void;
  showTranslation: boolean;
  toggleTranslation: () => void;
  showFurigana: boolean;
  toggleFurigana: () => void;
  recordingMode: 'push-to-talk' | 'voice-activated';
  setRecordingMode: (mode: 'push-to-talk' | 'voice-activated') => void;
  isListening: boolean;
  vadResetCounter: number;
  pronunciationResult: ReturnType<typeof usePronunciationCheck>['result'];
  isChecking: boolean;
  nextPhrase: () => void;
  fetchAndPlayAudio: () => void;
  handleRecordingComplete: (audioBlob: Blob) => Promise<void>;
  handleStartListening: () => void;
  handleStopListening: () => void;
}

export function useRepeatMode(): UseRepeatModeResult {
  const phrases = PRACTICE_PHRASES[LANGUAGE];
  const [gender, setGender] = useState<'male' | 'female'>('female');
  const [voiceStyle, setVoiceStyle] = useState<'normal' | 'anime'>('normal');
  const [currentPhrase, setCurrentPhrase] = useState<PracticePhrase | null>(null);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [vadResetCounter, setVadResetCounter] = useState(0);
  const [recordingMode, setRecordingMode] = useState<'push-to-talk' | 'voice-activated'>('push-to-talk');
  const [showTranslation, setShowTranslation] = useState(false);
  const [showFurigana, setShowFurigana] = useState(true);
  const [volume, setVolume] = useVolume();

  const { furigana, isLoading: isFuriganaLoading } = useFurigana(
    currentPhrase?.text || '',
    LANGUAGE === 'japanese'
  );

  const { play, isPlaying } = useAudioPlayer(volume);
  const { result: pronunciationResult, isChecking, check, clear } = usePronunciationCheck();
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isFetchingAudio, setIsFetchingAudio] = useState(false);

  const isLoading = isFuriganaLoading || isFetchingAudio;

  const nextPhrase = useCallback(() => {
    if (phrases.length === 0) return;

    const nextIndex = (phraseIndex + 1) % phrases.length;
    setPhraseIndex(nextIndex);
    setCurrentPhrase(phrases[nextIndex]);
    setAudioUrl(null); // Reset audio URL so new audio is fetched
    setIsListening(false);
    setVadResetCounter(c => c + 1);
    clear();
    setShowTranslation(false);
  }, [phrases, phraseIndex, clear]);

  // Load settings and first phrase on mount
  useEffect(() => {
    const settings = localStorage.getItem('repeatModeSettings');
    if (settings) {
      try {
        const parsed = JSON.parse(settings);
        setGender(parsed.gender || 'female');
        setVoiceStyle(parsed.voiceStyle || 'normal');
      } catch {
        // Use defaults
      }
    }

    if (phrases.length > 0) {
      setCurrentPhrase(phrases[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch audio from API
  const fetchAndPlayAudio = useCallback(async () => {
    if (!currentPhrase) return;

    // If we already have audio URL, just play it
    if (audioUrl) {
      play(audioUrl);
      return;
    }

    setIsFetchingAudio(true);
    try {
      const response = await fetch(`${API_URL}/api/repeat-after-me`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          target_text: currentPhrase.text,
          language: LANGUAGE,
          gender,
          voiceStyle,
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        play(url);
      }
    } catch (error) {
      console.error('Error fetching audio:', error);
    } finally {
      setIsFetchingAudio(false);
    }
  }, [currentPhrase, audioUrl, play, gender, voiceStyle]);

  // Auto-play audio when phrase changes
  useEffect(() => {
    if (currentPhrase && !audioUrl && !isFetchingAudio) {
      fetchAndPlayAudio();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPhrase, audioUrl]);

  // Spacebar shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat && !e.ctrlKey && !e.metaKey) {
        if (document.activeElement?.tagName === 'INPUT') return;
        if (isChecking || isLoading) return;

        e.preventDefault();
        nextPhrase();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isChecking, isLoading, nextPhrase]);

  const handleRecordingComplete = useCallback(async (audioBlob: Blob) => {
    if (!currentPhrase) return;

    await check(audioBlob, currentPhrase.text, LANGUAGE);
  }, [currentPhrase, check]);

  return {
    phrases,
    currentPhrase,
    furigana,
    isFuriganaLoading,
    isPlaying,
    isLoading,
    volume,
    setVolume,
    showTranslation,
    toggleTranslation: () => setShowTranslation(prev => !prev),
    showFurigana,
    toggleFurigana: () => setShowFurigana(prev => !prev),
    recordingMode,
    setRecordingMode,
    isListening,
    vadResetCounter,
    pronunciationResult,
    isChecking,
    nextPhrase,
    fetchAndPlayAudio,
    handleRecordingComplete,
    handleStartListening: () => setIsListening(true),
    handleStopListening: () => setIsListening(false),
  };
}
