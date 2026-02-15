// OpenAI Whisper STT Service
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface TranscriptionOptions {
  audioFilePath: string;
  language?: string; // 'ja' for Japanese, 'it' for Italian
}

export async function transcribeAudio({ audioFilePath, language }: TranscriptionOptions): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY not set');
  }

  const response = await openai.audio.transcriptions.create({
    file: await openai.files.create({
      file: await fetch(audioFilePath).then(r => r.blob()),
      purpose: 'assistants',
    }),
    model: 'whisper-1',
    language: language,
  });

  return response.text;
}

// Alternative: using direct fetch to Whisper API
export async function transcribeAudioDirect(audioBuffer: Buffer, language?: string): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY not set');
  }

  const formData = new FormData();
  const blob = new Blob([audioBuffer], { type: 'audio/mpeg' });
  formData.append('file', blob, 'audio.mp3');
  formData.append('model', 'whisper-1');
  if (language) {
    formData.append('language', language);
  }

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Whisper API error: ${error}`);
  }

  const data = await response.json();
  return data.text;
}
