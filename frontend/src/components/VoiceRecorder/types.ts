export interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  isListening: boolean;
  onStartListening: () => void;
  onStopListening: () => void;
  mode: 'push-to-talk' | 'voice-activated';
  disabled?: boolean;
}
