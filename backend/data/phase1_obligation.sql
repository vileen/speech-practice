-- Phase 1: Obligation and Lack of Obligation Grammar Patterns
-- Generated for speech-practice Phase 1 expansion

-- =====================================================
-- OBLIGATION PATTERNS (11 patterns)
-- =====================================================

INSERT INTO grammar_patterns (pattern, category, jlpt_level, formation_rules, examples, common_mistakes) VALUES
('〜なければなりません', 'Obligation', 'N5',
 '{"formation": "Verb NAI-form + なければなりません", "meaning": "Must do ~, Have to do ~"}'::jsonb,
 '[{"japanese": "毎日勉強しなければなりません。", "romaji": "Mainichi benkyou shinakereba narimasen.", "meaning": "I must study every day."}, {"japanese": "明日までに終わらせなければなりません。", "romaji": "Ashita made ni owarasenakereba narimasen.", "meaning": "I must finish by tomorrow."}]'::jsonb,
 '[{"mistake": "Using positive form before なければ", "correction": "Must use negative (nai) stem", "explanation": "なければ comes from ない (negative)"}]'::jsonb
),
('〜なければいけません', 'Obligation', 'N5',
 '{"formation": "Verb NAI-form + なければいけません", "meaning": "Must do ~, Have to do ~ (slightly softer)"}'::jsonb,
 '[{"japanese": "早く起きなければいけません。", "romaji": "Hayaku okinakereba ikemasen.", "meaning": "I have to wake up early."}, {"japanese": "薬を飲まなければいけません。", "romaji": "Kusuri wo nomanakereba ikemasen.", "meaning": "I must take medicine."}]'::jsonb,
 '[{"mistake": "Confusing with なければなりません", "correction": "Both mean the same, いけません is softer", "explanation": "なりません is stronger obligation"}]'::jsonb
),
('〜なければだめです', 'Obligation', 'N5',
 '{"formation": "Verb NAI-form + なければだめです", "meaning": "Have to do ~ (casual)"}'::jsonb,
 '[{"japanese": "もっと練習しなければだめです。", "romaji": "Motto renshuu shinakereba dame desu.", "meaning": "I have to practice more."}, {"japanese": "早く行かなければだめだ！", "romaji": "Hayaku ikanakereba dame da!", "meaning": "I gotta go now! (casual)"}]'::jsonb,
 '[{"mistake": "Using in formal writing", "correction": "Use なければなりません for formal", "explanation": "だめ is casual"}]'::jsonb
),
('〜なければいけない', 'Obligation', 'N5',
 '{"formation": "Verb NAI-form + なければいけない", "meaning": "Must do ~ (plain form)"}'::jsonb,
 '[{"japanese": "何とかしなければいけない。", "romaji": "Nantoka shinakereba ikenai.", "meaning": "I have to do something about it."}, {"japanese": "本当のことを言わなければいけない。", "romaji": "Hontou no koto wo iwanakereba ikenai.", "meaning": "I have to tell the truth."}]'::jsonb,
 '[]'::jsonb
),
('〜なくてはなりません', 'Obligation', 'N4',
 '{"formation": "Verb NAI-form + なくてはなりません", "meaning": "Must do ~ (alternative form)"}'::jsonb,
 '[{"japanese": "今日中に終わらなくてはなりません。", "romaji": "Kyoujuu ni owaranakute wa narimasen.", "meaning": "I must finish today."}, {"japanese": "もっと日本語を勉強しなくてはなりません。", "romaji": "Motto nihongo wo benkyou shinakute wa narimasen.", "meaning": "I must study Japanese more."}]'::jsonb,
 '[{"mistake": "Using なくて form incorrectly", "correction": "なくては = なければ (both valid)", "explanation": "なくては is slightly more formal/written"}]'::jsonb
),
('〜なくてはいけません', 'Obligation', 'N4',
 '{"formation": "Verb NAI-form + なくてはいけません", "meaning": "Must do ~ (alternative/softer)"}'::jsonb,
 '[{"japanese": "明日までに提出しなくてはいけません。", "romaji": "Ashita made ni teishutsu shinakute wa ikemasen.", "meaning": "I must submit by tomorrow."}, {"japanese": "早く寝なくてはいけません。", "romaji": "Hayaku shinakute wa ikemasen.", "meaning": "I have to sleep early."}]'::jsonb,
 '[]'::jsonb
),
('〜ないとだめです', 'Obligation', 'N4',
 '{"formation": "Verb NAI-form + ないとだめです", "meaning": "Have to do ~ (casual/conversational)"}'::jsonb,
 '[{"japanese": "もう行かないとだめです。", "romaji": "Mou ikanai to dame desu.", "meaning": "I have to go now."}, {"japanese": "早くしないとだめだよ。", "romaji": "Hayaku shinai to dame da yo.", "meaning": "You gotta hurry up."}]'::jsonb,
 '[{"mistake": "Using in formal situations", "correction": "Use なければなりません for formal", "explanation": "ないと is conversational/casual"}]'::jsonb
),
('〜ないといけません', 'Obligation', 'N4',
 '{"formation": "Verb NAI-form + ないといけません", "meaning": "Must do ~ (conversational)"}'::jsonb,
 '[{"japanese": "そろそろ帰らないといけません。", "romaji": "Sorosoro kaeranai to ikemasen.", "meaning": "I should head home soon."}, {"japanese": "準備をしないといけませんね。", "romaji": "Junbi wo shinai to ikemasen ne.", "meaning": "We need to prepare, right?"}]'::jsonb,
 '[]'::jsonb
),
('〜ないといけない', 'Obligation', 'N4',
 '{"formation": "Verb NAI-form + ないといけない", "meaning": "Have to do ~ (plain/casual)"}'::jsonb,
 '[{"japanese": "もっとお金を稼がないといけない。", "romaji": "Motto okane wo kaseganai to ikenai.", "meaning": "I have to earn more money."}, {"japanese": "明日早いから早く寝ないといけない。", "romaji": "Ashita hayai kara hayaku nenai to ikenai.", "meaning": "Tomorrow is early so I have to sleep."}]'::jsonb,
 '[]'::jsonb
),
('〜なくちゃいけません', 'Obligation', 'N4',
 '{"formation": "Verb NAI-form + なくちゃいけません", "meaning": "Must do ~ (colloquial)"}'::jsonb,
 '[{"japanese": "もう行かなくちゃいけません。", "romaji": "Mou ikanakucha ikemasen.", "meaning": "I really have to go now."}, {"japanese": "勉強しなくちゃいけなかった。", "romaji": "Benkyou shinakucha ikemasen deshita.", "meaning": "I should have studied."}]'::jsonb,
 '[{"mistake": "Using なくちゃ in formal writing", "correction": "Use なければなりません for formal", "explanation": "なくちゃ is casual spoken Japanese"}]'::jsonb
),
('〜なくちゃだめ', 'Obligation', 'N4',
 '{"formation": "Verb NAI-form + なくちゃだめ", "meaning": "Gotta do ~ (very casual)"}'::jsonb,
 '[{"japanese": "早く行かなくちゃだめ。", "romaji": "Hayaku ikanakucha dame.", "meaning": "Gotta go fast."}, {"japanese": "宿題しなくちゃだめだよ。", "romaji": "Shukudai shinaiakucha dame da yo.", "meaning": "You gotta do homework."}]'::jsonb,
 '[{"mistake": "Using なくちゃだめ in business contexts", "correction": "Use なければなりません", "explanation": "Very casual, friends/family only"}]'::jsonb
);

