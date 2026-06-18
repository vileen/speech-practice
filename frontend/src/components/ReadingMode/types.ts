export interface Passage {
  id: number;
  title: string;
  content: string;
  level: string;
  topic: string;
  character_count: number;
  created_at: string;
}

export interface Question {
  id: number;
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
  question_type: 'main_idea' | 'detail' | 'inference' | 'vocabulary' | 'grammar';
}

export interface AnswerResult {
  questionId: number;
  selectedOption: number;
  isCorrect: boolean;
  correctAnswer: number;
  explanation: string;
  questionType: string;
}

export interface ReadingResult {
  score: number;
  correctCount: number;
  totalQuestions: number;
  results: AnswerResult[];
  readingTimeSeconds: number | null;
  charsPerMinute: number | null;
}

export type ViewState = 'list' | 'reading' | 'questions' | 'results';
