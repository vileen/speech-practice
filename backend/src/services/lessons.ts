// Lesson Data Management - PostgreSQL version
import { pool } from '../db/pool.js';

interface VocabItem {
  jp: string;
  reading: string;
  en: string;
  type?: string;
  tags: string[];
  furigana?: string | null;
}

interface GrammarPoint {
  pattern: string;
  explanation: string;
  examples: Array<{
    jp: string; 
    en: string;
    furigana?: string | null;
  }>;
}

interface PracticePhrase {
  jp: string;
  en: string;
  romaji?: string;
  furigana?: string | null;
  order?: number;
}

interface LessonData {
  id: string;
  date: string;
  title: string;
  order: number;
  topics: string[];
  vocabulary: VocabItem[];
  grammar: GrammarPoint[];
  practice_phrases: PracticePhrase[];
}

interface LessonIndex {
  count: number;
  lessons: Array<{
    id: string;
    date: string;
    title: string;
    order: number;
    topics: string[];
    vocabCount: number;
    grammarCount: number;
  }>;
}

// Get lesson index (list all lessons)
export async function getLessonIndex(): Promise<LessonIndex> {
  const result = await pool.query(
    'SELECT id, date, title, order_num as order, topics, ' +
    'jsonb_array_length(vocabulary) as vocabCount, ' +
    'jsonb_array_length(grammar) as grammarCount ' +
    'FROM lessons ORDER BY order_num DESC'
  );
  
  return {
    count: result.rows.length,
    lessons: result.rows.map(row => ({
      id: row.id,
      date: row.date,
      title: row.title,
      order: row.order,
      topics: row.topics || [],
      vocabCount: parseInt(row.vocabcount) || 0,
      grammarCount: parseInt(row.grammarcount) || 0
    }))
  };
}

// Get furigana from cache
export async function getCachedFurigana(text: string): Promise<string | null> {
  const result = await pool.query(
    'SELECT furigana_html FROM furigana_cache WHERE original_text = $1',
    [text]
  );
  
  if (result.rows.length === 0) {
    return null;
  }
  
  return result.rows[0].furigana_html;
}

// Store furigana in cache
export async function cacheFurigana(text: string, furiganaHtml: string): Promise<void> {
  await pool.query(
    `INSERT INTO furigana_cache (original_text, furigana_html)
     VALUES ($1, $2)
     ON CONFLICT (original_text) DO UPDATE SET
       furigana_html = EXCLUDED.furigana_html`,
    [text, furiganaHtml]
  );
}

// Generate furigana HTML from reading field
// Example: jp="安い", reading="やす" -> "<ruby>安<rt>やす</rt></ruby>い"
function generateFuriganaFromReading(jp: string, reading: string | null | undefined): string | null {
  if (!reading || !jp) return null;
  
  // Check if word has kanji
  const kanjiRegex = /[\u4e00-\u9faf]/;
  if (!kanjiRegex.test(jp)) return null; // Pure hiragana/katakana - no furigana needed
  
  // Find the kanji portion (everything until first hiragana)
  let kanjiEnd = 0;
  for (let i = 0; i < jp.length; i++) {
    const char = jp[i];
    // Kanji range
    if (/[\u4e00-\u9faf]/.test(char)) {
      kanjiEnd = i + 1;
    } else if (/[ぁ-ん]/.test(char)) {
      // Hiragana found - this is okurigana, stop here
      break;
    }
  }
  
  const kanjiPart = jp.substring(0, kanjiEnd);
  const okurigana = jp.substring(kanjiEnd);
  
  if (kanjiPart.length === 0) return null;
  
  // Generate ruby HTML
  return `<ruby>${kanjiPart}<rt>${reading}</rt></ruby>${okurigana}`;
}