-- =====================================================
-- LACK OF OBLIGATION PATTERNS (11 patterns)
-- =====================================================

INSERT INTO grammar_patterns (pattern, category, jlpt_level, formation_rules, examples, common_mistakes) VALUES
('〜なくてもいいです', 'Lack of Obligation', 'N5',
 '{"formation": "Verb NAI-form + くてもいいです", "meaning": "Don\'t have to do ~, Need not do ~"}'::jsonb,
 '[{"japanese": "明日は来なくてもいいです。", "romaji": "Ashita wa konakute mo ii desu.", "meaning": "You don\'t have to come tomorrow."}, {"japanese": "帽子をかぶらなくてもいいですか。", "romaji": "Boushi wo kaburanakute mo ii desu ka.", "meaning": "Do I have to wear a hat?"}]'::jsonb,
 '[{"mistake": "Using positive form", "correction": "Must use negative (nakute) + も", "explanation": "なくてもいい = not doing is okay"}]'::jsonb
),
('〜なくてもかまいません', 'Lack of Obligation', 'N5',
 '{"formation": "Verb NAI-form + くてもかまいません", "meaning": "Need not do ~, Don\'t have to do ~ (polite)"}'::jsonb,
 '[{"japanese": "心配しなくてもかまいません。", "romaji": "Shinpai shinakute mo kamaimasen.", "meaning": "You need not worry."}, {"japanese": "今日は仕事しなくてもかまいません。", "romaji": "Kyou wa shigoto shinakute mo kamaimasen.", "meaning": "You don\'t have to work today."}]'::jsonb,
 '[]'::jsonb
),
('〜なくても大丈夫です', 'Lack of Obligation', 'N4',
 '{"formation": "Verb NAI-form + くても大丈夫です", "meaning": "It is okay not to do ~"}'::jsonb,
 '[{"japanese": "急がなくても大丈夫です。", "romaji": "Isoganakute mo daijoubu desu.", "meaning": "It is okay not to rush."}, {"japanese": "全部食べなくても大丈夫ですよ。", "romaji": "Zenbu tabenakute mo daijoubu desu yo.", "meaning": "You don\'t have to eat everything."}]'::jsonb,
 '[]'::jsonb
),
('〜なくても問題ありません', 'Lack of Obligation', 'N3',
 '{"formation": "Verb NAI-form + くても問題ありません", "meaning": "There is no problem with not doing ~ (formal)"}'::jsonb,
 '[{"japanese": "明日までに返信しなくても問題ありません。", "romaji": "Ashita made ni henshin shinakute mo mondai arimasen.", "meaning": "There is no problem not replying by tomorrow."}, {"japanese": "参加しなくても問題ありませんか。", "romaji": "Sanka shinakute mo mondai arimasen ka.", "meaning": "Is it okay if I don\'t participate?"}]'::jsonb,
 '[{"mistake": "Using in casual situations", "correction": "Use いいです for casual", "explanation": "問題ありません is formal"}]'::jsonb
),
('〜なくても構いません', 'Lack of Obligation', 'N4',
 '{"formation": "Verb NAI-form + くても構いません", "meaning": "It is acceptable not to do ~ (formal)"}'::jsonb,
 '[{"japanese": "今日は来なくても構いません。", "romaji": "Kyou wa konakute mo kamaimasen.", "meaning": "It is acceptable not to come today."}, {"japanese": "準備しなくても構いませんか。", "romaji": "Junbi shinakute mo kamaimasen ka.", "meaning": "Is it alright if I don\'t prepare?"}]'::jsonb,
 '[]'::jsonb
),
('〜なくてもよろしいですか', 'Lack of Obligation', 'N4',
 '{"formation": "Verb NAI-form + くてもよろしいですか", "meaning": "Would it be acceptable not to do ~? (polite)"}'::jsonb,
 '[{"japanese": "明日は来なくてもよろしいですか。", "romaji": "Ashita wa konakute mo yoroshii desu ka.", "meaning": "Would it be acceptable not to come tomorrow?"}, {"japanese": "お土産を持たなくてもよろしいですか。", "romaji": "Omiyage wo motanakute mo yoroshii desu ka.", "meaning": "Is it okay not to bring a gift?"}]'::jsonb,
 '[{"mistake": "Using いい instead of よろしい", "correction": "よろしい is more polite than いい", "explanation": "Use よろしい in polite questions"}]'::jsonb
),
('〜なくても差し支えありません', 'Lack of Obligation', 'N2',
 '{"formation": "Verb NAI-form + くても差し支えありません", "meaning": "There is no objection to not doing ~ (very formal)"}'::jsonb,
 '[{"japanese": "書類を今日提出しなくても差し支えありません。", "romaji": "Shorui wo kyou teishutsu shinakute mo sashitsukae arimasen.", "meaning": "There is no objection to not submitting documents today."}]'::jsonb,
 '[{"mistake": "Using in casual conversation", "correction": "Very formal written language only", "explanation": "差し支え is business formal"}]'::jsonb
),
('〜ないでもいいです', 'Lack of Obligation', 'N5',
 '{"formation": "Verb NAI-form + ないでもいいです", "meaning": "Don\'t have to do ~ (alternative form)"}'::jsonb,
 '[{"japanese": "漢字を書かないでもいいです。", "romaji": "Kanji wo kakanaide mo ii desu.", "meaning": "You don\'t have to write kanji."}, {"japanese": "明日は来ないでもいいです。", "romaji": "Ashita wa konaide mo ii desu.", "meaning": "You don\'t have to come tomorrow."}]'::jsonb,
 '[{"mistake": "Confusing with ないで (negative request)", "correction": "ないで+も vs ないでください", "explanation": "ないでもいい = lack of obligation"}]'::jsonb
),
('〜なくても結構です', 'Lack of Obligation', 'N3',
 '{"formation": "Verb NAI-form + くても結構です", "meaning": "It is fine not to do ~ (polite refusal)"}'::jsonb,
 '[{"japanese": "お茶は入れなくても結構です。", "romaji": "Ocha wa irenakute mo kekkou desu.", "meaning": "It is fine, you need not make tea."}, {"japanese": "遠慮しなくても結構ですよ。", "romaji": "Enryo shinakute mo kekkou desu yo.", "meaning": "Please don\'t hold back."}]'::jsonb,
 '[{"mistake": "Using 結構 to mean obligation", "correction": "結構です = fine/unnecessary", "explanation": "Often used to politely decline"}]'::jsonb
),
('〜なくちゃいけない → 〜なくちゃいけないんじゃない', 'Lack of Obligation', 'N4',
 '{"formation": "Double negative casual", "meaning": "I guess I don\'t have to ~ (hesitant)"}'::jsonb,
 '[{"japanese": "そんなに急がなくちゃいけないんじゃない？", "romaji": "Sonna ni isoganakucha ikenain ja nai?", "meaning": "Maybe you don\'t have to rush that much?"}]'::jsonb,
 '[]'::jsonb
),
('〜しなくてもいい', 'Lack of Obligation', 'N5',
 '{"formation": "する verb NAI-form + くてもいい", "meaning": "Don\'t have to do ~ (casual/plain)"}'::jsonb,
 '[{"japanese": "心配しなくてもいい。", "romaji": "Shinpai shinakute mo ii.", "meaning": "You don\'t have to worry."}, {"japanese": "何もしなくてもいい。", "romaji": "Nani mo shinakute mo ii.", "meaning": "You don\'t have to do anything."}]'::jsonb,
 '[]'::jsonb
);

-- Note: Add exercises after pattern insertion using:
-- INSERT INTO grammar_exercises (pattern_id, type, question, options, correct_answer, explanation)
-- SELECT id, 'recognition', ... FROM grammar_patterns WHERE pattern = '...';
