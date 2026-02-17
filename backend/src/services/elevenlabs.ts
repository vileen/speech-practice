// ElevenLabs TTS Service
import { config } from 'dotenv';
import { resolve } from 'path';
import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
config({ path: resolve(process.cwd(), '.env.local') });

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_BASE_URL = 'https://api.elevenlabs.io/v1';
const CACHE_FILE = './furigana-cache.json';

// Voice IDs - Younger, more casual voices
const VOICES = {
  japanese: {
    male: 'TxGEqnHWrfWFTfGW9jX',     // Japanese male - younger, casual
    female: 'XB0fDUnXU5powFXDhCwa',   // Japanese female - young, natural
  },
  italian: {
    male: 'TX3AEvVoIzMeN6vkV4Ch',     // Italian male
    female: 'XrExE9yKIg1WjnnlVkGX',   // Italian female
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
          stability: 0.3,        // More variable, natural
          similarity_boost: 0.7, // More expressive
          style: 0.4,            // Slight style boost for casual tone
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

// Persistent cache for furigana
let furiganaCache: Map<string, string> = new Map();
let cacheLoaded = false;

// Load cache from disk
async function loadCache(): Promise<void> {
  if (cacheLoaded) return;
  
  try {
    if (existsSync(CACHE_FILE)) {
      const data = await readFile(CACHE_FILE, 'utf-8');
      const obj = JSON.parse(data);
      furiganaCache = new Map(Object.entries(obj));
      console.log(`Loaded ${furiganaCache.size} cached readings from disk`);
    }
  } catch (error) {
    console.error('Error loading cache:', error);
  }
  cacheLoaded = true;
}

// Save cache to disk
async function saveCache(): Promise<void> {
  try {
    const obj = Object.fromEntries(furiganaCache);
    await writeFile(CACHE_FILE, JSON.stringify(obj, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving cache:', error);
  }
}

// Periodic save every 5 minutes
setInterval(saveCache, 5 * 60 * 1000);

// Save on process exit
process.on('SIGINT', async () => {
  console.log('Saving furigana cache...');
  await saveCache();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Saving furigana cache...');
  await saveCache();
  process.exit(0);
});

// Fetch reading from Jisho API
async function getReadingFromJisho(word: string): Promise<string | null> {
  await loadCache();
  
  // Check cache first
  if (furiganaCache.has(word)) {
    return furiganaCache.get(word)!;
  }

  try {
    const response = await fetch(`https://jisho.org/api/v1/search/words?keyword=${encodeURIComponent(word)}`);
    if (!response.ok) return null;
    
    const data = await response.json();
    if (data.data && data.data.length > 0) {
      const firstResult = data.data[0];
      const reading = firstResult.japanese?.[0]?.reading;
      if (reading) {
        furiganaCache.set(word, reading);
        // Save immediately for new entries
        await saveCache();
        return reading;
      }
    }
  } catch (error) {
    console.error('Error fetching from Jisho:', error);
  }
  return null;
}

// Add furigana using Jisho API for unknown kanji
export async function addFurigana(text: string): Promise<string> {
  await loadCache();
  
  let result = text;
  const kanjiRegex = /[\u4e00-\u9faf]+/g;
  const matches = text.match(kanjiRegex) || [];
  
  // Sort by length (longest first) to avoid partial matches
  const uniqueMatches = [...new Set(matches)].sort((a, b) => b.length - a.length);
  
  for (const kanjiWord of uniqueMatches) {
    const reading = await getReadingFromJisho(kanjiWord);
    
    if (reading) {
      const ruby = `<ruby>${kanjiWord}<rt>${reading}</rt></ruby>`;
      result = result.replace(new RegExp(kanjiWord, 'g'), ruby);
    }
  }
  
  return result;
}

// Synchronous version for simple cases (uses only cached readings)
export function addFuriganaSync(text: string): string {
  let result = text;
  const kanjiRegex = /[\u4e00-\u9faf]+/g;
  const matches = text.match(kanjiRegex) || [];
  
  const uniqueMatches = [...new Set(matches)].sort((a, b) => b.length - a.length);
  
  for (const kanjiWord of uniqueMatches) {
    const reading = furiganaCache.get(kanjiWord);
    if (reading) {
      const ruby = `<ruby>${kanjiWord}<rt>${reading}</rt></ruby>`;
      result = result.replace(new RegExp(kanjiWord, 'g'), ruby);
    }
  }
  
  return result;
}

// Manual save function (can be called from API)
export async function saveFuriganaCache(): Promise<void> {
  await saveCache();
}

// Convert kanji text to hiragana for TTS (better pronunciation)
export async function toHiraganaForTTS(text: string): Promise<string> {
  await loadCache();
  
  let result = text;
  const kanjiRegex = /[\u4e00-\u9faf]+/g;
  const matches = text.match(kanjiRegex) || [];
  
  // Sort by length (longest first) to avoid partial matches
  const uniqueMatches = [...new Set(matches)].sort((a, b) => b.length - a.length);
  
  for (const kanjiWord of uniqueMatches) {
    let reading = furiganaCache.get(kanjiWord);
    
    // If not in cache, try to fetch
    if (!reading) {
      reading = await getReadingFromJisho(kanjiWord);
    }
    
    if (reading) {
      result = result.replace(new RegExp(kanjiWord, 'g'), reading);
    }
  }
  
  return result;
}
