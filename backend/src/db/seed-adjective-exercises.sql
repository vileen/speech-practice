-- I-adjective and Na-adjective exercises
-- Run this AFTER seed-grammar.sql has been executed

-- I-adjective exercises
INSERT INTO grammar_exercises (pattern_id, type, prompt, context, correct_answer, hints, difficulty)
SELECT id, 'fill_blank', 'これは高＿＿です。', 'Complete: This is expensive (present affirmative)', 'い', '["Dictionary form keeps い", "No change needed"]', 1
FROM grammar_patterns WHERE pattern = 'い-adjectives: Present affirmative';

INSERT INTO grammar_exercises (pattern_id, type, prompt, context, correct_answer, hints, difficulty)
SELECT id, 'fill_blank', '今日は寒＿＿です。', 'Complete: Today is cold', 'い', '["い-adjective in dictionary form"]', 1
FROM grammar_patterns WHERE pattern = 'い-adjectives: Present affirmative';

INSERT INTO grammar_exercises (pattern_id, type, prompt, context, correct_answer, hints, difficulty)
SELECT id, 'fill_blank', 'これは高＿＿です。', 'Complete: This is not expensive (present negative)', 'くない', '["Drop い and add くない"]', 1
FROM grammar_patterns WHERE pattern = 'い-adjectives: Present negative';

INSERT INTO grammar_exercises (pattern_id, type, prompt, context, correct_answer, hints, difficulty)
SELECT id, 'fill_blank', '今日は寒＿＿です。', 'Complete: Today is not cold', 'くない', '["Drop final い, add くない"]', 1
FROM grammar_patterns WHERE pattern = 'い-adjectives: Present negative';

INSERT INTO grammar_exercises (pattern_id, type, prompt, context, correct_answer, hints, difficulty)
SELECT id, 'fill_blank', '昨日は暑＿＿です。', 'Complete: Yesterday was hot (past affirmative)', 'かった', '["Drop い and add かった"]', 1
FROM grammar_patterns WHERE pattern = 'い-adjectives: Past affirmative';

INSERT INTO grammar_exercises (pattern_id, type, prompt, context, correct_answer, hints, difficulty)
SELECT id, 'fill_blank', 'その映画は面白＿＿です。', 'Complete: That movie was interesting', 'かった', '["Past form of い-adjective"]', 1
FROM grammar_patterns WHERE pattern = 'い-adjectives: Past affirmative';

INSERT INTO grammar_exercises (pattern_id, type, prompt, context, correct_answer, hints, difficulty)
SELECT id, 'fill_blank', '昨日は寒＿＿です。', 'Complete: Yesterday was not cold (past negative)', 'くなかった', '["Drop い, add くなかった"]', 2
FROM grammar_patterns WHERE pattern = 'い-adjectives: Past negative';

INSERT INTO grammar_exercises (pattern_id, type, prompt, context, correct_answer, hints, difficulty)
SELECT id, 'fill_blank', 'その本は難し＿＿です。', 'Complete: That book was not difficult', 'くなかった', '["Past negative form"]', 2
FROM grammar_patterns WHERE pattern = 'い-adjectives: Past negative';

-- Na-adjective exercises
INSERT INTO grammar_exercises (pattern_id, type, prompt, context, correct_answer, hints, difficulty)
SELECT id, 'fill_blank', '彼女はきれい＿＿です。', 'Complete: She is pretty (present affirmative)', '', '["Na-adjective connects directly to です", "No な needed before です"]', 1
FROM grammar_patterns WHERE pattern = 'な-adjectives: Present affirmative';

INSERT INTO grammar_exercises (pattern_id, type, prompt, context, correct_answer, hints, difficulty)
SELECT id, 'fill_blank', 'これは便利＿＿です。', 'Complete: This is convenient', '', '["Use dictionary form + です"]', 1
FROM grammar_patterns WHERE pattern = 'な-adjectives: Present affirmative';

INSERT INTO grammar_exercises (pattern_id, type, prompt, context, correct_answer, hints, difficulty)
SELECT id, 'fill_blank', 'ここは便利＿＿ありません。', 'Complete: This place is not convenient (present negative)', 'では', '["Na-adjective + ではありません"]', 1
FROM grammar_patterns WHERE pattern = 'な-adjectives: Present negative';

INSERT INTO grammar_exercises (pattern_id, type, prompt, context, correct_answer, hints, difficulty)
SELECT id, 'fill_blank', 'それは簡単＿＿ありません。', 'Complete: That is not simple', 'じゃ', '["Casual form: じゃありません"]', 1
FROM grammar_patterns WHERE pattern = 'な-adjectives: Present negative';

INSERT INTO grammar_exercises (pattern_id, type, prompt, context, correct_answer, hints, difficulty)
SELECT id, 'fill_blank', '昨日は暇＿＿。', 'Complete: Yesterday was free (past affirmative)', 'でした', '["Na-adjective + でした"]', 1
FROM grammar_patterns WHERE pattern = 'な-adjectives: Past affirmative';

INSERT INTO grammar_exercises (pattern_id, type, prompt, context, correct_answer, hints, difficulty)
SELECT id, 'fill_blank', '前の仕事は大変＿＿。', 'Complete: The previous job was tough', 'でした', '["Past tense with でした"]', 1
FROM grammar_patterns WHERE pattern = 'な-adjectives: Past affirmative';

INSERT INTO grammar_exercises (pattern_id, type, prompt, context, correct_answer, hints, difficulty)
SELECT id, 'fill_blank', '昨日は暇＿＿ありませんでした。', 'Complete: Yesterday was not free (past negative)', 'では', '["Na-adjective + ではありませんでした"]', 2
FROM grammar_patterns WHERE pattern = 'な-adjectives: Past negative';

INSERT INTO grammar_exercises (pattern_id, type, prompt, context, correct_answer, hints, difficulty)
SELECT id, 'fill_blank', 'きれい＿＿花', 'Complete: Pretty flower (before noun)', 'な', '["Na-adjective needs な before nouns"]', 1
FROM grammar_patterns WHERE pattern = 'な-adjectives: Before nouns';

INSERT INTO grammar_exercises (pattern_id, type, prompt, context, correct_answer, hints, difficulty)
SELECT id, 'fill_blank', '便利＿＿道具', 'Complete: Convenient tool', 'な', '["Add な before the noun"]', 1
FROM grammar_patterns WHERE pattern = 'な-adjectives: Before nouns';

INSERT INTO grammar_exercises (pattern_id, type, prompt, context, correct_answer, hints, difficulty)
SELECT id, 'fill_blank', '有名＿＿人', 'Complete: Famous person', 'な', '["な-adjective + noun connection"]', 1
FROM grammar_patterns WHERE pattern = 'な-adjectives: Before nouns';
