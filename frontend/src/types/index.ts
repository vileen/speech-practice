// Shared types for Speech Practice App

export interface Lesson {
  id: string;
  date: string;
  title: string;
  order: number;
  topics: string[];
  vocabCount: number;
  grammarCount: number;
  vocabulary?: VocabularyItem[];
  grammar?: GrammarItem[];
  practice_phrases?: PracticePhrase[];
}

export interface VocabularyItem {
  jp: string;
  reading: string;
  romaji: string;
  en: string;
  type?: string;
  furigana?: string | null;
}

export interface GrammarItem {
  pattern: string;
  explanation: string;
  romaji?: string;
  examples: Array<{
    jp: string;
    en: string;
    furigana?: string | null;
  }>;
}

export interface PracticePhrase {
  jp: string;
  en: string;
  romaji?: string;
  furigana?: string | null;
}

export interface Session {
  id: number;
  language: string;
  voice_gender: string;
  created_at: string;
}

export interface LessonDetail extends Lesson {
  practice_phrases: PracticePhrase[];
}
