// Lesson Data Management
import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Look for lessons - try src first (dev), then dist (production)
const { existsSync } = await import('fs');
const srcPath = join(__dirname, '../../src/data/lessons');
const distPath = join(__dirname, '../data/lessons');
const LESSONS_DIR = existsSync(srcPath) ? srcPath : distPath;

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

interface VocabItem {
  jp: string;
  reading: string;
  en: string;
  type?: string;
  tags: string[];
}

interface GrammarPoint {
  pattern: string;
  explanation: string;
  examples: Array<{jp: string; en: string}>;
}

interface LessonData {
  id: string;
  date: string;
  title: string;
  order: number;
  topics: string[];
  vocabulary: VocabItem[];
  grammar: GrammarPoint[];
  practice_phrases: string[];
  summary: string;
}

let lessonsCache: LessonIndex | null = null;

// Load lesson index
export async function getLessonIndex(): Promise<LessonIndex> {
  if (lessonsCache) return lessonsCache;
  
  const indexPath = join(LESSONS_DIR, 'index.json');
  const data = await readFile(indexPath, 'utf-8');
  lessonsCache = JSON.parse(data);
  return lessonsCache!;
}

// Load specific lesson
export async function getLesson(id: string): Promise<LessonData | null> {
  try {
    const lessonPath = join(LESSONS_DIR, `${id}.json`);
    const data = await readFile(lessonPath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return null;
  }
}

// Get recent lessons (for "review last lesson" feature)
export async function getRecentLessons(count: number = 3): Promise<LessonData[]> {
  const index = await getLessonIndex();
  const sorted = index.lessons.sort((a, b) => b.order - a.order);
  const recentIds = sorted.slice(0, count).map(l => l.id);
  
  const lessons: LessonData[] = [];
  for (const id of recentIds) {
    const lesson = await getLesson(id);
    if (lesson) lessons.push(lesson);
  }
  return lessons;
}

// Get lesson topics for AI context
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
export function getLessonSystemPrompt(lesson: LessonData, relaxed: boolean = true): string {
  const vocabWords = lesson.vocabulary.map(v => v.jp);
  const grammarPatterns = lesson.grammar.map(g => g.pattern);
  
  // Generate a conversation starter based on lesson content
  const starterTopics = lesson.topics.length > 0 
    ? lesson.topics.join(', ')
    : lesson.title;
  
  const basePrompt = `You are a Japanese language practice partner. You are helping the user practice Lesson: ${lesson.title}.

KEY VOCABULARY TO USE (prioritize these words):
${vocabWords.slice(0, 30).join(', ')}

GRAMMAR PATTERNS TO PRACTICE:
${grammarPatterns.join('\n')}

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
  const index = await getLessonIndex();
  
  // Try exact match first
  let match = index.lessons.find(l => l.id === query);
  if (match) return getLesson(match.id);
  
  // Try partial date match
  match = index.lessons.find(l => l.id.includes(query));
  if (match) return getLesson(match.id);
  
  // Try title match
  match = index.lessons.find(l => l.title.toLowerCase().includes(query.toLowerCase()));
  if (match) return getLesson(match.id);
  
  return null;
}
