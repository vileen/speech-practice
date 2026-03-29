-- Exercises for polite negative forms (corrected schema)

INSERT INTO grammar_exercises (pattern_id, type, prompt, context, correct_answer, hints, difficulty)
SELECT id, 'conjugation', 'Conjugate 書く to polite negative present (I don''t write)', 
       'Godan verb ending in く', '書きません',
       '["Change く to き", "Add ません"]'::jsonb, 1
FROM grammar_patterns WHERE pattern = 'Godan: く→きません';

INSERT INTO grammar_exercises (pattern_id, type, prompt, context, correct_answer, hints, difficulty)
SELECT id, 'conjugation', 'Conjugate 行く to polite negative past (I didn''t go)', 
       'Godan verb ending in く', '行きませんでした',
       '["Change く to き", "Add ませんでした"]'::jsonb, 2
FROM grammar_patterns WHERE pattern = 'Godan: く→きませんでした';

INSERT INTO grammar_exercises (pattern_id, type, prompt, context, correct_answer, hints, difficulty)
SELECT id, 'conjugation', 'Conjugate 話す to polite negative present (I don''t speak)', 
       'Godan verb ending in す', '話しません',
       '["Change す to し", "Add ません"]'::jsonb, 1
FROM grammar_patterns WHERE pattern = 'Godan: す→しません';

INSERT INTO grammar_exercises (pattern_id, type, prompt, context, correct_answer, hints, difficulty)
SELECT id, 'conjugation', 'Conjugate 待つ to polite negative past (I didn''t wait)', 
       'Godan verb ending in つ', '待ちませんでした',
       '["Change つ to ち", "Add ませんでした"]'::jsonb, 2
FROM grammar_patterns WHERE pattern = 'Godan: つ→ちませんでした';

INSERT INTO grammar_exercises (pattern_id, type, prompt, context, correct_answer, hints, difficulty)
SELECT id, 'conjugation', 'Conjugate 食べる to polite negative present (I don''t eat)', 
       'Ichidan verb', '食べません',
       '["Drop る", "Add ません"]'::jsonb, 1
FROM grammar_patterns WHERE pattern = 'Ichidan: る→ません';

INSERT INTO grammar_exercises (pattern_id, type, prompt, context, correct_answer, hints, difficulty)
SELECT id, 'conjugation', 'Conjugate 見る to polite negative past (I didn''t see)', 
       'Ichidan verb', '見ませんでした',
       '["Drop る", "Add ませんでした"]'::jsonb, 2
FROM grammar_patterns WHERE pattern = 'Ichidan: る→ませんでした';

INSERT INTO grammar_exercises (pattern_id, type, prompt, context, correct_answer, hints, difficulty)
SELECT id, 'conjugation', 'Conjugate 来る to polite negative present (I won''t come)', 
       'Irregular verb', '来ません',
       '["来る is irregular", "Use きません"]'::jsonb, 1
FROM grammar_patterns WHERE pattern = '来る polite negative';

INSERT INTO grammar_exercises (pattern_id, type, prompt, context, correct_answer, hints, difficulty)
SELECT id, 'conjugation', 'Conjugate する to polite negative past (I didn''t do)', 
       'Irregular verb', 'しませんでした',
       '["する is irregular", "Use しませんでした"]'::jsonb, 2
FROM grammar_patterns WHERE pattern = 'する polite negative';
