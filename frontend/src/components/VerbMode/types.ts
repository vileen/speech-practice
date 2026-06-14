export interface Verb {
  id: number;
  dictionary_form: string;
  reading: string;
  meaning: string;
  group: 'I' | 'II' | 'III';
  jlpt_level: string;
  conjugations: ConjugationMap;
  streak?: number;
  total_attempts?: number;
  correct_attempts?: number;
  ease_factor?: number;
}

export interface ConjugationMap {
  [key: string]: string | undefined;
  te_form?: string;
  ta_form?: string;
  negative?: string;
  past_negative?: string;
  polite?: string;
  polite_negative?: string;
  polite_past?: string;
  polite_past_negative?: string;
  potential?: string;
  volitional?: string;
  imperative?: string;
  conditional?: string;
  passive?: string;
  causative?: string;
  causative_passive?: string;
}

export type PracticeType = 'recognition' | 'construction' | 'transformation';
export type AnswerMode = 'input' | 'multiple-choice';

export interface Exercise {
  verb: Verb;
  questionType: 'recognition' | 'construction' | 'transformation';
  targetForm: string;
  sourceForm?: string;
  prompt: string;
  correctAnswer: string;
  options?: string[];
}

export interface FeedbackState {
  correct: boolean;
  userAnswer: string;
  correctAnswer: string;
  explanation?: string;
  streak?: number;
}

export type ExerciseState = 'loading' | 'input' | 'feedback' | 'selection' | 'processing';

export const FORM_DISPLAY_NAMES: Record<string, string> = {
  'te_form': 'TE-form',
  'ta_form': 'TA-form (past)',
  'negative': 'Negative (plain)',
  'past_negative': 'Past Negative',
  'polite': 'Polite (ます)',
  'polite_negative': 'Polite Negative',
  'polite_past': 'Polite Past',
  'polite_past_negative': 'Polite Past Negative',
  'potential': 'Potential',
  'volitional': 'Volitional',
  'imperative': 'Imperative',
  'conditional': 'Conditional',
  'passive': 'Passive',
  'causative': 'Causative',
  'causative_passive': 'Causative Passive',
  'dictionary_form': 'Dictionary Form',
};

export const FORM_DESCRIPTIONS: Record<string, string> = {
  'te_form': 'Used for connecting verbs, making requests (～てください), and expressing continuous states',
  'ta_form': 'The plain past tense form',
  'negative': 'The plain negative form, ends in ない',
  'past_negative': 'The plain past negative, ends in なかった',
  'polite': 'The polite present/future form, ends in ます',
  'polite_negative': 'The polite negative, ends in ません',
  'polite_past': 'The polite past, ends in ました',
  'polite_past_negative': 'The polite past negative, ends in ませんでした',
  'potential': 'Expresses ability ("can do"), Group I → ～える, Group II → ～られる',
  'volitional': 'Expresses intention ("let\'s do"), Group I → ～おう, Group II → ～よう',
  'imperative': 'Direct command form',
  'conditional': 'The "if" form, ends in ～えば',
  'passive': 'Passive form ("is done"), Group I → ～れる, Group II → ～られる',
  'causative': 'Causative form ("make/let do"), Group I → ～せる, Group II → ～させる',
  'causative_passive': 'Causative passive ("be made to do")',
  'dictionary_form': 'The base form of the verb',
};

export const AVAILABLE_FORMS = [
  'te_form',
  'ta_form',
  'negative',
  'past_negative',
  'polite',
  'polite_negative',
  'polite_past',
  'polite_past_negative',
  'potential',
  'volitional',
  'imperative',
  'conditional',
  'passive',
  'causative',
];
