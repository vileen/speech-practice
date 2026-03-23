-- Add verb conjugation patterns to grammar_patterns
-- These represent grammatical patterns for verb conjugation

INSERT INTO grammar_patterns (pattern, category, jlpt_level, formation_rules, examples, common_mistakes) VALUES
-- Group I (Godan) conjugations
('Godan: う→います', 'Verb Conjugation', 'N5', 
  '[{"rule": "Change final う to い and add ます", "step": 1}, {"counts": "Group I (Godan) verbs", "usage": "Polite present/future form"}]'::jsonb,
  '[{"jp": "書きます", "en": "I write (polite)"}, {"jp": "読みます", "en": "I read (polite)"}]'::jsonb,
  '[{"mistake": "書くます", "correction": "書きます", "explanation": "Change く to き, don''t just add ます"}]'::jsonb
),
('Godan: う→って', 'Verb Conjugation', 'N5',
  '[{"rule": "Change final う, つ, る to って", "step": 1}, {"counts": "Group I (Godan) verbs ending in う/つ/る", "usage": "Te-form for connecting verbs"}]'::jsonb,
  '[{"jp": "書いて", "en": "Write (and...)"}, {"jp": "待って", "en": "Wait (and...)"}]'::jsonb,
  '[{"mistake": "書くて", "correction": "書いて", "explanation": "う/つ/る verbs use って, not て directly"}]'::jsonb
),
('Godan: く→いて', 'Verb Conjugation', 'N5',
  '[{"rule": "Change く to い and add て", "step": 1}, {"counts": "Group I (Godan) verbs ending in く", "usage": "Te-form"}]'::jsonb,
  '[{"jp": "書いて", "en": "Write (and...)"}, {"jp": "聞いて", "en": "Listen (and...)"}]'::jsonb,
  '[{"mistake": "書くて", "correction": "書いて", "explanation": "く becomes い, not く"}]'::jsonb
),
('Godan: ぐ→いで', 'Verb Conjugation', 'N5',
  '[{"rule": "Change ぐ to い and add で", "step": 1}, {"counts": "Group I (Godan) verbs ending in ぐ", "usage": "Te-form"}]'::jsonb,
  '[{"jp": "泳いで", "en": "Swim (and...)"}, {"jp": "遊んで", "en": "Play (and...)"}]'::jsonb,
  '[]'::jsonb
),
('Godan: す→して', 'Verb Conjugation', 'N5',
  '[{"rule": "Change す to し and add て", "step": 1}, {"counts": "Group I (Godan) verbs ending in す", "usage": "Te-form"}]'::jsonb,
  '[{"jp": "話して", "en": "Speak (and...)"}, {"jp": "直して", "en": "Fix (and...)"}]'::jsonb,
  '[]'::jsonb
),
('Godan: ぬ/ぶ/む→んで', 'Verb Conjugation', 'N5',
  '[{"rule": "Change ぬ/ぶ/む to ん and add で", "step": 1}, {"counts": "Group I (Godan) verbs ending in ぬ/ぶ/む", "usage": "Te-form"}]'::jsonb,
  '[{"jp": "死んで", "en": "Die (and...)"}, {"jp": "遊んで", "en": "Play (and...)"}, {"jp": "読んで", "en": "Read (and...)"}]'::jsonb,
  '[]'::jsonb
),
('Godan: う→わない', 'Verb Conjugation', 'N5',
  '[{"rule": "Change う to わ and add ない", "step": 1}, {"counts": "Group I (Godan) verbs", "usage": "Negative form"}]'::jsonb,
  '[{"jp": "書かない", "en": "I don''t write"}, {"jp": "読まない", "en": "I don''t read"}]'::jsonb,
  '[{"mistake": "書くない", "correction": "書かない", "explanation": "For negative, う becomes わ, not く"}]'::jsonb
),
('Godan: う→った', 'Verb Conjugation', 'N5',
  '[{"rule": "Change final う, つ, る to った", "step": 1}, {"counts": "Group I (Godan) verbs ending in う/つ/る", "usage": "Past form"}]'::jsonb,
  '[{"jp": "書いた", "en": "I wrote"}, {"jp": "待った", "en": "I waited"}]'::jsonb,
  '[]'::jsonb
),
('Godan: く→いた (past)', 'Verb Conjugation', 'N5',
  '[{"rule": "Change く to い and add た", "step": 1}, {"counts": "Group I (Godan) verbs ending in く", "usage": "Past form"}]'::jsonb,
  '[{"jp": "書いた", "en": "I wrote"}, {"jp": "聞いた", "en": "I listened"}]'::jsonb,
  '[]'::jsonb
),

-- Group II (Ichidan) conjugations
('Ichidan: る→ます', 'Verb Conjugation', 'N5',
  '[{"rule": "Drop る and add ます", "step": 1}, {"counts": "Group II (Ichidan) verbs ending in いる/える", "usage": "Polite present/future form"}]'::jsonb,
  '[{"jp": "食べます", "en": "I eat (polite)"}, {"jp": "見ます", "en": "I see (polite)"}]'::jsonb,
  '[]'::jsonb
),
('Ichidan: る→て', 'Verb Conjugation', 'N5',
  '[{"rule": "Drop る and add て", "step": 1}, {"counts": "Group II (Ichidan) verbs", "usage": "Te-form"}]'::jsonb,
  '[{"jp": "食べて", "en": "Eat (and...)"}, {"jp": "見て", "en": "See (and...)"}]'::jsonb,
  '[{"mistake": "食べって", "correction": "食べて", "explanation": "Just て, not って for Ichidan"}]'::jsonb
),
('Ichidan: る→ない', 'Verb Conjugation', 'N5',
  '[{"rule": "Drop る and add ない", "step": 1}, {"counts": "Group II (Ichidan) verbs", "usage": "Negative form"}]'::jsonb,
  '[{"jp": "食べない", "en": "I don''t eat"}, {"jp": "見ない", "en": "I don''t see"}]'::jsonb,
  '[]'::jsonb
),
('Ichidan: る→た', 'Verb Conjugation', 'N5',
  '[{"rule": "Drop る and add た", "step": 1}, {"counts": "Group II (Ichidan) verbs", "usage": "Past form"}]'::jsonb,
  '[{"jp": "食べた", "en": "I ate"}, {"jp": "見た", "en": "I saw"}]'::jsonb,
  '[]'::jsonb
),

-- Group III (Irregular) conjugations
('来る conjugation', 'Verb Conjugation', 'N5',
  '[{"rule": "Irregular - memorize all forms", "step": 1}, {"counts": "来る (kuru) only", "usage": "All forms are irregular"}]'::jsonb,
  '[{"jp": "来ます / 来て / 来ない / 来た", "en": "Come (polite/te-form/negative/past)"}]'::jsonb,
  '[{"mistake": "来ります", "correction": "来ます", "explanation": "来る is completely irregular"}]'::jsonb
),
('する conjugation', 'Verb Conjugation', 'N5',
  '[{"rule": "Irregular - する becomes し〜", "step": 1}, {"counts": "する and 〜する compounds", "usage": "All forms use し stem"}]'::jsonb,
  '[{"jp": "します / して / しない / した", "en": "Do (polite/te-form/negative/past)"}]'::jsonb,
  '[{"mistake": "するます", "correction": "します", "explanation": "する becomes します, not するます"}]'::jsonb
)
ON CONFLICT DO NOTHING;
