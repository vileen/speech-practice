// ElevenLabs TTS Service
import { config } from 'dotenv';
import { resolve } from 'path';
import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
config({ path: resolve(process.cwd(), '.env.local') });

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_BASE_URL = 'https://api.elevenlabs.io/v1';
const CACHE_FILE = './data/furigana-cache.json';

// Voice IDs - ElevenLabs Multilingual v2 voices
// Get valid IDs from: https://api.elevenlabs.io/v1/voices
type VoiceStyle = 'normal' | 'anime';
type Gender = 'male' | 'female';
type Language = 'japanese' | 'italian';

const VOICES: Record<Language, Record<VoiceStyle, Record<Gender, string>>> = {
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
  italian: {
    normal: {
      male: 'TX3AEvVoIzMeN6vkV4Ch',     // Italian male
      female: 'XrExE9yKIg1WjnnlVkGX',   // Italian female
    },
    anime: {
      male: 'IKne3meq5aSn9XLyUdCD',     // Charlie - energetic
      female: 'cgSgspJ2msm6clMCkdW9',   // Jessica - cute, expressive
    },
  },
};

interface TTSOptions {
  text: string;
  language: 'japanese' | 'italian';
  gender: 'male' | 'female';
  voiceStyle?: 'normal' | 'anime';
}

// Strip furigana/ruby tags from text for TTS
function stripFurigana(text: string): string {
  // Remove ruby tags and keep only the kanji (not the rt content)
  // <ruby>犬<rt>いぬ</rt></ruby> -> 犬
  let cleaned = text.replace(/<ruby>([^<]*)<rt>[^<]*<\/rt><\/ruby>/g, '$1');
  
  // Remove any remaining HTML tags
  cleaned = cleaned.replace(/<[^>]*>/g, '');
  
  return cleaned;
}

