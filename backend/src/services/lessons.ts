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
  
  // Enrich vocabulary with cached furigana if requested
  if (includeFurigana && vocabulary.length > 0) {
    vocabulary = await Promise.all(vocabulary.map(async (v: VocabItem) => {
      const cached = await getCachedFurigana(v.jp);
      return {
        ...v,
        furigana: cached || null
      };
    }));
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
  
  return {
    id: row.id,
    date: row.date,
    title: row.title,
    order: row.order,
    topics: row.topics || [],
    vocabulary: row.vocabulary || [],
    grammar: grammar,
    practice_phrases: row.practice_phrases || []
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
