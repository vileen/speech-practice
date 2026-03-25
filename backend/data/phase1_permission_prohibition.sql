-- Phase 1: Permission and Prohibition Grammar Patterns
-- Generated for speech-practice Phase 1 expansion

-- =====================================================
-- PERMISSION PATTERNS (11 patterns)
-- =====================================================

INSERT INTO grammar_patterns (pattern, category, jlpt_level, formation_rules, examples, common_mistakes) VALUES
('〜てもいいです', 'Permission', 'N5', 
 '{"formation": "Verb TE-form + もいいです", "meaning": "May do ~, It is okay to do ~"}'::jsonb,
 '[{"japanese": "写真を撮ってもいいですか。", "romaji": "Shashin wo totte mo ii desu ka.", "meaning": "May I take a photo?"}, {"japanese": "ここで食べてもいいです。", "romaji": "Koko de tabete mo ii desu.", "meaning": "You may eat here."}]'::jsonb,
 '[{"mistake": "〜ていいです (missing も)", "correction": "〜てもいいです", "explanation": "The particle も is required for permission"}]'::jsonb
),
('〜てもかまいません', 'Permission', 'N5',
 '{"formation": "Verb TE-form + もかまいません", "meaning": "May do ~, It is alright to do ~ (polite)"}'::jsonb,
 '[{"japanese": "少し待ってもかまいませんか。", "romaji": "Sukoshi matte mo kamaimasen ka.", "meaning": "May I wait a little?"}, {"japanese": "明日来なくてもかまいません。", "romaji": "Ashita konakute mo kamaimasen.", "meaning": "You need not come tomorrow."}]'::jsonb,
 '[{"mistake": "Using かまいません for prohibition", "correction": "Use かまいません only for permission/lack of obligation", "explanation": "かまいません means it causes no problem"}]'::jsonb
),
('〜ても大丈夫です', 'Permission', 'N4',
 '{"formation": "Verb TE-form + も大丈夫です", "meaning": "It is okay to do ~, Doing ~ is fine"}'::jsonb,
 '[{"japanese": "この水を飲んでも大丈夫ですか。", "romaji": "Kono mizu wo nonde mo daijoubu desu ka.", "meaning": "Is it okay to drink this water?"}, {"japanese": "座っても大丈夫です。", "romaji": "Suwatte mo daijoubu desu.", "meaning": "It is okay to sit."}]'::jsonb,
 '[{"mistake": "Using with negative intention", "correction": "大丈夫 is for permission/confirmation only", "explanation": "This pattern asks if something is safe/acceptable"}]'::jsonb
),
('〜ても構いません', 'Permission', 'N4',
 '{"formation": "Verb TE-form + も構いません", "meaning": "May do ~, It is acceptable to do ~ (formal)"}'::jsonb,
 '[{"japanese": "質問しても構いませんか。", "romaji": "Shitsumon shite mo kamaimasen ka.", "meaning": "May I ask a question? (formal)"}, {"japanese": "お使いになっても構いません。", "romaji": "Otsukai ni natte mo kamaimasen.", "meaning": "Please feel free to use it. (honorific)"}]'::jsonb,
 '[{"mistake": "Using 構う in casual speech", "correction": "Use かまいません for formal, いいです for casual", "explanation": "構う/かまう is more formal/literary"}]'::jsonb
),
('〜ないでください → 〜てもいいです', 'Permission', 'N5',
 '{"formation": "Negative request form contrast", "meaning": "Instead of saying don't do ~, you may do ~"}'::jsonb,
 '[{"japanese": "A: 触らないでください。B: じゃあ、見てもいいですか。", "romaji": "A: Sawaranaide kudasai. B: Jaa, mite mo ii desu ka.", "meaning": "A: Please don\'t touch. B: Then, may I look?"}]'::jsonb,
 '[]'::jsonb
),
('〜ても問題ありません', 'Permission', 'N3',
 '{"formation": "Verb TE-form + も問題ありません", "meaning": "There is no problem with doing ~ (business formal)"}'::jsonb,
 '[{"japanese": "後日送っても問題ありません。", "romaji": "Gojitsu okutte mo mondai arimasen.", "meaning": "There is no problem sending it later."}, {"japanese": "キャンセルしても問題ありませんか。", "romaji": "Kyanseru shite mo mondai arimasen ka.", "meaning": "Is there any problem with canceling?"}]'::jsonb,
 '[{"mistake": "Using in casual conversation", "correction": "Use 大丈夫です or いいです for casual", "explanation": "問題ありません is business formal"}]'::jsonb
),
('〜てもよろしいでしょうか', 'Permission', 'N4',
 '{"formation": "Verb TE-form + もよろしいでしょうか", "meaning": "Would it be acceptable if I do ~? (very polite)"}'::jsonb,
 '[{"japanese": "お茶を入れてもよろしいでしょうか。", "romaji": "Ocha wo irete mo yoroshii deshou ka.", "meaning": "Would it be acceptable if I made tea?"}, {"japanese": "お名前を伺ってもよろしいでしょうか。", "romaji": "Onamae wo ukagatte mo yoroshii deshou ka.", "meaning": "Might I ask your name? (very polite)"}]'::jsonb,
 '[{"mistake": "Using いいでしょうか instead", "correction": "よろしい is more polite than いい", "explanation": "よろしい is the honorific form of いい"}]'::jsonb
),
('〜ても差し支えありません', 'Permission', 'N2',
 '{"formation": "Verb TE-form + も差し支えありません", "meaning": "There is no objection to doing ~ (very formal/written)"}'::jsonb,
 '[{"japanese": "事前に確認しても差し支えありません。", "romaji": "Jizen ni kakunin shite mo sashitsukae arimasen.", "meaning": "There is no objection to checking in advance."}]'::jsonb,
 '[{"mistake": "Using in spoken conversation", "correction": "Use for business documents/formal writing only", "explanation": "差し支え is formal written Japanese"}]'::jsonb
),
('〜なくてもかまいません', 'Permission', 'N5',
 '{"formation": "Verb NAI-form + くてもかまいません", "meaning": "Need not do ~, Don\'t have to do ~"}'::jsonb,
 '[{"japanese": "明日は早く来なくてもかまいません。", "romaji": "Ashita wa hayaku konakute mo kamaimasen.", "meaning": "You need not come early tomorrow."}, {"japanese": "全てを覚えなくてもかまいません。", "romaji": "Subete wo oboenakute mo kamaimasen.", "meaning": "You don\'t have to remember everything."}]'::jsonb,
 '[{"mistake": "Confusing with obligation forms", "correction": "なくてもかまいません = lack of obligation", "explanation": "This is the opposite of なければなりません"}]'::jsonb
),
('〜なくてもいいです', 'Permission', 'N5',
 '{"formation": "Verb NAI-form + くてもいいです", "meaning": "Don\'t have to do ~, Need not do ~ (casual)"}'::jsonb,
 '[{"japanese": "漢字を書かなくてもいいです。", "romaji": "Kanji wo kakanakute mo ii desu.", "meaning": "You don\'t have to write kanji."}, {"japanese": "帽子をかぶらなくてもいいですか。", "romaji": "Boushi wo kaburanakute mo ii desu ka.", "meaning": "Do I have to wear a hat? (don\'t have to)"}]'::jsonb,
 '[{"mistake": "Using positive form", "correction": "Must use negative (nakute) form before も", "explanation": "なくてもいい = not doing is okay"}]'::jsonb
),
('〜なくても大丈夫です', 'Permission', 'N4',
 '{"formation": "Verb NAI-form + くても大丈夫です", "meaning": "It is okay not to do ~"}'::jsonb,
 '[{"japanese": "急がなくても大丈夫です。", "romaji": "Isoganakute mo daijoubu desu.", "meaning": "It is okay not to rush."}, {"japanese": "全部食べなくても大丈夫ですよ。", "romaji": "Zenbu tabenakute mo daijoubu desu yo.", "meaning": "It is okay not to eat everything."}]'::jsonb,
 '[]'::jsonb
);

