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

const particles = ['は', 'が', 'を', 'に', 'で', 'と', 'の', 'も', 'へ', 'や', 'か', 'ね', 'よ', 'わ', 'て', 'ば'];

// Common Japanese words for segmentation (hiragana)
const commonWords = new Set([
  'あなた', 'あの', 'ありがとう', 'ある', 'あれ', 'いい', 'いく', 'いくつ', 'いち', 'いま', 'いや', 'いる', 'いろいろ',
  'うち', 'うまい', 'おい', 'おいしい', 'おおきい', 'おかしい', 'おきる', 'おく', 'おくる', 'おさけ', 'おしえる',
  'おちる', 'おっと', 'おと', 'おとうと', 'おとな', 'おなか', 'おにい', 'おねえ', 'おのおの', 'おば', 'おばあ',
  'おひさ', 'おふろ', 'おまえ', 'おもい', 'おもう', 'おや', 'およぐ', 'おりる', 'おる', 'おれ', 'おわり', 'おんな',
  'かい', 'かう', 'かえる', 'かお', 'かかる', 'かぎ', 'かく', 'かける', 'かさ', 'かす', 'かた', 'かち', 'かつ',
  'かなしい', 'かのじょ', 'かばん', 'かべ', 'かみ', 'かも', 'から', 'かるい', 'かれ', 'かんじ', 'き', 'きいろ',
  'きく', 'きせつ', 'きた', 'きたない', 'きっと', 'きのう', 'きみ', 'きもち', 'きる', 'きょう', 'きょねん',
  'きらい', 'きれい', 'きろ', 'ぎん', 'く', 'くい', 'くう', 'くすり', 'くだ', 'くち', 'くに', 'くも', 'くらい',
  'くる', 'くれ', 'くろ', 'け', 'けさ', 'けす', 'けっこう', 'けっして', 'けれど', 'げつ', 'こい', 'こう', 'ここ',
  'こちら', 'こっち', 'こと', 'この', 'こば', 'こまる', 'これ', 'こん', 'こんど', 'こんばん', 'さい', 'さか',
  'さき', 'さく', 'さす', 'さっき', 'さて', 'さとう', 'さびしい', 'さむい', 'さらい', 'さん', 'しかし', 'しごと',
  'しぬ', 'しばらく', 'しまう', 'しめる', 'しゃ', 'しゃべる', 'しゅう', 'しょう', 'しょく', 'しる', 'しろ',
  'しん', 'す', 'すぐ', 'すこし', 'すずしい', 'すてる', 'すな', 'すぱ', 'すみ', 'する', 'すわる', 'せん', 'ぜん',
  'そう', 'そこ', 'そちら', 'そっち', 'そと', 'その', 'そば', 'そら', 'それ', 'そろ', 'たい', 'たいせつ', 'たかい',
  'たく', 'たくさん', 'たしか', 'たす', 'たすける', 'たつ', 'たて', 'たぶん', 'たべ', 'たべる', 'たまご', 'ため',
  'たより', 'だい', 'だけ', 'だす', 'だれ', 'ちい', 'ちいさい', 'ちがう', 'ちかい', 'ちから', 'ちず', 'ちち',
  'ちゃ', 'ちゃん', 'ちょう', 'ちょっと', 'つい', 'つかう', 'つかれる', 'つき', 'つく', 'つくえ', 'つける', 'つぎ',
  'つまらない', 'つめ', 'つもり', 'つよい', 'つる', 'て', 'てがみ', 'てつ', 'てぶくろ', 'てら', 'でも', 'でる',
  'でんわ', 'と', 'とう', 'とお', 'とおい', 'とき', 'ところ', 'とし', 'とち', 'とても', 'とどく', 'となり', 'とまる',
  'とも', 'とる', 'どう', 'どうして', 'どうぞ', 'どこ', 'どちら', 'どっち', 'どの', 'どれ', 'なか', 'ながい',
  'なく', 'なぜ', 'なつ', 'なに', 'なの', 'なふだ', 'なまえ', 'なら', 'なる', 'なん', 'に', 'にく', 'にし',
  'にち', 'にもつ', 'にわ', 'ぬ', 'ぬぐ', 'ぬる', 'ね', 'ねがい', 'ねこ', 'ねだん', 'ねる', 'の', 'のこる',
  'のぞく', 'のる', 'はい', 'はがき', 'はこ', 'はし', 'はじまる', 'はじめ', 'はじめて', 'はず', 'はたらく',
  'はち', 'はな', 'はなす', 'はなび', 'はなみ', 'はやい', 'はる', 'はれ', 'はん', 'ば', 'ばか', 'ばかり',
  'ひく', 'ひこう', 'ひだり', 'ひと', 'ひとつ', 'ひま', 'ひゃく', 'ひる', 'ひろい', 'ふう', 'ふく', 'ふたつ',
  'ふつ', 'ふる', 'ふん', 'ぶ', 'へ', 'へい', 'へる', 'ほう', 'ほしい', 'ほそい', 'ほど', 'ほん', 'まい',
  'まいにち', 'まえ', 'まがる', 'まず', 'また', 'まだ', 'まち', 'まっ', 'まど', 'まるい', 'まわる', 'み', 'みぎ',
  'みじかい', 'みず', 'みせ', 'みせる', 'みち', 'みっつ', 'みな', 'みなみ', 'みみ', 'みる', 'みんな', 'むい',
  'むすこ', 'むすめ', 'むね', 'むら', 'め', 'めがね', 'も', 'もう', 'もく', 'もし', 'もちろん', 'もつ', 'もっと',
  'もみじ', 'もも', 'もや', 'もらう', 'もん', 'や', 'やお', 'やさい', 'やすい', 'やすむ', 'やっと', 'やま',
  'やめる', 'ゆう', 'ゆうがた', 'ゆうびん', 'ゆうべ', 'ゆうめい', 'ゆき', 'ゆっくり', 'ゆび', 'ゆめ', 'ゆるい',
  'よ', 'よう', 'ようか', 'よく', 'よこ', 'よし', 'よつ', 'よてい', 'よねん', 'よぶ', 'よむ', 'よる', 'より',
  'よわい', 'よん', 'らい', 'らいげつ', 'らいしゅう', 'らいねん', 'らく', 'り', 'りっぱ', 'りょう', 'りょこう',
  'る', 'るす', 'れい', 'れき', 'ろく', 'わ', 'わかい', 'わかる', 'わすれる', 'わたし', 'わるい', 'わん',
  // Extended vocabulary
  'ことば', 'ともだち', 'かぞく', 'せんせい', 'がっこう', 'だいがく', 'びょういん', 'えき', 'ひこうき',
  'でんしゃ', 'くるま', 'じてんしゃ', 'みせ', 'レストラン', 'ホテル', 'まち', 'くに', 'かたち', 'いろ',
  'おんがく', 'えいが', 'しゃしん', 'てがみ', 'きょうみ', 'しゅみ', 'うんどう', 'りょうり', 'さかな',
  'にく', 'やさい', 'くだもの', 'のみもの', 'さとう', 'しお', 'しょうゆ', 'みず', 'おちゃ', 'こうちゃ',
  'ぎゅうにゅう', 'パン', 'ごはん', 'みそしる', 'すいか', 'りんご', 'みかん', 'ばなな', 'にほん', 'えいご',
  'がいこく', 'がいこくじん', 'かんこう', 'りょかん', 'おんせん', 'まつり', 'しゅうまつ', 'きょうと',
  'とうきょう', 'おおさか', 'ふくおか', 'さっぽろ', 'なごや', 'こうべ', 'ひろしま'
]);

