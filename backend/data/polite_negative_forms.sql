-- Polite Negative Verb Conjugations (masu/masen forms)
-- Adds masen (polite negative present) and masen deshita (polite negative past) patterns

INSERT INTO grammar_patterns (pattern, category, jlpt_level, formation_rules, examples, common_mistakes) VALUES

-- ============================================
-- GODAN VERB POLITE NEGATIVE FORMS
-- ============================================

('Godan: う→いません', 'Verb Conjugation', 'N5',
  '[{"rule": "Change final う to い and add ません", "step": 1}, {"counts": "Group I (Godan) verbs", "usage": "Polite negative present form - I don''t ~"}]'::jsonb,
  '[{"jp": "書きません", "en": "I don''t write (polite)"}, {"jp": "読みません", "en": "I don''t read (polite)"}, {"jp": "行きません", "en": "I don''t go (polite)"}, {"jp": "買いません", "en": "I don''t buy (polite)"}]'::jsonb,
  '[{"mistake": "書くません", "correction": "書きません", "explanation": "Change く to き, don''t just add ません"}, {"mistake": "書かません", "correction": "書きません", "explanation": "Polite negative uses い-stem (き), not わ-stem (か)"}]'::jsonb
),

('Godan: く→きません', 'Verb Conjugation', 'N5',
  '[{"rule": "Change く to き and add ません", "step": 1}, {"counts": "Group I (Godan) verbs ending in く", "usage": "Polite negative present form"}]'::jsonb,
  '[{"jp": "書きません", "en": "I don''t write (polite)"}, {"jp": "聞きません", "en": "I don''t listen (polite)"}, {"jp": "働きません", "en": "I don''t work (polite)"}]'::jsonb,
  '[{"mistake": "書きませません", "correction": "書きません", "explanation": "Just きません, not きませません"}]'::jsonb
),

('Godan: ぐ→ぎません', 'Verb Conjugation', 'N5',
  '[{"rule": "Change ぐ to ぎ and add ません", "step": 1}, {"counts": "Group I (Godan) verbs ending in ぐ", "usage": "Polite negative present form"}]'::jsonb,
  '[{"jp": "泳ぎません", "en": "I don''t swim (polite)"}, {"jp": "急ぎません", "en": "I don''t hurry (polite)"}, {"jp": "稼ぎません", "en": "I don''t earn (polite)"}]'::jsonb,
  '[]'::jsonb
),

('Godan: す→しません', 'Verb Conjugation', 'N5',
  '[{"rule": "Change す to し and add ません", "step": 1}, {"counts": "Group I (Godan) verbs ending in す", "usage": "Polite negative present form"}]'::jsonb,
  '[{"jp": "話しません", "en": "I don''t speak (polite)"}, {"jp": "貸しません", "en": "I don''t lend (polite)"}, {"jp": "直しません", "en": "I don''t fix (polite)"}]'::jsonb,
  '[]'::jsonb
),

('Godan: つ→ちません', 'Verb Conjugation', 'N5',
  '[{"rule": "Change つ to ち and add ません", "step": 1}, {"counts": "Group I (Godan) verbs ending in つ", "usage": "Polite negative present form"}]'::jsonb,
  '[{"jp": "待ちません", "en": "I don''t wait (polite)"}, {"jp": "立ちません", "en": "I don''t stand (polite)"}, {"jp": "持ちません", "en": "I don''t hold (polite)"}]'::jsonb,
  '[]'::jsonb
),

('Godan: ぬ→にません', 'Verb Conjugation', 'N5',
  '[{"rule": "Change ぬ to に and add ません", "step": 1}, {"counts": "Group I (Godan) verbs ending in ぬ", "usage": "Polite negative present form"}]'::jsonb,
  '[{"jp": "死にません", "en": "I don''t die (polite)"}]'::jsonb,
  '[]'::jsonb
),

