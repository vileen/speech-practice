export interface GrammarPattern {
  id: number;
  pattern: string;
  category: string;
  jlpt_level: string;
  formation_rules: any[];
  examples: any[];
  common_mistakes: any[];
  related_patterns?: number[];
  ease_factor?: number;
  streak?: number;
  total_attempts?: number;
  correct_attempts?: number;
  confusion_pairs?: number[];
  base_form?: string;           // For counter grouping
  variants?: GrammarPattern[];  // Variants when this is a counter group
  variant_count?: number;       // Number of variants
  isCounterGroup?: boolean;     // Flag for counter base forms
}

export interface GrammarExercise {
  id: number;
  type: 'construction' | 'transformation' | 'error_correction' | 'fill_blank' | 'discrimination';
  prompt: string;
  context: string;
  correct_answer: string;
  hints: any[];
  difficulty: number;
  options?: DiscriminationOption[];
}

export interface DiscriminationOption {
  pattern_id: number;
  pattern: string;
  category: string;
  is_correct: boolean;
  explanation: string;
}

export interface DiscriminationAlert {
  confusedWith: GrammarPattern;
  message: string;
}

export type ExerciseState = 'loading' | 'prompt' | 'input' | 'processing' | 'feedback' | 'discrimination_select';
export type ReviewMode = 'normal' | 'mixed' | 'discrimination';
