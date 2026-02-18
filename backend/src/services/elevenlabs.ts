// ElevenLabs TTS Service
import { config } from 'dotenv';
import { resolve } from 'path';
import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
config({ path: resolve(process.cwd(), '.env.local') });

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_BASE_URL = 'https://api.elevenlabs.io/v1';
const CACHE_FILE = './furigana-cache.json';

// Voice IDs - ElevenLabs Multilingual v2 voices
// Get valid IDs from: https://api.elevenlabs.io/v1/voices
const VOICES = {
  japanese: {
    male: 'pNInz6obpgDQGcFmaJgB',     // Adam - Multilingual v2
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

// Fallback dictionary for proper nouns and words Jisho doesn't provide readings for
const FALLBACK_READINGS: Record<string, string> = {
  // Common surnames
  '田中': 'たなか',
  '山田': 'やまだ',
  '鈴木': 'すずき',
  '佐藤': 'さとう',
  '伊藤': 'いとう',
  '渡辺': 'わたなべ',
  '高橋': 'たかはし',
  '小林': 'こばやし',
  '田中': 'たなか',
  // Common words that might be missing
  ' Penn': 'ペン',
};

// Fetch reading from Jisho API
async function getReadingFromJisho(word: string): Promise<string | null> {
  await loadCache();
  
  // Check cache first
  if (furiganaCache.has(word)) {
    console.log(`[Furigana] Cache hit for: ${word} = ${furiganaCache.get(word)}`);
    return furiganaCache.get(word)!;
  }
  
  // Check fallback dictionary
  if (FALLBACK_READINGS[word]) {
    console.log(`[Furigana] Fallback hit for: ${word} = ${FALLBACK_READINGS[word]}`);
    furiganaCache.set(word, FALLBACK_READINGS[word]);
    await saveCache();
    return FALLBACK_READINGS[word];
  }

  console.log(`[Furigana] Fetching from Jisho: ${word}`);
  try {
    const response = await fetch(`https://jisho.org/api/v1/search/words?keyword=${encodeURIComponent(word)}`);
    console.log(`[Furigana] Jisho response status: ${response.status}`);
    
    if (!response.ok) {
      console.log(`[Furigana] Jisho request failed: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    console.log(`[Furigana] Jisho results count: ${data.data?.length || 0}`);
    
    if (data.data && data.data.length > 0) {
      // Try to find a result with a reading
      for (const result of data.data) {
        const japanese = result.japanese?.[0];
        if (japanese) {
          const resultWord = japanese.word;
          const reading = japanese.reading;
          
          // Only use if the word matches exactly and has a reading
          if (resultWord === word && reading) {
            furiganaCache.set(word, reading);
            await saveCache();
            console.log(`[Furigana] Cached: ${word} = ${reading}`);
            return reading;
          }
        }
      }
      console.log(`[Furigana] No result with reading found for: ${word}`);
    } else {
      console.log(`[Furigana] No results for: ${word}`);
    }
  } catch (error) {
    console.error('[Furigana] Error fetching from Jisho:', error);
  }
  return null;
}

// Add furigana using Jisho API for unknown kanji
export async function addFurigana(text: string): Promise<string> {
  await loadCache();
  
  let result = text;
  const kanjiRegex = /[\u4e00-\u9faf]+/g;
  const matches = text.match(kanjiRegex) || [];
  
  console.log(`[Furigana] Processing text: "${text}", found ${matches.length} kanji matches: [${matches.join(', ')}]`);
  
  // Sort by length (longest first) to avoid partial matches
  const uniqueMatches = [...new Set(matches)].sort((a, b) => b.length - a.length);
  
  console.log(`[Furigana] Unique matches to process: [${uniqueMatches.join(', ')}]`);
  
  for (const kanjiWord of uniqueMatches) {
    const reading = await getReadingFromJisho(kanjiWord);
    
    if (reading) {
      const ruby = `<ruby>${kanjiWord}<rt>${reading}</rt></ruby>`;
      result = result.replace(new RegExp(kanjiWord, 'g'), ruby);
      console.log(`[Furigana] Replaced "${kanjiWord}" with "${ruby}"`);
    } else {
      console.log(`[Furigana] No reading found for: "${kanjiWord}"`);
    }
  }
  
  console.log(`[Furigana] Result: "${result}"`);
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
  
  // Fix particle pronunciations
  // は as particle → わ, へ as particle → え
  // Pattern: word boundaries or spaces before は/へ indicate particles
  result = result.replace(/(\s|^)(は|へ)(\s|$)/g, (match, before, particle, after) => {
    const replacement = particle === 'は' ? 'わ' : 'え';
    return before + replacement + after;
  });
  
  return result;
}
