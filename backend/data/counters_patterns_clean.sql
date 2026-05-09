-- Japanese Counters (数詞) - Clean Import
-- Categories organized by counter type with clear groupings

-- ============================================
-- A. GENERAL COUNTERS (〜つ) - Japanese readings 1-10
-- ============================================

INSERT INTO grammar_patterns (pattern, base_form, category, jlpt_level, formation_rules, examples, common_mistakes) VALUES
('ひとつ', '〜つ', 'Counters', 'N5',
 '[{"step": 1, "rule": "General counter for 1 item (Japanese reading)", "counts": "general items 1-10"}]',
 '[{"jp": "りんごがひとつ", "en": "1 apple", "romaji": "ringo ga hitotsu"}]',
 '[{"mistake": "いちつ", "explanation": "Use hitotsu, not ichi + tsu"}]'),

('ふたつ', '〜つ', 'Counters', 'N5',
 '[{"step": 1, "rule": "General counter for 2 items (Japanese reading)", "counts": "general items 1-10"}]',
 '[{"jp": "本がふたつ", "en": "2 books", "romaji": "hon ga futatsu"}]',
 '[{"mistake": "につ", "explanation": "Use futatsu, not ni + tsu"}]'),

('みっつ', '〜つ', 'Counters', 'N5',
 '[{"step": 1, "rule": "General counter for 3 items - note the っ gemination", "counts": "general items 1-10"}]',
 '[{"jp": "ボールがみっつ", "en": "3 balls", "romaji": "booru ga mittsu"}]',
 '[{"mistake": "みつ", "explanation": "Remember the small っ: mittsu, not mitsu"}]'),

('よっつ', '〜つ', 'Counters', 'N5',
 '[{"step": 1, "rule": "General counter for 4 items - note the っ gemination", "counts": "general items 1-10"}]',
 '[{"jp": "椅子がよっつ", "en": "4 chairs", "romaji": "isu ga yottsu"}]',
 '[{"mistake": "よつ", "explanation": "Remember the small っ: yottsu"}]'),

('いつつ', '〜つ', 'Counters', 'N5',
 '[{"step": 1, "rule": "General counter for 5 items (Japanese reading)", "counts": "general items 1-10"}]',
 '[{"jp": "ペンがいつつ", "en": "5 pens", "romaji": "pen ga itsutsu"}]',
 '[{"mistake": "ごつ", "explanation": "Use itsutsu, not go + tsu"}]'),

('むっつ', '〜つ', 'Counters', 'N5',
 '[{"step": 1, "rule": "General counter for 6 items - note the っ gemination", "counts": "general items 1-10"}]',
 '[{"jp": "ケーキがむっつ", "en": "6 cakes", "romaji": "keeki ga muttsu"}]',
 '[{"mistake": "ろくつ", "explanation": "Use muttsu, not roku + tsu"}]'),

('ななつ', '〜つ', 'Counters', 'N5',
 '[{"step": 1, "rule": "General counter for 7 items (Japanese reading)", "counts": "general items 1-10"}]',
 '[{"jp": "ドアがななつ", "en": "7 doors", "romaji": "doa ga nanatsu"}]',
 '[{"mistake": "しちつ", "explanation": "Use nanatsu, not shichi + tsu"}]'),

('やっつ', '〜つ', 'Counters', 'N5',
 '[{"step": 1, "rule": "General counter for 8 items - note the っ gemination", "counts": "general items 1-10"}]',
 '[{"jp": "窓がやっつ", "en": "8 windows", "romaji": "mado ga yattsu"}]',
 '[{"mistake": "はちつ", "explanation": "Use yattsu, not hachi + tsu"}]'),

('ここのつ', '〜つ', 'Counters', 'N5',
 '[{"step": 1, "rule": "General counter for 9 items (Japanese reading)", "counts": "general items 1-10"}]',
 '[{"jp": "花がここのつ", "en": "9 flowers", "romaji": "hana ga kokonotsu"}]',
 '[{"mistake": "きゅうつ", "explanation": "Use kokonotsu, not kyuu + tsu"}]'),

('とお', '〜つ', 'Counters', 'N5',
 '[{"step": 1, "rule": "General counter for 10 items - unique reading", "counts": "general items 1-10"}]',
 '[{"jp": "ボタンがとお", "en": "10 buttons", "romaji": "botan ga too"}]',
 '[{"mistake": "じゅうつ", "explanation": "Use too/to, not juu + tsu"}]');

-- ============================================
-- B. LONG OBJECTS (〜本) - With sandhi changes
-- ============================================

INSERT INTO grammar_patterns (pattern, base_form, category, jlpt_level, formation_rules, examples, common_mistakes) VALUES
('いっぽん', '〜本', 'Counters', 'N5',
 '[{"step": 1, "rule": "1 long object - いち becomes いっ", "counts": "long objects (pens, bottles, etc.)"}]',
 '[{"jp": "鉛筆がいっぽん", "en": "1 pencil", "romaji": "enpitsu ga ippon"}]',
 '[{"mistake": "いちほん", "explanation": "1 + hon becomes ippon (not ichi-hon)"}]'),

('にほん', '〜本', 'Counters', 'N5',
 '[{"step": 1, "rule": "2 long objects - standard reading", "counts": "long objects (pens, bottles, etc.)"}]',
 '[{"jp": "ペンがにほん", "en": "2 pens", "romaji": "pen ga nihon"}]',
 '[]'),

('さんぼん', '〜本', 'Counters', 'N5',
 '[{"step": 1, "rule": "3 long objects - ほ becomes ぼ (voiced)", "counts": "long objects (pens, bottles, etc.)"}]',
 '[{"jp": "傘がさんぼん", "en": "3 umbrellas", "romaji": "kasa ga sanbon"}]',
 '[{"mistake": "さんほん", "explanation": "3 + hon becomes sanbon (voiced b)"}]'),

('よんほん', '〜本', 'Counters', 'N5',
 '[{"step": 1, "rule": "4 long objects - standard reading", "counts": "long objects (pens, bottles, etc.)"}]',
 '[{"jp": "箸がよんほん", "en": "4 chopsticks", "romaji": "hashi ga yonhon"}]',
 '[]'),

