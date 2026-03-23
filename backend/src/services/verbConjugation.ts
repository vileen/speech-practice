// Verb Conjugation Engine
// Handles all Japanese verb conjugations for Group I, II, and III verbs

export interface Verb {
  id: number;
  dictionary_form: string;
  reading: string;
  meaning: string;
  verb_group: 1 | 2 | 3;
  stem?: string;
  is_irregular: boolean;
  masu_form?: string;
  te_form?: string;
  nai_form?: string;
  ta_form?: string;
}

export type ConjugationType = 
  | 'masu'           // Polite present
  | 'te'             // Te-form (connecting)
  | 'nai'            // Negative
  | 'ta'             // Past
  | 'nakatta'        // Negative past
  | 'conditional'    // Eba-form
  | 'potential'      // Can do
  | 'passive'        // Passive voice
  | 'causative'      // Causative (make/let)
  | 'imperative'     // Command form
  | 'volitional';    // Let's do

// Godan (Group I) verb endings and their transformations
const GODAN_CHART: Record<string, Record<ConjugationType, string>> = {
  'う': { masu: 'います', te: 'って', nai: 'わない', ta: 'った', nakatta: 'わなかった', conditional: 'えば', potential: 'える', passive: 'われる', causative: 'わせる', imperative: 'え', volitional: 'おう' },
  'く': { masu: 'きます', te: 'いて', nai: 'かない', ta: 'いた', nakatta: 'かなかった', conditional: 'けば', potential: 'ける', passive: 'かれる', causative: 'かせる', imperative: 'け', volitional: 'こう' },
  'ぐ': { masu: 'ぎます', te: 'いで', nai: 'がない', ta: 'いだ', nakatta: 'がなかった', conditional: 'げば', potential: 'げる', passive: 'がれる', causative: 'がせる', imperative: 'げ', volitional: 'ごう' },
  'す': { masu: 'します', te: 'して', nai: 'さない', ta: 'した', nakatta: 'さなかった', conditional: 'せば', potential: 'せる', passive: 'される', causative: 'させる', imperative: 'せ', volitional: 'そう' },
  'つ': { masu: 'ちます', te: 'って', nai: 'たない', ta: 'った', nakatta: 'たなかった', conditional: 'てば', potential: 'てる', passive: 'たれる', causative: 'たせる', imperative: 'て', volitional: 'とう' },
  'ぬ': { masu: 'にます', te: 'んで', nai: 'なない', ta: 'んだ', nakatta: 'ななかった', conditional: 'ねば', potential: 'ねる', passive: 'なれる', causative: 'なせる', imperative: 'ね', volitional: 'のう' },
  'ぶ': { masu: 'びます', te: 'んで', nai: 'ばない', ta: 'んだ', nakatta: 'ばなかった', conditional: 'べば', potential: 'べる', passive: 'ばれる', causative: 'ばせる', imperative: 'べ', volitional: 'ぼう' },
  'む': { masu: 'みます', te: 'んで', nai: 'まない', ta: 'んだ', nakatta: 'まなかった', conditional: 'めば', potential: 'める', passive: 'まれる', causative: 'ませる', imperative: 'め', volitional: 'もう' },
  'る': { masu: 'ります', te: 'って', nai: 'らない', ta: 'った', nakatta: 'らなかった', conditional: 'れば', potential: 'れる', passive: 'られる', causative: 'させる', imperative: 'れ', volitional: 'ろう' },
};

// Special cases for Godan verbs
const SPECIAL_CASES: Record<string, Partial<Record<ConjugationType, string>>> = {
  '行く': { te: '行って', ta: '行った' }, // iku is special for te/ta
};

export function conjugate(verb: Verb, type: ConjugationType): string {
  // Group III (Irregular) - 来る, する
  if (verb.verb_group === 3) {
    return conjugateGroup3(verb, type);
  }
  
  // Group II (Ichidan) - drop る and add ending
  if (verb.verb_group === 2) {
    return conjugateGroup2(verb, type);
  }
  
  // Group I (Godan) - transform last kana
  return conjugateGroup1(verb, type);
}

