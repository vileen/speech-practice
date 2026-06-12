import { useState, useEffect, useRef, useCallback } from 'react';

export interface UseVoiceRecorderOptions {
  onRecordingComplete: (audioBlob: Blob) => void;
  isListening: boolean;
  onStartListening: () => void;
  onStopListening: () => void;
  mode: 'push-to-talk' | 'voice-activated';
  disabled?: boolean;
}

export interface UseVoiceRecorderReturn {
  audioLevel: number;
  isSpeaking: boolean;
  silenceTimer: number;
  displaySilenceTimer: number;
  isReady: boolean;
  hasDetectedVoiceState: boolean;
  isProcessing: boolean;
  initError: string | null;
  isPushToTalk: boolean;
  startVAD: () => Promise<void>;
  startPushToTalk: () => Promise<void>;
  stopRecording: () => void;
  restartRecording: () => void;
}

export function useVoiceRecorder({
  onRecordingComplete,
  isListening,
  onStartListening,
  onStopListening,
  mode,
  disabled = false,
}: UseVoiceRecorderOptions): UseVoiceRecorderReturn {
  const [audioLevel, setAudioLevel] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [silenceTimer, setSilenceTimer] = useState(0);
  const [displaySilenceTimer, setDisplaySilenceTimer] = useState(0); // Debounced for UI
  const [isReady, setIsReady] = useState(false);
  const [hasDetectedVoiceState, setHasDetectedVoiceState] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); // Lock after recording
  const [initError, setInitError] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const rafRef = useRef<number | null>(null);
  const silenceStartRef = useRef<number | null>(null);
  const isRunningRef = useRef(false);
  const hasDetectedVoiceRef = useRef(false);
  const silenceDebounceRef = useRef<number | null>(null);
  const speakingDebounceRef = useRef<number | null>(null);
  const lastSpeakingTimeRef = useRef<number>(0);
  const prevModeRef = useRef(mode);
  const prevDisabledRef = useRef(disabled);

  const MIN_RECORDING_DURATION = 1000; // Minimum 1 second recording

  const cleanup = useCallback(() => {
    isRunningRef.current = false;

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    if (silenceDebounceRef.current) {
      clearTimeout(silenceDebounceRef.current);
      silenceDebounceRef.current = null;
    }
    if (speakingDebounceRef.current) {
      clearTimeout(speakingDebounceRef.current);
      speakingDebounceRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    setIsSpeaking(false);
    setIsReady(false);
    hasDetectedVoiceRef.current = false;
    setHasDetectedVoiceState(false);
    setSilenceTimer(0);
    setDisplaySilenceTimer(0);
    silenceStartRef.current = null;
    setAudioLevel(0);
  }, []);

  // Start VAD monitoring
  const startVAD = useCallback(async () => {
    if (isRunningRef.current) return;
    isRunningRef.current = true;
    setInitError(null);

    const initTimeout = setTimeout(() => {
      if (!isReady) {
        setInitError('Microphone initialization timeout. Please check permissions.');
        isRunningRef.current = false;
      }
    }, 5000);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      mediaStreamRef.current = stream;
      clearTimeout(initTimeout);

      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      audioContextRef.current = audioContext;

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.3;
      analyserRef.current = analyser;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      let mediaRecorder: MediaRecorder | null = null;
      let recordingStarted = false;
      let recordingStartTime: number = 0;

      const startRecording = () => {
        if (recordingStarted || !mediaStreamRef.current) return;
        recordingStarted = true;
        recordingStartTime = Date.now();

        mediaRecorder = new MediaRecorder(mediaStreamRef.current);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const duration = Date.now() - recordingStartTime;
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });

          if (duration >= MIN_RECORDING_DURATION && audioChunksRef.current.length > 0) {
            setIsProcessing(true);
            onRecordingComplete(audioBlob);
          } else {
            console.log('Recording too short, discarding');
            onStopListening();
          }
          audioChunksRef.current = [];
        };

        mediaRecorder.start(50);
        console.log('Recording started - voice detected');
      };

      hasDetectedVoiceRef.current = false;
      setHasDetectedVoiceState(false);
      setSilenceTimer(0);
      silenceStartRef.current = null;
      recordingStarted = false;
      recordingStartTime = 0;

      const checkAudio = () => {
        if (!analyserRef.current || !isRunningRef.current) return;

        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteTimeDomainData(dataArray);

        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          const x = (dataArray[i] - 128) / 128.0;
          sum += x * x;
        }
        const rms = Math.sqrt(sum / dataArray.length);

        const level = Math.min(rms * 400, 100);
        setAudioLevel(level);

        const threshold = 0.015;
        const speaking = rms > threshold;
        setIsSpeaking(speaking);

        if (mode === 'voice-activated') {
          if (speaking) {
            if (!recordingStarted) {
              startRecording();
            }

            if (!hasDetectedVoiceRef.current) {
              hasDetectedVoiceRef.current = true;
              setHasDetectedVoiceState(true);
            }
            silenceStartRef.current = null;
            setSilenceTimer(0);
            if (silenceDebounceRef.current) {
              clearTimeout(silenceDebounceRef.current);
              silenceDebounceRef.current = null;
            }
            setDisplaySilenceTimer(0);
          } else if (hasDetectedVoiceRef.current) {
            if (!silenceStartRef.current) {
              silenceStartRef.current = Date.now();
            }
            const silenceDuration = Date.now() - silenceStartRef.current;
            setSilenceTimer(silenceDuration);

            if (!silenceDebounceRef.current) {
              silenceDebounceRef.current = window.setTimeout(() => {
                setDisplaySilenceTimer(silenceDuration);
              }, 500);
            }

            const recordingDuration = Date.now() - recordingStartTime;
            if (silenceDuration > 2000 && recordingDuration >= MIN_RECORDING_DURATION) {
              console.log('Auto-stopping after silence (min duration met)');
              stopRecording();
              return;
            }
          }
        }

        if (isRunningRef.current) {
          rafRef.current = requestAnimationFrame(checkAudio);
        }
      };

      checkAudio();
      onStartListening();
      setIsReady(true);
    } catch (error) {
      console.error('Error starting VAD:', error);
      setInitError('Failed to access microphone. Please check permissions.');
      isRunningRef.current = false;
      clearTimeout(initTimeout);
    }
  }, [mode, onStartListening, onRecordingComplete, onStopListening, isReady]);

  // Start recording immediately for push-to-talk (no VAD)
  const startPushToTalk = useCallback(async () => {
    if (isRunningRef.current) return;
    isRunningRef.current = true;
    setInitError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      mediaStreamRef.current = stream;

      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.3;
      analyserRef.current = analyser;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        if (audioChunksRef.current.length > 0) {
          onRecordingComplete(audioBlob);
        } else {
          onStopListening();
        }
        audioChunksRef.current = [];
      };

      mediaRecorder.start(50);

      const checkAudio = () => {
        if (!analyserRef.current || !isRunningRef.current) return;

        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteTimeDomainData(dataArray);

        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          const value = (dataArray[i] - 128) / 128;
          sum += value * value;
        }
        const rms = Math.sqrt(sum / dataArray.length);
        const level = Math.min(rms * 400, 100);

        setAudioLevel(level);

        const isCurrentlySpeaking = level > 8;
        if (isCurrentlySpeaking) {
          lastSpeakingTimeRef.current = Date.now();
          if (!isSpeaking) {
            setIsSpeaking(true);
          }
          if (speakingDebounceRef.current) {
            clearTimeout(speakingDebounceRef.current);
            speakingDebounceRef.current = null;
          }
        } else if (isSpeaking && !speakingDebounceRef.current) {
          speakingDebounceRef.current = window.setTimeout(() => {
            const timeSinceLastSpeak = Date.now() - lastSpeakingTimeRef.current;
            if (timeSinceLastSpeak >= 300) {
              setIsSpeaking(false);
            }
            speakingDebounceRef.current = null;
          }, 300);
        }

        if (isRunningRef.current) {
          rafRef.current = requestAnimationFrame(checkAudio);
        }
      };

      checkAudio();
      onStartListening();
      setIsReady(true);
    } catch (error) {
      console.error('Error starting push-to-talk:', error);
      setInitError('Failed to access microphone. Please check permissions.');
      isRunningRef.current = false;
    }
  }, [onStartListening, onRecordingComplete, onStopListening, isSpeaking]);

  // Stop recording
  const stopRecording = useCallback(() => {
    isRunningRef.current = false;

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    if (silenceDebounceRef.current) {
      clearTimeout(silenceDebounceRef.current);
      silenceDebounceRef.current = null;
    }
    if (speakingDebounceRef.current) {
      clearTimeout(speakingDebounceRef.current);
      speakingDebounceRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      if (audioChunksRef.current.length > 0) {
        mediaRecorderRef.current.stop();
      } else {
        mediaRecorderRef.current.stop();
        onStopListening();
      }
    } else {
      onStopListening();
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    setIsSpeaking(false);
    setIsReady(false);
    hasDetectedVoiceRef.current = false;
    setHasDetectedVoiceState(false);
    setSilenceTimer(0);
    setDisplaySilenceTimer(0);
    silenceStartRef.current = null;
    setAudioLevel(0);

    onStopListening();
  }, [onStopListening]);

  const restartRecording = useCallback(() => {
    setIsProcessing(false);
    setIsReady(false);
    setInitError(null);
    isRunningRef.current = false;
    // Auto-start will trigger via useEffect
  }, []);

  // Auto-start for voice-activated mode (but not if processing or disabled)
  useEffect(() => {
    if (disabled) return;
    if (mode === 'voice-activated' && !isListening && !isRunningRef.current && !isProcessing) {
      const timer = setTimeout(() => {
        startVAD();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [mode, isListening, startVAD, isProcessing, disabled]);

  // Auto-retry on initialization error
  useEffect(() => {
    if (initError && mode === 'voice-activated' && !isProcessing) {
      console.log('Auto-retrying microphone initialization...');
      const retryTimer = setTimeout(() => {
        setInitError(null);
        isRunningRef.current = false;
        startVAD();
      }, 2000);
      return () => clearTimeout(retryTimer);
    }
  }, [initError, mode, isProcessing, startVAD]);

  // Stop recording when switching modes or when disabled
  useEffect(() => {
    const modeChangedToPushToTalk = prevModeRef.current === 'voice-activated' && mode === 'push-to-talk';
    const disabledChangedToTrue = !prevDisabledRef.current && disabled;

    if (isListening && (modeChangedToPushToTalk || disabledChangedToTrue)) {
      stopRecording();
    }

    prevModeRef.current = mode;
    prevDisabledRef.current = disabled;
  }, [mode, disabled, isListening, stopRecording]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    audioLevel,
    isSpeaking,
    silenceTimer,
    displaySilenceTimer,
    isReady,
    hasDetectedVoiceState,
    isProcessing,
    initError,
    isPushToTalk: mode === 'push-to-talk',
    startVAD,
    startPushToTalk,
    stopRecording,
    restartRecording,
  };
}
