export type VoiceStyle = 'normal' | 'anime';
export type Gender = 'male' | 'female';
export type Language = 'japanese';

export interface TTSOptions {
  text: string;
  language: Language;
  gender: Gender;
  voiceStyle?: VoiceStyle;
}
