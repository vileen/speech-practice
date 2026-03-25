-- Phase 1: TE-form Patterns
-- 15 patterns covering Godan, Ichidan, and Irregular verb conjugations
-- JLPT Levels: N5-N4

-- ============================================
-- GODAN VERB TE-FORMS (Group 1)
-- ============================================

-- Pattern 1: う→って (u-verbs ending in う)
INSERT INTO grammar_patterns (pattern, category, jlpt_level, formation_rules, examples) VALUES
('う→って', 'TE-form', 'N5', 
'Verbs ending in う (う-sound): Drop う and add って\nExample: 会う (あう) → 会って (あって)', 
'["会う → 会って", "買う → 買って", "待つ → 待って (exception)", "歌う → 歌って"]');

-- Pattern 2: く→いて (ku-verbs)
INSERT INTO grammar_patterns (pattern, category, jlpt_level, formation_rules, examples) VALUES
('く→いて', 'TE-form', 'N5', 
'Verbs ending in く: Drop く and add いて\nException: 行く → 行って\nExample: 書く (かく) → 書いて (かいて)', 
'["書く → 書いて", "聞く → 聞いて", "行く → 行って (exception)", "働く → 働いて"]');

-- Pattern 3: ぐ→いで (gu-verbs)
INSERT INTO grammar_patterns (pattern, category, jlpt_level, formation_rules, examples) VALUES
('ぐ→いで', 'TE-form', 'N5', 
'Verbs ending in ぐ: Drop ぐ and add いで\nExample: 泳ぐ (およぐ) → 泳いで (およいで)', 
'["泳ぐ → 泳いで", "急ぐ → 急いで", "稼ぐ → 稼いで", "脱ぐ → 脱いで"]');

-- Pattern 4: す→して (su-verbs)
INSERT INTO grammar_patterns (pattern, category, jlpt_level, formation_rules, examples) VALUES
('す→して', 'TE-form', 'N5', 
'Verbs ending in す: Drop す and add して\nExample: 話す (はなす) → 話して (はなして)', 
'["話す → 話して", "貸す → 貸して", "返す → 返して", "直す → 直して"]');

-- Pattern 5: つ→って (tsu-verbs)
INSERT INTO grammar_patterns (pattern, category, jlpt_level, formation_rules, examples) VALUES
('つ→って', 'TE-form', 'N5', 
'Verbs ending in つ: Drop つ and add って\nExample: 待つ (まつ) → 待って (まって)', 
'["待つ → 待って", "立つ → 立って", "打つ → 打って", "持つ → 持って"]');

-- Pattern 6: ぬ→んで (nu-verbs)
INSERT INTO grammar_patterns (pattern, category, jlpt_level, formation_rules, examples) VALUES
('ぬ→んで', 'TE-form', 'N5', 
'Verbs ending in ぬ: Drop ぬ and add んで\nExample: 死ぬ (しぬ) → 死んで (しんで)', 
'["死ぬ → 死んで", "死ぬ → 死んで", "死ぬ → 死んで", "死ぬ → 死んで"]');

-- Pattern 7: ぶ→んで (bu-verbs)
INSERT INTO grammar_patterns (pattern, category, jlpt_level, formation_rules, examples) VALUES
('ぶ→んで', 'TE-form', 'N5', 
'Verbs ending in ぶ: Drop ぶ and add んで\nExample: 遊ぶ (あそぶ) → 遊んで (あそんで)', 
'["遊ぶ → 遊んで", "呼ぶ → 呼んで", "学ぶ → 学んで", "選ぶ → 選んで"]');

-- Pattern 8: む→んで (mu-verbs)
INSERT INTO grammar_patterns (pattern, category, jlpt_level, formation_rules, examples) VALUES
('む→んで', 'TE-form', 'N5', 
'Verbs ending in む: Drop む and add んで\nExample: 読む (よむ) → 読んで (よんで)', 
'["読む → 読んで", "飲む → 飲んで", "住む → 住んで", "楽しむ → 楽しんで"]');