// Simple romaji generator for practice phrases
export function generateRomaji(text: string, furiganaHtml?: string | null): string {
  if (!text) return '';

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

  // If we have furigana HTML, extract readings and convert to romaji
  if (furiganaHtml) {
    // Extract readings from <rt> tags and replace kanji with readings
    let romajiFromFurigana = furiganaHtml;

    // Replace <ruby>漢字<rt>かんじ</rt></ruby> with かんじ
    romajiFromFurigana = romajiFromFurigana.replace(/<ruby>[^<]*<rt>([^<]*)<\/rt><\/ruby>/g, '$1');

    // Remove any remaining HTML tags
    romajiFromFurigana = romajiFromFurigana.replace(/<[^>]*>/g, '');

    // Add spaces after common particles and punctuation
    const particles = ['は', 'が', 'を', 'に', 'で', 'と', 'の', 'も', 'へ', 'や', 'か', 'ね', 'よ', 'わ', '、', '。'];
    let withSpaces = '';
    for (let i = 0; i < romajiFromFurigana.length; i++) {
      withSpaces += romajiFromFurigana[i];
      // Add space after particle (but not if it's the last character)
      if (i < romajiFromFurigana.length - 1 && particles.includes(romajiFromFurigana[i])) {
        withSpaces += ' ';
      }
    }

    // Now convert the hiragana to romaji
    let romaji = '';
    let i = 0;
    while (i < withSpaces.length) {
      const char = withSpaces[i];
      const nextChar = withSpaces[i + 1];

      // Preserve spaces
      if (char === ' ') {
        romaji += ' ';
        i++;
        continue;
      }

      // Check for small tsu (sokuon)
      if (char === 'っ' || char === 'ッ') {
        if (nextChar && kanaToRomaji[nextChar]) {
          romaji += kanaToRomaji[nextChar][0];
        }
        i++;
        continue;
      }

      // Check for compound sounds
      if (i + 1 < withSpaces.length && ['ゃ', 'ゅ', 'ょ', 'ャ', 'ュ', 'ョ'].includes(nextChar)) {
        if (kanaToRomaji[char] && kanaToRomaji[nextChar]) {
          romaji += kanaToRomaji[char].slice(0, -1) + kanaToRomaji[nextChar];
          i += 2;
          continue;
        }
      }

      // Handle long vowels
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

      // Convert character
      if (kanaToRomaji[char]) {
        romaji += kanaToRomaji[char];
      }

      i++;
    }

    return romaji.trim();
  }

  // Fallback: convert text directly (kanji will be skipped)
  // Add spaces after particles
  const particles = ['は', 'が', 'を', 'に', 'で', 'と', 'の', 'も', 'へ', 'や', 'か', 'ね', 'よ', 'わ', '、', '。'];
  let withSpaces = '';
  for (let i = 0; i < text.length; i++) {
    withSpaces += text[i];
    if (i < text.length - 1 && particles.includes(text[i])) {
      withSpaces += ' ';
    }
  }

  let romaji = '';
  let i = 0;

  while (i < withSpaces.length) {
    const char = withSpaces[i];
    const nextChar = withSpaces[i + 1];

    // Preserve spaces
    if (char === ' ') {
      romaji += ' ';
      i++;
      continue;
    }

    // Skip kanji - they won't be converted
    const isKanji = /[\u4e00-\u9faf]/.test(char);
    if (isKanji) {
      i++;
      continue;
    }

    // Check for small tsu (sokuon) - doubles the next consonant
    if (char === 'っ' || char === 'ッ') {
      if (nextChar && kanaToRomaji[nextChar]) {
        romaji += kanaToRomaji[nextChar][0];
      }
      i++;
      continue;
    }

    // Check for compound sounds (small ya, yu, yo)
    if (i + 1 < withSpaces.length) {
      if (['ゃ', 'ゅ', 'ょ', 'ャ', 'ュ', 'ョ'].includes(nextChar)) {
        if (kanaToRomaji[char] && kanaToRomaji[nextChar]) {
          romaji += kanaToRomaji[char].slice(0, -1) + kanaToRomaji[nextChar];
          i += 2;
          continue;
        }
      }
    }

    // Handle long vowels (ー)
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

    // Convert character
    if (kanaToRomaji[char]) {
      romaji += kanaToRomaji[char];
    }

    i++;
  }

  // Fix particle readings in romaji
  romaji = romaji.replace(/\bha\b/g, 'wa');  // は as particle = wa
  romaji = romaji.replace(/\bhe\b/g, 'e');   // へ as particle = e

  return romaji.trim();
}