// Simple Japanese to romaji conversion for TTS
// This helps ElevenLabs pronounce particles correctly (は as wa, へ as e, etc.)
function japaneseToRomaji(text: string): string {
  // Basic hiragana/katakana to romaji mapping
  const kanaToRomaji: Record<string, string> = {
    // Hiragana
    'あ': 'a', 'い': 'i', 'う': 'u', 'え': 'e', 'お': 'o',
    'か': 'ka', 'き': 'ki', 'く': 'ku', 'け': 'ke', 'こ': 'ko',
    'さ': 'sa', 'し': 'shi', 'す': 'su', 'せ': 'se', 'そ': 'so',
    'た': 'ta', 'ち': 'chi', 'つ': 'tsu', 'て': 'te', 'と': 'to',
    'な': 'na', 'に': 'ni', 'ぬ': 'nu', 'ね': 'ne', 'の': 'no',
    'は': 'ha', 'ひ': 'hi', 'ふ': 'fu', 'へ': 'he', 'ほ': 'ho',
    'ま': 'ma', 'み': 'mi', 'む': 'mu', 'め': 'me', 'も': 'mo',
    'や': 'ya', 'ゆ': 'yu', 'よ': 'yo',
    'ら': 'ra', 'り': 'ri', 'る': 'ru', 'れ': 're', 'ろ': 'ro',
    'わ': 'wa', 'を': 'wo', 'ん': 'n',
    'が': 'ga', 'ぎ': 'gi', 'ぐ': 'gu', 'げ': 'ge', 'ご': 'go',
    'ざ': 'za', 'じ': 'ji', 'ず': 'zu', 'ぜ': 'ze', 'ぞ': 'zo',
    'だ': 'da', 'ぢ': 'ji', 'づ': 'zu', 'で': 'de', 'ど': 'do',
    'ば': 'ba', 'び': 'bi', 'ぶ': 'bu', 'べ': 'be', 'ぼ': 'bo',
    'ぱ': 'pa', 'ぴ': 'pi', 'ぷ': 'pu', 'ぺ': 'pe', 'ぽ': 'po',
    'ゃ': 'ya', 'ゅ': 'yu', 'ょ': 'yo', 'っ': 'tsu',
    // Katakana
    'ア': 'a', 'イ': 'i', 'ウ': 'u', 'エ': 'e', 'オ': 'o',
    'カ': 'ka', 'キ': 'ki', 'ク': 'ku', 'ケ': 'ke', 'コ': 'ko',
    'サ': 'sa', 'シ': 'shi', 'ス': 'su', 'セ': 'se', 'ソ': 'so',
    'タ': 'ta', 'チ': 'chi', 'ツ': 'tsu', 'テ': 'te', 'ト': 'to',
    'ナ': 'na', 'ニ': 'ni', 'ヌ': 'nu', 'ネ': 'ne', 'ノ': 'no',
    'ハ': 'ha', 'ヒ': 'hi', 'フ': 'fu', 'ヘ': 'he', 'ホ': 'ho',
    'マ': 'ma', 'ミ': 'mi', 'ム': 'mu', 'メ': 'me', 'モ': 'mo',
    'ヤ': 'ya', 'ユ': 'yu', 'ヨ': 'yo',
    'ラ': 'ra', 'リ': 'ri', 'ル': 'ru', 'レ': 're', 'ロ': 'ro',
    'ワ': 'wa', 'ヲ': 'wo', 'ン': 'n',
    'ガ': 'ga', 'ギ': 'gi', 'グ': 'gu', 'ゲ': 'ge', 'ゴ': 'go',
    'ザ': 'za', 'ジ': 'ji', 'ズ': 'zu', 'ゼ': 'ze', 'ゾ': 'zo',
    'ダ': 'da', 'ヂ': 'ji', 'ヅ': 'zu', 'デ': 'de', 'ド': 'do',
    'バ': 'ba', 'ビ': 'bi', 'ブ': 'bu', 'ベ': 'be', 'ボ': 'bo',
    'パ': 'pa', 'ピ': 'pi', 'プ': 'pu', 'ペ': 'pe', 'ポ': 'po',
    'ャ': 'ya', 'ュ': 'yu', 'ョ': 'yo', 'ッ': 'tsu',
  };
  
  // Common kanji readings for basic phrases
  const commonKanji: Record<string, string> = {
    '明日': 'ashita', '今日': 'kyou', '昨日': 'kinou',
    '火曜日': 'kayoubi', '月曜日': 'getsuyoubi', '水曜日': 'suiyoubi',
    '木曜日': 'mokuyoubi', '金曜日': 'kinyoubi', '土曜日': 'doyoubi', '日曜日': 'nichiyoubi',
    '私': 'watashi', '私たち': 'watashitachi',
    '日本': 'nihon', '日本語': 'nihongo',
    '英語': 'eigo',
    '漢字': 'kanji', 'ひらがな': 'hiragana', 'カタカナ': 'katakana',
    '人': 'hito', '人々': 'hitobito',
    '大きい': 'ookii', '小さい': 'chiisai',
    '新しい': 'atarashii', '古い': 'furui',
    '良い': 'yoi', '悪い': 'warui',
    '多い': 'ooi', '少ない': 'sukunai',
    '長い': 'nagai', '短い': 'mijikai',
    '高い': 'takai', '安い': 'yasui',
    '近い': 'chikai', '遠い': 'tooi',
    '忙しい': 'isogashii', '楽しい': 'tanoshii',
    '難しい': 'muzukashii', '易しい': 'yasashii',
  };
  
  let result = text;
  
  // Replace common kanji first
  for (const [kanji, romaji] of Object.entries(commonKanji)) {
    result = result.split(kanji).join(romaji);
  }
  
  // Convert kana to romaji
  let romaji = '';
  for (const char of result) {
    romaji += kanaToRomaji[char] || char;
  }
  
  // Post-processing for particle pronunciation
  // Handle Japanese particles that have different readings when used as particles:
  // は (ha) as topic marker = wa
  // へ (he) as direction marker = e
  // を (wo) as object marker = o
  
  // Pattern: word boundary + particle at end of phrase or before space/punctuation
  // We need to identify particles vs normal syllables
  
  // Split into words/tokens and process each
  const tokens = romaji.split(/(\s+)/);
  const processed = tokens.map((token, index) => {
    const trimmed = token.trim();
    
    // Check if this looks like a standalone particle
    // Particles are typically: ha, he, wo, ga, ka, ni, de, to, mo, no
    // But we only need to fix the ones with different pronunciation: ha->wa, he->e, wo->o
    
    if (trimmed === 'ha') {
      // Check if it's likely a particle (between words or at end)
      const prevToken = tokens[index - 2]; // -2 because -1 is the space
      const nextToken = tokens[index + 2]; // +2 because +1 is the space
      
      // If previous token exists and looks like a word, and next is space/end/punctuation
      // then it's likely a particle
      if (prevToken && prevToken.trim()) {
        return 'wa';
      }
    }
    
    if (trimmed === 'he') {
      const prevToken = tokens[index - 2];
      if (prevToken && prevToken.trim()) {
        return 'e';
      }
    }
    
    if (trimmed === 'wo') {
      const prevToken = tokens[index - 2];
      if (prevToken && prevToken.trim()) {
        return 'o';
      }
    }
    
    return token;
  });
  
  romaji = processed.join('').replace(/\s+/g, ' ').trim();
  
  return romaji;
}