-- Pattern 9: る→って (ru-verbs - Godan)
INSERT INTO grammar_patterns (pattern, category, jlpt_level, formation_rules, examples) VALUES
('る→って (五段)', 'TE-form', 'N5', 
'Godan verbs ending in る: Drop る and add って\nDistinguish from Ichidan: If る has a,i,u,o before it (あ,い,う,お段), it is Godan\nExample: 帰る (かえる) → 帰って (かえって)', 
'["帰る → 帰って", "知る → 知って", "走る → 走って", "入る → 入って"]');

-- ============================================
-- ICHIDAN VERB TE-FORMS (Group 2)
-- ============================================

-- Pattern 10: る→て (Ichidan verbs)
INSERT INTO grammar_patterns (pattern, category, jlpt_level, formation_rules, examples) VALUES
('る→て (一段)', 'TE-form', 'N5', 
'Ichidan (ru-) verbs: Drop る and add て\nIdentify: る with e or i sound before it (え,い段)\nExample: 食べる (たべる) → 食べて (たべて)', 
'["食べる → 食べて", "見る → 見て", "起きる → 起きて", "寝る → 寝て", "借りる → 借りて"]');

-- ============================================
-- IRREGULAR VERB TE-FORMS (Group 3)
-- ============================================

-- Pattern 11: する→して
INSERT INTO grammar_patterns (pattern, category, jlpt_level, formation_rules, examples) VALUES
('する→して', 'TE-form', 'N5', 
'Irregular verb する: Changes to して\nApplies to all する compounds\nExample: 勉強する (べんきょうする) → 勉強して (べんきょうして)', 
'["する → して", "勉強する → 勉強して", "運動する → 運動して", "結婚する → 結婚して", "説明する → 説明して"]');

-- Pattern 12: くる→きて
INSERT INTO grammar_patterns (pattern, category, jlpt_level, formation_rules, examples) VALUES
('くる→きて', 'TE-form', 'N5', 
'Irregular verb 来る (くる): Changes to 来て (きて)\nThis is completely irregular and must be memorized', 
'["来る → 来て", "来る → 来て", "来る → 来て", "来る → 来て"]');

-- ============================================
-- TE-FORM USAGE PATTERNS
-- ============================================

-- Pattern 13: ている (ongoing action)
INSERT INTO grammar_patterns (pattern, category, jlpt_level, formation_rules, examples) VALUES
('ている (進行形)', 'TE-form', 'N5', 
'TE-form + いる: Indicates ongoing action or current state\nExample: 食べている = eating (now), 持っている = possess', 
'["食べている = is eating", "寝ている = is sleeping", "勉強している = is studying", "持っている = have/possess"]');

-- Pattern 14: てください (request)
INSERT INTO grammar_patterns (pattern, category, jlpt_level, formation_rules, examples) VALUES
('てください', 'TE-form', 'N5', 
'TE-form + ください: Polite request\nExample: 見てください = Please look/see', 
'["見てください = Please look", "聞いてください = Please listen", "待ってください = Please wait", "教えてください = Please tell me"]');

-- Pattern 15: てもいいです (permission)
INSERT INTO grammar_patterns (pattern, category, jlpt_level, formation_rules, examples) VALUES
('てもいいです', 'TE-form', 'N5', 
'TE-form + も + いいです: Asking for/giving permission\nExample: 入ってもいいです = May I enter? / You may enter', 
'["入ってもいいですか = May I enter?", "写真を撮ってもいいです = You may take photos", "食べてもいいですよ = You can eat it", "使ってもいいです = You may use it"]');

-- ============================================
-- EXERCISES FOR TE-FORM PATTERNS
-- ============================================