/**
 * Segment hiragana text into words using dictionary lookup
 * Falls back to particle-based segmentation for unknown words
 */
function segmentHiraganaWords(hiraganaText: string): string {
  const result: string[] = [];
  let i = 0;
  
  while (i < hiraganaText.length) {
    // Try to find longest matching word in dictionary
    let matched = false;
    
    // Try lengths from 8 chars down to 1
    for (let len = Math.min(8, hiraganaText.length - i); len >= 1; len--) {
      const substring = hiraganaText.substring(i, i + len);
      
      if (commonWords.has(substring)) {
        result.push(substring);
        i += len;
        matched = true;
        break;
      }
    }
    
    if (!matched) {
      // Check if it's a particle
      const char = hiraganaText[i];
      if (particles.includes(char)) {
        result.push(char);
      } else {
        // Unknown word - add single character
        result.push(char);
      }
      i++;
    }
  }
  
  return result.join(' ');
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
 * Post-process romaji to add spaces at natural boundaries.
 * Uses simple heuristics to identify likely word boundaries.
 */
function addSpacesToRomaji(romaji: string): string {
  // Add spaces after question marks (ka at end of sentence)
  let result = romaji
    .replace(/(ka)([^a-z]|$)/g, '$1 $2')     // か (question) followed by non-letter or end
    .replace(/(ne)([^a-z]|$)/g, '$1 $2')     // ね (confirmation)
    .replace(/(yo)([^a-z]|$)/g, '$1 $2')     // よ (emphasis)
    .replace(/(na)(do)([^a-z]|$)/g, '$1$2 $3') // など (etc)
    .replace(/(de)(su)([^a-z]|$)/g, '$1$2 $3') // です
    .replace(/(ma)(su)([^a-z]|$)/g, '$1$2 $3') // ～ます
    .replace(/(ta)(i)([^a-z]|$)/g, '$1$2 $3')  // ～たい
    .replace(/(nai)([^a-z]|$)/g, '$1 $2')    // ～ない
    .replace(/(ta)([^a-z]|$)/g, '$1 $2');    // ～た (past)

  // Clean up multiple spaces and trim
  return result.replace(/ +/g, ' ').trim();
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
 * Extract hiragana readings from furigana HTML and segment into words.
 * Uses <ruby> tags to identify word boundaries.
 * Returns array of { text, isParticle } for each segment.
 */
function extractAndSegmentFurigana(furiganaHtml: string): Array<{ text: string; isParticle: boolean }> {
  const segments: Array<{ text: string; isParticle: boolean }> = [];
  const particles = ['は', 'が', 'を', 'に', 'で', 'と', 'の', 'も', 'か', 'ね', 'よ'];
  
  // Regex to match: <ruby>...</ruby> or plain text
  const tokenRegex = /<ruby>[^<]*<rt>([^<]*)<\/rt><\/ruby>|([^<]+)/g;
  let match;
  
  while ((match = tokenRegex.exec(furiganaHtml)) !== null) {
    if (match[1]) {
      // This is a <ruby> tag with reading in group 1
      segments.push({ text: match[1], isParticle: false });
    } else if (match[2]) {
      // This is plain text in group 2
      const text = match[2];
      // Split plain text into particles and words
      let current = '';
      for (const char of text) {
        if (particles.includes(char)) {
          if (current) {
            segments.push({ text: current, isParticle: false });
            current = '';
          }
          segments.push({ text: char, isParticle: true });
        } else {
          current += char;
        }
      }
      if (current) {
        segments.push({ text: current, isParticle: false });
      }
    }
  }
  
  return segments;
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

  let segments: Array<{ text: string; isParticle: boolean }>;

  if (furiganaHtml) {
    // Use furigana HTML structure to segment properly
    segments = extractAndSegmentFurigana(furiganaHtml);
  } else if (hasKanji) {
    // Generate furigana for kanji
    const { addFurigana } = await import('./elevenlabs.js');
    const generated = await addFurigana(text);
    segments = extractAndSegmentFurigana(generated);
  } else {
    // No kanji - segment plain text
    const particles = ['は', 'が', 'を', 'に', 'で', 'と', 'の', 'も', 'か', 'ね', 'よ'];
    segments = [];
    let current = '';
    for (const char of text) {
      if (particles.includes(char)) {
        if (current) {
          segments.push({ text: current, isParticle: false });
          current = '';
        }
        segments.push({ text: char, isParticle: true });
      } else {
        current += char;
      }
    }
    if (current) {
      segments.push({ text: current, isParticle: false });
    }
  }

  // Convert each segment to romaji and join with spaces
  const romajiParts = segments.map((seg) => convertKanaToRomaji(seg.text));
  
  // Join with spaces between segments
  const romaji = romajiParts.join(' ');

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