('ごほん', '〜本', 'Counters', 'N5',
 '[{"step": 1, "rule": "5 long objects - standard reading", "counts": "long objects (pens, bottles, etc.)"}]',
 '[{"jp": "ろうそくがごほん", "en": "5 candles", "romaji": "rousoku ga gohon"}]',
 '[]'),

('ろっぽん', '〜本', 'Counters', 'N5',
 '[{"step": 1, "rule": "6 long objects - ろく becomes ろっ, ほ becomes ぽ", "counts": "long objects (pens, bottles, etc.)"}]',
 '[{"jp": "びんがろっぽん", "en": "6 bottles", "romaji": "bin ga roppon"}]',
 '[{"mistake": "ろくほん", "explanation": "6 + hon becomes roppon (not roku-hon)"}]'),

('ななほん', '〜本', 'Counters', 'N5',
 '[{"step": 1, "rule": "7 long objects - standard reading", "counts": "long objects (pens, bottles, etc.)"}]',
 '[{"jp": "かぎがななほん", "en": "7 keys", "romaji": "kagi ga nanahon"}]',
 '[]'),

('はっぽん', '〜本', 'Counters', 'N5',
 '[{"step": 1, "rule": "8 long objects - はち becomes はっ, ほ becomes ぽ", "counts": "long objects (pens, bottles, etc.)"}]',
 '[{"jp": "えんぴつがはっぽん", "en": "8 pencils", "romaji": "enpitsu ga happon"}]',
 '[{"mistake": "はちほん", "explanation": "8 + hon becomes happon (not hachi-hon)"}]'),

('きゅうほん', '〜本', 'Counters', 'N5',
 '[{"step": 1, "rule": "9 long objects - standard reading", "counts": "long objects (pens, bottles, etc.)"}]',
 '[{"jp": "ボールペンがきゅうほん", "en": "9 ballpoint pens", "romaji": "boorupen ga kyuuhon"}]',
 '[]'),

('じゅっぽん', '〜本', 'Counters', 'N5',
 '[{"step": 1, "rule": "10 long objects - じゅう becomes じゅっ, ほ becomes ぽ", "counts": "long objects (pens, bottles, etc.)"}]',
 '[{"jp": "テープがじゅっぽん", "en": "10 tapes", "romaji": "teepu ga juppon"}]',
 '[{"mistake": "じゅうほん", "explanation": "10 + hon becomes juppon (not juu-hon)"}]'),

('ひゃっぽん', '〜本', 'Counters', 'N5',
 '[{"step": 1, "rule": "100 long objects - ひゃく becomes ひゃっ", "counts": "long objects (pens, bottles, etc.)"}]',
 '[{"jp": "ペンがひゃっぽん", "en": "100 pens", "romaji": "pen ga hyappon"}]',
 '[{"mistake": "ひゃくほん", "explanation": "100 + hon becomes hyappon"}]'),

('せんぼん', '〜本', 'Counters', 'N5',
 '[{"step": 1, "rule": "1000 long objects - せん + ぼん (voiced)", "counts": "long objects (pens, bottles, etc.)"}]',
 '[{"jp": "えんぴつがせんぼん", "en": "1000 pencils", "romaji": "enpitsu ga senbon"}]',
 '[{"mistake": "せんほん", "explanation": "1000 + hon becomes senbon (voiced b)"}]'),

('なんぼん', '〜本', 'Counters', 'N5',
 '[{"step": 1, "rule": "How many long objects? - なん + ぼん (voiced)", "counts": "long objects (pens, bottles, etc.)"}]',
 '[{"jp": "ペンがなんぼん", "en": "How many pens?", "romaji": "pen ga nanbon"}]',
 '[{"mistake": "なんほん", "explanation": "Question form uses nanbon (voiced)"}]');

-- ============================================
-- C. FLAT OBJECTS (〜枚) - No sandhi changes
-- ============================================

INSERT INTO grammar_patterns (pattern, base_form, category, jlpt_level, formation_rules, examples, common_mistakes) VALUES
('いちまい', '〜枚', 'Counters', 'N5',
 '[{"step": 1, "rule": "1 flat object - straightforward, no changes", "counts": "flat objects (paper, tickets, shirts)"}]',
 '[{"jp": "紙がいちまい", "en": "1 sheet of paper", "romaji": "kami ga ichimai"}]',
 '[]'),

('にまい', '〜枚', 'Counters', 'N5',
 '[{"step": 1, "rule": "2 flat objects - straightforward", "counts": "flat objects (paper, tickets, shirts)"}]',
 '[{"jp": "切符がにまい", "en": "2 tickets", "romaji": "kippu ga nimai"}]',
 '[]'),

('さんまい', '〜枚', 'Counters', 'N5',
 '[{"step": 1, "rule": "3 flat objects - straightforward", "counts": "flat objects (paper, tickets, shirts)"}]',
 '[{"jp": "シャツがさんまい", "en": "3 shirts", "romaji": "shatsu ga sanmai"}]',
 '[]'),

('よんまい', '〜枚', 'Counters', 'N5',
 '[{"step": 1, "rule": "4 flat objects - straightforward", "counts": "flat objects (paper, tickets, shirts)"}]',
 '[{"jp": "皿がよんまい", "en": "4 plates", "romaji": "sara ga yonmai"}]',
 '[]'),

('ごまい', '〜枚', 'Counters', 'N5',
 '[{"step": 1, "rule": "5 flat objects - straightforward", "counts": "flat objects (paper, tickets, shirts)"}]',
 '[{"jp": "写真がごまい", "en": "5 photos", "romaji": "shashin ga gomai"}]',
 '[]'),

('ろくまい', '〜枚', 'Counters', 'N5',
 '[{"step": 1, "rule": "6 flat objects - straightforward", "counts": "flat objects (paper, tickets, shirts)"}]',
 '[{"jp": "はがきがろくまい", "en": "6 postcards", "romaji": "hagaki ga rokumai"}]',
 '[]'),

