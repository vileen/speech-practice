// romaji.ts - Japanese text to romaji conversion utilities
import kuromoji from 'kuromoji';

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
  'ゃ': 'ya', 'ゅ': 'yu', 'ょ': 'yo', 'っ': '',
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
  'ャ': 'ya', 'ュ': 'yu', 'ョ': 'yo', 'ッ': '',
};

// Lazy-loaded kuromoji tokenizer
let tokenizer: any = null;

async function getTokenizer(): Promise<any> {
  if (tokenizer) return tokenizer;
  
  return new Promise((resolve, reject) => {
    kuromoji.builder({ dicPath: 'node_modules/kuromoji/dict' }).build((err: any, t: any) => {
      if (err) {
        reject(err);
      } else {
        tokenizer = t;
        resolve(t);
      }
    });
  });
}

/**
 * Tokenize Japanese text using kuromoji
 * Returns array of tokens with surface form and reading
 */
async function tokenizeJapanese(text: string): Promise<Array<{ surface: string; reading: string; pos: string }>> {
  try {
    const t = await getTokenizer();
    return t.tokenize(text);
  } catch (err) {
    console.error('Kuromoji tokenization failed:', err);
    // Fallback: return single token
    return [{ surface: text, reading: text, pos: 'UNKNOWN' }];
  }
}

/**
 * Convert hiragana/katakana string to romaji
 * Preserves spaces in input
 */
function convertKanaToRomaji(text: string): string {
  let romaji = '';
  let i = 0;

  while (i < text.length) {
    const char = text[i];
    const nextChar = text[i + 1];

    // Preserve spaces
    if (char === ' ') {
      romaji += ' ';
      i++;
      continue;
    }

    // Small tsu (sokuon) - doubles next consonant
    if (char === 'っ' || char === 'ッ') {
      if (nextChar && kanaToRomaji[nextChar]) {
        romaji += kanaToRomaji[nextChar][0];
      }
      i++;
      continue;
    }

    // Compound sounds (small ya, yu, yo)
    if (i + 1 < text.length && ['ゃ', 'ゅ', 'ょ', 'ャ', 'ュ', 'ョ'].includes(nextChar)) {
      if (kanaToRomaji[char] && kanaToRomaji[nextChar]) {
        romaji += kanaToRomaji[char].slice(0, -1) + kanaToRomaji[nextChar];
        i += 2;
        continue;
      }
    }

    // Long vowels
    if (char === 'ー' || char === '〜') {
      if (romaji.length > 0) {
        const lastVowel = romaji[romaji.length - 1];
        if ('aeiou'.includes(lastVowel)) {
          romaji += lastVowel;
        }
      }
      i++;
      continue;
    }

    // Regular character
    if (kanaToRomaji[char]) {
      romaji += kanaToRomaji[char];
    }

    i++;
  }

  return romaji;
}

/**
 * Fix particle pronunciations in romaji
 * ha -> wa, he -> e when used as particles
 */
function fixParticlePronunciations(romaji: string): string {
  return romaji
    .split(' ')
    .map(word => {
      if (word === 'ha') return 'wa';
      if (word === 'he') return 'e';
      return word;
    })
    .join(' ');
}

/**
 * Merge grammatical suffixes with their base words using kuromoji POS tags
 * e.g., "shi nakere ba nari mase n" -> "shinakereba narimasen"
 * Particles (助詞) stay separate for readability
 */
function mergeGrammaticalForms(tokens: Array<{ surface: string; reading: string; pos: string }>): string[] {
  const result: string[] = [];
  let currentWord = '';
  
  // POS tags that should be merged with previous word (auxiliary verbs, suffixes)
  // Note: 助詞 (particles) are NOT included - they stay separate
  const mergeablePos = ['助動詞', '接尾辞']; // auxiliary verbs, suffixes only
  
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const romaji = convertKanaToRomaji(token.reading || token.surface);
    
    // If this is a mergeable token (auxiliary verb, suffix), merge with current word
    if (mergeablePos.some(pos => token.pos.includes(pos))) {
      currentWord += romaji;
    } else {
      // This is an independent token (main word, particle, etc.)
      // Flush previous word if exists
      if (currentWord) {
        result.push(currentWord);
      }
      // Start new word - particles get their own slot
      currentWord = romaji;
    }
  }
  
  // Flush last word
  if (currentWord) {
    result.push(currentWord);
  }
  
  return result;
}

/**
 * Main function to convert Japanese text to romaji
 * Uses kuromoji for proper tokenization
 * @param text - Original Japanese text (may contain kanji)
 * @returns Romaji string with proper spacing
 */
export async function generateRomaji(text: string): Promise<string> {
  if (!text) return '';

  // Tokenize using kuromoji
  const tokens = await tokenizeJapanese(text);
  
  // Merge grammatical forms for better readability
  const mergedParts = mergeGrammaticalForms(tokens);

  // Join with spaces
  const romaji = mergedParts.join(' ');

  // Fix particle pronunciations (ha -> wa, he -> e)
  return fixParticlePronunciations(romaji).trim();
}

/**
 * Generate furigana HTML from kanji and its reading
 * Used for vocabulary items that have reading stored in database
 */
export function generateFuriganaFromReading(jp: string, reading: string | null | undefined): string | null {
  if (!reading) return null;

  // Find the kanji portion (everything until first hiragana)
  let kanjiEnd = 0;
  for (let i = 0; i < jp.length; i++) {
    const char = jp[i];
    if (/[\u4e00-\u9faf]/.test(char)) {
      kanjiEnd = i + 1;
    } else if (/[ぁ-ん]/.test(char)) {
      break;
    }
  }

  const kanjiPart = jp.substring(0, kanjiEnd);
  const okurigana = jp.substring(kanjiEnd);

  if (kanjiPart.length === 0) return null;

  return `<ruby>${kanjiPart}<rt>${reading}</rt></ruby>${okurigana}`;
}