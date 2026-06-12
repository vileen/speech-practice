import { RecordingControls } from './RecordingControls';
import type { VoiceRecorderProps } from './types';

export type { VoiceRecorderProps } from './types';
export { RecordingControls } from './RecordingControls';
export { useVoiceRecorder } from '../../hooks/useVoiceRecorder';
export type { UseVoiceRecorderOptions, UseVoiceRecorderReturn } from '../../hooks/useVoiceRecorder';

export function VoiceRecorder(props: VoiceRecorderProps) {
  return <RecordingControls {...props} />;
}