('ななまい', '〜枚', 'Counters', 'N5',
 '[{"step": 1, "rule": "7 flat objects - straightforward", "counts": "flat objects (paper, tickets, shirts)"}]',
 '[{"jp": "CDがななまい", "en": "7 CDs", "romaji": "shii-dii ga nanamai"}]',
 '[]'),

('はちまい', '〜枚', 'Counters', 'N5',
 '[{"step": 1, "rule": "8 flat objects - straightforward", "counts": "flat objects (paper, tickets, shirts)"}]',
 '[{"jp": "紙がはちまい", "en": "8 sheets of paper", "romaji": "kami ga hachimai"}]',
 '[]'),

('きゅうまい', '〜枚', 'Counters', 'N5',
 '[{"step": 1, "rule": "9 flat objects - straightforward", "counts": "flat objects (paper, tickets, shirts)"}]',
 '[{"jp": "カードがきゅうまい", "en": "9 cards", "romaji": "kaado ga kyuumai"}]',
 '[]'),

('じゅうまい', '〜枚', 'Counters', 'N5',
 '[{"step": 1, "rule": "10 flat objects - straightforward", "counts": "flat objects (paper, tickets, shirts)"}]',
 '[{"jp": "切手がじゅうまい", "en": "10 stamps", "romaji": "kitte ga juumai"}]',
 '[]'),

('なんまい', '〜枚', 'Counters', 'N5',
 '[{"step": 1, "rule": "How many flat objects? - straightforward", "counts": "flat objects (paper, tickets, shirts)"}]',
 '[{"jp": "紙がなんまい", "en": "How many sheets of paper?", "romaji": "kami ga nanmai"}]',
 '[]');

-- ============================================
-- D. SMALL OBJECTS (〜個) - With sandhi changes
-- ============================================

INSERT INTO grammar_patterns (pattern, base_form, category, jlpt_level, formation_rules, examples, common_mistakes) VALUES
('いっこ', '〜個', 'Counters', 'N5',
 '[{"step": 1, "rule": "1 small object - いち becomes いっ", "counts": "small objects (fruit, eggs, etc.)"}]',
 '[{"jp": "りんごがいっこ", "en": "1 apple", "romaji": "ringo ga ikko"}]',
 '[{"mistake": "いちこ", "explanation": "1 + ko becomes ikko (not ichi-ko)"}]'),

('にこ', '〜個', 'Counters', 'N5',
 '[{"step": 1, "rule": "2 small objects - straightforward", "counts": "small objects (fruit, eggs, etc.)"}]',
 '[{"jp": "みかんがにこ", "en": "2 oranges", "romaji": "mikan ga niko"}]',
 '[]'),

('さんこ', '〜個', 'Counters', 'N5',
 '[{"step": 1, "rule": "3 small objects - straightforward", "counts": "small objects (fruit, eggs, etc.)"}]',
 '[{"jp": "たまごがさんこ", "en": "3 eggs", "romaji": "tamago ga sanko"}]',
 '[]'),

('よんこ', '〜個', 'Counters', 'N5',
 '[{"step": 1, "rule": "4 small objects - straightforward", "counts": "small objects (fruit, eggs, etc.)"}]',
 '[{"jp": "ケーキがよんこ", "en": "4 cakes", "romaji": "keeki ga yonko"}]',
 '[]'),

('ごこ', '〜個', 'Counters', 'N5',
 '[{"step": 1, "rule": "5 small objects - straightforward", "counts": "small objects (fruit, eggs, etc.)"}]',
 '[{"jp": "クッキーがごこ", "en": "5 cookies", "romaji": "kukkii ga goko"}]',
 '[]'),

('ろっこ', '〜個', 'Counters', 'N5',
 '[{"step": 1, "rule": "6 small objects - ろく becomes ろっ", "counts": "small objects (fruit, eggs, etc.)"}]',
 '[{"jp": "ボールがろっこ", "en": "6 balls", "romaji": "booru ga rokko"}]',
 '[{"mistake": "ろくこ", "explanation": "6 + ko becomes rokko (not roku-ko)"}]'),

('ななこ', '〜個', 'Counters', 'N5',
 '[{"step": 1, "rule": "7 small objects - straightforward", "counts": "small objects (fruit, eggs, etc.)"}]',
 '[{"jp": "みかんがななこ", "en": "7 oranges", "romaji": "mikan ga nanako"}]',
 '[]'),

('はっこ', '〜個', 'Counters', 'N5',
 '[{"step": 1, "rule": "8 small objects - はち becomes はっ", "counts": "small objects (fruit, eggs, etc.)"}]',
 '[{"jp": "いちごがはっこ", "en": "8 strawberries", "romaji": "ichigo ga hakko"}]',
 '[{"mistake": "はちこ", "explanation": "8 + ko becomes hakko (not hachi-ko)"}]'),

('きゅうこ', '〜個', 'Counters', 'N5',
 '[{"step": 1, "rule": "9 small objects - straightforward", "counts": "small objects (fruit, eggs, etc.)"}]',
 '[{"jp": "おにぎりがきゅうこ", "en": "9 rice balls", "romaji": "onigiri ga kyuuko"}]',
 '[]'),

('じゅっこ', '〜個', 'Counters', 'N5',
 '[{"step": 1, "rule": "10 small objects - じゅう becomes じゅっ", "counts": "small objects (fruit, eggs, etc.)"}]',
 '[{"jp": "ドーナツがじゅっこ", "en": "10 donuts", "romaji": "doonatsu ga jukko"}]',
 '[{"mistake": "じゅうこ", "explanation": "10 + ko becomes jukko (not juu-ko)"}]'),

('ひゃっこ', '〜個', 'Counters', 'N5',
 '[{"step": 1, "rule": "100 small objects - ひゃく becomes ひゃっ", "counts": "small objects (fruit, eggs, etc.)"}]',
 '[{"jp": "りんごがひゃっこ", "en": "100 apples", "romaji": "ringo ga hyakko"}]',
 '[{"mistake": "ひゃくこ", "explanation": "100 + ko becomes hyakko"}]'),

