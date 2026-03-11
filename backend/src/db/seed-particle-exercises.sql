-- Particle exercises - run this AFTER seed-grammar.sql
-- These use subqueries to find the correct pattern IDs

INSERT INTO grammar_exercises (pattern_id, type, prompt, context, correct_answer, hints, difficulty)
SELECT id, 'fill_blank', '私＿＿学生です。', 'Fill in the topic marker', 'は', '["Marking the topic: as for me..."]', 1
FROM grammar_patterns WHERE pattern = 'は (topic marker)';

INSERT INTO grammar_exercises (pattern_id, type, prompt, context, correct_answer, hints, difficulty)
SELECT id, 'fill_blank', '今日＿＿いい天気です。', 'Fill in the topic marker', 'は', '["Today is the topic"]', 1
FROM grammar_patterns WHERE pattern = 'は (topic marker)';

INSERT INTO grammar_exercises (pattern_id, type, prompt, context, correct_answer, hints, difficulty)
SELECT id, 'fill_blank', '猫＿＿います。', 'Fill in: There is a cat', 'が', '["Use が with います for existence"]', 1
FROM grammar_patterns WHERE pattern = 'が (subject marker)';

INSERT INTO grammar_exercises (pattern_id, type, prompt, context, correct_answer, hints, difficulty)
SELECT id, 'fill_blank', '誰＿＿来ましたか。', 'Fill in: Who came?', 'が', '["Question word + が for unknown subject"]', 2
FROM grammar_patterns WHERE pattern = 'が (subject marker)';

INSERT INTO grammar_exercises (pattern_id, type, prompt, context, correct_answer, hints, difficulty)
SELECT id, 'fill_blank', '寿司＿＿食べます。', 'Fill in the object marker', 'を', '["Marks what is being eaten"]', 1
FROM grammar_patterns WHERE pattern = 'を (object marker)';

INSERT INTO grammar_exercises (pattern_id, type, prompt, context, correct_answer, hints, difficulty)
SELECT id, 'fill_blank', '本＿＿読みます。', 'Fill in: I read a book', 'を', '["Marks the object of reading"]', 1
FROM grammar_patterns WHERE pattern = 'を (object marker)';

INSERT INTO grammar_exercises (pattern_id, type, prompt, context, correct_answer, hints, difficulty)
SELECT id, 'fill_blank', '３時＿＿会いましょう。', 'Fill in the time particle', 'に', '["Specific time points use に"]', 1
FROM grammar_patterns WHERE pattern = 'に (location/time/target)';

INSERT INTO grammar_exercises (pattern_id, type, prompt, context, correct_answer, hints, difficulty)
SELECT id, 'fill_blank', '日本＿＿行きます。', 'Fill in: I go to Japan', 'に', '["Destination/direction"]', 1
FROM grammar_patterns WHERE pattern = 'に (location/time/target)';

INSERT INTO grammar_exercises (pattern_id, type, prompt, context, correct_answer, hints, difficulty)
SELECT id, 'fill_blank', '友達＿＿あげます。', 'Fill in: I give to a friend', 'に', '["Marks recipient/indirect object"]', 2
FROM grammar_patterns WHERE pattern = 'に (location/time/target)';

INSERT INTO grammar_exercises (pattern_id, type, prompt, context, correct_answer, hints, difficulty)
SELECT id, 'fill_blank', '図書館＿＿勉強します。', 'Fill in: I study at the library', 'で', '["Location where action happens"]', 1
FROM grammar_patterns WHERE pattern = 'で (location/method/means)';

INSERT INTO grammar_exercises (pattern_id, type, prompt, context, correct_answer, hints, difficulty)
SELECT id, 'fill_blank', 'バス＿＿行きます。', 'Fill in: I go by bus', 'で', '["Method/means of transportation"]', 1
FROM grammar_patterns WHERE pattern = 'で (location/method/means)';

INSERT INTO grammar_exercises (pattern_id, type, prompt, context, correct_answer, hints, difficulty)
SELECT id, 'fill_blank', '学校＿＿行きます。', 'Fill in the direction', 'へ', '["Emphasizes direction toward"]', 1
FROM grammar_patterns WHERE pattern = 'へ (direction)';

INSERT INTO grammar_exercises (pattern_id, type, prompt, context, correct_answer, hints, difficulty)
SELECT id, 'fill_blank', '私＿＿友達＿＿行きます。', 'Fill in both particles: I go with my friend', 'と、と', '["と = with/together with"]', 2
FROM grammar_patterns WHERE pattern = 'と (and/with)';

INSERT INTO grammar_exercises (pattern_id, type, prompt, context, correct_answer, hints, difficulty)
SELECT id, 'fill_blank', '「はい」＿＿言いました。', 'Fill in: I said yes', 'と', '["と for quoting what was said"]', 2
FROM grammar_patterns WHERE pattern = 'と (and/with)';

INSERT INTO grammar_exercises (pattern_id, type, prompt, context, correct_answer, hints, difficulty)
SELECT id, 'fill_blank', '日本＿＿来ました。', 'Fill in: I came from Japan', 'から', '["Origin/starting point"]', 1
FROM grammar_patterns WHERE pattern = 'から (from/since)';

INSERT INTO grammar_exercises (pattern_id, type, prompt, context, correct_answer, hints, difficulty)
SELECT id, 'fill_blank', '９時＿＿働きます。', 'Fill in: I work from 9', 'から', '["Starting time"]', 1
FROM grammar_patterns WHERE pattern = 'から (from/since)';

INSERT INTO grammar_exercises (pattern_id, type, prompt, context, correct_answer, hints, difficulty)
SELECT id, 'fill_blank', '駅＿＿行きます。', 'Fill in: I go to the station', 'まで', '["Destination/up to"]', 1
FROM grammar_patterns WHERE pattern = 'まで (until/to)';

INSERT INTO grammar_exercises (pattern_id, type, prompt, context, correct_answer, hints, difficulty)
SELECT id, 'fill_blank', '５時＿＿働きます。', 'Fill in: I work until 5', 'まで', '["Until a time"]', 1
FROM grammar_patterns WHERE pattern = 'まで (until/to)';

INSERT INTO grammar_exercises (pattern_id, type, prompt, context, correct_answer, hints, difficulty)
SELECT id, 'fill_blank', '私＿＿本です。', 'Fill in: It is my book', 'の', '["Possession: my book"]', 1
FROM grammar_patterns WHERE pattern = 'の (possession/description)';

INSERT INTO grammar_exercises (pattern_id, type, prompt, context, correct_answer, hints, difficulty)
SELECT id, 'fill_blank', '日本語＿＿先生です。', 'Fill in: A Japanese teacher', 'の', '["Noun modifier: Japanese (language) teacher"]', 1
FROM grammar_patterns WHERE pattern = 'の (possession/description)';
