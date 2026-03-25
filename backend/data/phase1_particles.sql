-- Phase 1: Particles Grammar Patterns
-- Generated for speech-practice Phase 1 expansion

-- =====================================================
-- PARTICLE PATTERNS (10 additional patterns)
-- =====================================================

INSERT INTO grammar_patterns (pattern, category, jlpt_level, formation_rules, examples, common_mistakes) VALUES
('は vs が (contrastive は)', 'Particles', 'N4',
 '{"formation": "Topic は vs Subject が", "meaning": "は = topic/contrast, が = subject/identifier"}'::jsonb,
 '[{"japanese": "私は学生です。私がやりました。", "romaji": "Watashi wa gakusei desu. Watashi ga yarimashita.", "meaning": "I am a student. I did it (not someone else)."}, {"japanese": "今日は行きます。明日は行きません。", "romaji": "Kyou wa ikimasu. Ashita wa ikimasen.", "meaning": "Today I will go. Tomorrow I won\'t. (contrast)"}]'::jsonb,
 '[{"mistake": "Using が for general topic", "correction": "Use は for general statements", "explanation": "が is for specific identification"}]'::jsonb
),
('に (time marker)', 'Particles', 'N5',
 '{"formation": "Time expression + に", "meaning": "At, On (specific time)"}'::jsonb,
 '[{"japanese": "７時に起きます。", "romaji": "Shichiji ni okimasu.", "meaning": "I wake up at 7."}, {"japanese": "月曜日に会いましょう。", "romaji": "Getsuyoubi ni aimashou.", "meaning": "Let\'s meet on Monday."}]'::jsonb,
 '[{"mistake": "Using に with relative time", "correction": "No particle with today, tomorrow, yesterday", "explanation": "きょう、あした、きのう don\'t take に"}]'::jsonb
),
('に (location/target)', 'Particles', 'N5',
 '{"formation": "Place + に + motion verb", "meaning": "To, Into, Towards"}'::jsonb,
 '[{"japanese": "学校に行きます。", "romaji": "Gakkou ni ikimasu.", "meaning": "I go to school."}, {"japanese": "日本に来ました。", "romaji": "Nihon ni kimashita.", "meaning": "I came to Japan."}]'::jsonb,
 '[{"mistake": "Using で instead of に for destination", "correction": "Use に for direction/destination", "explanation": "に marks target of motion"}]'::jsonb
),
('に (purpose)', 'Particles', 'N5',
 '{"formation": "Verb stem + に + motion verb", "meaning": "In order to ~, For the purpose of ~"}'::jsonb,
 '[{"japanese": "食べに行きます。", "romaji": "Tabe ni ikimasu.", "meaning": "I go to eat."}, {"japanese": "日本へ勉強しに来ました。", "romaji": "Nihon e benkyou shi ni kimashita.", "meaning": "I came to Japan to study."}]'::jsonb,
 '[{"mistake": "Using て-form instead of stem", "correction": "Use verb stem + に", "explanation": "食べる→食べに行く"}]'::jsonb
),
('で (location of action)', 'Particles', 'N5',
 '{"formation": "Place + で + action verb", "meaning": "At, In (where action happens)"}'::jsonb,
 '[{"japanese": "学校で勉強します。", "romaji": "Gakkou de benkyou shimasu.", "meaning": "I study at school."}, {"japanese": "レストランで食べました。", "romaji": "Resutoran de tabemashita.", "meaning": "I ate at a restaurant."}]'::jsonb,
 '[{"mistake": "Using に for location of action", "correction": "Use で for where action takes place", "explanation": "に = destination, で = location of action"}]'::jsonb
),
('で (means/instrument)', 'Particles', 'N5',
 '{"formation": "Tool/Method + で", "meaning": "By, With, Using"}'::jsonb,
 '[{"japanese": "箸で食べます。", "romaji": "Hashi de tabemasu.", "meaning": "I eat with chopsticks."}, {"japanese": "バスで行きます。", "romaji": "Basu de ikimasu.", "meaning": "I go by bus."}]'::jsonb,
 '[{"mistake": "Using を for instruments", "correction": "Use で for tools/methods", "explanation": "で marks means, を marks direct object"}]'::jsonb
),
('から (starting point)', 'Particles', 'N5',
 '{"formation": "Place/Time + から", "meaning": "From, Starting at"}'::jsonb,
 '[{"japanese": "東京から来ました。", "romaji": "Toukyou kara kimashita.", "meaning": "I came from Tokyo."}, {"japanese": "９時から始まります。", "romaji": "Kuji kara hajimarimasu.", "meaning": "It starts from 9 o\'clock."}]'::jsonb,
 '[]'::jsonb
),
('まで (ending point)', 'Particles', 'N5',
 '{"formation": "Place/Time + まで", "meaning": "Until, To, As far as"}'::jsonb,
 '[{"japanese": "大阪まで行きます。", "romaji": "Osaka made ikimasu.", "meaning": "I go as far as Osaka."}, {"japanese": "５時まで働きます。", "romaji": "Goji made hatarakimasu.", "meaning": "I work until 5."}]'::jsonb,
 '[{"mistake": "Using に with まで", "correction": "Use まで alone", "explanation": "まで replaces に for destination with distance"}]'::jsonb
),
('と (together with)', 'Particles', 'N5',
 '{"formation": "Person + と + verb", "meaning": "With, Together with"}'::jsonb,
 '[{"japanese": "友達と映画を見ました。", "romaji": "Tomodachi to eiga wo mimashita.", "meaning": "I watched a movie with a friend."}, {"japanese": "家族と住んでいます。", "romaji": "Kazoku to sunde imasu.", "meaning": "I live with my family."}]'::jsonb,
 '[{"mistake": "Using に for companions", "correction": "Use と for doing things together", "explanation": "と = together with, に = target/direction"}]'::jsonb
),
('や (incomplete listing)', 'Particles', 'N5',
 '{"formation": "Noun + や + Noun + (や)", "meaning": "And so on, Such as, Things like"}'::jsonb,
 '[{"japanese": "本や雑誌を読みます。", "romaji": "Hon ya zasshi wo yomimasu.", "meaning": "I read books and magazines (and such)."}, {"japanese": "東京や大阪へ行きました。", "romaji": "Toukyou ya Osaka e ikimashita.", "meaning": "I went to Tokyo and Osaka (and other places)."}]'::jsonb,
 '[{"mistake": "Using や for complete lists", "correction": "Use と for complete lists, や for incomplete", "explanation": "や implies there are more items"}]'::jsonb
);

-- Note: Add exercises after pattern insertion:
-- INSERT INTO grammar_exercises (pattern_id, type, question, options, correct_answer, explanation)
-- SELECT id, 'discrimination', 'Where do you study? (action location)',
--        '["学校に", "学校で", "学校へ"]'::jsonb, '学校で',
--        'Use で for location where action takes place'
-- FROM grammar_patterns WHERE pattern = 'で (location of action)';
