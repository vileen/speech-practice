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
  const [hasDetectedVoice, setHasDetectedVoice] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const rafRef = useRef<number | null>(null);
  const silenceStartRef = useRef<number | null>(null);
  
  // Start VAD monitoring
  const startVAD = useCallback(async () => {
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
        onRecordingComplete(audioBlob);
        audioChunksRef.current = [];
      };
      
      mediaRecorder.start(100); // Collect data every 100ms
      
      // Start VAD loop
      const checkAudio = () => {
        if (!analyserRef.current) return;
        
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
        
        // Debug logging
        if (level > 5) {
          console.log('Audio level:', level.toFixed(1), 'Speaking:', speaking);
        }
        
        if (mode === 'voice-activated') {
          if (speaking) {
            if (!hasDetectedVoice) {
              setHasDetectedVoice(true);
            }
            silenceStartRef.current = null;
            setSilenceTimer(0);
          } else if (hasDetectedVoice) {
            if (!silenceStartRef.current) {
              silenceStartRef.current = Date.now();
            }
            const silenceDuration = Date.now() - silenceStartRef.current;
            setSilenceTimer(silenceDuration);
            
            // Auto-stop after 1.5s of silence
            if (silenceDuration > 1500) {
              stopRecording();
              return;
            }
          }
        }
        
        rafRef.current = requestAnimationFrame(checkAudio);
      };
      
      checkAudio();
      onStartListening();
      
    } catch (error) {
      console.error('Error starting VAD:', error);
    }
  }, [isListening, mode, hasDetectedVoice, onStartListening, onRecordingComplete]);
  
  // Stop recording
  const stopRecording = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    
    setIsSpeaking(false);
    setHasDetectedVoice(false);
    setSilenceTimer(0);
    silenceStartRef.current = null;
    
    onStopListening();
  }, [onStopListening]);
  
  // Toggle recording
  const toggleRecording = () => {
    if (isListening) {
      stopRecording();
    } else {
      startVAD();
    }
  };
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
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
      {/* Audio level indicator */}
      <div className="audio-meter">
        <div 
          className={`audio-level ${isSpeaking ? 'speaking' : ''}`}
          style={{ width: `${Math.min((audioLevel / 50) * 100, 100)}%` }}
        />
      </div>
      
      {/* Mode indicator */}
      <div className="mode-indicator">
        {mode === 'voice-activated' && isListening && (
          <span className="vad-status">
            {hasDetectedVoice ? (
              silenceTimer > 0 ? (
                <>Auto-stop in {Math.ceil((1500 - silenceTimer) / 100) / 10}s</>
              ) : (
                <>Listening... <span className="voice-detected">🎤 Voice detected</span></>
              )
            ) : (
              <>Waiting for voice...</>
            )}
          </span>
        )}
      </div>
      
      {/* Record button */}
      <button
        className={`record-button ${isListening ? 'recording' : ''} ${isSpeaking ? 'speaking' : ''}`}
        onMouseDown={isPushToTalk ? startVAD : undefined}
        onMouseUp={isPushToTalk ? stopRecording : undefined}
        onMouseLeave={isPushToTalk && isListening ? stopRecording : undefined}
        onClick={!isPushToTalk ? toggleRecording : undefined}
        onTouchStart={isPushToTalk ? startVAD : undefined}
        onTouchEnd={isPushToTalk ? stopRecording : undefined}
      >
        {isListening ? (
          isPushToTalk ? (
            <>🔴 Hold to speak</>
          ) : (
            <>⏹️ Stop</>
          )
        ) : (
          <>
            {isPushToTalk ? '🎙️ Push to Talk' : '🎙️ Voice Activated'}
          </>
        )}
      </button>
      
      {/* Instructions */}
      <div className="instructions">
        {isPushToTalk ? (
          <small>Hold the button while speaking</small>
        ) : (
          <small>Click to start, speaks when you speak, stops after silence</small>
        )}
      </div>
    </div>
  );
}