export async function generateSpeech({ text, language, gender, voiceStyle = 'normal' }: TTSOptions): Promise<Buffer> {
  if (!ELEVENLABS_API_KEY) {
    throw new Error('ELEVENLABS_API_KEY not set');
  }

  // Clean text for TTS - remove furigana/ruby annotations
  let cleanText = stripFurigana(text);

  // For Japanese, convert to romaji for better TTS pronunciation
  // This fixes particle pronunciation (は as wa, へ as e)
  if (language === 'japanese') {
    cleanText = japaneseToRomaji(cleanText);
  }

  console.log(`[TTS] Original: "${text}" -> Clean: "${cleanText}" -> Style: ${voiceStyle}`);

  const voiceId = VOICES[language][voiceStyle][gender];

  // Anime mode = more expressive settings
  const isAnime = voiceStyle === 'anime';
  const voiceSettings = {
    stability: isAnime ? 0.25 : 0.3,        // More variable for anime
    similarity_boost: isAnime ? 0.85 : 0.7, // Higher expressiveness for anime
    style: isAnime ? 0.7 : 0.4,             // Much higher style boost for anime
    use_speaker_boost: isAnime,              // Extra clarity for anime
  };

  console.log(`[TTS] Using voice ${voiceId} with settings:`, voiceSettings);

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
        text: cleanText,
        model_id: 'eleven_multilingual_v2',
        voice_settings: voiceSettings,
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

export function getVoiceInfo(language: Language, gender: Gender, voiceStyle: VoiceStyle = 'normal') {
  return {
    voiceId: VOICES[language][voiceStyle][gender],
    language,
    gender,
    voiceStyle,
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

// No fallback dictionary - we rely on Jisho API and proper logic
// Individual kanji should be handled by improving the lookup logic

// Helper function to fetch from Jisho with retry logic for 429 rate limit
async function fetchFromJisho(word: string): Promise<Response | null> {
  const maxRetries = 3;
  const baseDelay = 500; // 500ms
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(`https://jisho.org/api/v1/search/words?keyword=${encodeURIComponent(word)}`);
      
      if (response.status === 429) {
        if (attempt < maxRetries) {
          const delay = baseDelay + (attempt * 500); // 500ms, 1000ms, 1500ms
          console.log(`[Furigana] Rate limited (429), retry ${attempt + 1}/${maxRetries} after ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        } else {
          console.log('[Furigana] Max retries reached for 429');
          return null;
        }
      }
      
      return response;
    } catch (error) {
      if (attempt < maxRetries) {
        const delay = baseDelay + (attempt * 500);
        console.log(`[Furigana] Fetch error, retry ${attempt + 1}/${maxRetries} after ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        console.error('[Furigana] Fetch failed after all retries:', error);
        return null;
      }
    }
  }
  
  return null;
}

// Fetch reading from Jisho API
async function getReadingFromJisho(word: string): Promise<string | null> {
  await loadCache();
  
  // Check cache first
  if (furiganaCache.has(word)) {
    console.log(`[Furigana] Cache hit for: ${word} = ${furiganaCache.get(word)}`);
    return furiganaCache.get(word)!;
  }

  console.log(`[Furigana] Fetching from Jisho: ${word}`);
  const response = await fetchFromJisho(word);
  
  if (!response) {
    return null;
  }
  
  if (!response.ok) {
    console.log(`[Furigana] Jisho request failed: ${response.status}`);
    return null;
  }
  
  try {
    const data = await response.json();
    console.log(`[Furigana] Jisho results count: ${data.data?.length || 0}`);
    
    if (data.data && data.data.length > 0) {
      // First pass: check all japanese entries in all results for exact word match
      for (const result of data.data) {
        // Check ALL japanese variants, not just the first one
        for (const japanese of result.japanese || []) {
          if (japanese && japanese.reading) {
            const resultWord = japanese.word;
            const reading = japanese.reading;
            
            // Accept exact word match
            if (resultWord === word) {
              furiganaCache.set(word, reading);
              await saveCache();
              console.log(`[Furigana] Cached: ${word} = ${reading}`);
              return reading;
            }
          }
        }
      }
      
      // Second pass: try slug match (when no exact word match found)
      for (const result of data.data) {
        const japanese = result.japanese?.[0];
        if (japanese && japanese.reading && result.slug === word) {
          furiganaCache.set(word, japanese.reading);
          await saveCache();
          console.log(`[Furigana] Cached (by slug): ${word} = ${japanese.reading}`);
          return japanese.reading;
        }
      }
      
      // Third pass: try reading-only entries
      for (const result of data.data) {
        for (const japanese of result.japanese || []) {
          if (japanese && !japanese.word && japanese.reading) {
            if (result.slug === word) {
              furiganaCache.set(word, japanese.reading);
              await saveCache();
              console.log(`[Furigana] Cached (reading-only): ${word} = ${japanese.reading}`);
              return japanese.reading;
            }
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

// Common particles that indicate word boundaries
const PARTICLES = new Set(['は', 'が', 'を', 'に', 'で', 'から', 'まで', 'より', 'と', 'や', 'の', 'へ', 'も', 'と', 'ね', 'よ', 'か', 'わ']);

// Common okurigana patterns for adjectives and verbs
const OKURIGANA_PATTERNS = ['くない', 'くて', 'く', 'すぎる', 'すぎ', 'かった', 'かっ', 'い', 'しい', 'ちゃう', 'ちゃ', 'なさい', 'なさ', 'ない', 'たい', 'た', 'て', 'ば', 'べ', 'む', 'る', 'う', 'く', 'す', 'つ', 'ぬ', 'ふ', 'ゆ', 'ぐ', 'ず', 'づ', 'ぶ', 'ぷ', 'れ', 'せ', 'め'];

// Convert hiragana to romaji for comparison
function hiraganaToRomaji(hiragana: string): string {
  const map: Record<string, string> = {
    'あ': 'a', 'い': 'i', 'う': 'u', 'え': 'e', 'お': 'o',
    'か': 'ka', 'き': 'ki', 'く': 'ku', 'け': 'ke', 'こ': 'ko',
    'さ': 'sa', 'し': 'shi', 'す': 'su', 'せ': 'se', 'そ': 'so',
    'た': 'ta', 'ち': 'chi', 'つ': 'tsu', 'て': 'te', 'と': 'to',
    'な': 'na', 'に': 'ni', 'ぬ': 'nu', 'ね': 'ne', 'の': 'no',
    'は': 'ha', 'ひ': 'hi', 'ふ': 'fu', 'へ': 'he', 'ほ': 'ho',
    'ま': 'ma', 'み': 'mi', 'む': 'mu', 'め': 'me', 'も': 'mo',
    'や': 'ya', 'ゆ': 'yu', 'よ': 'yo',
    'ら': 'ra', 'り': 'ri', 'る': 'ru', 'れ': 're', 'ろ': 'ro',
    'わ': 'wa', 'を': 'wo', 'ん': 'n',
    'が': 'ga', 'ぎ': 'gi', 'ぐ': 'gu', 'げ': 'ge', 'ご': 'go',
    'ざ': 'za', 'じ': 'ji', 'ず': 'zu', 'ぜ': 'ze', 'ぞ': 'zo',
    'だ': 'da', 'ぢ': 'ji', 'づ': 'zu', 'で': 'de', 'ど': 'do',
    'ば': 'ba', 'び': 'bi', 'ぶ': 'bu', 'べ': 'be', 'ぼ': 'bo',
    'ぱ': 'pa', 'ぴ': 'pi', 'ぷ': 'pu', 'ぺ': 'pe', 'ぽ': 'po',
    'ゃ': 'ya', 'ゅ': 'yu', 'ょ': 'yo', 'っ': 'tsu',
  };
  
  let result = '';
  for (const char of hiragana) {
    result += map[char] || char;
  }
  return result;
}

// Try to get reading for kanji in context of full word (with okurigana)
// This gives correct kun'yomi reading (e.g., 暑い -> あつ not しょ)
async function getReadingForFullWord(fullText: string, kanjiWord: string): Promise<string | null> {
  // Find the kanji position in the full text
  const kanjiIndex = fullText.indexOf(kanjiWord);
  if (kanjiIndex === -1) return null;
  
  // Extract hiragana after kanji, but stop at word boundaries
  let okurigana = '';
  for (let i = kanjiIndex + kanjiWord.length; i < fullText.length; i++) {
    const char = fullText[i];
    // Check if hiragana (3040-309F)
    if (/[\u3040-\u309F]/.test(char)) {
      // Stop at common particles (word boundaries)
      if (PARTICLES.has(char) && okurigana.length > 0) {
        break;
      }
      okurigana += char;
      // Limit okurigana length to avoid capturing grammar
      if (okurigana.length >= 5) break;
    } else {
      break;
    }
  }
  
  if (!okurigana) return null; // No okurigana, use regular lookup
  
  // Try progressively shorter okurigana to find a match
  // This handles cases like "速いです" -> try "速いです", "速いで", "速い"
  let testOkurigana = okurigana;
  while (testOkurigana.length > 0) {
    const fullWord = kanjiWord + testOkurigana;
    console.log(`[Furigana] Looking up full word: "${fullWord}" for kanji "${kanjiWord}"`);
    
    const fullReading = await getReadingFromJisho(fullWord);
    if (fullReading) {
      // Jisho returns hiragana reading, okurigana is also hiragana
      // Extract just the kanji reading by removing okurigana portion from the end
      let kanjiReading = fullReading;
      if (kanjiReading.endsWith(testOkurigana)) {
        kanjiReading = kanjiReading.slice(0, -testOkurigana.length);
      }

      console.log(`[Furigana] Extracted kanji reading: "${kanjiReading}" from "${fullReading}" (removed "${testOkurigana}")`);
      return kanjiReading;
    }
    
    // Try shorter okurigana
    testOkurigana = testOkurigana.slice(0, -1);
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
    // First try: get reading for kanji in context of full word (with okurigana)
    // This gives correct kun'yomi reading (e.g., 暑い -> あつ not しょ)
    const fullWordReading = await getReadingForFullWord(text, kanjiWord);
    
    let reading = fullWordReading;
    
    if (!reading) {
      // Fallback: get reading for kanji alone
      reading = await getReadingFromJisho(kanjiWord);
    }
    
    if (reading) {
      const ruby = `<ruby>${kanjiWord}<rt>${reading}</rt></ruby>`;
      result = result.replace(new RegExp(kanjiWord, 'g'), ruby);
      console.log(`[Furigana] Replaced "${kanjiWord}" with "${ruby}"`);
    } else {
      console.log(`[Furigana] No reading found for: "${kanjiWord}"`);
    }
  }
  
  console.log(`[Furigana] Result: "${result}"`);
  
  // Post-processing: check if all kanji have furigana
  // Find any remaining bare kanji (not wrapped in <ruby> tags)
  // Remove all ruby tags temporarily to check what's left
  const textWithoutRuby = result.replace(/<ruby>[^<]*<rt>[^<]*<\/rt><\/ruby>/g, '');
  const kanjiRegex2 = /[\u4e00-\u9faf]/g;
  const remainingKanji = textWithoutRuby.match(kanjiRegex2);
  
  if (remainingKanji && remainingKanji.length > 0) {
    const uniqueRemaining = [...new Set(remainingKanji)];
    console.log(`[Furigana] Post-processing: Found ${uniqueRemaining.length} unique kanji without furigana: [${uniqueRemaining.join(', ')}]`);
    
    // Try to get furigana for remaining kanji individually
    for (const kanji of uniqueRemaining) {
      // Check cache first
      let reading = furiganaCache.get(kanji);
      
      if (!reading) {
        // Fetch from Jisho
        reading = (await getReadingFromJisho(kanji)) ?? undefined;
      }
      
      if (reading) {
        const ruby = `<ruby>${kanji}<rt>${reading}</rt></ruby>`;
        // Replace bare kanji that are not already inside ruby tags
        // Simple approach: replace in the original result
        result = result.replace(kanji, ruby);
        console.log(`[Furigana] Post-process: Added "${ruby}" for "${kanji}"`);
      } else {
        console.log(`[Furigana] Post-process: Could not find reading for "${kanji}"`);
      }
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
      reading = (await getReadingFromJisho(kanjiWord)) ?? undefined;
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