('なんこ', '〜個', 'Counters', 'N5',
 '[{"step": 1, "rule": "How many small objects? - straightforward", "counts": "small objects (fruit, eggs, etc.)"}]',
 '[{"jp": "りんごがなんこ", "en": "How many apples?", "romaji": "ringo ga nanko"}]',
 '[]');

-- ============================================
-- E. PEOPLE (〜人) - Critical exceptions for 1-2
-- ============================================

INSERT INTO grammar_patterns (pattern, base_form, category, jlpt_level, formation_rules, examples, common_mistakes) VALUES
('ひとり', '〜人', 'Counters', 'N5',
 '[{"step": 1, "rule": "1 person - COMPLETELY DIFFERENT WORD (not いち + にん!)", "counts": "people"}]',
 '[{"jp": "ひとり", "en": "1 person", "romaji": "hitori"}]',
 '[{"mistake": "いちにん", "explanation": "1 person is HITORI, never ichi-nin!"}, {"mistake": "いっにん", "explanation": "Never use ichi or っ with nin for 1 person"}]'),

('ふたり', '〜人', 'Counters', 'N5',
 '[{"step": 1, "rule": "2 people - COMPLETELY DIFFERENT WORD (not に + にん!)", "counts": "people"}]',
 '[{"jp": "ふたり", "en": "2 people", "romaji": "futari"}]',
 '[{"mistake": "ににん", "explanation": "2 people are FUTARI, never ni-nin!"}]'),

('さんにん', '〜人', 'Counters', 'N5',
 '[{"step": 1, "rule": "3 people - standard Sino-Japanese counting starts here", "counts": "people"}]',
 '[{"jp": "学生がさんにん", "en": "3 students", "romaji": "gakusei ga sannin"}]',
 '[{"mistake": "さんひと", "explanation": "From 3 onwards, use standard counting: sannin"}]'),

('よんにん', '〜人', 'Counters', 'N5',
 '[{"step": 1, "rule": "4 people - standard reading", "counts": "people"}]',
 '[{"jp": "先生がよんにん", "en": "4 teachers", "romaji": "sensei ga yonin"}]',
 '[]'),

('ごにん', '〜人', 'Counters', 'N5',
 '[{"step": 1, "rule": "5 people - standard reading", "counts": "people"}]',
 '[{"jp": "友達がごにん", "en": "5 friends", "romaji": "tomodachi ga gonin"}]',
 '[]'),

('ろくにん', '〜人', 'Counters', 'N5',
 '[{"step": 1, "rule": "6 people - standard reading", "counts": "people"}]',
 '[{"jp": "子供がろくにん", "en": "6 children", "romaji": "kodomo ga rokunin"}]',
 '[]'),

('ななにん', '〜人', 'Counters', 'N5',
 '[{"step": 1, "rule": "7 people - standard reading (なな preferred over しち)", "counts": "people"}]',
 '[{"jp": "男の人がななにん", "en": "7 men", "romaji": "otoko no hito ga nananin"}]',
 '[{"mistake": "しちにん", "explanation": "Use nananin, not shichinin"}]'),

('はちにん', '〜人', 'Counters', 'N5',
 '[{"step": 1, "rule": "8 people - standard reading", "counts": "people"}]',
 '[{"jp": "女の人がはちにん", "en": "8 women", "romaji": "onna no hito ga hachinin"}]',
 '[]'),

('きゅうにん', '〜人', 'Counters', 'N5',
 '[{"step": 1, "rule": "9 people - standard reading", "counts": "people"}]',
 '[{"jp": "人がきゅうにん", "en": "9 people", "romaji": "hito ga kyuunin"}]',
 '[]'),

('じゅうにん', '〜人', 'Counters', 'N5',
 '[{"step": 1, "rule": "10 people - standard reading", "counts": "people"}]',
 '[{"jp": "客がじゅうにん", "en": "10 customers", "romaji": "kyaku ga juunin"}]',
 '[]'),

('なんにん', '〜人', 'Counters', 'N5',
 '[{"step": 1, "rule": "How many people? - standard reading", "counts": "people"}]',
 '[{"jp": "人がなんにん", "en": "How many people?", "romaji": "hito ga nannin"}]',
 '[]');

-- ============================================
-- F. DAYS OF THE MONTH (〜日) - 1st through 31st
-- Many exceptions in days 1-10, 14, 20, 24
-- ============================================

INSERT INTO grammar_patterns (pattern, base_form, category, jlpt_level, formation_rules, examples, common_mistakes) VALUES
('ついたち', '〜日', 'Counters', 'N5',
 '[{"step": 1, "rule": "1st day of month - COMPLETELY UNIQUE READING", "counts": "days of the month (1st-31st)"}]',
 '[{"jp": "ついたち", "en": "1st", "romaji": "tsuitachi"}]',
 '[{"mistake": "いちにち", "explanation": "1st day is TSUITACHI, not ichi-nichi (which means \"one day\")"}]'),

('ふつか', '〜日', 'Counters', 'N5',
 '[{"step": 1, "rule": "2nd day - Japanese reading (not ににち)", "counts": "days of the month (1st-31st)"}]',
 '[{"jp": "ふつか", "en": "2nd", "romaji": "futsuka"}]',
 '[{"mistake": "ににち", "explanation": "2nd day is FUTSUKA (Japanese reading)"}]'),

('みっか', '〜日', 'Counters', 'N5',
 '[{"step": 1, "rule": "3rd day - Japanese reading with っ", "counts": "days of the month (1st-31st)"}]',
 '[{"jp": "みっか", "en": "3rd", "romaji": "mikka"}]',
 '[{"mistake": "さんにち", "explanation": "3rd day is MIKKA with small っ"}]'),

('よっか', '〜日', 'Counters', 'N5',
 '[{"step": 1, "rule": "4th day - Japanese reading with っ. Same for 14th and 24th!", "counts": "days of the month (1st-31st)"}]',
 '[{"jp": "よっか", "en": "4th", "romaji": "yokka"}]',
 '[{"mistake": "よんにち", "explanation": "4th day is YOKKA with small っ"}]'),