-- Exercises for う→って
INSERT INTO grammar_exercises (pattern_id, type, question, options, correct_answer, explanation) VALUES
((SELECT id FROM grammar_patterns WHERE pattern = 'う→って'), 'recognition', 'What is the TE-form of 会う (to meet)?', '["あいて", "あって", "あうて", "あんで"]', 'あって', 'う-verbs change to って. 会う → 会って (あって)'),
((SELECT id FROM grammar_patterns WHERE pattern = 'う→って'), 'construction', 'Convert to TE-form: 買う (かう)', '["かいて", "かって", "かうて", "かんで"]', 'かって', 'う-verbs drop う and add って. 買う → 買って'),
((SELECT id FROM grammar_patterns WHERE pattern = 'う→って'), 'transformation', 'Change to TE-form: 歌う (to sing)', '["うたいて", "うたって", "うたうて", "うたんで"]', 'うたって', 'う-verbs conjugate to って. 歌う → 歌って'),
((SELECT id FROM grammar_patterns WHERE pattern = 'う→って'), 'recognition', 'Which verb uses the う→って pattern?', '["書く", "泳ぐ", "会う", "読む"]', '会う', '会う ends in う, so it follows the う→って pattern. The others follow different patterns.');

-- Exercises for く→いて
INSERT INTO grammar_exercises (pattern_id, type, question, options, correct_answer, explanation) VALUES
((SELECT id FROM grammar_patterns WHERE pattern = 'く→いて'), 'recognition', 'What is the TE-form of 書く (to write)?', '["かいて", "かって", "かくて", "かんで"]', 'かいて', 'く-verbs change to いて. 書く → 書いて (かいて)'),
((SELECT id FROM grammar_patterns WHERE pattern = 'く→いて'), 'construction', 'Convert to TE-form: 聞く (to listen)', '["きいて", "きって", "きくて", "きんで"]', 'きいて', 'く-verbs drop く and add いて. 聞く → 聞いて'),
((SELECT id FROM grammar_patterns WHERE pattern = 'く→いて'), 'recognition', 'What is the exception to the く→いて rule?', '["書く", "聞く", "行く", "働く"]', '行く', '行く (to go) is the exception: 行く → 行って (not 行いて)'),
((SELECT id FROM grammar_patterns WHERE pattern = 'く→いて'), 'transformation', 'Change to TE-form: 働く (to work)', '["はたらいて", "はたらって", "はたらくて", "はたらんで"]', 'はたらいて', 'く-verbs conjugate to いて. 働く → 働いて');

-- Exercises for ぐ→いで
INSERT INTO grammar_exercises (pattern_id, type, question, options, correct_answer, explanation) VALUES
((SELECT id FROM grammar_patterns WHERE pattern = 'ぐ→いで'), 'recognition', 'What is the TE-form of 泳ぐ (to swim)?', '["およいで", "およいて", "およぐで", "およんで"]', 'およいで', 'ぐ-verbs change to いで. 泳ぐ → 泳いで (およいで)'),
((SELECT id FROM grammar_patterns WHERE pattern = 'ぐ→いで'), 'construction', 'Convert to TE-form: 急ぐ (to hurry)', '["いそいで", "いそいて", "いそぐで", "いそんで"]', 'いそいで', 'ぐ-verbs drop ぐ and add いで. 急ぐ → 急いで'),
((SELECT id FROM grammar_patterns WHERE pattern = 'ぐ→いで'), 'recognition', 'Which verb type uses いで ending?', '["Verbs ending in く", "Verbs ending in す", "Verbs ending in ぐ", "Verbs ending in む"]', 'Verbs ending in ぐ', 'ぐ-verbs conjugate to いで. く-verbs use いて, す-verbs use して, む-verbs use んで'),
((SELECT id FROM grammar_patterns WHERE pattern = 'ぐ→いで'), 'transformation', 'Change to TE-form: 脱ぐ (to take off)', '["ぬいで", "ぬいて", "ぬぐで", "ぬんで"]', 'ぬいで', 'ぐ-verbs conjugate to いで. 脱ぐ → 脱いで');

