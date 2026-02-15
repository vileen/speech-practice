// ElevenLabs TTS Service
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_BASE_URL = 'https://api.elevenlabs.io/v1';

// Voice IDs
const VOICES = {
  japanese: {
    male: 'TxGEqnHWrfWFTfGW9XjX',   // Alternative Japanese male
    female: 'XB0fDUnXU5powFXDhCwa', // Alternative Japanese female
  },
  italian: {
    male: 'TX3AEvVoIzMeN6vkV4Ch',   // Italian male
    female: 'XrExE9yKIg1WjnnlVkGX', // Italian female
  },
};

interface TTSOptions {
  text: string;
  language: 'japanese' | 'italian';
  gender: 'male' | 'female';
}

export async function generateSpeech({ text, language, gender }: TTSOptions): Promise<Buffer> {
  if (!ELEVENLABS_API_KEY) {
    throw new Error('ELEVENLABS_API_KEY not set');
  }

  const voiceId = VOICES[language][gender];
  
  const response = await fetch(
    `${ELEVENLABS_BASE_URL}/text-to-speech/${voiceId}`,
    {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`ElevenLabs API error: ${error}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export function getVoiceInfo(language: 'japanese' | 'italian', gender: 'male' | 'female') {
  return {
    voiceId: VOICES[language][gender],
    language,
    gender,
  };
}