('いつか', '〜日', 'Counters', 'N5',
 '[{"step": 1, "rule": "5th day - Japanese reading", "counts": "days of the month (1st-31st)"}]',
 '[{"jp": "いつか", "en": "5th", "romaji": "itsuka"}]',
 '[{"mistake": "ごにち", "explanation": "5th day is ITSUKA (Japanese reading)"}]'),

('むいか', '〜日', 'Counters', 'N5',
 '[{"step": 1, "rule": "6th day - Japanese reading", "counts": "days of the month (1st-31st)"}]',
 '[{"jp": "むいか", "en": "6th", "romaji": "muika"}]',
 '[{"mistake": "ろくにち", "explanation": "6th day is MUIKA (Japanese reading)"}]'),

('なのか', '〜日', 'Counters', 'N5',
 '[{"step": 1, "rule": "7th day - Japanese reading", "counts": "days of the month (1st-31st)"}]',
 '[{"jp": "なのか", "en": "7th", "romaji": "nanoka"}]',
 '[{"mistake": "ななにち", "explanation": "7th day is NANOKA (Japanese reading)"}]'),

('ようか', '〜日', 'Counters', 'N5',
 '[{"step": 1, "rule": "8th day - Japanese reading", "counts": "days of the month (1st-31st)"}]',
 '[{"jp": "ようか", "en": "8th", "romaji": "youka"}]',
 '[{"mistake": "はちにち", "explanation": "8th day is YOUKA (Japanese reading)"}]'),

('ここのか', '〜日', 'Counters', 'N5',
 '[{"step": 1, "rule": "9th day - Japanese reading", "counts": "days of the month (1st-31st)"}]',
 '[{"jp": "ここのか", "en": "9th", "romaji": "kokonoka"}]',
 '[{"mistake": "きゅうにち", "explanation": "9th day is KOKONOKA (Japanese reading)"}]'),

('とおか', '〜日', 'Counters', 'N5',
 '[{"step": 1, "rule": "10th day - Japanese reading (not じゅうにち)", "counts": "days of the month (1st-31st)"}]',
 '[{"jp": "とおか", "en": "10th", "romaji": "tooka"}]',
 '[{"mistake": "じゅうにち", "explanation": "10th day is TOOKA (Japanese reading)"}]'),

('じゅういちにち', '〜日', 'Counters', 'N5',
 '[{"step": 1, "rule": "11th day - standard Sino-Japanese + nichi", "counts": "days of the month (1st-31st)"}]',
 '[{"jp": "じゅういちにち", "en": "11th", "romaji": "juuichinichi"}]',
 '[]'),

('じゅうににち', '〜日', 'Counters', 'N5',
 '[{"step": 1, "rule": "12th day - standard Sino-Japanese + nichi", "counts": "days of the month (1st-31st)"}]',
 '[{"jp": "じゅうににち", "en": "12th", "romaji": "juuninichi"}]',
 '[]'),

('じゅうさんにち', '〜日', 'Counters', 'N5',
 '[{"step": 1, "rule": "13th day - standard Sino-Japanese + nichi", "counts": "days of the month (1st-31st)"}]',
 '[{"jp": "じゅうさんにち", "en": "13th", "romaji": "juusannichi"}]',
 '[]'),

('じゅうよっか', '〜日', 'Counters', 'N5',
 '[{"step": 1, "rule": "14th day - 4 reverts to よっか", "counts": "days of the month (1st-31st)"}]',
 '[{"jp": "じゅうよっか", "en": "14th", "romaji": "juuyokka"}]',
 '[{"mistake": "じゅうよんにち", "explanation": "14th day uses YOKKA (not yon-nichi)"}]'),

('じゅうごにち', '〜日', 'Counters', 'N5',
 '[{"step": 1, "rule": "15th day - standard", "counts": "days of the month (1st-31st)"}]',
 '[{"jp": "じゅうごにち", "en": "15th", "romaji": "juugonichi"}]',
 '[]'),

('じゅうろくにち', '〜日', 'Counters', 'N5',
 '[{"step": 1, "rule": "16th day - standard", "counts": "days of the month (1st-31st)"}]',
 '[{"jp": "じゅうろくにち", "en": "16th", "romaji": "juurokunichi"}]',
 '[]'),

('じゅうしちにち', '〜日', 'Counters', 'N5',
 '[{"step": 1, "rule": "17th day - standard", "counts": "days of the month (1st-31st)"}]',
 '[{"jp": "じゅうしちにち", "en": "17th", "romaji": "juushichinichi"}]',
 '[]'),

('じゅうはちにち', '〜日', 'Counters', 'N5',
 '[{"step": 1, "rule": "18th day - standard", "counts": "days of the month (1st-31st)"}]',
 '[{"jp": "じゅうはちにち", "en": "18th", "romaji": "juuhachinichi"}]',
 '[]'),

('じゅうくにち', '〜日', 'Counters', 'N5',
 '[{"step": 1, "rule": "19th day - standard", "counts": "days of the month (1st-31st)"}]',
 '[{"jp": "じゅうくにち", "en": "19th", "romaji": "juukunichi"}]',
 '[]'),

('はつか', '〜日', 'Counters', 'N5',
 '[{"step": 1, "rule": "20th day - COMPLETELY UNIQUE READING", "counts": "days of the month (1st-31st)"}]',
 '[{"jp": "はつか", "en": "20th", "romaji": "hatsuka"}]',
 '[{"mistake": "にじゅうにち", "explanation": "20th day is HATSUKA, not ni-juu-nichi"}]'),

('にじゅういちにち', '〜日', 'Counters', 'N5',
 '[{"step": 1, "rule": "21st day - standard", "counts": "days of the month (1st-31st)"}]',
 '[{"jp": "にじゅういちにち", "en": "21st", "romaji": "nijuuichinichi"}]',
 '[]'),

('にじゅうににち', '〜日', 'Counters', 'N5',
 '[{"step": 1, "rule": "22nd day - standard", "counts": "days of the month (1st-31st)"}]',
 '[{"jp": "にじゅうににち", "en": "22nd", "romaji": "nijuuninichi"}]',
 '[]'),