-- Exercises for す→して
INSERT INTO grammar_exercises (pattern_id, type, question, options, correct_answer, explanation) VALUES
((SELECT id FROM grammar_patterns WHERE pattern = 'す→して'), 'recognition', 'What is the TE-form of 話す (to speak)?', '["はなして", "はないて", "はなすて", "はなんで"]', 'はなして', 'す-verbs change to して. 話す → 話して (はなして)'),
((SELECT id FROM grammar_patterns WHERE pattern = 'す→して'), 'construction', 'Convert to TE-form: 返す (to return)', '["かえして", "かえいて", "かえすて", "かえんで"]', 'かえして', 'す-verbs drop す and add して. 返す → 返して'),
((SELECT id FROM grammar_patterns WHERE pattern = 'す→して'), 'recognition', 'All verbs ending in す conjugate to:', '["して", "いて", "んで", "って"]', 'して', 'す-verbs always change to して. Example: 話す → 話して'),
((SELECT id FROM grammar_patterns WHERE pattern = 'す→して'), 'transformation', 'Change to TE-form: 貸す (to lend)', '["かして", "かいて", "かすて", "かんで"]', 'かして', 'す-verbs conjugate to して. 貸す → 貸して');

-- Exercises for つ→って
INSERT INTO grammar_exercises (pattern_id, type, question, options, correct_answer, explanation) VALUES
((SELECT id FROM grammar_patterns WHERE pattern = 'つ→って'), 'recognition', 'What is the TE-form of 待つ (to wait)?', '["まいて", "まって", "まつて", "まんで"]', 'まって', 'つ-verbs change to って. 待つ → 待って (まって)'),
((SELECT id FROM grammar_patterns WHERE pattern = 'つ→って'), 'construction', 'Convert to TE-form: 立つ (to stand)', '["たいて", "たって", "たつて", "たんで"]', 'たって', 'つ-verbs drop つ and add って. 立つ → 立って'),
((SELECT id FROM grammar_patterns WHERE pattern = 'つ→って'), 'recognition', 'Both う and つ verbs conjugate to:', '["いて", "して", "んで", "って"]', 'って', 'う-verbs and つ-verbs both conjugate to って. Example: 会う→会って, 待つ→待って'),
((SELECT id FROM grammar_patterns WHERE pattern = 'つ→って'), 'transformation', 'Change to TE-form: 持つ (to hold)', '["もいて", "もって", "もつて", "もんで"]', 'もって', 'つ-verbs conjugate to って. 持つ → 持って');

-- Exercises for ぬ→んで
INSERT INTO grammar_exercises (pattern_id, type, question, options, correct_answer, explanation) VALUES
((SELECT id FROM grammar_patterns WHERE pattern = 'ぬ→んで'), 'recognition', 'What is the TE-form of 死ぬ (to die)?', '["しにて", "しんで", "しぬで", "しむで"]', 'しんで', 'ぬ-verbs change to んで. 死ぬ → 死んで (しんで)'),
((SELECT id FROM grammar_patterns WHERE pattern = 'ぬ→んで'), 'construction', 'Convert to TE-form: 死ぬ', '["しにて", "しんで", "しぬで", "しゅんで"]', 'しんで', 'ぬ-verbs drop ぬ and add んで. 死ぬ → 死んで'),
((SELECT id FROM grammar_patterns WHERE pattern = 'ぬ→んで'), 'recognition', 'The verb 死ぬ conjugates to:', '["しにて", "しんで", "しぬで", "しむで"]', 'しんで', '死ぬ is one of the few verbs ending in ぬ. It conjugates to 死んで'),
((SELECT id FROM grammar_patterns WHERE pattern = 'ぬ→んで'), 'recognition', 'ぬ-verbs conjugate like which other verb groups?', '["す-verbs and く-verbs", "む-verbs and ぶ-verbs", "る-verbs (Godan)", "う-verbs and つ-verbs"]', 'む-verbs and ぶ-verbs', 'ぬ, む, and ぶ-verbs all conjugate to んで');

