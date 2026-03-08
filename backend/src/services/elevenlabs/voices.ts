import type { Language, VoiceStyle, Gender } from './types.js';

export const VOICES: Record<Language, Record<VoiceStyle, Record<Gender, string>>> = {
  japanese: {
    normal: {
      male: 'pNInz6obpgDQGcFmaJgB',     // Adam - Multilingual v2
      female: 'XB0fDUnXU5powFXDhCwa',   // Bella - warm, professional
    },
    anime: {
      male: 'IKne3meq5aSn9XLyUdCD',     // Charlie - energetic, hyped
      female: 'cgSgspJ2msm6clMCkdW9',   // Jessica - cute, playful, expressive
    },
  },
};