// Get specific lesson with enriched grammar examples (includes furigana)
export async function getLesson(id: string, includeFurigana: boolean = false): Promise<LessonData | null> {
  const result = await pool.query(
    'SELECT id, date, title, order_num as order, topics, vocabulary, grammar, practice_phrases ' +
    'FROM lessons WHERE id = $1',
    [id]
  );
  
  if (result.rows.length === 0) {
    return null;
  }
  
  const row = result.rows[0];
  let grammar = row.grammar || [];
  let vocabulary = row.vocabulary || [];
  
  // Enrich vocabulary with furigana generated from reading field
  if (includeFurigana && vocabulary.length > 0) {
    vocabulary = vocabulary.map((v: VocabItem) => {
      // Generate furigana from reading field instead of cache
      const furigana = generateFuriganaFromReading(v.jp, v.reading);
      return {
        ...v,
        furigana: furigana || null
      };
    });
  }
  
  // Enrich grammar examples with cached furigana if requested
  if (includeFurigana && grammar.length > 0) {
    grammar = await Promise.all(grammar.map(async (g: GrammarPoint) => {
      if (!g.examples || g.examples.length === 0) return g;
      
      const enrichedExamples = await Promise.all(g.examples.map(async (ex) => {
        const cached = await getCachedFurigana(ex.jp);
        return {
          ...ex,
          furigana: cached || null
        };
      }));
      
      return {
        ...g,
        examples: enrichedExamples
      };
    }));
  }
  
  // Enrich practice phrases with furigana and romaji
  let practice_phrases = row.practice_phrases || [];
  if (practice_phrases.length > 0) {
    practice_phrases = await Promise.all(practice_phrases.map(async (p: PracticePhrase) => {
      // Try to get furigana from cache
      const cachedFurigana = includeFurigana ? await getCachedFurigana(p.jp) : null;

      // Generate romaji using furigana if available (for correct kanji readings)
      const romaji = generateRomaji(p.jp, cachedFurigana);

      return {
        ...p,
        furigana: cachedFurigana || null,
        romaji: romaji
      };
    }));
  }
  
  return {
    id: row.id,
    date: row.date,
    title: row.title,
    order: row.order,
    topics: row.topics || [],
    vocabulary: vocabulary,
    grammar: grammar,
    practice_phrases: practice_phrases
  };
}

// Get recent lessons
export async function getRecentLessons(count: number = 3): Promise<LessonData[]> {
  const result = await pool.query(
    'SELECT id, date, title, order_num as order, topics, vocabulary, grammar, practice_phrases ' +
    'FROM lessons ORDER BY order_num DESC LIMIT $1',
    [count]
  );
  
  return result.rows.map(row => ({
    id: row.id,
    date: row.date,
    title: row.title,
    order: row.order,
    topics: row.topics || [],
    vocabulary: row.vocabulary || [],
    grammar: row.grammar || [],
    practice_phrases: row.practice_phrases || []
  }));
}

// Create or update lesson
export async function upsertLesson(lesson: LessonData): Promise<void> {
  await pool.query(
    `INSERT INTO lessons (id, date, title, order_num, topics, vocabulary, grammar, practice_phrases)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     ON CONFLICT (id) DO UPDATE SET
       date = EXCLUDED.date,
       title = EXCLUDED.title,
       order_num = EXCLUDED.order_num,
       topics = EXCLUDED.topics,
       vocabulary = EXCLUDED.vocabulary,
       grammar = EXCLUDED.grammar,
       practice_phrases = EXCLUDED.practice_phrases,
       updated_at = CURRENT_TIMESTAMP`,
    [
      lesson.id,
      lesson.date,
      lesson.title,
      lesson.order,
      lesson.topics,
      JSON.stringify(lesson.vocabulary),
      JSON.stringify(lesson.grammar),
      lesson.practice_phrases
    ]
  );
}

// Delete lesson
export async function deleteLesson(id: string): Promise<void> {
  await pool.query('DELETE FROM lessons WHERE id = $1', [id]);
}