-- Exercises for ぶ→んで
INSERT INTO grammar_exercises (pattern_id, type, question, options, correct_answer, explanation) VALUES
((SELECT id FROM grammar_patterns WHERE pattern = 'ぶ→んで'), 'recognition', 'What is the TE-form of 遊ぶ (to play)?', '["あそいて", "あそって", "あそんで", "あそぶて"]', 'あそんで', 'ぶ-verbs change to んで. 遊ぶ → 遊んで (あそんで)'),
((SELECT id FROM grammar_patterns WHERE pattern = 'ぶ→んで'), 'construction', 'Convert to TE-form: 呼ぶ (to call)', '["よいて", "よって", "よんで", "よぶて"]', 'よんで', 'ぶ-verbs drop ぶ and add んで. 呼ぶ → 呼んで'),
((SELECT id FROM grammar_patterns WHERE pattern = 'ぶ→んで'), 'recognition', 'ぶ-verbs conjugate to:', '["いて", "して", "んで", "って"]', 'んで', 'ぶ-verbs always change to んで. Example: 遊ぶ → 遊んで'),
((SELECT id FROM grammar_patterns WHERE pattern = 'ぶ→んで'), 'transformation', 'Change to TE-form: 学ぶ (to learn)', '["まないて", "まなって", "まなんで", "まなぶて"]', 'まなんで', 'ぶ-verbs conjugate to んで. 学ぶ → 学んで');

-- Exercises for む→んで
INSERT INTO grammar_exercises (pattern_id, type, question, options, correct_answer, explanation) VALUES
((SELECT id FROM grammar_patterns WHERE pattern = 'む→んで'), 'recognition', 'What is the TE-form of 読む (to read)?', '["よいて", "よって", "よんで", "よむで"]', 'よんで', 'む-verbs change to んで. 読む → 読んで (よんで)'),
((SELECT id FROM grammar_patterns WHERE pattern = 'む→んで'), 'construction', 'Convert to TE-form: 飲む (to drink)', '["のいて", "のって", "のんで", "のむで"]', 'のんで', 'む-verbs drop む and add んで. 飲む → 飲んで'),
((SELECT id FROM grammar_patterns WHERE pattern = 'む→んで'), 'recognition', 'む-verbs conjugate to:', '["いて", "して", "んで", "って"]', 'んで', 'む-verbs always change to んで. Example: 読む → 読んで'),
((SELECT id FROM grammar_patterns WHERE pattern = 'む→んで'), 'transformation', 'Change to TE-form: 住む (to live)', '["すいて", "すって", "すんで", "すむで"]', 'すんで', 'む-verbs conjugate to んで. 住む → 住んで');

-- Exercises for る→って (Godan)
INSERT INTO grammar_exercises (pattern_id, type, question, options, correct_answer, explanation) VALUES
((SELECT id FROM grammar_patterns WHERE pattern = 'る→って (五段)'), 'recognition', 'What is the TE-form of 帰る (to return home)?', '["かえて", "かえって", "かえるて", "かえんで"]', 'かえって', 'る-verbs (Godan) change to って. 帰る → 帰って (かえって). Note: え before る makes this Godan'),
((SELECT id FROM grammar_patterns WHERE pattern = 'る→って (五段)'), 'construction', 'How do you know 帰る is Godan (not Ichidan)?', '["It ends in る", "The る has え before it", "It is a movement verb", "It is irregular"]', 'The る has え before it', 'Godan る-verbs have a, i, u, o before る. Ichidan have e or i. 帰る (かえる) has え before る = Godan'),
((SELECT id FROM grammar_patterns WHERE pattern = 'る→って (五段)'), 'recognition', 'Which is a Godan る-verb?', '["食べる", "見る", "起きる", "知る"]', '知る', '知る (しる) has い before る, but it is an exception and acts as Godan: 知る → 知って'),
((SELECT id FROM grammar_patterns WHERE pattern = 'る→って (五段)'), 'transformation', 'Change to TE-form: 走る (to run)', '["はして", "はしって", "はしるて", "はしんで"]', 'はしって', '走る is Godan (し = i-sound, but it's Godan). 走る → 走って');