-- =====================================================
-- PROHIBITION PATTERNS (11 patterns)
-- =====================================================

INSERT INTO grammar_patterns (pattern, category, jlpt_level, formation_rules, examples, common_mistakes) VALUES
('〜てはいけません', 'Prohibition', 'N5',
 '{"formation": "Verb TE-form + はいけません", "meaning": "Must not do ~, May not do ~"}'::jsonb,
 '[{"japanese": "ここで写真を撮ってはいけません。", "romaji": "Koko de shashin wo totte wa ikemasen.", "meaning": "You must not take photos here."}, {"japanese": "駄目！触ってはいけません。", "romaji": "Dame! Sawatte wa ikemasen.", "meaning": "No! You must not touch."}]'::jsonb,
 '[{"mistake": "〜てはいきません (wrong verb)", "correction": "〜てはいけません", "explanation": "いける (to be acceptable), not いく (to go)"}]'::jsonb
),
('〜てはだめです', 'Prohibition', 'N5',
 '{"formation": "Verb TE-form + はだめです", "meaning": "Must not do ~, No ~ing (casual)"}'::jsonb,
 '[{"japanese": "遅くまで遊んでてはだめです。", "romaji": "Osoku made asondete wa dame desu.", "meaning": "You must not play until late."}, {"japanese": "嘘をついてはだめだよ。", "romaji": "Uso wo tsuite wa dame da yo.", "meaning": "You must not lie. (casual)"}]'::jsonb,
 '[{"mistake": "Using in formal situations", "correction": "Use いけません for formal", "explanation": "だめ is casual/friendly"}]'::jsonb
),
('〜てはいけない', 'Prohibition', 'N5',
 '{"formation": "Verb TE-form + はいけない", "meaning": "Must not do ~ (plain/casual)"}'::jsonb,
 '[{"japanese": "入ってはいけない！", "romaji": "Haitte wa ikenai!", "meaning": "Do not enter!"}, {"japanese": "約束を破ってはいけない。", "romaji": "Yakusoku wo yabutte wa ikenai.", "meaning": "You must not break promises."}]'::jsonb,
 '[]'::jsonb
),
('〜てはなりません', 'Prohibition', 'N4',
 '{"formation": "Verb TE-form + はなりません", "meaning": "Must not do ~ (formal)"}'::jsonb,
 '[{"japanese": "このドアを開けてはなりません。", "romaji": "Kono doa wo akete wa narimasen.", "meaning": "You must not open this door."}, {"japanese": "駐車してはなりません。", "romaji": "Chuusha shite wa narimasen.", "meaning": "Parking prohibited."}]'::jsonb,
 '[{"mistake": "Confusing with obligation pattern", "correction": "〜てはなりません = prohibition, not obligation", "explanation": "Compare: しなければなりません (must do)"}]'::jsonb
),
('〜てはならない', 'Prohibition', 'N3',
 '{"formation": "Verb TE-form + はならない", "meaning": "Must not do ~ (written/formal)"}'::jsonb,
 '[{"japanese": "個人情報を漏らしてはならない。", "romaji": "Kojin jouhou wo morashite wa naranai.", "meaning": "Personal information must not be leaked."}, {"japanese": "安全基準を無視してはならない。", "romaji": "Anzen kijun wo mushi shite wa naranai.", "meaning": "Safety standards must not be ignored."}]'::jsonb,
 '[]'::jsonb
),
('〜禁止', 'Prohibition', 'N3',
 '{"formation": "Noun + 禁止", "meaning": "~ prohibited, ~ forbidden (signs)"}'::jsonb,
 '[{"japanese": "立入禁止", "romaji": "Tachiiri kinshi", "meaning": "No entry"}, {"japanese": "駐車禁止", "romaji": "Chuusha kinshi", "meaning": "No parking"}, {"japanese": "喫煙禁止", "romaji": "Kitsuen kinshi", "meaning": "No smoking"}]'::jsonb,
 '[{"mistake": "Using in conversation", "correction": "禁止 is for signs/written notices", "explanation": "Use てはいけません when speaking"}]'::jsonb
),
('〜厳禁', 'Prohibition', 'N2',
 '{"formation": "Noun + 厳禁", "meaning": "~ strictly forbidden"}'::jsonb,
 '[{"japanese": "火気厳禁", "romaji": "Kaki genkin", "meaning": "Strictly no open flames"}, {"japanese": "持ち込み厳禁", "romaji": "Mochikomi genkin", "meaning": "Bringing in strictly prohibited"}]'::jsonb,
 '[{"mistake": "Using casually", "correction": "厳禁 is for serious warnings only", "explanation": "厳禁 implies severe consequences"}]'::jsonb
),
('〜ないでください', 'Prohibition', 'N5',
 '{"formation": "Verb NAI-form + でください", "meaning": "Please don\'t do ~ (request)"}'::jsonb,
 '[{"japanese": "タバコを吸わないでください。", "romaji": "Tabako wo suwanaide kudasai.", "meaning": "Please don\'t smoke."}, {"japanese": "ここを触らないでください。", "romaji": "Koko wo sawaranaide kudasai.", "meaning": "Please don\'t touch here."}]'::jsonb,
 '[{"mistake": "Using for rules/laws", "correction": "Use てはいけません for rules", "explanation": "ないでください is a request, not a rule"}]'::jsonb
),
('〜ないでくれ', 'Prohibition', 'N4',
 '{"formation": "Verb NAI-form + でくれ", "meaning": "Don\'t do ~ for me (casual/masculine)"}'::jsonb,
 '[{"japanese": "心配しないでくれ。", "romaji": "Shinpai shinaide kure.", "meaning": "Don\'t worry about me."}, {"japanese": "勝手に決めないでくれよ。", "romaji": "Katte ni kimenaide kure yo.", "meaning": "Don\'t decide on your own."}]'::jsonb,
 '[{"mistake": "Using くれ in polite situations", "correction": "Use ください for polite", "explanation": "くれ is casual/commanding"}]'::jsonb
),
('〜ないでほしい', 'Prohibition', 'N4',
 '{"formation": "Verb NAI-form + でほしい", "meaning": "I want you to not do ~"}'::jsonb,
 '[{"japanese": "私を忘れないでほしい。", "romaji": "Watashi wo wasurenaide hoshii.", "meaning": "I want you to not forget me."}, {"japanese": "嘘をつかないでほしい。", "romaji": "Uso wo tsukanaide hoshii.", "meaning": "I want you to not lie."}]'::jsonb,
 '[]'::jsonb
),
('〜無用', 'Prohibition', 'N3',
 '{"formation": "Noun + 無用", "meaning": "No ~ needed/forbidden (formal signs)"}'::jsonb,
 '[{"japanese": "入場無料（≠無用）", "romaji": "Nyuujou muryou", "meaning": "Admission free"}, {"japanese": "お断り（断り無用の意）", "romaji": "Okotowari", "meaning": "Not accepted"}]'::jsonb,
 '[{"mistake": "Confusing 無用 with 無料", "correction": "無用 = unnecessary/forbidden, 無料 = free of charge", "explanation": "Different meanings despite similar look"}]'::jsonb
);

-- Create exercises for Permission and Prohibition patterns
-- Exercises will be inserted based on pattern IDs

-- Note: After inserting patterns above, run this to add exercises:
-- INSERT INTO grammar_exercises (pattern_id, type, question, options, correct_answer, explanation)
-- SELECT id, 'recognition', 'Which sentence means "May I take a photo?"', 
--        '["写真を撮ってはいけません", "写真を撮ってもいいですか", "写真を撮ります"]'::jsonb,
--        '写真を撮ってもいいですか', 'てもいいですか asks for permission'
-- FROM grammar_patterns WHERE pattern = '〜てもいいです';
