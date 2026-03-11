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

-- Particle patterns (N5 level) - Using double single quotes for escaping
INSERT INTO grammar_patterns (pattern, category, jlpt_level, formation_rules, examples, common_mistakes) VALUES
('は (topic marker)', 'Particles', 'N5',
 '[{"step": 1, "rule": "Place after topic"}, {"step": 2, "rule": "Replaces が or を for contrast/emphasis"}]'::jsonb,
 '[{"jp": "私は学生です。", "en": "I am a student (as for me).", "romaji": "Watashi wa gakusei desu."}, {"jp": "今日は忙しいです。", "en": "Today (unlike other days) I am busy.", "romaji": "Kyou wa isogashii desu."}]'::jsonb,
 '[{"mistake": "Using は for existence sentences", "explanation": "Use が for あります/います: 本があります not 本はあります for simple existence"}]'::jsonb
),
('が (subject marker)', 'Particles', 'N5',
 '[{"step": 1, "rule": "Marks grammatical subject"}, {"step": 2, "rule": "Used with あります/います, 好き/嫌い, ability"}]'::jsonb,
 '[{"jp": "猫がいます。", "en": "There is a cat. / A cat exists.", "romaji": "Neko ga imasu."}, {"jp": "私がやります。", "en": "I will do it (emphasis: I, not others).", "romaji": "Watashi ga yarimasu."}]'::jsonb,
 '[{"mistake": "Confusing は and が", "explanation": "は marks topic (old info), が marks subject (new info). 私は is neutral, 私が emphasizes me"}]'::jsonb
),
('を (object marker)', 'Particles', 'N5',
 '[{"step": 1, "rule": "Place after direct object"}, {"step": 2, "rule": "Marks what the verb acts upon"}]'::jsonb,
 '[{"jp": "寿司を食べます。", "en": "I eat sushi.", "romaji": "Sushi wo tabemasu."}, {"jp": "本を読みます。", "en": "I read a book.", "romaji": "Hon wo yomimasu."}]'::jsonb,
 '[{"mistake": "Using を with intransitive verbs", "explanation": "Intransitive verbs like 行く use に/へ, not を: 学校に行く not 学校を行く"}]'::jsonb
),
('に (location/time/target)', 'Particles', 'N5',
 '[{"step": 1, "rule": "Time: specific time point"}, {"step": 2, "rule": "Location: existence, direction"}, {"step": 3, "rule": "Indirect object: give to, say to"}]'::jsonb,
 '[{"jp": "３時に会いましょう。", "en": "Let''s meet at 3 o''clock.", "romaji": "San-ji ni aimashou."}, {"jp": "日本に行きます。", "en": "I go to Japan.", "romaji": "Nihon ni ikimasu."}, {"jp": "友達にあげます。", "en": "I give it to a friend.", "romaji": "Tomodachi ni agemasu."}]'::jsonb,
 '[{"mistake": "Using に with あります/います location", "explanation": "Use に for location of existence: 机の上にあります not で"}]'::jsonb
),
('で (location/method/means)', 'Particles', 'N5',
 '[{"step": 1, "rule": "Location: where action happens"}, {"step": 2, "rule": "Method: how/by what means"}, {"step": 3, "rule": "Material: what something is made with"}]'::jsonb,
 '[{"jp": "図書館で勉強します。", "en": "I study at the library.", "romaji": "Toshokan de benkyou shimasu."}, {"jp": "バスで行きます。", "en": "I go by bus.", "romaji": "Basu de ikimasu."}, {"jp": "箸で食べます。", "en": "I eat with chopsticks.", "romaji": "Hashi de tabemasu."}]'::jsonb,
 '[{"mistake": "Confusing で and に for location", "explanation": "で = where action happens (eat, study), に = destination/existence (go, be, give)"}]'::jsonb
),
('へ (direction)', 'Particles', 'N5',
 '[{"step": 1, "rule": "Place after destination/direction"}, {"step": 2, "rule": "Emphasizes direction toward"}]'::jsonb,
 '[{"jp": "学校へ行きます。", "en": "I go to school (in that direction).", "romaji": "Gakkou e ikimasu."}, {"jp": "日本へようこそ。", "en": "Welcome to Japan.", "romaji": "Nihon e youkoso."}]'::jsonb,
 '[{"mistake": "Using へ for exact time", "explanation": "へ is direction, に is time: 3時に not 3時へ"}]'::jsonb
),
('と (and/with)', 'Particles', 'N5',
 '[{"step": 1, "rule": "Complete listing: A and B"}, {"step": 2, "rule": "With: together with someone"}, {"step": 3, "rule": "Quote: what someone said/thought"}]'::jsonb,
 '[{"jp": "私と友達と行きます。", "en": "I go with my friend.", "romaji": "Watashi to tomodachi to ikimasu."}, {"jp": "「はい」と言いました。", "en": "I said yes.", "romaji": "Hai to iimashita."}, {"jp": "寿司と刺身が好きです。", "en": "I like sushi and sashimi.", "romaji": "Sushi to sashimi ga suki desu."}]'::jsonb,
 '[{"mistake": "Using と for incomplete lists", "explanation": "と is for complete lists (A and B and nothing else). Use や for incomplete lists (A and B and maybe more)"}]'::jsonb
),
('から (from/since)', 'Particles', 'N5',
 '[{"step": 1, "rule": "Origin: from a place"}, {"step": 2, "rule": "Time: since/from a time"}, {"step": 3, "rule": "Reason: because (at sentence end)"}]'::jsonb,
 '[{"jp": "日本から来ました。", "en": "I came from Japan.", "romaji": "Nihon kara kimashita."}, {"jp": "９時から働きます。", "en": "I work from 9 o''clock.", "romaji": "Ku-ji kara hatarakimasu."}, {"jp": "寒いですから、コートを着ます。", "en": "Because it''s cold, I wear a coat.", "romaji": "Samui desu kara, kooto wo kimasu."}]'::jsonb,
 '[]'::jsonb
),
('まで (until/to)', 'Particles', 'N5',
 '[{"step": 1, "rule": "Destination: up to a place"}, {"step": 2, "rule": "Time: until a time"}, {"step": 3, "rule": "Extent: up to a degree/amount"}]'::jsonb,
 '[{"jp": "駅まで行きます。", "en": "I go to the station.", "romaji": "Eki made ikimasu."}, {"jp": "５時まで働きます。", "en": "I work until 5 o''clock.", "romaji": "Go-ji made hatarakimasu."}, {"jp": "ここまで読みました。", "en": "I read up to here.", "romaji": "Koko made yomimashita."}]'::jsonb,
 '[{"mistake": "Using まで for destination with あります/います", "explanation": "まで goes with motion verbs like 行く, not existence verbs"}]'::jsonb
),
('の (possession/description)', 'Particles', 'N5',
 '[{"step": 1, "rule": "Possession: A''s B"}, {"step": 2, "rule": "Description: noun modifier"}, {"step": 3, "rule": "Apposition: one of..."}]'::jsonb,
 '[{"jp": "私の本です。", "en": "It is my book.", "romaji": "Watashi no hon desu."}, {"jp": "日本語の先生です。", "en": "A Japanese language teacher.", "romaji": "Nihongo no sensei desu."}, {"jp": "大学の学生です。", "en": "A university student.", "romaji": "Daigaku no gakusei desu."}]'::jsonb,
 '[{"mistake": "Overusing の in chained nouns", "explanation": "Japanese avoids chained の: university Japanese teacher = 大学の日本語の先生 (OK) vs 大学の日本語先生 (too chained)"}]'::jsonb
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

-- I-adjectives (い-adjectives)
INSERT INTO grammar_patterns (pattern, category, jlpt_level, formation_rules, examples, common_mistakes) VALUES
('い-adjectives: Present affirmative', 'I-Adjectives', 'N5',
 '[{"step": 1, "rule": "Use dictionary form"}, {"step": 2, "rule": "Ends in い, no change needed"}]'::jsonb,
 '[{"jp": "これは高いです。", "en": "This is expensive.", "romaji": "Kore wa takai desu."}, {"jp": "その本は面白いです。", "en": "That book is interesting.", "romaji": "Sono hon wa omoshiroi desu."}]'::jsonb,
 '[{"mistake": "Adding な before です", "explanation": "い-adjectives connect directly to です: 高いです not 高いなです"}]'::jsonb
),
('い-adjectives: Present negative', 'I-Adjectives', 'N5',
 '[{"step": 1, "rule": "Drop final い"}, {"step": 2, "rule": "Add くない"}]'::jsonb,
 '[{"jp": "これは高くないです。", "en": "This is not expensive.", "romaji": "Kore wa takakunai desu."}, {"jp": "今日は寒くないです。", "en": "Today is not cold.", "romaji": "Kyou wa samukunai desu."}]'::jsonb,
 '[{"mistake": "Using ではありません", "explanation": "い-adjectives form negative with くない: 高くない not 高いではありません"}]'::jsonb
),
('い-adjectives: Past affirmative', 'I-Adjectives', 'N5',
 '[{"step": 1, "rule": "Drop final い"}, {"step": 2, "rule": "Add かった"}]'::jsonb,
 '[{"jp": "昨日は暑かったです。", "en": "Yesterday was hot.", "romaji": "Kinou wa atsukatta desu."}, {"jp": "その映画は面白かったです。", "en": "That movie was interesting.", "romaji": "Sono eiga wa omoshirokatta desu."}]'::jsonb,
 '[{"mistake": "Adding です directly to い form", "explanation": "Must change to past form: 高かった not 高いでした"}]'::jsonb
),
('い-adjectives: Past negative', 'I-Adjectives', 'N5',
 '[{"step": 1, "rule": "Drop final い"}, {"step": 2, "rule": "Add くなかった"}]'::jsonb,
 '[{"jp": "昨日は寒くなかったです。", "en": "Yesterday was not cold.", "romaji": "Kinou wa samukunakatta desu."}, {"jp": "その本は難しくなかったです。", "en": "That book was not difficult.", "romaji": "Sono hon wa muzukashikunakatta desu."}]'::jsonb,
 '[{"mistake": "Using ではありませんでした", "explanation": "Use くなかった: 高くなかった not 高いではありませんでした"}]'::jsonb
);

-- Na-adjectives (な-adjectives)
INSERT INTO grammar_patterns (pattern, category, jlpt_level, formation_rules, examples, common_mistakes) VALUES
('な-adjectives: Present affirmative', 'Na-Adjectives', 'N5',
 '[{"step": 1, "rule": "Dictionary form"}, {"step": 2, "rule": "Add です (no な before です)"}]'::jsonb,
 '[{"jp": "彼女はきれいです。", "en": "She is pretty.", "romaji": "Kanojo wa kirei desu."}, {"jp": "これは便利です。", "en": "This is convenient.", "romaji": "Kore wa benri desu."}]'::jsonb,
 '[{"mistake": "Adding な before です", "explanation": "な is only used before nouns: きれいです (not きれいなです)"}]'::jsonb
),
('な-adjectives: Present negative', 'Na-Adjectives', 'N5',
 '[{"step": 1, "rule": "Dictionary form"}, {"step": 2, "rule": "Add ではありません or じゃありません"}]'::jsonb,
 '[{"jp": "ここは便利ではありません。", "en": "This place is not convenient.", "romaji": "Koko wa benri dewa arimasen."}, {"jp": "それは簡単じゃありません。", "en": "That is not simple.", "romaji": "Sore wa kantan ja arimasen."}]'::jsonb,
 '[{"mistake": "Using くない", "explanation": "な-adjectives use ではありません not くない: 便利ではありません not 便利くない"}]'::jsonb
),
('な-adjectives: Past affirmative', 'Na-Adjectives', 'N5',
 '[{"step": 1, "rule": "Dictionary form"}, {"step": 2, "rule": "Add でした"}]'::jsonb,
 '[{"jp": "昨日は暇でした。", "en": "Yesterday was free (I was free).", "romaji": "Kinou wa hima deshita."}, {"jp": "前の仕事は大変でした。", "en": "The previous job was tough.", "romaji": "Mae no shigoto wa taihen deshita."}]'::jsonb,
 '[]'::jsonb
),
('な-adjectives: Past negative', 'Na-Adjectives', 'N5',
 '[{"step": 1, "rule": "Dictionary form"}, {"step": 2, "rule": "Add ではありませんでした or じゃありませんでした"}]'::jsonb,
 '[{"jp": "昨日は暇ではありませんでした。", "en": "Yesterday was not free.", "romaji": "Kinou wa hima dewa arimasen deshita."}, {"jp": "それは簡単じゃありませんでした。", "en": "That was not simple.", "romaji": "Sore wa kantan ja arimasen deshita."}]'::jsonb,
 '[]'::jsonb
),
('な-adjectives: Before nouns', 'Na-Adjectives', 'N5',
 '[{"step": 1, "rule": "Dictionary form"}, {"step": 2, "rule": "Add な before the noun"}]'::jsonb,
 '[{"jp": "きれいな花", "en": "Pretty flower", "romaji": "Kirei na hana"}, {"jp": "便利な道具", "en": "Convenient tool", "romaji": "Benri na dougu"}, {"jp": "有名な人", "en": "Famous person", "romaji": "Yuumei na hito"}]'::jsonb,
 '[{"mistake": "Forgetting な before nouns", "explanation": "な-adjectives need な before nouns: きれいな花 not きれい花"}]'::jsonb
);

-- Get the IDs of newly inserted particle patterns and add exercises
-- The particle patterns should be IDs 9-18 (after the first 8 patterns)

-- Particle exercises (will reference pattern_ids 9-18)
-- We need to insert these separately since we don't know exact IDs
