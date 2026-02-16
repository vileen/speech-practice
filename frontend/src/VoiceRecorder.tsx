import { useState, useEffect, useRef, useCallback } from 'react';
import './VoiceRecorder.css';

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  isListening: boolean;
  onStartListening: () => void;
  onStopListening: () => void;
  mode: 'push-to-talk' | 'voice-activated';
}

export function VoiceRecorder({
  onRecordingComplete,
  isListening,
  onStartListening,
  onStopListening,
  mode,
}: VoiceRecorderProps) {
  const [audioLevel, setAudioLevel] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [silenceTimer, setSilenceTimer] = useState(0);
  const [displaySilenceTimer, setDisplaySilenceTimer] = useState(0); // Debounced for UI
  const [isReady, setIsReady] = useState(false);
  const [hasDetectedVoiceState, setHasDetectedVoiceState] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); // Lock after recording
  
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
  
  // Start VAD monitoring
  const startVAD = useCallback(async () => {
    if (isRunningRef.current) return;
    isRunningRef.current = true;
    
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
      
      // Create audio context
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Resume audio context (browser requires user interaction)
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      
      audioContextRef.current = audioContext;
      
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;
      
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      
      console.log('VAD started - microphone active');
      
      // Start media recorder for actual audio capture
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
        setIsProcessing(true); // Lock to prevent immediate re-trigger
        onRecordingComplete(audioBlob);
        audioChunksRef.current = [];
      };
      
      mediaRecorder.start(100); // Collect data every 100ms
      
      // Reset states
      hasDetectedVoiceRef.current = false;
      setHasDetectedVoiceState(false);
      setSilenceTimer(0);
      silenceStartRef.current = null;
      
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
        
        // Scale to 0-100 for display
        const level = Math.min(rms * 200, 100);
        setAudioLevel(level);
        
        // Threshold for voice detection (lower = more sensitive)
        const threshold = 0.02; // ~2% of max amplitude
        const speaking = rms > threshold;
        setIsSpeaking(speaking);
        
        if (mode === 'voice-activated') {
          if (speaking) {
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
            
            // Auto-stop after 2s of silence (more forgiving)
            if (silenceDuration > 2000) {
              console.log('Auto-stopping after silence');
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
      isRunningRef.current = false;
    }
  }, [mode, onStartListening, onRecordingComplete]);
  
  // Stop recording
  const stopRecording = useCallback(() => {
    isRunningRef.current = false;
    
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    
    // Clear debounce timer
    if (silenceDebounceRef.current) {
      clearTimeout(silenceDebounceRef.current);
      silenceDebounceRef.current = null;
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
    hasDetectedVoiceRef.current = false;
    setHasDetectedVoiceState(false);
    setSilenceTimer(0);
    setDisplaySilenceTimer(0);
    setIsReady(false);
    silenceStartRef.current = null;
    setAudioLevel(0);
    
    onStopListening();
  }, [onStopListening]);
  
  // Auto-start for voice-activated mode (but not if processing)
  useEffect(() => {
    if (mode === 'voice-activated' && !isListening && !isRunningRef.current && !isProcessing) {
      // Small delay to ensure component is mounted
      const timer = setTimeout(() => {
        startVAD();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [mode, isListening, startVAD, isProcessing]);
  
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
            {isProcessing ? (
              <>✅ Done! Click to speak again</>
            ) : !isReady ? (
              <>Initializing microphone...</>
            ) : hasDetectedVoiceState ? (
              displaySilenceTimer > 0 ? (
                <>⏱️ Auto-stop in {Math.max(0, Math.ceil((2000 - silenceTimer) / 100) / 10)}s</>
              ) : (
                <>🎤 Recording... speak now!</>
              )
            ) : (
              <>👂 Listening... waiting for your voice</>
            )}
          </span>
        )}
      </div>
      
      {/* Restart button - show after voice-activated recording */}
      {!isPushToTalk && isProcessing && (
        <button
          className="record-button"
          onClick={() => {
            setIsProcessing(false);
            // Auto-start will trigger via useEffect
          }}
        >
          🎤 Start New Recording
        </button>
      )}
      
      {/* Push to talk button - only show for push-to-talk mode */}
      {isPushToTalk && (
        <button
          className={`record-button ${isListening ? 'recording' : ''} ${isSpeaking ? 'speaking' : ''}`}
          onMouseDown={startVAD}
          onMouseUp={stopRecording}
          onMouseLeave={isListening ? stopRecording : undefined}
          onTouchStart={startVAD}
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
