// romaji.ts - Japanese text to romaji conversion utilities

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

const particles = ['は', 'が', 'を', 'に', 'で', 'と', 'の', 'も', 'へ', 'や', 'か', 'ね', 'よ', 'わ'];

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
 * Add spaces around particles in hiragana text
 * Example: "saikineakonwo" -> "saikin eakon wo"
 */
function addSpacesAroundParticles(hiraganaText: string): string {
  let result = '';
  
  for (let i = 0; i < hiraganaText.length; i++) {
    const char = hiraganaText[i];
    const prevChar = hiraganaText[i - 1];
    const nextChar = hiraganaText[i + 1];
    
    const isParticle = particles.includes(char);
    const prevIsSpace = prevChar === ' ';
    const nextIsSpace = nextChar === ' ';
    const nextIsParticle = particles.includes(nextChar);
    
    // Add space BEFORE particle
    if (isParticle && i > 0 && !prevIsSpace) {
      result += ' ';
    }
    
    result += char;
    
    // Add space AFTER particle (if next isn't space and isn't another particle)
    if (isParticle && i < hiraganaText.length - 1 && !nextIsSpace && !nextIsParticle) {
      result += ' ';
    }
  }
  
  return result;
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
 * Extract hiragana readings from furigana HTML
 * Replaces <ruby>漢字<rt>かんじ</rt></ruby> with かんじ
 */
function extractHiraganaFromFurigana(furiganaHtml: string): string {
  return furiganaHtml
    .replace(/<ruby>[^<]*<rt>([^<]*)<\/rt><\/ruby>/g, '$1')
    .replace(/<[^>]*>/g, '');
}

/**
 * Main function to convert Japanese text to romaji
 * @param text - Original Japanese text (may contain kanji)
 * @param furiganaHtml - Optional pre-generated furigana HTML
 * @returns Romaji string with proper spacing
 */
export async function generateRomaji(
  text: string, 
  furiganaHtml?: string | null
): Promise<string> {
  if (!text) return '';

  // Check if we need to generate furigana
  let hiraganaText: string;
  const hasKanji = /[\u4e00-\u9faf]/.test(text);

  if (furiganaHtml) {
    // Use provided furigana
    hiraganaText = extractHiraganaFromFurigana(furiganaHtml);
  } else if (hasKanji) {
    // Generate furigana for kanji
    const { addFurigana } = await import('./elevenlabs.js');
    const generated = await addFurigana(text);
    hiraganaText = extractHiraganaFromFurigana(generated);
  } else {
    // No kanji - use text directly
    hiraganaText = text;
  }

  // Add spaces around particles
  const hiraganaWithSpaces = addSpacesAroundParticles(hiraganaText);

  // Convert to romaji
  const romaji = convertKanaToRomaji(hiraganaWithSpaces);

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
