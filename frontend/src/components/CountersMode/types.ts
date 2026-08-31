export interface CounterPattern {
  id: number;
  pattern: string;
  base_form: string;
  formation_rules: any[];
  examples: any[];
  total_attempts?: number;
  correct_attempts?: number;
}

export interface CounterGroup {
  baseForm: string;
  count: number;
  patterns: CounterPattern[];
  counts: string;
  description: string;
}

export type Mode = 'menu' | 'study' | 'table' | 'quiz' | 'mixed' | 'category-quiz' | 'review';

export interface QuizQuestion {
  pattern: CounterPattern;
  group: CounterGroup;
  questionText: string;
}
