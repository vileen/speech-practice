// Main ElevenLabs TTS service
import { appConfig } from '../../config/index.js';
import { VOICES } from './voices.js';
import type { TTSOptions } from './types.js';
import { stripFurigana, toHiraganaForTTS } from '../../utils/text.js';

const ELEVENLABS_BASE_URL = 'https://api.elevenlabs.io/v1';

export async function generateSpeech(options: TTSOptions): Promise<Buffer> {
  const { text, language, gender, voiceStyle = 'normal' } = options;
  
  const voiceId = VOICES[language][voiceStyle][gender];
  const cleanText = stripFurigana(text);
  const ttsText = language === 'japanese' 
    ? toHiraganaForTTS(cleanText) 
    : cleanText;
  
  const response = await fetch(`${ELEVENLABS_BASE_URL}/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'xi-api-key': appConfig.apiKeys.elevenlabs,
    },
    body: JSON.stringify({
      text: ttsText,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
      },
    }),
  });
  
  if (!response.ok) {
    throw new Error(`ElevenLabs API error: ${response.status}`);
  }
  
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// Re-export from original for backward compatibility
export { addFurigana, addFuriganaSync } from '../elevenlabs.js';
