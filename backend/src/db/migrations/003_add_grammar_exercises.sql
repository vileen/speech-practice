-- Migration: Add exercises for I-Adjective forms, Na-Adjective forms, and Particle patterns
-- Created: 2026-03-21

-- ============================================
-- I-ADJECTIVE EXERCISES (Patterns 19-22)
-- ============================================

-- Pattern 19: い-adjectives: Present affirmative
INSERT INTO grammar_exercises (pattern_id, type, prompt, context, correct_answer, hints, difficulty) VALUES
(19, 'construction', 'Say: This is expensive.', 'Use い-adjective present affirmative', 'これは高いです。', '["い-adjective: 高い", "Add です for politeness"]', 1),
(19, 'fill_blank', 'この本は＿＿＿＿＿。 (interesting)', 'Complete with い-adjective present affirmative', '面白いです', '["い-adjective: 面白い", "Add です"]', 2),
(19, 'discrimination', 'Choose the correct form: "This book is interesting"', 'Present affirmative form', '面白いです', '["Present = dictionary form + です", "Not past, not negative"]', 2);

-- Pattern 20: い-adjectives: Present negative
INSERT INTO grammar_exercises (pattern_id, type, prompt, context, correct_answer, hints, difficulty) VALUES
(20, 'construction', 'Say: This is not expensive.', 'Use い-adjective present negative (drop い, add くない)', 'これは高くないです。', '["Drop final い from 高い", "Add くないです"]', 2),
(20, 'fill_blank', '今日は＿＿＿＿＿＿。 (not cold - 寒い)', 'Complete with い-adjective present negative', '寒くないです', '["Drop い from 寒い", "Add くないです"]', 2),
(20, 'error_correction', 'Fix: これは高いではありません。', 'い-adjectives use くない, not ではありません', 'これは高くないです。', '["い-adjectives form negative with くない", "な-adjectives use ではありません"]', 3),
(20, 'discrimination', 'Choose the negative form of 寒い', 'Present negative', '寒くないです', '["Drop い, add くない", "Not 寒いない or 寒いではありません"]', 2);

-- Pattern 21: い-adjectives: Past affirmative
INSERT INTO grammar_exercises (pattern_id, type, prompt, context, correct_answer, hints, difficulty) VALUES
(21, 'construction', 'Say: Yesterday was hot.', 'Use い-adjective past affirmative (drop い, add かった)', '昨日は暑かったです。', '["Drop final い from 暑い", "Add かったです"]', 2),
(21, 'fill_blank', 'その映画は＿＿＿＿＿＿。 (interesting - past)', 'Complete with い-adjective past affirmative', '面白かったです', '["Drop い from 面白い", "Add かったです"]', 2),
(21, 'transformation', 'Change to past: この本は難しいです。', 'Convert present to past', 'この本は難しかったです。', '["Drop い from 難しい", "Add かったです"]', 2);

-- Pattern 22: い-adjectives: Past negative
INSERT INTO grammar_exercises (pattern_id, type, prompt, context, correct_answer, hints, difficulty) VALUES
(22, 'construction', 'Say: Yesterday was not cold.', 'Use い-adjective past negative (drop い, add くなかった)', '昨日は寒くなかったです。', '["Drop final い from 寒い", "Add くなかったです"]', 3),
(22, 'fill_blank', 'その本は＿＿＿＿＿＿＿＿。 (difficult - past negative)', 'Complete with い-adjective past negative', '難しくなかったです', '["Drop い from 難しい", "Add くなかったです"]', 3),
(22, 'transformation', 'Change to past negative: この料理は高いです。', 'Convert to past negative', 'この料理は高くなかったです。', '["Drop い from 高い", "Add くなかったです"]', 3);

-- ============================================
-- NA-ADJECTIVE EXERCISES (Patterns 23-27)
-- ============================================

-- Pattern 23: な-adjectives: Present affirmative
INSERT INTO grammar_exercises (pattern_id, type, prompt, context, correct_answer, hints, difficulty) VALUES
(23, 'construction', 'Say: She is pretty.', 'Use な-adjective present affirmative (no な before です)', '彼女はきれいです。', '["な-adjective: きれい", "Connect directly to です (no な)"]', 1),
(23, 'fill_blank', 'これは＿＿＿＿＿。 (convenient - 便利)', 'Complete with な-adjective present affirmative', '便利です', '["な-adjective: 便利", "Directly + です"]', 1),
(23, 'error_correction', 'Fix: 彼女はきれいなです。', 'な is NOT used before です', '彼女はきれいです。', '["な is only before nouns", "Before です: no な"]', 2);