('Godan: ぶ→びません', 'Verb Conjugation', 'N5',
  '[{"rule": "Change ぶ to び and add ません", "step": 1}, {"counts": "Group I (Godan) verbs ending in ぶ", "usage": "Polite negative present form"}]'::jsonb,
  '[{"jp": "遊びません", "en": "I don''t play (polite)"}, {"jp": "呼びません", "en": "I don''t call (polite)"}, {"jp": "選びません", "en": "I don''t choose (polite)"}]'::jsonb,
  '[]'::jsonb
),

('Godan: む→みません', 'Verb Conjugation', 'N5',
  '[{"rule": "Change む to み and add ません", "step": 1}, {"counts": "Group I (Godan) verbs ending in む", "usage": "Polite negative present form"}]'::jsonb,
  '[{"jp": "読みません", "en": "I don''t read (polite)"}, {"jp": "飲みません", "en": "I don''t drink (polite)"}]'::jsonb,
  '[]'::jsonb
),

('Godan: る→りません', 'Verb Conjugation', 'N5',
  '[{"rule": "Change る to り and add ません", "step": 1}, {"counts": "Group I (Godan) verbs ending in る", "usage": "Polite negative present form"}]'::jsonb,
  '[{"jp": "走りません", "en": "I don''t run (polite)"}, {"jp": "帰りません", "en": "I don''t return (polite)"}]'::jsonb,
  '[]'::jsonb
),

-- ============================================
-- GODAN VERB POLITE NEGATIVE PAST FORMS
-- ============================================

('Godan: う→いませんでした', 'Verb Conjugation', 'N5',
  '[{"rule": "Change final う to い and add ませんでした", "step": 1}, {"counts": "Group I (Godan) verbs", "usage": "Polite negative past form - I didn''t ~"}]'::jsonb,
  '[{"jp": "書きませんでした", "en": "I didn''t write (polite)"}, {"jp": "読みませんでした", "en": "I didn''t read (polite)"}, {"jp": "行きませんでした", "en": "I didn''t go (polite)"}, {"jp": "買いませんでした", "en": "I didn''t buy (polite)"}]'::jsonb,
  '[{"mistake": "書きませんした", "correction": "書きませんでした", "explanation": "Need でした for past, not just した"}, {"mistake": "書かませんでした", "correction": "書きませんでした", "explanation": "Use い-stem (き), not わ-stem (か)"}]'::jsonb
),

('Godan: く→きませんでした', 'Verb Conjugation', 'N5',
  '[{"rule": "Change く to き and add ませんでした", "step": 1}, {"counts": "Group I (Godan) verbs ending in く", "usage": "Polite negative past form"}]'::jsonb,
  '[{"jp": "書きませんでした", "en": "I didn''t write (polite)"}, {"jp": "聞きませんでした", "en": "I didn''t listen (polite)"}]'::jsonb,
  '[]'::jsonb
),

('Godan: ぐ→ぎませんでした', 'Verb Conjugation', 'N5',
  '[{"rule": "Change ぐ to ぎ and add ませんでした", "step": 1}, {"counts": "Group I (Godan) verbs ending in ぐ", "usage": "Polite negative past form"}]'::jsonb,
  '[{"jp": "泳ぎませんでした", "en": "I didn''t swim (polite)"}, {"jp": "遊びませんでした", "en": "I didn''t play (polite)"}]'::jsonb,
  '[]'::jsonb
),

('Godan: す→しませんでした', 'Verb Conjugation', 'N5',
  '[{"rule": "Change す to し and add ませんでした", "step": 1}, {"counts": "Group I (Godan) verbs ending in す", "usage": "Polite negative past form"}]'::jsonb,
  '[{"jp": "話しませんでした", "en": "I didn''t speak (polite)"}, {"jp": "貸しませんでした", "en": "I didn''t lend (polite)"}]'::jsonb,
  '[]'::jsonb
),

('Godan: つ→ちませんでした', 'Verb Conjugation', 'N5',
  '[{"rule": "Change つ to ち and add ませんでした", "step": 1}, {"counts": "Group I (Godan) verbs ending in つ", "usage": "Polite negative past form"}]'::jsonb,
  '[{"jp": "待ちませんでした", "en": "I didn''t wait (polite)"}, {"jp": "立ちませんでした", "en": "I didn''t stand (polite)"}]'::jsonb,
  '[]'::jsonb
),

