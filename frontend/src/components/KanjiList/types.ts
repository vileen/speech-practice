export interface KanjiReading {
  type: 'kun' | 'on';
  reading: string;
}

export interface KanjiExample {
  word: string;
  reading: string;
  meaning: string;
}

export interface KanjiItem {
  id: string;
  character: string;
  meanings: string[];
  readings: KanjiReading[];
  lesson_id?: string;
  mnemonic?: string;
  stroke_count?: number;
  jlpt_level?: string;
  examples: KanjiExample[];
}

export interface Lesson {
  id: string;
  date: string;
  title: string;
}

export type SortOrder = 'newest' | 'oldest';