-- Exercises for る→て (Ichidan)
INSERT INTO grammar_exercises (pattern_id, type, question, options, correct_answer, explanation) VALUES
((SELECT id FROM grammar_patterns WHERE pattern = 'る→て (一段)'), 'recognition', 'What is the TE-form of 食べる (to eat)?', '["たべて", "たべって", "たべるて", "たべんで"]', 'たべて', 'Ichidan る-verbs drop る and add て. 食べる → 食べて (たべて)'),
((SELECT id FROM grammar_patterns WHERE pattern = 'る→て (一段)'), 'construction', 'How do you identify an Ichidan verb?', '["It ends in る", "The る has e or i before it", "It is common", "It is irregular"]', 'The る has e or i before it', 'Ichidan verbs have e or i sound before る. Example: 食べる (e), 見る (i), 起きる (i)'),
((SELECT id FROM grammar_patterns WHERE pattern = 'る→て (一段)'), 'recognition', 'Which is an Ichidan verb?', '["帰る", "知る", "食べる", "走る"]', '食べる', '食べる (たべる) has え before る = Ichidan. The others are Godan.'),
((SELECT id FROM grammar_patterns WHERE pattern = 'る→て (一段)'), 'transformation', 'Change to TE-form: 起きる (to wake up)', '["おきて", "おきって", "おきるて", "おきんで"]', 'おきて', 'Ichidan verbs drop る and add て. 起きる → 起きて');

-- Exercises for する→して
INSERT INTO grammar_exercises (pattern_id, type, question, options, correct_answer, explanation) VALUES
((SELECT id FROM grammar_patterns WHERE pattern = 'する→して'), 'recognition', 'What is the TE-form of する (to do)?', '["しって", "して", "するて", "しんで"]', 'して', 'する is irregular. It changes to して'),
((SELECT id FROM grammar_patterns WHERE pattern = 'する→して'), 'construction', 'Convert to TE-form: 勉強する (to study)', '["べんきょうしって", "べんきょうして", "べんきょうするて", "べんきょうしんで"]', 'べんきょうして', 'する compounds change する to して. 勉強する → 勉強して'),
((SELECT id FROM grammar_patterns WHERE pattern = 'する→して'), 'recognition', 'All する compound verbs conjugate to:', '["して ending", "すて ending", "しる ending", "すり ending"]', 'して ending', 'Any verb ending in する changes to して. Example: 運動する → 運動して'),
((SELECT id FROM grammar_patterns WHERE pattern = 'する→して'), 'transformation', 'Change to TE-form: 結婚する (to marry)', '["けっこんしって", "けっこんして", "けっこんするて", "けっこんしんで"]', 'けっこんして', 'する compounds change する to して. 結婚する → 結婚して');

-- Exercises for くる→きて
INSERT INTO grammar_exercises (pattern_id, type, question, options, correct_answer, explanation) VALUES
((SELECT id FROM grammar_patterns WHERE pattern = 'くる→きて'), 'recognition', 'What is the TE-form of 来る (くる, to come)?', '["くて", "きて", "くるて", "きって"]', 'きて', '来る is completely irregular. It changes to 来て (きて)'),
((SELECT id FROM grammar_patterns WHERE pattern = 'くる→きて'), 'construction', 'Convert to TE-form: 来る', '["くて", "きて", "くるて", "きって"]', 'きて', '来る changes to 来て. This is the only verb that does this pattern.'),
((SELECT id FROM grammar_patterns WHERE pattern = 'くる→きて'), 'recognition', '来る is:', '["Regular Godan verb", "Regular Ichidan verb", "Irregular verb", "Group 1 verb"]', 'Irregular verb', '来る is one of only two irregular verbs in Japanese (along with する)'),
((SELECT id FROM grammar_patterns WHERE pattern = 'くる→きて'), 'recognition', 'The TE-form of 来る is:', '["くて", "きて", "くるて", "きって"]', 'きて', '来る → 来て (きて). Must be memorized as an exception.');