('にじゅうさんにち', '〜日', 'Counters', 'N5',
 '[{"step": 1, "rule": "23rd day - standard", "counts": "days of the month (1st-31st)"}]',
 '[{"jp": "にじゅうさんにち", "en": "23rd", "romaji": "nijuusannichi"}]',
 '[]'),

('にじゅうよっか', '〜日', 'Counters', 'N5',
 '[{"step": 1, "rule": "24th day - 4 reverts to よっか", "counts": "days of the month (1st-31st)"}]',
 '[{"jp": "にじゅうよっか", "en": "24th", "romaji": "nijuuyokka"}]',
 '[{"mistake": "にじゅうよんにち", "explanation": "24th day uses YOKKA (not yon-nichi)"}]'),

('にじゅうごにち', '〜日', 'Counters', 'N5',
 '[{"step": 1, "rule": "25th day - standard", "counts": "days of the month (1st-31st)"}]',
 '[{"jp": "にじゅうごにち", "en": "25th", "romaji": "nijuugonichi"}]',
 '[]'),

('にじゅうろくにち', '〜日', 'Counters', 'N5',
 '[{"step": 1, "rule": "26th day - standard", "counts": "days of the month (1st-31st)"}]',
 '[{"jp": "にじゅうろくにち", "en": "26th", "romaji": "nijuurokunichi"}]',
 '[]'),

('にじゅうしちにち', '〜日', 'Counters', 'N5',
 '[{"step": 1, "rule": "27th day - standard", "counts": "days of the month (1st-31st)"}]',
 '[{"jp": "にじゅうしちにち", "en": "27th", "romaji": "nijuushichinichi"}]',
 '[]'),

('にじゅうはちにち', '〜日', 'Counters', 'N5',
 '[{"step": 1, "rule": "28th day - standard", "counts": "days of the month (1st-31st)"}]',
 '[{"jp": "にじゅうはちにち", "en": "28th", "romaji": "nijuuhachinichi"}]',
 '[]'),

('にじゅうくにち', '〜日', 'Counters', 'N5',
 '[{"step": 1, "rule": "29th day - standard", "counts": "days of the month (1st-31st)"}]',
 '[{"jp": "にじゅうくにち", "en": "29th", "romaji": "nijuukunichi"}]',
 '[]'),

('さんじゅうにち', '〜日', 'Counters', 'N5',
 '[{"step": 1, "rule": "30th day - standard", "counts": "days of the month (1st-31st)"}]',
 '[{"jp": "さんじゅうにち", "en": "30th", "romaji": "sanjuunichi"}]',
 '[]'),

('さんじゅういちにち', '〜日', 'Counters', 'N5',
 '[{"step": 1, "rule": "31st day - standard", "counts": "days of the month (1st-31st)"}]',
 '[{"jp": "さんじゅういちにち", "en": "31st", "romaji": "sanjuuichinichi"}]',
 '[]'),

('なんにち', '〜日', 'Counters', 'N5',
 '[{"step": 1, "rule": "Which day? / How many days? - standard reading", "counts": "days of the month (1st-31st)"}]',
 '[{"jp": "なんにち", "en": "Which day? / How many days?", "romaji": "nannichi"}]',
 '[]');

-- ============================================
-- G. MONTHS (〜月) - January through December
-- ============================================

INSERT INTO grammar_patterns (pattern, base_form, category, jlpt_level, formation_rules, examples, common_mistakes) VALUES
('いちがつ', '〜月', 'Counters', 'N5',
 '[{"step": 1, "rule": "January - straightforward", "counts": "months"}]',
 '[{"jp": "いちがつ", "en": "January", "romaji": "ichigatsu"}]',
 '[]'),

('にがつ', '〜月', 'Counters', 'N5',
 '[{"step": 1, "rule": "February - straightforward", "counts": "months"}]',
 '[{"jp": "にがつ", "en": "February", "romaji": "nigatsu"}]',
 '[]'),

('さんがつ', '〜月', 'Counters', 'N5',
 '[{"step": 1, "rule": "March - straightforward", "counts": "months"}]',
 '[{"jp": "さんがつ", "en": "March", "romaji": "sangatsu"}]',
 '[]'),

('しがつ', '〜月', 'Counters', 'N5',
 '[{"step": 1, "rule": "April - note: shi (not yon!)", "counts": "months"}]',
 '[{"jp": "しがつ", "en": "April", "romaji": "shigatsu"}]',
 '[{"mistake": "よんがつ", "explanation": "April is SHIGATSU, not yon-gatsu"}]'),

('ごがつ', '〜月', 'Counters', 'N5',
 '[{"step": 1, "rule": "May - straightforward", "counts": "months"}]',
 '[{"jp": "ごがつ", "en": "May", "romaji": "gogatsu"}]',
 '[]'),

('ろくがつ', '〜月', 'Counters', 'N5',
 '[{"step": 1, "rule": "June - straightforward", "counts": "months"}]',
 '[{"jp": "ろくがつ", "en": "June", "romaji": "rokugatsu"}]',
 '[]'),

('しちがつ', '〜月', 'Counters', 'N5',
 '[{"step": 1, "rule": "July - note: shichi (not nana!)", "counts": "months"}]',
 '[{"jp": "しちがつ", "en": "July", "romaji": "shichigatsu"}]',
 '[{"mistake": "なながつ", "explanation": "July is SHICHIGATSU, not nana-gatsu"}]'),

('はちがつ', '〜月', 'Counters', 'N5',
 '[{"step": 1, "rule": "August - straightforward", "counts": "months"}]',
 '[{"jp": "はちがつ", "en": "August", "romaji": "hachigatsu"}]',
 '[]'),

('くがつ', '〜月', 'Counters', 'N5',
 '[{"step": 1, "rule": "September - note: ku (not kyuu!)", "counts": "months"}]',
 '[{"jp": "くがつ", "en": "September", "romaji": "kugatsu"}]',
 '[{"mistake": "きゅうがつ", "explanation": "September is KUGATSU, not kyuu-gatsu"}]'),