function conjugateGroup2(verb: Verb, type: ConjugationType): string {
  // For Ichidan verbs, just drop the る and add the appropriate ending
  const stem = verb.dictionary_form.slice(0, -1);
  
  const endings: Record<ConjugationType, string> = {
    masu: 'ます',
    te: 'て',
    nai: 'ない',
    ta: 'た',
    nakatta: 'なかった',
    conditional: 'れば',
    potential: 'られる',
    passive: 'られる',
    causative: 'させる',
    imperative: 'ろ',
    volitional: 'よう',
  };
  
  return stem + endings[type];
}

function conjugateGroup1(verb: Verb, type: ConjugationType): string {
  const lastChar = verb.dictionary_form.slice(-1);
  const stem = verb.dictionary_form.slice(0, -1);
  
  // Check for special cases first
  const special = SPECIAL_CASES[verb.dictionary_form]?.[type];
  if (special) return special;
  
  // Handle nakatta (negative past) specially
  if (type === 'nakatta') {
    const naiForm = conjugateGroup1(verb, 'nai');
    return naiForm.slice(0, -1) + 'かった';
  }
  
  const transformation = GODAN_CHART[lastChar]?.[type];
  if (!transformation) {
    throw new Error(`Unknown transformation for ${lastChar} -> ${type}`);
  }
  
  return stem + transformation;
}

function conjugateGroup3(verb: Verb, type: ConjugationType): string {
  // Use stored forms if available (for irregular verbs in DB)
  if (verb.masu_form && type === 'masu') return verb.masu_form;
  if (verb.te_form && type === 'te') return verb.te_form;
  if (verb.nai_form && type === 'nai') return verb.nai_form;
  if (verb.ta_form && type === 'ta') return verb.ta_form;
  
  // Calculate from scratch
  if (verb.dictionary_form === '来る' || verb.reading === 'くる') {
    const kuruChart: Record<ConjugationType, string> = {
      masu: '来ます',
      te: '来て',
      nai: '来ない',
      ta: '来た',
      nakatta: '来なかった',
      conditional: '来れば',
      potential: '来られる',
      passive: '来られる',
      causative: '来させる',
      imperative: '来い',
      volitional: '来よう',
    };
    return kuruChart[type];
  }
  
  // する and compounds
  const suruStem = verb.dictionary_form.endsWith('する') 
    ? verb.dictionary_form.slice(0, -2) 
    : '';
  
  const suruChart: Record<ConjugationType, string> = {
    masu: suruStem + 'します',
    te: suruStem + 'して',
    nai: suruStem + 'しない',
    ta: suruStem + 'した',
    nakatta: suruStem + 'しなかった',
    conditional: suruStem + 'すれば',
    potential: suruStem + 'できる',
    passive: suruStem + 'される',
    causative: suruStem + 'させる',
    imperative: suruStem + 'しろ',
    volitional: suruStem + 'しよう',
  };
  
  return suruChart[type];
}

// Get all conjugations for a verb
export function getAllConjugations(verb: Verb): Record<ConjugationType, string> {
  const types: ConjugationType[] = [
    'masu', 'te', 'nai', 'ta', 'nakatta', 
    'conditional', 'potential', 'passive', 'causative', 'imperative', 'volitional'
  ];
  
  const result = {} as Record<ConjugationType, string>;
  for (const type of types) {
    try {
      result[type] = conjugate(verb, type);
    } catch (e) {
      result[type] = '?';
    }
  }
  return result;
}

// Practice generation
export interface ConjugationExercise {
  verb: Verb;
  fromType: 'dictionary' | ConjugationType;
  toType: ConjugationType;
  prompt: string;
  correctAnswer: string;
  hints: string[];
}

export function generateExercise(verb: Verb): ConjugationExercise {
  const types: ConjugationType[] = ['masu', 'te', 'nai', 'ta'];
  const toType = types[Math.floor(Math.random() * types.length)];
  
  return {
    verb,
    fromType: 'dictionary',
    toType,
    prompt: `Conjugate "${verb.dictionary_form}" (${verb.meaning}) to ${toType} form:`,
    correctAnswer: conjugate(verb, toType),
    hints: [
      `This is a Group ${verb.verb_group} verb`,
      verb.verb_group === 2 ? 'Drop る and add ending' : 'Transform the last syllable',
    ],
  };
}
