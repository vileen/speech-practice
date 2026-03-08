// Shared types for the backend

export interface Session {
  id: number;
  language: string;
  voice_gender: string;
  created_at: Date;
}

export interface Message {
  id: number;
  session_id: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: Date;
}

export interface Lesson {
  id: string;
  title: string;
  date: string;
  description?: string;
  vocabulary?: VocabularyItem[];
  grammar?: GrammarPoint[];
  dialogue?: DialogueLine[];
  topics?: string[];
}

export interface VocabularyItem {
  jp: string;
  reading?: string;
  romaji?: string;
  en: string;
  type?: string;
}

export interface GrammarPoint {
  pattern: string;
  meaning?: string;
  structure?: string;
  examples?: {
    jp: string;
    reading?: string;
    romaji?: string;
    en: string;
  }[];
}

export interface DialogueLine {
  speaker: string;
  jp: string;
  reading?: string;
  romaji?: string;
  en: string;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface TTSOptions {
  text: string;
  language: 'japanese';
  gender: 'male' | 'female';
  voiceStyle?: 'normal' | 'anime';
}