('じゅうがつ', '〜月', 'Counters', 'N5',
 '[{"step": 1, "rule": "October - straightforward", "counts": "months"}]',
 '[{"jp": "じゅうがつ", "en": "October", "romaji": "juugatsu"}]',
 '[]'),

('じゅういちがつ', '〜月', 'Counters', 'N5',
 '[{"step": 1, "rule": "November - straightforward", "counts": "months"}]',
 '[{"jp": "じゅういちがつ", "en": "November", "romaji": "juuichigatsu"}]',
 '[]'),

('じゅうにがつ', '〜月', 'Counters', 'N5',
 '[{"step": 1, "rule": "December - straightforward", "counts": "months"}]',
 '[{"jp": "じゅうにがつ", "en": "December", "romaji": "juunigatsu"}]',
 '[]'),

('なんがつ', '〜月', 'Counters', 'N5',
 '[{"step": 1, "rule": "Which month? - straightforward", "counts": "months"}]',
 '[{"jp": "なんがつ", "en": "Which month?", "romaji": "nangatsu"}]',
 '[]');

-- ============================================
-- H. MINUTES (〜分) - With sandhi changes
-- ============================================

INSERT INTO grammar_patterns (pattern, base_form, category, jlpt_level, formation_rules, examples, common_mistakes) VALUES
('いっぷん', '〜分', 'Counters', 'N5',
 '[{"step": 1, "rule": "1 minute - いち→いっ, ふん→ぷん (voiced)", "counts": "minutes"}]',
 '[{"jp": "いっぷん", "en": "1 minute", "romaji": "ippun"}]',
 '[{"mistake": "いちふん", "explanation": "1 + fun becomes ippun (voiced p)"}]'),

('にふん', '〜分', 'Counters', 'N5',
 '[{"step": 1, "rule": "2 minutes - standard", "counts": "minutes"}]',
 '[{"jp": "にふん", "en": "2 minutes", "romaji": "nifun"}]',
 '[]'),

('さんぷん', '〜分', 'Counters', 'N5',
 '[{"step": 1, "rule": "3 minutes - ふん→ぷん (voiced)", "counts": "minutes"}]',
 '[{"jp": "さんぷん", "en": "3 minutes", "romaji": "sanpun"}]',
 '[{"mistake": "さんふん", "explanation": "3 + fun becomes sanpun (voiced)"}]'),

('よんふん', '〜分', 'Counters', 'N5',
 '[{"step": 1, "rule": "4 minutes - standard", "counts": "minutes"}]',
 '[{"jp": "よんふん", "en": "4 minutes", "romaji": "yonfun"}]',
 '[]'),

('ごふん', '〜分', 'Counters', 'N5',
 '[{"step": 1, "rule": "5 minutes - standard", "counts": "minutes"}]',
 '[{"jp": "ごふん", "en": "5 minutes", "romaji": "gofun"}]',
 '[]'),

('ろっぷん', '〜分', 'Counters', 'N5',
 '[{"step": 1, "rule": "6 minutes - ろく→ろっ, ふん→ぷん", "counts": "minutes"}]',
 '[{"jp": "ろっぷん", "en": "6 minutes", "romaji": "roppun"}]',
 '[{"mistake": "ろくふん", "explanation": "6 + fun becomes roppun"}]'),

('ななふん', '〜分', 'Counters', 'N5',
 '[{"step": 1, "rule": "7 minutes - standard", "counts": "minutes"}]',
 '[{"jp": "ななふん", "en": "7 minutes", "romaji": "nanafun"}]',
 '[]'),

('はっぷん', '〜分', 'Counters', 'N5',
 '[{"step": 1, "rule": "8 minutes - はち→はっ, ふん→ぷん", "counts": "minutes"}]',
 '[{"jp": "はっぷん", "en": "8 minutes", "romaji": "happun"}]',
 '[{"mistake": "はちふん", "explanation": "8 + fun becomes happun"}]'),

('きゅうふん', '〜分', 'Counters', 'N5',
 '[{"step": 1, "rule": "9 minutes - standard", "counts": "minutes"}]',
 '[{"jp": "きゅうふん", "en": "9 minutes", "romaji": "kyuufun"}]',
 '[]'),

('じゅっぷん', '〜分', 'Counters', 'N5',
 '[{"step": 1, "rule": "10 minutes - じゅう→じゅっ, ふん→ぷん", "counts": "minutes"}]',
 '[{"jp": "じゅっぷん", "en": "10 minutes", "romaji": "juppun"}]',
 '[{"mistake": "じゅうふん", "explanation": "10 + fun becomes juppun"}]'),

('なんぷん', '〜分', 'Counters', 'N5',
 '[{"step": 1, "rule": "How many minutes? - ふん→ぷん (voiced)", "counts": "minutes"}]',
 '[{"jp": "なんぷん", "en": "How many minutes?", "romaji": "nanpun"}]',
 '[{"mistake": "なんふん", "explanation": "Question uses nanpun (voiced)"}]');

-- ============================================
-- I. AGE (〜才/歳)
-- ============================================

INSERT INTO grammar_patterns (pattern, base_form, category, jlpt_level, formation_rules, examples, common_mistakes) VALUES
('いっさい', '〜才/歳', 'Counters', 'N5',
 '[{"step": 1, "rule": "1 year old - いち→いっ", "counts": "age (years old)"}]',
 '[{"jp": "いっさい", "en": "1 year old", "romaji": "issai"}]',
 '[{"mistake": "いちさい", "explanation": "1 + sai becomes issai"}]'),

('にさい', '〜才/歳', 'Counters', 'N5',
 '[{"step": 1, "rule": "2 years old - standard", "counts": "age (years old)"}]',
 '[{"jp": "にさい", "en": "2 years old", "romaji": "nisai"}]',
 '[]'),

('さんさい', '〜才/歳', 'Counters', 'N5',
 '[{"step": 1, "rule": "3 years old - standard", "counts": "age (years old)"}]',
 '[{"jp": "さんさい", "en": "3 years old", "romaji": "sansai"}]',
 '[]'),