('Godan: ぶ→びませんでした', 'Verb Conjugation', 'N5',
  '[{"rule": "Change ぶ to び and add ませんでした", "step": 1}, {"counts": "Group I (Godan) verbs ending in ぶ", "usage": "Polite negative past form"}]'::jsonb,
  '[{"jp": "遊びませんでした", "en": "I didn''t play (polite)"}, {"jp": "呼びませんでした", "en": "I didn''t call (polite)"}]'::jsonb,
  '[]'::jsonb
),

-- ============================================
-- ICHIDAN VERB POLITE NEGATIVE FORMS
-- ============================================

('Ichidan: る→ません', 'Verb Conjugation', 'N5',
  '[{"rule": "Drop る and add ません", "step": 1}, {"counts": "Group II (Ichidan) verbs ending in いる/える", "usage": "Polite negative present form - I don''t ~"}]'::jsonb,
  '[{"jp": "食べません", "en": "I don''t eat (polite)"}, {"jp": "見ません", "en": "I don''t see (polite)"}, {"jp": "起きません", "en": "I don''t wake up (polite)"}, {"jp": "寝ません", "en": "I don''t sleep (polite)"}]'::jsonb,
  '[{"mistake": "食べりません", "correction": "食べません", "explanation": "Drop る completely, then add ません"}, {"mistake": "食べないです", "correction": "食べません", "explanation": "〜ないです is casual polite; 〜ません is proper polite form"}]'::jsonb
),

('Ichidan: る→ませんでした', 'Verb Conjugation', 'N5',
  '[{"rule": "Drop る and add ませんでした", "step": 1}, {"counts": "Group II (Ichidan) verbs", "usage": "Polite negative past form - I didn''t ~"}]'::jsonb,
  '[{"jp": "食べませんでした", "en": "I didn''t eat (polite)"}, {"jp": "見ませんでした", "en": "I didn''t see (polite)"}, {"jp": "起きませんでした", "en": "I didn''t wake up (polite)"}, {"jp": "寝ませんでした", "en": "I didn''t sleep (polite)"}]'::jsonb,
  '[{"mistake": "食べませんした", "correction": "食べませんでした", "explanation": "Need でした for past, not just した"}]'::jsonb
),

-- ============================================
-- IRREGULAR VERB POLITE NEGATIVE FORMS
-- ============================================

('来る polite negative', 'Verb Conjugation', 'N5',
  '[{"rule": "来る → きません / きませんでした", "step": 1}, {"counts": "来る (kuru) only", "usage": "Polite negative present and past forms"}]'::jsonb,
  '[{"jp": "来ません", "en": "I won''t come (polite)"}, {"jp": "来ませんでした", "en": "I didn''t come (polite)"}]'::jsonb,
  '[{"mistake": "来りません", "correction": "来ません", "explanation": "来る conjugates to き stem, not 来り"}]'::jsonb
),

('する polite negative', 'Verb Conjugation', 'N5',
  '[{"rule": "する → しません / しませんでした", "step": 1}, {"counts": "する and 〜する compounds", "usage": "Polite negative present and past forms"}]'::jsonb,
  '[{"jp": "しません", "en": "I don''t do (polite)"}, {"jp": "しませんでした", "en": "I didn''t do (polite)"}, {"jp": "勉強しません", "en": "I don''t study (polite)"}, {"jp": "仕事しませんでした", "en": "I didn''t work (polite)"}]'::jsonb,
  '[{"mistake": "すりません", "correction": "しません", "explanation": "する uses し stem, not すり"}]'::jsonb
);

-- ============================================
-- EXERCISES FOR POLITE NEGATIVE FORMS
-- ============================================

-- Godan exercises
INSERT INTO grammar_exercises (pattern_id, type, question, options, correct_answer, explanation)
SELECT id, 'conjugation', 'Conjugate 書く (to write) to polite negative present: "I don''t write"',
       '["書きます", "書きません", "書かない", "書きませんでした"]'::jsonb, '書きません',
       'Godan verb: change く to き and add ません'