-- Pattern 24: な-adjectives: Present negative
INSERT INTO grammar_exercises (pattern_id, type, prompt, context, correct_answer, hints, difficulty) VALUES
(24, 'construction', 'Say: This place is not convenient.', 'Use な-adjective present negative (ではありません)', 'ここは便利ではありません。', '["な-adjective + ではありません", "Or use casual: じゃありません"]', 2),
(24, 'fill_blank', 'それは＿＿＿＿＿＿＿＿＿。 (simple - 簡単, negative)', 'Complete with な-adjective present negative', '簡単じゃありません', '["な-adjective + じゃありません", "Or ではありません"]', 2),
(24, 'error_correction', 'Fix: ここは便利くないです。', 'な-adjectives use ではありません, not くない', 'ここは便利ではありません。', '["い-adjectives: くない", "な-adjectives: ではありません"]', 3);

-- Pattern 25: な-adjectives: Past affirmative
INSERT INTO grammar_exercises (pattern_id, type, prompt, context, correct_answer, hints, difficulty) VALUES
(25, 'construction', 'Say: Yesterday was free (I had free time).', 'Use な-adjective past affirmative (でした)', '昨日は暇でした。', '["な-adjective + でした"]', 2),
(25, 'fill_blank', '前の仕事は＿＿＿＿＿。 (tough - 大変, past)', 'Complete with な-adjective past affirmative', '大変でした', '["な-adjective + でした"]', 2),
(25, 'transformation', 'Change to past: この部屋はきれいです。', 'Convert present to past', 'この部屋はきれいでした。', '["Replace です with でした"]', 2);

-- Pattern 26: な-adjectives: Past negative
INSERT INTO grammar_exercises (pattern_id, type, prompt, context, correct_answer, hints, difficulty) VALUES
(26, 'construction', 'Say: Yesterday was not free.', 'Use な-adjective past negative', '昨日は暇ではありませんでした。', '["な-adjective + ではありませんでした"]', 3),
(26, 'fill_blank', 'それは＿＿＿＿＿＿＿＿＿＿。 (simple - 簡単, past negative)', 'Complete with な-adjective past negative', '簡単じゃありませんでした', '["な-adjective + じゃありませんでした"]', 3),
(26, 'transformation', 'Change to past negative: この町は有名です。', 'Convert to past negative', 'この町は有名ではありませんでした。', '["Replace です with ではありませんでした"]', 3);

-- Pattern 27: な-adjectives: Before nouns
INSERT INTO grammar_exercises (pattern_id, type, prompt, context, correct_answer, hints, difficulty) VALUES
(27, 'construction', 'Say: pretty flower', 'Use な-adjective before noun (add な)', 'きれいな花', '["な-adjective: きれい", "Add な before noun: 花"]', 2),
(27, 'construction', 'Say: convenient tool', 'Use な-adjective before noun', '便利な道具', '["な-adjective + な + noun"]', 2),
(27, 'fill_blank', '＿＿＿＿＿＿人 (famous person - 有名)', 'Complete with な-adjective + noun', '有名な人', '["Add な before the noun"]', 2),
(27, 'error_correction', 'Fix: きれい花', 'な-adjectives need な before nouns!', 'きれいな花', '["い-adjectives: no change before noun", "な-adjectives: add な before noun"]', 2);

-- ============================================
-- PARTICLE EXERCISES (Patterns 9-18)
-- ============================================

-- Pattern 9: は (topic marker)
INSERT INTO grammar_exercises (pattern_id, type, prompt, context, correct_answer, hints, difficulty) VALUES
(9, 'construction', 'Say: I am a student. (neutral topic)', 'Use は topic marker', '私は学生です。', '["Topic marker: は", "As for me, I am a student"]', 1),
(9, 'fill_blank', '＿＿＿＿学生です。 (I - 私)', 'Complete with は', '私は', '["Topic marker: は", "Marks known information"]', 1),
(9, 'discrimination', 'Choose: "I am a student" (neutral statement)', 'Topic vs Subject marker', '私は学生です。', '["は = topic (neutral/known)", "が = subject (new/emphasis)"]', 2);

-- Pattern 10: が (subject marker)
INSERT INTO grammar_exercises (pattern_id, type, prompt, context, correct_answer, hints, difficulty) VALUES
(10, 'construction', 'Say: There is a cat. / A cat exists.', 'Use が subject marker with existence', '猫がいます。', '["Subject marker: が", "Use with います/あります"]', 1),
(10, 'construction', 'Say: I will do it (emphasis: ME, not others).', 'Use が for emphasis', '私がやります。', '["が emphasizes the subject", "Contrasts with others"]', 2),
(10, 'fill_blank', '本＿＿＿あります。 (There is a book)', 'Complete with が', 'が', '["Use が with あります/います"]', 1),
(10, 'discrimination', 'Choose: "There is a cat" (existence)', 'Subject marker for existence', '猫がいます。', '["が = subject marker", "は = topic marker (different meaning)"]', 2);