('よんさい', '〜才/歳', 'Counters', 'N5',
 '[{"step": 1, "rule": "4 years old - standard", "counts": "age (years old)"}]',
 '[{"jp": "よんさい", "en": "4 years old", "romaji": "yonsai"}]',
 '[]'),

('ごさい', '〜才/歳', 'Counters', 'N5',
 '[{"step": 1, "rule": "5 years old - standard", "counts": "age (years old)"}]',
 '[{"jp": "ごさい", "en": "5 years old", "romaji": "gosai"}]',
 '[]'),

('ろくさい', '〜才/歳', 'Counters', 'N5',
 '[{"step": 1, "rule": "6 years old - standard", "counts": "age (years old)"}]',
 '[{"jp": "ろくさい", "en": "6 years old", "romaji": "rokusai"}]',
 '[]'),

('ななさい', '〜才/歳', 'Counters', 'N5',
 '[{"step": 1, "rule": "7 years old - standard", "counts": "age (years old)"}]',
 '[{"jp": "ななさい", "en": "7 years old", "romaji": "nanasai"}]',
 '[]'),

('はっさい', '〜才/歳', 'Counters', 'N5',
 '[{"step": 1, "rule": "8 years old - はち→はっ", "counts": "age (years old)"}]',
 '[{"jp": "はっさい", "en": "8 years old", "romaji": "hassai"}]',
 '[]'),

('きゅうさい', '〜才/歳', 'Counters', 'N5',
 '[{"step": 1, "rule": "9 years old - standard", "counts": "age (years old)"}]',
 '[{"jp": "きゅうさい", "en": "9 years old", "romaji": "kyuusai"}]',
 '[]'),

('じゅっさい', '〜才/歳', 'Counters', 'N5',
 '[{"step": 1, "rule": "10 years old - じゅう→じゅっ", "counts": "age (years old)"}]',
 '[{"jp": "じゅっさい", "en": "10 years old", "romaji": "jussai"}]',
 '[]'),

('はたち', '〜才/歳', 'Counters', 'N5',
 '[{"step": 1, "rule": "20 years old - COMPLETELY UNIQUE (not にじゅっさい!)", "counts": "age (years old)"}]',
 '[{"jp": "はたち", "en": "20 years old", "romaji": "hatachi"}]',
 '[{"mistake": "にじゅっさい", "explanation": "20 years old is HATACHI, special reading!"}, {"mistake": "にじゅうさい", "explanation": "Never use ni-juu-sai for age 20"}]'),

('なんさい', '〜才/歳', 'Counters', 'N5',
 '[{"step": 1, "rule": "How old? - straightforward", "counts": "age (years old)"}]',
 '[{"jp": "なんさい", "en": "How old?", "romaji": "nansai"}]',
 '[]');

-- ============================================
-- J. OTHER COMMON COUNTERS
-- ============================================

INSERT INTO grammar_patterns (pattern, base_form, category, jlpt_level, formation_rules, examples, common_mistakes) VALUES
('いっぱい', '〜杯', 'Counters', 'N5',
 '[{"step": 1, "rule": "1 cup/glass/bowl - いち→いっ", "counts": "cups/glasses/bowls"}]',
 '[{"jp": "お茶がいっぱい", "en": "1 cup of tea", "romaji": "ocha ga ippai"}]',
 '[{"mistake": "いちはい", "explanation": "1 + hai becomes ippai"}]'),

('いっさつ', '〜冊', 'Counters', 'N5',
 '[{"step": 1, "rule": "1 book/volume - いち→いっ", "counts": "books/volumes"}]',
 '[{"jp": "本がいっさつ", "en": "1 book", "romaji": "hon ga issatsu"}]',
 '[{"mistake": "いちさつ", "explanation": "1 + satsu becomes issatsu"}]'),

('いっかい', '〜回', 'Counters', 'N5',
 '[{"step": 1, "rule": "1 time/once - いち→いっ", "counts": "times/occurrences"}]',
 '[{"jp": "いっかい", "en": "1 time / once", "romaji": "ikkai"}]',
 '[{"mistake": "いちかい", "explanation": "1 + kai becomes ikkai"}]'),

('にかい', '〜回', 'Counters', 'N5',
 '[{"step": 1, "rule": "2 times/twice - standard", "counts": "times/occurrences"}]',
 '[{"jp": "にかい", "en": "2 times / twice", "romaji": "nikai"}]',
 '[]'),

('さんかい', '〜回', 'Counters', 'N5',
 '[{"step": 1, "rule": "3 times - standard", "counts": "times/occurrences"}]',
 '[{"jp": "さんかい", "en": "3 times", "romaji": "sankai"}]',
 '[]'),

('なんかい', '〜回', 'Counters', 'N5',
 '[{"step": 1, "rule": "How many times? - standard", "counts": "times/occurrences"}]',
 '[{"jp": "なんかい", "en": "How many times?", "romaji": "nankai"}]',
 '[]'),

('にはい', '〜杯', 'Counters', 'N5',
 '[{"step": 1, "rule": "2 cups - standard", "counts": "cups/glasses/bowls"}]',
 '[{"jp": "お茶がにはい", "en": "2 cups of tea", "romaji": "ocha ga nihai"}]',
 '[]'),

('さんばい', '〜杯', 'Counters', 'N5',
 '[{"step": 1, "rule": "3 cups - はい→ばい (voiced)", "counts": "cups/glasses/bowls"}]',
 '[{"jp": "お茶がさんばい", "en": "3 cups of tea", "romaji": "ocha ga sanbai"}]',
 '[{"mistake": "さんはい", "explanation": "3 + hai becomes sanbai (voiced b)"}]'),

('なんばい', '〜杯', 'Counters', 'N5',
 '[{"step": 1, "rule": "How many cups? - はい→ばい (voiced)", "counts": "cups/glasses/bowls"}]',
 '[{"jp": "お茶がなんばい", "en": "How many cups of tea?", "romaji": "ocha ga nanbai"}]',
 '[{"mistake": "なんはい", "explanation": "Question uses nanbai (voiced)"}]');