FROM grammar_patterns WHERE pattern = 'Godan: く→きません';

INSERT INTO grammar_exercises (pattern_id, type, question, options, correct_answer, explanation)
SELECT id, 'conjugation', 'Conjugate 行く (to go) to polite negative past: "I didn''t go"',
       '["行きます", "行きません", "行かなかった", "行きませんでした"]'::jsonb, '行きませんでした',
       'Godan verb: change く to き and add ませんでした for polite negative past'
FROM grammar_patterns WHERE pattern = 'Godan: く→きませんでした';

INSERT INTO grammar_exercises (pattern_id, type, question, options, correct_answer, explanation)
SELECT id, 'conjugation', 'Conjugate 話す (to speak) to polite negative present: "I don''t speak"',
       '["話します", "話しません", "話さない", "話しませんでした"]'::jsonb, '話しません',
       'Godan verb: change す to し and add ません'
FROM grammar_patterns WHERE pattern = 'Godan: す→しません';

INSERT INTO grammar_exercises (pattern_id, type, question, options, correct_answer, explanation)
SELECT id, 'conjugation', 'Conjugate 待つ (to wait) to polite negative past: "I didn''t wait"',
       '["待ちます", "待ちません", "待たなかった", "待ちませんでした"]'::jsonb, '待ちませんでした',
       'Godan verb: change つ to ち and add ませんでした'
FROM grammar_patterns WHERE pattern = 'Godan: つ→ちませんでした';

-- Ichidan exercises
INSERT INTO grammar_exercises (pattern_id, type, question, options, correct_answer, explanation)
SELECT id, 'conjugation', 'Conjugate 食べる (to eat) to polite negative present: "I don''t eat"',
       '["食べます", "食べません", "食べない", "食べませんでした"]'::jsonb, '食べません',
       'Ichidan verb: drop る and add ません'
FROM grammar_patterns WHERE pattern = 'Ichidan: る→ません';

INSERT INTO grammar_exercises (pattern_id, type, question, options, correct_answer, explanation)
SELECT id, 'conjugation', 'Conjugate 見る (to see) to polite negative past: "I didn''t see"',
       '["見ます", "見ません", "見なかった", "見ませんでした"]'::jsonb, '見ませんでした',
       'Ichidan verb: drop る and add ませんでした'
FROM grammar_patterns WHERE pattern = 'Ichidan: る→ませんでした';

-- Irregular exercises
INSERT INTO grammar_exercises (pattern_id, type, question, options, correct_answer, explanation)
SELECT id, 'conjugation', 'Conjugate 来る (to come) to polite negative present: "I won''t come"',
       '["来ます", "来ません", "来ない", "来ませんでした"]'::jsonb, '来ません',
       'Irregular: 来る conjugates to きません'
FROM grammar_patterns WHERE pattern = '来る polite negative';

INSERT INTO grammar_exercises (pattern_id, type, question, options, correct_answer, explanation)
SELECT id, 'conjugation', 'Conjugate する (to do) to polite negative past: "I didn''t do"',
       '["します", "しません", "しなかった", "しませんでした"]'::jsonb, 'しませんでした',
       'Irregular: する conjugates to しませんでした'
FROM grammar_patterns WHERE pattern = 'する polite negative';

-- Mixed discrimination exercises
INSERT INTO grammar_exercises (pattern_id, type, question, options, correct_answer, explanation)
SELECT id, 'discrimination', 'Which is correct polite negative present of 書く?',
       '["書きます", "書きません", "書かない", "書きました"]'::jsonb, '書きません',
       'Polite negative present = i-stem + ません'
FROM grammar_patterns WHERE pattern = 'Godan: く→きません';

INSERT INTO grammar_exercises (pattern_id, type, question, options, correct_answer, explanation)
SELECT id, 'discrimination', 'Which is correct polite negative past of 食べる?',
       '["食べません", "食べませんでした", "食べなかった", "食べりませんでした"]'::jsonb, '食べませんでした',
       'Polite negative past = stem + ませんでした'
FROM grammar_patterns WHERE pattern = 'Ichidan: る→ませんでした';
