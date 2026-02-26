import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

// OpenAI TTS voices
const VOICES = {
  alloy: 'alloy',    // Neutral
  echo: 'echo',      // Male
  fable: 'fable',    // Male (British)
  onyx: 'onyx',      // Male (deep)
  nova: 'nova',      // Female
  shimmer: 'shimmer', // Female (young)
} as const;

type Voice = keyof typeof VOICES;

interface TTSOptions {
  text: string;
  voice?: Voice;
  speed?: number;
}

/**
 * Generate speech using OpenAI TTS API
 * OpenAI TTS has excellent Japanese language support
 * - No romaji conversion needed
 * - Proper handling of particles (は as wa, へ as e)
 * - Natural pronunciation
 */
export async function generateSpeech({
  text,
  voice = 'nova',
  speed = 1.0,
}: TTSOptions): Promise<Buffer> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY not set');
  }

  console.log(`[OpenAI TTS] Generating speech for: "${text.substring(0, 50)}..." with voice: ${voice}`);

  try {
    const mp3Response = await openai.audio.speech.create({
      model: 'tts-1',  // or 'tts-1-hd' for higher quality
      voice: VOICES[voice],
      input: text,
      speed: speed,
    });

    const arrayBuffer = await mp3Response.arrayBuffer();
    console.log(`[OpenAI TTS] Successfully generated ${arrayBuffer.byteLength} bytes`);
    
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error('[OpenAI TTS] Error:', error);
    throw error;
  }
}

/**
 * Get available voice options
 */
export function getAvailableVoices(): { id: Voice; name: string; description: string }[] {
  return [
    { id: 'alloy', name: 'Alloy', description: 'Neutral' },
    { id: 'echo', name: 'Echo', description: 'Male' },
    { id: 'fable', name: 'Fable', description: 'Male (British)' },
    { id: 'onyx', name: 'Onyx', description: 'Male (Deep)' },
    { id: 'nova', name: 'Nova', description: 'Female' },
    { id: 'shimmer', name: 'Shimmer', description: 'Female (Young)' },
  ];
}
