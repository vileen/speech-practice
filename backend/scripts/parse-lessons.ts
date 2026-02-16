#!/usr/bin/env node
/**
 * Parse Japanese lesson Markdown files into structured JSON
 * Extracts vocabulary, grammar, dialogues, and key phrases
 */

import { readFile, writeFile, readdir } from 'fs/promises';
import { join } from 'path';

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

interface Dialogue {
  title: string;
  lines: Array<{speaker: string; jp: string; en: string}>;
}

interface LessonData {
  id: string;
  date: string;
  title: string;
  order: number;
  topics: string[];
  vocabulary: VocabItem[];
  grammar: GrammarPoint[];
  dialogues: Dialogue[];
  practice_phrases: string[];
  summary: string;
}

// Extract furigana from ruby tags or brackets
function extractReading(text: string): {kanji: string; reading: string} | null {
  // Pattern: kanji[reading] or <ruby>kanji<rt>reading</rt></ruby>
  const bracketMatch = text.match(/^(.+?)\[(.+?)\]$/);
  if (bracketMatch) {
    return { kanji: bracketMatch[1], reading: bracketMatch[2] };
  }
  
  const rubyMatch = text.match(/<ruby>(.+?)<rt>(.+?)<\/rt><\/ruby>/);
  if (rubyMatch) {
    return { kanji: rubyMatch[1], reading: rubyMatch[2] };
  }
  
  return null;
}

