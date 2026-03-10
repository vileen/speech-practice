-- Seed data for grammar patterns (N5 level)

INSERT INTO grammar_patterns (pattern, category, jlpt_level, formation_rules, examples, common_mistakes) VALUES
('〜てもいいです', 'Permission', 'N5', 
 '[{"step": 1, "rule": "Te-form of verb"}, {"step": 2, "rule": "Add もいいです"}]'::jsonb,
 '[{"jp": "写真を撮ってもいいですか。", "en": "May I take photos?", "romaji": "Shashin wo totte mo ii desu ka."}, {"jp": "入ってもいいです。", "en": "You may enter.", "romaji": "Haitte mo ii desu."}]'::jsonb,
 '[{"mistake": "Using dictionary form instead of te-form", "explanation": "Must use te-form: 食べてもいい not 食べもいい"}]'::jsonb
),
('〜てはいけません', 'Prohibition', 'N5',
 '[{"step": 1, "rule": "Te-form of verb"}, {"step": 2, "rule": "Add はいけません"}]'::jsonb,
 '[{"jp": "ここで吸ってはいけません。", "en": "You must not smoke here.", "romaji": "Koko de sutte wa ikemasen."}, {"jp": "触ってはいけません。", "en": "Do not touch.", "romaji": "Sawatte wa ikemasen."}]'::jsonb,
 '[{"mistake": "Forgetting は particle", "explanation": "Must include は: てはいけません not ていけません"}]'::jsonb
),
('〜たいです', 'Desire', 'N5',
 '[{"step": 1, "rule": "Stem form (masu-form without masu)"}, {"step": 2, "rule": "Add たいです"}]'::jsonb,
 '[{"jp": "寿司を食べたいです。", "en": "I want to eat sushi.", "romaji": "Sushi wo tabetai desu."}, {"jp": "日本に行きたいです。", "en": "I want to go to Japan.", "romaji": "Nihon ni ikitai desu."}]'::jsonb,
 '[{"mistake": "Using te-form instead of stem form", "explanation": "Use stem form: 食べたい not 食べてたい"}]'::jsonb
),
('〜ことができます', 'Ability', 'N5',
 '[{"step": 1, "rule": "Dictionary form of verb"}, {"step": 2, "rule": "Add ことができます"}]'::jsonb,
 '[{"jp": "日本語が話せることができます。", "en": "I can speak Japanese.", "romaji": "Nihongo wo hanasu koto ga dekimasu."}, {"jp": "泳ぐことができます。", "en": "I can swim.", "romaji": "Oyogu koto ga dekimasu."}]'::jsonb,
 '[{"mistake": "Using potential form before ことが", "explanation": "Use dictionary form: 話すことができます not 話せることができます"}]'::jsonb
),
('〜なければなりません', 'Obligation', 'N5',
 '[{"step": 1, "rule": "Negative form (nai) without ない"}, {"step": 2, "rule": "Add なければなりません"}]'::jsonb,
 '[{"jp": "勉強しなければなりません。", "en": "I must study.", "romaji": "Benkyou shinakereba narimasen."}, {"jp": "早く行かなければなりません。", "en": "I have to go early.", "romaji": "Hayaku ikanakereba narimasen."}]'::jsonb,
 '[{"mistake": "Using te-form", "explanation": "Must use nai-stem: しなければ not してなければ"}]'::jsonb
),
('〜なくてもいいです', 'Lack of Obligation', 'N5',
 '[{"step": 1, "rule": "Negative form (nai) without ない"}, {"step": 2, "rule": "Add なくてもいいです"}]'::jsonb,
 '[{"jp": "明日は来なくてもいいです。", "en": "You don''t have to come tomorrow.", "romaji": "Ashita wa konakute mo ii desu."}, {"jp": "心配しなくてもいいです。", "en": "You don''t need to worry.", "romaji": "Shinpai shinakute mo ii desu."}]'::jsonb,
 '[]'::jsonb
),
('〜ませんか', 'Invitation', 'N5',
 '[{"step": 1, "rule": "Verb stem (masu-form without masu)"}, {"step": 2, "rule": "Add ませんか"}]'::jsonb,
 '[{"jp": "一緒に食べませんか。", "en": "Shall we eat together?", "romaji": "Issho ni tabemasen ka."}, {"jp": "映画を見ませんか。", "en": "Would you like to see a movie?", "romaji": "Eiga wo mimasen ka."}]'::jsonb,
 '[{"mistake": "Using plain form", "explanation": "Use masu-stem: 食べませんか not 食べるませんか"}]'::jsonb
),
('〜ましょう', 'Suggestion', 'N5',
 '[{"step": 1, "rule": "Verb stem (masu-form without masu)"}, {"step": 2, "rule": "Add ましょう"}]'::jsonb,
 '[{"jp": "行きましょう！", "en": "Let''s go!", "romaji": "Ikimashou!"}, {"jp": "始めましょう。", "en": "Let''s begin.", "romaji": "Hajimemashou."}]'::jsonb,
 '[]'::jsonb
);

-- Add exercises for patterns
INSERT INTO grammar_exercises (pattern_id, type, prompt, context, correct_answer, hints, difficulty) VALUES
(1, 'construction', 'Ask for permission to take photos.', 'Use 〜てもいいです', '写真を撮ってもいいですか。', '["Think: photo = 写真, take = 撮る"]', 1),
(1, 'fill_blank', 'すみません、ここで写真を＿＿＿＿＿＿。', 'Complete with 〜てもいいです', '撮ってもいいですか', '["Use te-form of 撮る", "Add もいいですか"]', 2),
(2, 'construction', 'Say: You must not enter here.', 'Use 〜てはいけません', 'ここに入ってはいけません。', '["Enter = 入る", "Use te-form + はいけません"]', 1),
(3, 'construction', 'Say you want to eat sushi.', 'Use 〜たいです', '寿司を食べたいです。', '["Sushi = 寿司", "Want to eat = 食べたい"]', 1),
(4, 'construction', 'Say you can speak Japanese.', 'Use 〜ことができます', '日本語を話すことができます。', '["Japanese = 日本語", "Speak = 話す"]', 1),
(5, 'construction', 'Say you must study.', 'Use 〜なければなりません', '勉強しなければなりません。', '["Study = 勉強する", "Remove ない and add なければなりません"]', 2),
(6, 'construction', 'Say: You don''t have to come tomorrow.', 'Use 〜なくてもいいです', '明日は来なくてもいいです。', '["Tomorrow = 明日", "Come = 来る"]', 2),
(7, 'construction', 'Invite someone to eat together.', 'Use 〜ませんか', '一緒に食べませんか。', '["Together = 一緒に", "Eat = 食べる"]', 1),
(8, 'construction', 'Suggest: Let''s go!', 'Use 〜ましょう', '行きましょう！', '["Go = 行く", "Use stem form"]', 1);
