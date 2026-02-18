import { useState, useEffect, useRef, useCallback } from 'react';
import './VoiceRecorder.css';

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  isListening: boolean;
  onStartListening: () => void;
  onStopListening: () => void;
  mode: 'push-to-talk' | 'voice-activated';
  disabled?: boolean;
}

export function VoiceRecorder({
  onRecordingComplete,
  isListening,
  onStartListening,
  onStopListening,
  mode,
  disabled = false,
}: VoiceRecorderProps) {
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
  
  // Start VAD monitoring
  const startVAD = useCallback(async () => {
    if (isRunningRef.current) return;
    isRunningRef.current = true;
    setInitError(null);
    
    // Set a timeout for initialization
    const initTimeout = setTimeout(() => {
      if (!isReady) {
        setInitError('Microphone initialization timeout. Please check permissions.');
        isRunningRef.current = false;
      }
    }, 5000);
    
    try {
      // Get microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      mediaStreamRef.current = stream;
      clearTimeout(initTimeout);
      
      // Create audio context
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Resume audio context (browser requires user interaction)
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      
      audioContextRef.current = audioContext;
      
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 512; // Higher resolution for better detection
      analyser.smoothingTimeConstant = 0.3; // Less smoothing = more responsive
      analyserRef.current = analyser;
      
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      
      console.log('VAD started - microphone active');
      
      // Prepare media recorder but don't start yet - wait for voice detection
      let mediaRecorder: MediaRecorder | null = null;
      let recordingStarted = false;
      let recordingStartTime: number = 0;
      const MIN_RECORDING_DURATION = 1000; // Minimum 1 second recording
      
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
          
          // Only process if minimum duration met
          if (duration >= MIN_RECORDING_DURATION && audioChunksRef.current.length > 0) {
            setIsProcessing(true);
            onRecordingComplete(audioBlob);
          } else {
            // Too short, don't send - just reset
            console.log('Recording too short, discarding');
            onStopListening();
          }
          audioChunksRef.current = [];
        };
        
        mediaRecorder.start(50); // More frequent chunks for smoother recording
        console.log('Recording started - voice detected');
      };
      
      // Reset states
      hasDetectedVoiceRef.current = false;
      setHasDetectedVoiceState(false);
      setSilenceTimer(0);
      silenceStartRef.current = null;
      recordingStarted = false;
      recordingStartTime = 0;
      
      // Start VAD loop
      const checkAudio = () => {
        if (!analyserRef.current || !isRunningRef.current) return;
        
        // Use time domain data for better voice detection
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteTimeDomainData(dataArray);
        
        // Calculate RMS (root mean square)
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          const x = (dataArray[i] - 128) / 128.0; // Normalize to -1..1
          sum += x * x;
        }
        const rms = Math.sqrt(sum / dataArray.length);
        
        // Scale to 0-100 for display (very responsive)
        const level = Math.min(rms * 400, 100);
        setAudioLevel(level);
        
        // Threshold for voice detection (lower = earlier detection)
        const threshold = 0.015; // ~1.5% of max amplitude - very sensitive
        const speaking = rms > threshold;
        setIsSpeaking(speaking);
        
        if (mode === 'voice-activated') {
          if (speaking) {
            // Start recording on first voice detection
            if (!recordingStarted) {
              startRecording();
            }
            
            if (!hasDetectedVoiceRef.current) {
              hasDetectedVoiceRef.current = true;
              setHasDetectedVoiceState(true);
            }
            silenceStartRef.current = null;
            setSilenceTimer(0);
            // Clear any pending debounce
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
            
            // Debounce UI update - only show after 500ms of actual silence
            if (!silenceDebounceRef.current) {
              silenceDebounceRef.current = window.setTimeout(() => {
                setDisplaySilenceTimer(silenceDuration);
              }, 500);
            }
            
            // Auto-stop after 2s of silence, but only if minimum duration met
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
  }, [mode, onStartListening, onRecordingComplete]);

  // Start recording immediately for push-to-talk (no VAD)
  const startPushToTalk = useCallback(async () => {
    if (isRunningRef.current) return;
    isRunningRef.current = true;
    setInitError(null);
    
    try {
      // Get microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });
      
      mediaStreamRef.current = stream;
      
      // Setup audio context for level monitoring (visual feedback only)
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;
      
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.3;
      analyserRef.current = analyser;
      
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      
      // Start recording immediately
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
      
      // Visual feedback loop
      const checkAudio = () => {
        if (!analyserRef.current || !isRunningRef.current) return;
        
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteTimeDomainData(dataArray);
        
        // Calculate level for visual feedback only
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          const value = (dataArray[i] - 128) / 128;
          sum += value * value;
        }
        const rms = Math.sqrt(sum / dataArray.length);
        // More sensitive scaling for better range
        const level = Math.min(rms * 400, 100);
        
        setAudioLevel(level);
        
        // Debounced speaking state - turns on immediately, off with delay
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
          // Start debounce timer to turn off speaking state
          speakingDebounceRef.current = window.setTimeout(() => {
            const timeSinceLastSpeak = Date.now() - lastSpeakingTimeRef.current;
            if (timeSinceLastSpeak >= 300) { // 300ms debounce
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
  }, [onStartListening, onRecordingComplete, onStopListening]);
  
  // Stop recording
  const stopRecording = useCallback(() => {
    isRunningRef.current = false;
    
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    
    // Clear debounce timers
    if (silenceDebounceRef.current) {
      clearTimeout(silenceDebounceRef.current);
      silenceDebounceRef.current = null;
    }
    if (speakingDebounceRef.current) {
      clearTimeout(speakingDebounceRef.current);
      speakingDebounceRef.current = null;
    }
    
    // Only stop recorder if it was started and has data
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      // Check if we have any audio chunks before stopping
      if (audioChunksRef.current.length > 0) {
        mediaRecorderRef.current.stop();
      } else {
        // No audio recorded, just cleanup
        mediaRecorderRef.current.stop();
        onStopListening();
      }
    } else {
      // Recording never started, just cleanup
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
    
    // Reset all states for both modes
    setIsSpeaking(false);
    setIsReady(false);
    hasDetectedVoiceRef.current = false;
    setHasDetectedVoiceState(false);
    setSilenceTimer(0);
    setDisplaySilenceTimer(0);
    silenceStartRef.current = null;
    setAudioLevel(0);
    
    // Important: for push-to-talk, we need to notify parent
    onStopListening();
  }, [onStopListening]);
  
  // Auto-start for voice-activated mode (but not if processing or disabled)
  useEffect(() => {
    if (disabled) return; // Don't auto-start if disabled
    if (mode === 'voice-activated' && !isListening && !isRunningRef.current && !isProcessing) {
      // Small delay to ensure component is mounted
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
      }, 2000); // Wait 2 seconds before retry
      return () => clearTimeout(retryTimer);
    }
  }, [initError, mode, isProcessing, startVAD]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isRunningRef.current = false;
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);
  
  const isPushToTalk = mode === 'push-to-talk';
  
  return (
    <div className="voice-recorder">
      {/* Audio level indicator - always visible */}
      <div className="audio-meter">
        <div 
          className={`audio-level ${isSpeaking ? 'speaking' : ''} ${hasDetectedVoiceState ? 'active' : ''}`}
          style={{ width: `${Math.min((audioLevel / 50) * 100, 100)}%` }}
        />
      </div>
      
      {/* Status text */}
      <div className="mode-indicator">
        {mode === 'voice-activated' && (
          <span className="vad-status">
            {initError ? (
              <span style={{ color: '#f87171' }}>❌ {initError}</span>
            ) : isProcessing ? (
              <>✅ Processing... Click to speak again</>
            ) : !isReady ? (
              <>Initializing microphone (auto-retrying)...</>
            ) : hasDetectedVoiceState ? (
              displaySilenceTimer > 0 ? (
                <>⏱️ Auto-stop in {Math.max(0, Math.ceil((2000 - silenceTimer) / 100) / 10)}s</>
              ) : (
                <>🎤 Recording... ({Math.ceil(silenceTimer / 100) / 10}s)</>
              )
            ) : (
              <>👂 Speak to start recording...</>
            )}
          </span>
        )}
      </div>
      
      {/* Restart button - show after voice-activated recording or error */}
      {(!isPushToTalk && (isProcessing || initError)) && (
        <button
          className="record-btn"
          onClick={() => {
            setIsProcessing(false);
            setIsReady(false);
            setInitError(null);
            isRunningRef.current = false;
            // Auto-start will trigger via useEffect
          }}
        >
          🎤 {initError ? 'Retry' : 'Start New Recording'}
        </button>
      )}
      
      {/* Push to talk button - only show for push-to-talk mode */}
      {isPushToTalk && (
        <button
          className={`record-btn ${isListening ? 'recording' : ''} ${isSpeaking ? 'speaking' : ''}`}
          onMouseDown={startPushToTalk}
          onMouseUp={stopRecording}
          onMouseLeave={isListening ? stopRecording : undefined}
          onTouchStart={startPushToTalk}
          onTouchEnd={stopRecording}
        >
          {isListening ? (
            <>🔴 Recording...</>
          ) : (
            <>🎙️ Hold to Speak</>
          )}
        </button>
      )}
      
      {/* Instructions */}
      <div className="instructions">
        {isPushToTalk ? (
          <small>Hold the button while speaking</small>
        ) : (
          <small>Just start speaking - I'll detect your voice automatically</small>
        )}
      </div>
    </div>
  );
}