-- Exercises for ている
INSERT INTO grammar_exercises (pattern_id, type, question, options, correct_answer, explanation) VALUES
((SELECT id FROM grammar_patterns WHERE pattern = 'ている (進行形)'), 'recognition', 'What does 食べている mean?', '["will eat", "is eating", "ate", "eat regularly"]', 'is eating', 'TE-form + いる indicates ongoing action. 食べている = is eating (now)'),
((SELECT id FROM grammar_patterns WHERE pattern = 'ている (進行形)'), 'construction', 'Complete: 寝る → 寝て → ____', '["寝ている", "寝って", "寝ているる", "寝でいる"]', '寝ている', 'TE-form + いる. 寝て + いる = 寝ている (is sleeping)'),
((SELECT id FROM grammar_patterns WHERE pattern = 'ている (進行形)'), 'recognition', '持っている means:', '["is holding", "have/possess", "will hold", "held"]', 'have/possess', '持っている can mean ongoing holding OR possession. Context determines meaning.'),
((SELECT id FROM grammar_patterns WHERE pattern = 'ている (進行形)'), 'transformation', 'Make progressive: 勉強する (is studying)', '["べんきょうしている", "べんきょうして", "べんきょうするている", "べんきょうしてある"]', 'べんきょうしている', 'する → して + いる = している. 勉強する → 勉強している');

-- Exercises for てください
INSERT INTO grammar_exercises (pattern_id, type, question, options, correct_answer, explanation) VALUES
((SELECT id FROM grammar_patterns WHERE pattern = 'てください'), 'recognition', 'What does 見てください mean?', '["I see", "Please look", "Looking", "See you"]', 'Please look', 'TE-form + ください makes a polite request. 見てください = Please look/see'),
((SELECT id FROM grammar_patterns WHERE pattern = 'てください'), 'construction', 'Make a request: 待つ (wait)', '["待て", "待ってください", "待つください", "待って"]', '待ってください', 'TE-form of 待つ is 待って. Add ください: 待ってください = Please wait'),
((SELECT id FROM grammar_patterns WHERE pattern = 'てください'), 'recognition', 'てください is used for:', '["Asking questions", "Making requests", "Giving permission", "Expressing gratitude"]', 'Making requests', 'てください is the standard polite way to make a request in Japanese'),
((SELECT id FROM grammar_patterns WHERE pattern = 'てください'), 'transformation', 'Make polite request: 教える (tell me)', '["教えてください", "教えて", "教えてくださいます", "教えてくれ"]', '教えてください', '教える → 教えて (Ichidan) + ください = 教えてください = Please tell me');

-- Exercises for てもいいです
INSERT INTO grammar_exercises (pattern_id, type, question, options, correct_answer, explanation) VALUES
((SELECT id FROM grammar_patterns WHERE pattern = 'てもいいです'), 'recognition', 'What does 入ってもいいですか mean?', '["Are you entering?", "May I enter?", "Please enter", "I am entering"]', 'May I enter?', 'TE-form + もいいですか asks for permission. 入ってもいいですか = May I enter?'),
((SELECT id FROM grammar_patterns WHERE pattern = 'てもいいです'), 'construction', 'Ask permission: 写真を撮る (take photos)', '["写真を撮ってもいいですか", "写真を撮るもいいですか", "写真を撮ってもいい", "写真を撮りますか"]', '写真を撮ってもいいですか', '撮る → 撮って + もいいですか = 撮ってもいいですか = May I take photos?'),
((SELECT id FROM grammar_patterns WHERE pattern = 'てもいいです'), 'recognition', 'てもいいです is used for:', '["Making requests", "Asking for permission", "Giving commands", "Apologizing"]', 'Asking for permission', 'てもいいです asks if something is okay/allowed. Add か to make it a question.'),
((SELECT id FROM grammar_patterns WHERE pattern = 'てもいいです'), 'transformation', 'Give permission: 使う (use it)', '["使ってもいいです", "使ってもいいですか", "使ってください", "使ってはいけません"]', '使ってもいいです', '使う → 使って + もいいです = 使ってもいいです = You may use it');