// Get lesson context for AI
export function getLessonContext(lesson: LessonData): string {
  const vocabList = lesson.vocabulary.slice(0, 20).map(v => `${v.jp} (${v.reading}) = ${v.en}`).join(', ');
  const grammarList = lesson.grammar.map(g => g.pattern).join(', ');
  
  return `
Lesson: ${lesson.title}
Key vocabulary: ${vocabList}
Grammar patterns: ${grammarList}
Practice phrases: ${lesson.practice_phrases.join(', ')}
`;
}

// Get AI system prompt for lesson mode
export function getLessonSystemPrompt(lesson: LessonData, relaxed: boolean = true, simpleMode: boolean = false): string {
  const vocabWords = lesson.vocabulary.map(v => v.jp);
  const grammarPatterns = lesson.grammar.map(g => g.pattern);
  
  // Generate a conversation starter based on lesson content
  const starterTopics = lesson.topics.length > 0 
    ? lesson.topics.join(', ')
    : lesson.title;
  
  const simpleModeInstructions = simpleMode ? `
SIMPLE MODE - Use Basic Japanese:
- Use only JLPT N5/N4 level vocabulary
- Keep sentences short (5-8 words max)
- Use basic grammar patterns only (です/ます form)
- Avoid complex particles (のに, けど, ながら, etc.)
- Break down complex ideas into simple sentences
- If you need to use a difficult word, explain it simply
- Speak like you're talking to a beginner student
` : '';
  
  const basePrompt = `You are a Japanese language practice partner. You are helping the user practice Lesson: ${lesson.title}.

KEY VOCABULARY TO USE (prioritize these words):
${vocabWords.slice(0, 30).join(', ')}

GRAMMAR PATTERNS TO PRACTICE:
${grammarPatterns.join('\n')}
${simpleModeInstructions}

START THE CONVERSATION:
You MUST begin with a question in Japanese related to: ${starterTopics}
- Ask about the user's preferences, experiences, or opinions
- Use vocabulary and grammar from this lesson
- Keep your first message short (1-2 sentences)
- Don't just say "let's practice" - actually start talking!

CONVERSATION RULES:
1. Speak ONLY in Japanese (unless asked for translation)
2. Use simple, natural Japanese appropriate for the lesson level
3. Use furigana in your responses for kanji: <ruby>漢字<rt>かんじ</rt></ruby>
4. Ask follow-up questions to keep conversation flowing
5. If the user makes mistakes, gently correct them
6. Keep the conversation focused on topics from the lesson
7. BE PERSISTENT: If you ask multiple questions and the user only answers one, ASK AGAIN about the unanswered part. Don't let them skip questions.
8. PUSH THE USER: If their response is too short or incomplete, ask them to elaborate. For example: "もっと詳しく教えてください" (Please tell me more in detail)
9. CHECK FOR COMPLETENESS: After their response, verify they addressed everything. If not, say: "〜についても教えてください" (Please also tell me about ~)
`;

  if (relaxed) {
    return basePrompt + `
RELAXED MODE:
- You MAY use some additional vocabulary beyond the lesson list
- If user goes off-topic, gently steer back: "そうですね。でも、今日は[lesson topic]について話しましょう"
- Encourage natural conversation while keeping lesson words prominent
`;
  }
  
  return basePrompt + `
STRICT MODE:
- Use ONLY vocabulary from the lesson list
- Focus exclusively on the lesson grammar patterns
`;
}

// Find lesson by partial ID (for URL matching)
export async function findLesson(query: string): Promise<LessonData | null> {
  // Try exact match first
  let lesson = await getLesson(query);
  if (lesson) return lesson;
  
  // Try partial date match
  const result = await pool.query(
    'SELECT id FROM lessons WHERE id LIKE $1 LIMIT 1',
    [`%${query}%`]
  );
  if (result.rows.length > 0) {
    return getLesson(result.rows[0].id);
  }
  
  // Try title match
  const titleResult = await pool.query(
    'SELECT id FROM lessons WHERE title ILIKE $1 LIMIT 1',
    [`%${query}%`]
  );
  if (titleResult.rows.length > 0) {
    return getLesson(titleResult.rows[0].id);
  }
  
  return null;
}