-- Pattern 11: を (object marker)
INSERT INTO grammar_exercises (pattern_id, type, prompt, context, correct_answer, hints, difficulty) VALUES
(11, 'construction', 'Say: I eat sushi.', 'Use を object marker', '寿司を食べます。', '["Object marker: を", "Marks what the verb acts upon"]', 1),
(11, 'construction', 'Say: I read a book.', 'Use を object marker', '本を読みます。', '["Direct object + を"]', 1),
(11, 'fill_blank', '映画＿＿＿見ます。 (watch a movie)', 'Complete with を', 'を', '["Direct object marker"]', 1),
(11, 'error_correction', 'Fix: 学校を行きます。', '行く is intransitive - use に/へ, not を', '学校に行きます。', '["を = direct object (transitive verbs)", "に = destination (intransitive motion verbs)"]', 2);

-- Pattern 12: に (location/time/target)
INSERT INTO grammar_exercises (pattern_id, type, prompt, context, correct_answer, hints, difficulty) VALUES
(12, 'construction', 'Say: Let\'s meet at 3 o\'clock.', 'Use に for specific time', '３時に会いましょう。', '["Specific time + に"]', 1),
(12, 'construction', 'Say: I go to Japan.', 'Use に for direction with motion verbs', '日本に行きます。', '["Destination + に + motion verb"]', 1),
(12, 'construction', 'Say: I give it to a friend.', 'Use に for indirect object', '友達にあげます。', '["Recipient + に"]', 2),
(12, 'fill_blank', '机の上＿＿＿あります。 (exists on the table)', 'Complete with に', 'に', '["Location of existence: に"]', 2);

-- Pattern 13: で (location/method/means)
INSERT INTO grammar_exercises (pattern_id, type, prompt, context, correct_answer, hints, difficulty) VALUES
(13, 'construction', 'Say: I study at the library.', 'Use で for location of action', '図書館で勉強します。', '["Location of action + で"]', 1),
(13, 'construction', 'Say: I go by bus.', 'Use で for means/transportation', 'バスで行きます。', '["Means/method + で"]', 1),
(13, 'construction', 'Say: I eat with chopsticks.', 'Use で for instrument', '箸で食べます。', '["Instrument/tool + で"]', 2),
(13, 'discrimination', 'Choose: "I study at school" (action location)', 'で vs に', '学校で勉強します。', '["で = where action happens", "に = destination/existence"]', 2);

-- Pattern 14: へ (direction)
INSERT INTO grammar_exercises (pattern_id, type, prompt, context, correct_answer, hints, difficulty) VALUES
(14, 'construction', 'Say: I go to school (in that direction).', 'Use へ for direction', '学校へ行きます。', '["Direction/destination + へ"]', 1),
(14, 'construction', 'Say: Welcome to Japan.', 'Use へ in set phrase', '日本へようこそ。', '["へ emphasizes direction toward"]', 1),
(14, 'fill_blank', '東京＿＿＿行きます。 (go to Tokyo)', 'Complete with へ or に', 'へ', '["へ = direction emphasis", "に = destination (interchangeable for motion verbs)"]', 1);

-- Pattern 15: と (and/with)
INSERT INTO grammar_exercises (pattern_id, type, prompt, context, correct_answer, hints, difficulty) VALUES
(15, 'construction', 'Say: I go with my friend.', 'Use と for "with"', '友達と行きます。', '["Person + と = with person"]', 1),
(15, 'construction', 'Say: I like sushi and sashimi.', 'Use と for complete listing', '寿司と刺身が好きです。', '["A と B = A and B (complete list)"]', 1),
(15, 'construction', 'Say: I said "yes".', 'Use と for quotes', '「はい」と言いました。', '["Quote + と + verb of speaking"]', 2),
(15, 'discrimination', 'Choose: "I go WITH my friend"', 'と vs や', '友達と行きます。', '["と = complete list/with", "や = incomplete list (and more)"]', 2);

-- Pattern 16: から (from/since)
INSERT INTO grammar_exercises (pattern_id, type, prompt, context, correct_answer, hints, difficulty) VALUES
(16, 'construction', 'Say: I came from Japan.', 'Use から for origin', '日本から来ました。', '["Origin + から"]', 1),
(16, 'construction', 'Say: I work from 9 o\'clock.', 'Use から for starting time', '９時から働きます。', '["Starting time + から"]', 1),
(16, 'construction', 'Say: Because it\'s cold, I wear a coat.', 'Use から for reason (at end)', '寒いですから、コートを着ます。', '["Reason + から = because"]', 2),
(16, 'fill_blank', '家＿＿＿出ます。 (leave home)', 'Complete with から', 'から', '["Starting point + から"]', 1);

