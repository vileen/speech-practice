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
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;
      
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      
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
        if (!analyserRef.current || !isListening) return;
        
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        
        // Calculate RMS
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i] * dataArray[i];
        }
        const rms = Math.sqrt(sum / dataArray.length);
        setAudioLevel(rms);
        
        // Threshold for voice detection (0-255 scale)
        const threshold = 15;
        const speaking = rms > threshold;
        setIsSpeaking(speaking);
        
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