// Clean markdown formatting
function cleanText(text: string): string {
  return text
    .replace(/\*\*/g, '') // bold
    .replace(/\*/g, '')   // italic
    .replace(/`/g, '')    // code
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links
    .replace(/<[^>]+>/g, '') // HTML tags
    .trim();
}

async function parseLessonFile(filepath: string): Promise<LessonData | null> {
  const content = await readFile(filepath, 'utf-8');
  
  // Extract date from filename (Lesson-YYYY-MM-DD)
  const filename = filepath.split('/').pop() || '';
  const dateMatch = filename.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (!dateMatch) return null;
  
  const date = `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`;
  const id = date;
  
  // Extract title from first heading
  const titleMatch = content.match(/#\s*(.+?)(?:\n|$)/);
  const title = titleMatch ? cleanText(titleMatch[1]) : 'Untitled Lesson';
  
  // Extract topics from "Topics Covered" or "Temat" section
  const topics: string[] = [];
  const topicMatch = content.match(/Topics? Covered?:\s*([^\n]+)/i) || 
                     content.match(/Temat:\s*([^\n]+)/i);
  if (topicMatch) {
    topics.push(...topicMatch[1].split(/[,;]/).map(t => t.trim().toLowerCase()));
  }
  
  // Extract vocabulary from tables
  const vocabulary: VocabItem[] = [];
  const vocabMatches = content.matchAll(/\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|/g);
  for (const match of vocabMatches) {
    const jp = cleanText(match[1]);
    const reading = cleanText(match[2]);
    const en = cleanText(match[3]);
    
    if (jp && jp !== 'Japanese' && en && en !== 'Meaning') {
      vocabulary.push({
        jp,
        reading: reading || '',
        en,
        type: inferType(jp, en),
        tags: []
      });
    }
  }
  
  // Extract grammar patterns
  const grammar: GrammarPoint[] = [];
  const grammarMatches = content.matchAll(/###\s*\d+\.\s*(.+?)(?:\n|$)([\s\S]*?)(?=###|\n## |\n### \d|$)/g);
  for (const match of grammarMatches) {
    const pattern = cleanText(match[1]);
    const content = match[2];
    
    const examples: Array<{jp: string; en: string}> = [];
    const exampleMatches = content.matchAll(/[\*\-]\s*\*?(.+?)\*?(?:\s*[-–]\s*(.+?))?(?:\n|$)/g);
    for (const ex of exampleMatches) {
      const jp = cleanText(ex[1]);
      const en = ex[2] ? cleanText(ex[2]) : '';
      if (jp && (en || jp.length < 50)) {
        examples.push({ jp, en });
      }
    }
    
    grammar.push({
      pattern,
      explanation: cleanText(content.substring(0, 200)),
      examples: examples.slice(0, 5)
    });
  }
  
  // Extract dialogues
  const dialogues: Dialogue[] = [];
  const dialogueMatches = content.matchAll(/###\s*Dialogue \d+:\s*(.+?)(?:\n|$)([\s\S]*?)(?=###\s*Dialogue|\n## |\n### [^D]|$)/gi);
  for (const match of dialogueMatches) {
    const title = cleanText(match[1]);
    const content = match[2];
    
    const lines: Array<{speaker: string; jp: string; en: string}> = [];
    const lineMatches = content.matchAll(/\*\*(.+?):\*\*\s*(.+?)(?:\n|$)(?:\s*(.+?)(?:\n|$))?/g);
    for (const line of lineMatches) {
      lines.push({
        speaker: cleanText(line[1]),
        jp: cleanText(line[2]),
        en: line[3] ? cleanText(line[3]) : ''
      });
    }
    
    if (lines.length > 0) {
      dialogues.push({ title, lines });
    }
  }
  
  // Extract practice phrases from code blocks or bullet lists
  const practice_phrases: string[] = [];
  const phraseMatches = content.matchAll(/```\n([\s\S]*?)```/g);
  for (const match of phraseMatches) {
    const lines = match[1].split('\n').filter(l => l.trim() && !l.startsWith('#'));
    practice_phrases.push(...lines.slice(0, 10));
  }
  
  // Generate summary from first paragraph after title
  const summaryMatch = content.match(/#[^\n]+\n+([\s\S]{50,300}?)\n\n/);
  const summary = summaryMatch ? cleanText(summaryMatch[1]) : '';
  
  return {
    id,
    date,
    title,
    order: parseInt(dateMatch[1] + dateMatch[2] + dateMatch[3]),
    topics,
    vocabulary: vocabulary.slice(0, 50), // Limit to avoid huge files
    grammar: grammar.slice(0, 5),
    dialogues: dialogues.slice(0, 3),
    practice_phrases: practice_phrases.slice(0, 10),
    summary
  };
}

function inferType(jp: string, en: string): string | undefined {
  if (jp.endsWith('い') && (en.startsWith('is ') || en.includes('adj'))) return 'i-adj';
  if (jp.includes('な') && en.includes('na-adj')) return 'na-adj';
  if (jp.endsWith('る')) return 'ru-verb';
  if (jp.match(/[うくすつぬふむゆる]$/)) return 'u-verb';
  if (en.includes('noun')) return 'noun';
  if (en.includes('particle')) return 'particle';
  return undefined;
}

async function parseAllLessons(): Promise<void> {
  const lessonsDir = '/Users/dominiksoczewka/Library/Mobile Documents/iCloud~md~obsidian/Documents/Main/Skills/Japanese/Japanese Lessons';
  const outputDir = '/Users/dominiksoczewka/Projects/speech-practice/backend/src/data/lessons';
  
  // Create output directory
  try {
    await readdir(outputDir);
  } catch {
    await import('fs/promises').then(fs => fs.mkdir(outputDir, { recursive: true }));
  }
  
  const files = await readdir(lessonsDir);
  const lessonFiles = files.filter(f => f.startsWith('Lesson-') && f.endsWith('.md'));
  
  console.log(`Found ${lessonFiles.length} lesson files`);
  
  const lessons: LessonData[] = [];
  
  for (const file of lessonFiles.sort()) {
    const filepath = join(lessonsDir, file);
    console.log(`Parsing: ${file}`);
    
    const lesson = await parseLessonFile(filepath);
    if (lesson && lesson.vocabulary.length > 0) {
      lessons.push(lesson);
      
      // Save individual lesson file
      const outputFile = join(outputDir, `${lesson.id}.json`);
      await writeFile(outputFile, JSON.stringify(lesson, null, 2), 'utf-8');
      console.log(`  → Saved: ${outputFile} (${lesson.vocabulary.length} words, ${lesson.grammar.length} grammar)`);
    }
  }
  
  // Save index file
  const index = {
    count: lessons.length,
    lessons: lessons.map(l => ({
      id: l.id,
      date: l.date,
      title: l.title,
      order: l.order,
      topics: l.topics,
      vocabCount: l.vocabulary.length,
      grammarCount: l.grammar.length
    }))
  };
  
  await writeFile(join(outputDir, 'index.json'), JSON.stringify(index, null, 2), 'utf-8');
  console.log(`\n✅ Parsed ${lessons.length} lessons`);
  console.log(`📁 Output: ${outputDir}`);
}

parseAllLessons().catch(console.error);