-- Pattern 17: まで (until/to)
INSERT INTO grammar_exercises (pattern_id, type, prompt, context, correct_answer, hints, difficulty) VALUES
(17, 'construction', 'Say: I go to the station.', 'Use まで for destination/up to', '駅まで行きます。', '["Destination + まで"]', 1),
(17, 'construction', 'Say: I work until 5 o\'clock.', 'Use まで for ending time', '５時まで働きます。', '["Ending time + まで"]', 1),
(17, 'construction', 'Say: I read up to here.', 'Use まで for extent', 'ここまで読みました。', '["Extent limit + まで"]', 2),
(17, 'transformation', 'Change: ９時から働きます → "work until 5"', 'Add ending time with まで', '９時から５時まで働きます。', '["Start + から, End + まで"]', 2);

-- Pattern 18: の (possession/description)
INSERT INTO grammar_exercises (pattern_id, type, prompt, context, correct_answer, hints, difficulty) VALUES
(18, 'construction', 'Say: It is my book.', 'Use の for possession', '私の本です。', '["Possessor + の + possessed"]', 1),
(18, 'construction', 'Say: A Japanese language teacher.', 'Use の for description', '日本語の先生です。', '["Description + の + noun"]', 1),
(18, 'construction', 'Say: A university student.', 'Use の for noun modification', '大学の学生です。', '["Noun modifier + の + noun"]', 1),
(18, 'fill_blank', '田中さん＿＿＿本 (Tanaka\'s book)', 'Complete with の', 'の', '["Possession: の"]', 1);

-- Add some discrimination exercises comparing similar particles
INSERT INTO grammar_exercises (pattern_id, type, prompt, context, correct_answer, hints, difficulty) VALUES
(9, 'discrimination', 'Choose: "I am a student" (topic, not emphasized)', 'は vs が', '私は学生です。', '["は = neutral topic", "が = emphasized subject/new info"]', 2),
(10, 'discrimination', 'Choose: "There is a cat" (existence)', 'が vs は', '猫がいます。', '["が with います/あります", "は would change meaning"]', 2),
(12, 'discrimination', 'Choose: "I study at school" (action location)', 'で vs に', '学校で勉強します。', '["で = where action happens", "に = destination/existence"]', 2),
(11, 'discrimination', 'Choose: "I eat sushi" (direct object)', 'を vs が', '寿司を食べます。', '["を = direct object", "が = subject (different meaning)"]', 2);

-- ============================================
-- UPDATE PATTERN RELATIONSHIPS
-- ============================================

-- Set up related_patterns for I-adjectives
UPDATE grammar_patterns SET related_patterns = ARRAY[20,21,22] WHERE id = 19;
UPDATE grammar_patterns SET related_patterns = ARRAY[19,21,22] WHERE id = 20;
UPDATE grammar_patterns SET related_patterns = ARRAY[19,20,22] WHERE id = 21;
UPDATE grammar_patterns SET related_patterns = ARRAY[19,20,21] WHERE id = 22;

-- Set up related_patterns for Na-adjectives
UPDATE grammar_patterns SET related_patterns = ARRAY[24,25,26,27] WHERE id = 23;
UPDATE grammar_patterns SET related_patterns = ARRAY[23,25,26,27] WHERE id = 24;
UPDATE grammar_patterns SET related_patterns = ARRAY[23,24,26,27] WHERE id = 25;
UPDATE grammar_patterns SET related_patterns = ARRAY[23,24,25,27] WHERE id = 26;
UPDATE grammar_patterns SET related_patterns = ARRAY[23,24,25,26] WHERE id = 27;

-- Set up related_patterns for Particles
UPDATE grammar_patterns SET related_patterns = ARRAY[10,11,12] WHERE id = 9;  -- は vs が,を,に
UPDATE grammar_patterns SET related_patterns = ARRAY[9,12,13] WHERE id = 10;  -- が vs は,に,で
UPDATE grammar_patterns SET related_patterns = ARRAY[9,10,12] WHERE id = 11;  -- を vs は,が,に
UPDATE grammar_patterns SET related_patterns = ARRAY[9,10,11,13] WHERE id = 12; -- に vs は,が,を,で
UPDATE grammar_patterns SET related_patterns = ARRAY[12,14] WHERE id = 13;     -- で vs に,へ

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
