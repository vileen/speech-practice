import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
const envPath = resolve(process.cwd(), '.env.local');
config({ path: envPath });

// Validate and export configuration
export const appConfig = {
  port: parseInt(process.env.PORT || '3001', 10),
  password: process.env.ACCESS_PASSWORD || 'default123',
  
  database: {
    url: process.env.DATABASE_URL || 'postgresql://localhost:5432/speech_practice',
  },
  
  audio: {
    storagePath: process.env.AUDIO_STORAGE_PATH || './audio_recordings',
  },
  
  apiKeys: {
    openai: process.env.OPENAI_API_KEY || '',
    elevenlabs: process.env.ELEVENLABS_API_KEY || '',
  },
  
  cors: {
    origins: [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://vileen.github.io',
      'https://trunk-sticks-connect-currency.trycloudflare.com',
      'https://speech-practice-vileen.netlify.app',
      'https://magnificent-crumble-1f90e0.netlify.app',
      'https://speech.vileen.pl',
    ] as string[],
    credentials: true,
  },
};

// Validate required configuration
export function validateConfig(): void {
  const required = [
    { key: 'OPENAI_API_KEY', value: appConfig.apiKeys.openai },
    { key: 'ELEVENLABS_API_KEY', value: appConfig.apiKeys.elevenlabs },
    { key: 'DATABASE_URL', value: appConfig.database.url },
  ];
  
  const missing = required.filter(r => !r.value);
  if (missing.length > 0) {
    console.warn('⚠️  Missing optional config:', missing.map(m => m.key).join(', '));
  }
}
