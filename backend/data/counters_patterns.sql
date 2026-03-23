-- Counters (数詞) - Complete Pattern Set
-- Category: Counters
-- Total patterns: ~70 covering all exceptions

-- ============================================
-- A. GENERAL COUNTERS (つ-system) - Japanese readings 1-10
-- ============================================

INSERT INTO grammar_patterns (pattern, category, jlpt_level, formation_rules, examples, common_mistakes) VALUES
('ひとつ', 'Counters', 'N5', '[{"step": 1, "rule": "General counter for 1 item (Japanese reading)"}]', '[{"jp": "りんごがひとつあります", "en": "There is one apple", "romaji": "ringo ga hitotsu arimasu"}]', '[{"mistake": "いちつ", "explanation": "Use hitotsu, not ichi + tsu"}]'),
('ふたつ', 'Counters', 'N5', '[{"step": 1, "rule": "General counter for 2 items (Japanese reading)"}]', '[{"jp": "本がふたつあります", "en": "There are two books", "romaji": "hon ga futatsu arimasu"}]', '[{"mistake": "につ", "explanation": "Use futatsu, not ni + tsu"}]'),
('みっつ', 'Counters', 'N5', '[{"step": 1, "rule": "General counter for 3 items - note the っ gemination"}]', '[{"jp": "ボールがみっつあります", "en": "There are three balls", "romaji": "booru ga mittsu arimasu"}]', '[{"mistake": "みつ", "explanation": "Remember the small っ: mittsu, not mitsu"}]'),
('よっつ', 'Counters', 'N5', '[{"step": 1, "rule": "General counter for 4 items - note the っ gemination"}]', '[{"jp": "椅子がよっつあります", "en": "There are four chairs", "romaji": "isu ga yottsu arimasu"}]', '[{"mistake": "よつ", "explanation": "Remember the small っ: yottsu"}]'),
('いつつ', 'Counters', 'N5', '[{"step": 1, "rule": "General counter for 5 items (Japanese reading)"}]', '[{"jp": "ペンがいつつあります", "en": "There are five pens", "romaji": "pen ga itsutsu arimasu"}]', '[{"mistake": "ごつ", "explanation": "Use itsutsu, not go + tsu"}]'),
('むっつ', 'Counters', 'N5', '[{"step": 1, "rule": "General counter for 6 items - note the っ gemination"}]', '[{"jp": "ケーキがむっつあります", "en": "There are six cakes", "romaji": "keeki ga muttsu arimasu"}]', '[{"mistake": "ろくつ", "explanation": "Use muttsu, not roku + tsu"}]'),
('ななつ', 'Counters', 'N5', '[{"step": 1, "rule": "General counter for 7 items (Japanese reading)"}]', '[{"jp": "ドアがななつあります", "en": "There are seven doors", "romaji": "doa ga nanatsu arimasu"}]', '[{"mistake": "しちつ", "explanation": "Use nanatsu, not shichi + tsu"}]'),
('やっつ', 'Counters', 'N5', '[{"step": 1, "rule": "General counter for 8 items - note the っ gemination"}]', '[{"jp": "窓がやっつあります", "en": "There are eight windows", "romaji": "mado ga yattsu arimasu"}]', '[{"mistake": "はちつ", "explanation": "Use yattsu, not hachi + tsu"}]'),
('ここのつ', 'Counters', 'N5', '[{"step": 1, "rule": "General counter for 9 items (Japanese reading)"}]', '[{"jp": "花がここのつあります", "en": "There are nine flowers", "romaji": "hana ga kokonotsu arimasu"}]', '[{"mistake": "きゅうつ", "explanation": "Use kokonotsu, not kyuu + tsu"}]'),
('とお', 'Counters', 'N5', '[{"step": 1, "rule": "General counter for 10 items - unique reading"}]', '[{"jp": "ボタンがとおあります", "en": "There are ten buttons", "romaji": "botan ga too arimasu"}]', '[{"mistake": "じゅうつ", "explanation": "Use too/to, not juu + tsu"}]');

-- ============================================
-- B. LONG OBJECTS (本) - With Sandhi Changes
-- ============================================

INSERT INTO grammar_patterns (pattern, category, jlpt_level, formation_rules, examples, common_mistakes) VALUES
('いっぽん', 'Counters', 'N5', '[{"step": 1, "rule": "1 long object - いち becomes いっ"}, {"step": 2, "rule": "Add ぽん with voiced p"}]', '[{"jp": "鉛筆がいっぽんあります", "en": "There is one pencil", "romaji": "enpitsu ga ippon arimasu"}]', '[{"mistake": "いちほん", "explanation": "1 + hon becomes ippon (not ichi-hon)"}]'),
('にほん', 'Counters', 'N5', '[{"step": 1, "rule": "2 long objects - standard reading"}]', '[{"jp": "ペンがにほんあります", "en": "There are two pens", "romaji": "pen ga nihon arimasu"}]', '[{"mistake": "にぽん", "explanation": "Use nihon, not nippon (except for Japan 日本)"}]'),
('さんぼん', 'Counters', 'N5', '[{"step": 1, "rule": "3 long objects - ほ becomes ぼ (voiced)"}]', '[{"jp": "傘がさんぼんあります", "en": "There are three umbrellas", "romaji": "kasa ga sanbon arimasu"}]', '[{"mistake": "さんほん", "explanation": "3 + hon becomes sanbon (voiced b)"}]'),
('よんほん', 'Counters', 'N5', '[{"step": 1, "rule": "4 long objects - standard reading"}]', '[{"jp": "箸がよんほんあります", "en": "There are four chopsticks", "romaji": "hashi ga yonhon arimasu"}]', '[]'),
('ごほん', 'Counters', 'N5', '[{"step": 1, "rule": "5 long objects - standard reading"}]', '[{"jp": "ろうそくがごほんあります", "en": "There are five candles", "romaji": "rousoku ga gohon arimasu"}]', '[]'),
('ろっぽん', 'Counters', 'N5', '[{"step": 1, "rule": "6 long objects - ろく becomes ろっ"}, {"step": 2, "rule": "Add ぽん with voiced p"}]', '[{"jp": "びんがろっぽんあります", "en": "There are six bottles", "romaji": "bin ga roppon arimasu"}]', '[{"mistake": "ろくほん", "explanation": "6 + hon becomes roppon (not roku-hon)"}]'),
('ななほん', 'Counters', 'N5', '[{"step": 1, "rule": "7 long objects - standard reading"}]', '[{"jp": "かぎがななほんあります", "en": "There are seven keys", "romaji": "kagi ga nanahon arimasu"}]', '[]'),
('はっぽん', 'Counters', 'N5', '[{"step": 1, "rule": "8 long objects - はち becomes はっ"}, {"step": 2, "rule": "Add ぽん with voiced p"}]', '[{"jp": "えんぴつがはっぽんあります", "en": "There are eight pencils", "romaji": "enpitsu ga happon arimasu"}]', '[{"mistake": "はちほん", "explanation": "8 + hon becomes happon (not hachi-hon)"}]'),
('きゅうほん', 'Counters', 'N5', '[{"step": 1, "rule": "9 long objects - standard reading"}]', '[{"jp": "ボールペンがきゅうほんあります", "en": "There are nine ballpoint pens", "romaji": "boorupen ga kyuuhon arimasu"}]', '[]'),
('じゅっぽん', 'Counters', 'N5', '[{"step": 1, "rule": "10 long objects - じゅう becomes じゅっ"}, {"step": 2, "rule": "Add ぽん with voiced p"}]', '[{"jp": "テープがじゅっぽんあります", "en": "There are ten tapes", "romaji": "teepu ga juppon arimasu"}]', '[{"mistake": "じゅうほん", "explanation": "10 + hon becomes juppon (not juu-hon)"}]'),
('ひゃっぽん', 'Counters', 'N5', '[{"step": 1, "rule": "100 long objects - ひゃく becomes ひゃっ"}, {"step": 2, "rule": "Add ぽん with voiced p"}]', '[{"jp": "ペンがひゃっぽんあります", "en": "There are 100 pens", "romaji": "pen ga hyappon arimasu"}]', '[{"mistake": "ひゃくほん", "explanation": "100 + hon becomes hyappon"}]'),
('せんぼん', 'Counters', 'N5', '[{"step": 1, "rule": "1000 long objects - せん + ぼん (voiced)"}]', '[{"jp": "えんぴつがせんぼんあります", "en": "There are 1000 pencils", "romaji": "enpitsu ga senbon arimasu"}]', '[{"mistake": "せんほん", "explanation": "1000 + hon becomes senbon (voiced b)"}]'),
('なんぼん', 'Counters', 'N5', '[{"step": 1, "rule": "How many long objects? - なん + ぼん (voiced)"}]', '[{"jp": "ペンがなんぼんありますか", "en": "How many pens are there?", "romaji": "pen ga nanbon arimasu ka"}]', '[{"mistake": "なんほん", "explanation": "Question form uses nanbon (voiced)"}]');

-- ============================================
-- C. FLAT OBJECTS (枚) - No Sandhi, Easy!
-- ============================================

INSERT INTO grammar_patterns (pattern, category, jlpt_level, formation_rules, examples, common_mistakes) VALUES
('いちまい', 'Counters', 'N5', '[{"step": 1, "rule": "1 flat object - straightforward, no changes"}]', '[{"jp": "紙がいちまいあります", "en": "There is one sheet of paper", "romaji": "kami ga ichimai arimasu"}]', '[]'),
('にまい', 'Counters', 'N5', '[{"step": 1, "rule": "2 flat objects - straightforward"}]', '[{"jp": "切符がにまいあります", "en": "There are two tickets", "romaji": "kippu ga nimai arimasu"}]', '[]'),
('さんまい', 'Counters', 'N5', '[{"step": 1, "rule": "3 flat objects - straightforward"}]', '[{"jp": "シャツがさんまいあります", "en": "There are three shirts", "romaji": "shatsu ga sanmai arimasu"}]', '[]'),
('よんまい', 'Counters', 'N5', '[{"step": 1, "rule": "4 flat objects - straightforward"}]', '[{"jp": "皿がよんまいあります", "en": "There are four plates", "romaji": "sara ga yonmai arimasu"}]', '[]'),
('ごまい', 'Counters', 'N5', '[{"step": 1, "rule": "5 flat objects - straightforward"}]', '[{"jp": "写真がごまいあります", "en": "There are five photos", "romaji": "shashin ga gomai arimasu"}]', '[]'),
('ろくまい', 'Counters', 'N5', '[{"step": 1, "rule": "6 flat objects - straightforward"}]', '[{"jp": "はがきがろくまいあります", "en": "There are six postcards", "romaji": "hagaki ga rokumai arimasu"}]', '[]'),
('ななまい', 'Counters', 'N5', '[{"step": 1, "rule": "7 flat objects - straightforward"}]', '[{"jp": "CDがななまいあります", "en": "There are seven CDs", "romaji": "shii-dii ga nanamai arimasu"}]', '[]'),
('はちまい', 'Counters', 'N5', '[{"step": 1, "rule": "8 flat objects - straightforward"}]', '[{"jp": "紙がはちまいあります", "en": "There are eight sheets of paper", "romaji": "kami ga hachimai arimasu"}]', '[]'),
('きゅうまい', 'Counters', 'N5', '[{"step": 1, "rule": "9 flat objects - straightforward"}]', '[{"jp": "カードがきゅうまいあります", "en": "There are nine cards", "romaji": "kaado ga kyuumai arimasu"}]', '[]'),
('じゅうまい', 'Counters', 'N5', '[{"step": 1, "rule": "10 flat objects - straightforward"}]', '[{"jp": "切手がじゅうまいあります", "en": "There are ten stamps", "romaji": "kitte ga juumai arimasu"}]', '[]'),
('なんまい', 'Counters', 'N5', '[{"step": 1, "rule": "How many flat objects? - straightforward"}]', '[{"jp": "紙がなんまいありますか", "en": "How many sheets of paper are there?", "romaji": "kami ga nanmai arimasu ka"}]', '[]');

-- ============================================
-- D. SMALL OBJECTS (個) - With Sandhi Changes
-- ============================================

INSERT INTO grammar_patterns (pattern, category, jlpt_level, formation_rules, examples, common_mistakes) VALUES
('いっこ', 'Counters', 'N5', '[{"step": 1, "rule": "1 small object - いち becomes いっ"}]', '[{"jp": "りんごがいっこあります", "en": "There is one apple", "romaji": "ringo ga ikko arimasu"}]', '[{"mistake": "いちこ", "explanation": "1 + ko becomes ikko (not ichi-ko)"}]'),
('にこ', 'Counters', 'N5', '[{"step": 1, "rule": "2 small objects - straightforward"}]', '[{"jp": "みかんがにこあります", "en": "There are two oranges", "romaji": "mikan ga niko arimasu"}]', '[]'),
('さんこ', 'Counters', 'N5', '[{"step": 1, "rule": "3 small objects - straightforward"}]', '[{"jp": "たまごがさんこあります", "en": "There are three eggs", "romaji": "tamago ga sanko arimasu"}]', '[]'),
('よんこ', 'Counters', 'N5', '[{"step": 1, "rule": "4 small objects - straightforward"}]', '[{"jp": "ケーキがよんこあります", "en": "There are four cakes", "romaji": "keeki ga yonko arimasu"}]', '[]'),
('ごこ', 'Counters', 'N5', '[{"step": 1, "rule": "5 small objects - straightforward"}]', '[{"jp": "クッキーがごこあります", "en": "There are five cookies", "romaji": "kukkii ga goko arimasu"}]', '[]'),
('ろっこ', 'Counters', 'N5', '[{"step": 1, "rule": "6 small objects - ろく becomes ろっ"}]', '[{"jp": "ボールがろっこあります", "en": "There are six balls", "romaji": "booru ga rokko arimasu"}]', '[{"mistake": "ろくこ", "explanation": "6 + ko becomes rokko (not roku-ko)"}]'),
('ななこ', 'Counters', 'N5', '[{"step": 1, "rule": "7 small objects - straightforward"}]', '[{"jp": "みかんがななこあります", "en": "There are seven oranges", "romaji": "mikan ga nanako arimasu"}]', '[]'),
('はっこ', 'Counters', 'N5', '[{"step": 1, "rule": "8 small objects - はち becomes はっ"}]', '[{"jp": "いちごがはっこあります", "en": "There are eight strawberries", "romaji": "ichigo ga hakko arimasu"}]', '[{"mistake": "はちこ", "explanation": "8 + ko becomes hakko (not hachi-ko)"}]'),
('きゅうこ', 'Counters', 'N5', '[{"step": 1, "rule": "9 small objects - straightforward"}]', '[{"jp": "おにぎりがきゅうこあります", "en": "There are nine rice balls", "romaji": "onigiri ga kyuuko arimasu"}]', '[]'),
('じゅっこ', 'Counters', 'N5', '[{"step": 1, "rule": "10 small objects - じゅう becomes じゅっ"}]', '[{"jp": "ドーナツがじゅっこあります", "en": "There are ten donuts", "romaji": "doonatsu ga jukko arimasu"}]', '[{"mistake": "じゅうこ", "explanation": "10 + ko becomes jukko (not juu-ko)"}]'),
('ひゃっこ', 'Counters', 'N5', '[{"step": 1, "rule": "100 small objects - ひゃく becomes ひゃっ"}]', '[{"jp": "りんごがひゃっこあります", "en": "There are 100 apples", "romaji": "ringo ga hyakko arimasu"}]', '[{"mistake": "ひゃくこ", "explanation": "100 + ko becomes hyakko"}]'),
('なんこ', 'Counters', 'N5', '[{"step": 1, "rule": "How many small objects? - straightforward"}]', '[{"jp": "りんごがなんこありますか", "en": "How many apples are there?", "romaji": "ringo ga nanko arimasu ka"}]', '[]');

-- ============================================
-- E. PEOPLE (人) - Critical Exceptions!
-- ============================================

INSERT INTO grammar_patterns (pattern, category, jlpt_level, formation_rules, examples, common_mistakes) VALUES
('ひとり', 'Counters', 'N5', '[{"step": 1, "rule": "1 person - COMPLETELY DIFFERENT WORD (not いち + にん!)"}]', '[{"jp": "ひとりで来ました", "en": "I came alone / One person came", "romaji": "hitori de kimashita"}]', '[{"mistake": "いちにん", "explanation": "1 person is HITORI, never ichi-nin!"}, {"mistake": "いっにん", "explanation": "Never use ichi or っ with nin for 1 person"}]'),
('ふたり', 'Counters', 'N5', '[{"step": 1, "rule": "2 people - COMPLETELY DIFFERENT WORD (not に + にん!)"}]', '[{"jp": "ふたりで食べました", "en": "Two people ate", "romaji": "futari de tabemashita"}]', '[{"mistake": "ににん", "explanation": "2 people are FUTARI, never ni-nin!"}]'),
('さんにん', 'Counters', 'N5', '[{"step": 1, "rule": "3 people - standard Sino-Japanese counting starts here"}]', '[{"jp": "学生がさんにんいます", "en": "There are 3 students", "romaji": "gakusei ga sannin imasu"}]', '[{"mistake": "さんひと", "explanation": "From 3 onwards, use standard counting: sannin"}]'),
('よんにん', 'Counters', 'N5', '[{"step": 1, "rule": "4 people - standard reading"}]', '[{"jp": "先生がよんにんいます", "en": "There are 4 teachers", "romaji": "sensei ga yonin imasu"}]', '[]'),
('ごにん', 'Counters', 'N5', '[{"step": 1, "rule": "5 people - standard reading"}]', '[{"jp": "友達がごにんいます", "en": "There are 5 friends", "romaji": "tomodachi ga gonin imasu"}]', '[]'),
('ろくにん', 'Counters', 'N5', '[{"step": 1, "rule": "6 people - standard reading"}]', '[{"jp": "子供がろくにんいます", "en": "There are 6 children", "romaji": "kodomo ga rokunin imasu"}]', '[]'),
('ななにん', 'Counters', 'N5', '[{"step": 1, "rule": "7 people - standard reading (なな preferred over しち)"}]', '[{"jp": "男の人がななにんいます", "en": "There are 7 men", "romaji": "otoko no hito ga nananin imasu"}]', '[{"mistake": "しちにん", "explanation": "Use nananin, not shichinin"}]'),
('はちにん', 'Counters', 'N5', '[{"step": 1, "rule": "8 people - standard reading"}]', '[{"jp": "女の人がはちにんいます", "en": "There are 8 women", "romaji": "onna no hito ga hachinin imasu"}]', '[]'),
('きゅうにん', 'Counters', 'N5', '[{"step": 1, "rule": "9 people - standard reading"}]', '[{"jp": "人がきゅうにんいます", "en": "There are 9 people", "romaji": "hito ga kyuunin imasu"}]', '[]'),
('じゅうにん', 'Counters', 'N5', '[{"step": 1, "rule": "10 people - standard reading"}]', '[{"jp": "客がじゅうにんいます", "en": "There are 10 customers", "romaji": "kyaku ga juunin imasu"}]', '[]'),
('なんにん', 'Counters', 'N5', '[{"step": 1, "rule": "How many people? - standard reading"}]', '[{"jp": "人がなんにんいますか", "en": "How many people are there?", "romaji": "hito ga nannin imasu ka"}]', '[]');

-- ============================================
-- F. DAYS OF THE MONTH (日) - Many Exceptions
-- ============================================

INSERT INTO grammar_patterns (pattern, category, jlpt_level, formation_rules, examples, common_mistakes) VALUES
('ついたち', 'Counters', 'N5', '[{"step": 1, "rule": "1st day of month - COMPLETELY UNIQUE READING"}]', '[{"jp": "一月ついたちです", "en": "It is January 1st", "romaji": "ichigatsu tsuitachi desu"}]', '[{"mistake": "いちにち", "explanation": "1st day is TSUITACHI, not ichi-nichi (which means \"one day\")"}]'),
('ふつか', 'Counters', 'N5', '[{"step": 1, "rule": "2nd day of month - Japanese reading (not ににち)"}]', '[{"jp": "二月ふつかです", "en": "It is February 2nd", "romaji": "nigatsu futsuka desu"}]', '[{"mistake": "ににち", "explanation": "2nd day is FUTSUKA (Japanese reading)"}]'),
('みっか', 'Counters', 'N5', '[{"step": 1, "rule": "3rd day - Japanese reading with っ"}]', '[{"jp": "三月みっかです", "en": "It is March 3rd", "romaji": "sangatsu mikka desu"}]', '[{"mistake": "さんにち", "explanation": "3rd day is MIKKA with small っ"}]'),
('よっか', 'Counters', 'N5', '[{"step": 1, "rule": "4th day - Japanese reading with っ"}]', '[{"jp": "四月よっかです", "en": "It is April 4th", "romaji": "shigatsu yokka desu"}]', '[{"mistake": "よんにち", "explanation": "4th day is YOKKA with small っ"}]'),
('いつか', 'Counters', 'N5', '[{"step": 1, "rule": "5th day - Japanese reading"}]', '[{"jp": "五月いつかです", "en": "It is May 5th", "romaji": "gogatsu itsuka desu"}]', '[{"mistake": "ごにち", "explanation": "5th day is ITSUKA (Japanese reading)"}]'),
('むいか', 'Counters', 'N5', '[{"step": 1, "rule": "6th day - Japanese reading"}]', '[{"jp": "六月むいかです", "en": "It is June 6th", "romaji": "rokugatsu muika desu"}]', '[{"mistake": "ろくにち", "explanation": "6th day is MUIKA (Japanese reading)"}]'),
('なのか', 'Counters', 'N5', '[{"step": 1, "rule": "7th day - Japanese reading"}]', '[{"jp": "七月なのかです", "en": "It is July 7th", "romaji": "shichigatsu nanoka desu"}]', '[{"mistake": "ななにち", "explanation": "7th day is NANOKA (Japanese reading)"}]'),
('ようか', 'Counters', 'N5', '[{"step": 1, "rule": "8th day - Japanese reading"}]', '[{"jp": "八月ようかです", "en": "It is August 8th", "romaji": "hachigatsu youka desu"}]', '[{"mistake": "はちにち", "explanation": "8th day is YOUKA (Japanese reading)"}]'),
('ここのか', 'Counters', 'N5', '[{"step": 1, "rule": "9th day - Japanese reading"}]', '[{"jp": "九月ここのかです", "en": "It is September 9th", "romaji": "kugatsu kokonoka desu"}]', '[{"mistake": "きゅうにち", "explanation": "9th day is KOKONOKA (Japanese reading)"}]'),
('とおか', 'Counters', 'N5', '[{"step": 1, "rule": "10th day - Japanese reading (not じゅうにち)"}]', '[{"jp": "十月とおかです", "en": "It is October 10th", "romaji": "juugatsu tooka desu"}]', '[{"mistake": "じゅうにち", "explanation": "10th day is TOOKA (Japanese reading)"}]'),
('じゅうよっか', 'Counters', 'N5', '[{"step": 1, "rule": "14th day - 4 reverts to よっか"}]', '[{"jp": "七月じゅうよっかです", "en": "It is July 14th", "romaji": "shichigatsu juuyokka desu"}]', '[{"mistake": "じゅうよんにち", "explanation": "14th day uses YOKKA (not yon-nichi)"}]'),
('はつか', 'Counters', 'N5', '[{"step": 1, "rule": "20th day - COMPLETELY UNIQUE READING"}]', '[{"jp": "八月はつかです", "en": "It is August 20th", "romaji": "hachigatsu hatsuka desu"}]', '[{"mistake": "にじゅうにち", "explanation": "20th day is HATSUKA, not ni-juu-nichi"}]'),
('にじゅうよっか', 'Counters', 'N5', '[{"step": 1, "rule": "24th day - 4 reverts to よっか"}]', '[{"jp": "九月にじゅうよっかです", "en": "It is September 24th", "romaji": "kugatsu nijuuyokka desu"}]', '[{"mistake": "にじゅうよんにち", "explanation": "24th day uses YOKKA (not yon-nichi)"}]'),
('なんにち', 'Counters', 'N5', '[{"step": 1, "rule": "Which day? / How many days? - standard reading"}]', '[{"jp": "今日はなんにちですか", "en": "What day is today?", "romaji": "kyou wa nannichi desu ka"}]', '[]');

-- ============================================
-- G. ADDITIONAL COMMON COUNTERS
-- ============================================

INSERT INTO grammar_patterns (pattern, category, jlpt_level, formation_rules, examples, common_mistakes) VALUES
('いっぱい', 'Counters', 'N5', '[{"step": 1, "rule": "1 cup/glass/bowl - いち→いっ"}]', '[{"jp": "お茶がいっぱいあります", "en": "There is one cup of tea", "romaji": "ocha ga ippai arimasu"}]', '[{"mistake": "いちはい", "explanation": "1 + hai becomes ippai"}]'),
('いっさつ', 'Counters', 'N5', '[{"step": 1, "rule": "1 book/volume - いち→いっ"}]', '[{"jp": "本がいっさつあります", "en": "There is one book", "romaji": "hon ga issatsu arimasu"}]', '[{"mistake": "いちさつ", "explanation": "1 + satsu becomes issatsu"}]'),
('いっかい', 'Counters', 'N5', '[{"step": 1, "rule": "1 time/once - いち→いっ"}]', '[{"jp": "いっかい行きました", "en": "I went one time", "romaji": "ikkai ikimashita"}]', '[{"mistake": "いちかい", "explanation": "1 + kai becomes ikkai"}]'),
('いっぷん', 'Counters', 'N5', '[{"step": 1, "rule": "1 minute - いち→いっ, ふん→ぷん (voiced)"}]', '[{"jp": "いっぷんまってください", "en": "Please wait one minute", "romaji": "ippun matte kudasai"}]', '[{"mistake": "いちふん", "explanation": "1 + fun becomes ippun (voiced p)"}]'),
('さんぷん', 'Counters', 'N5', '[{"step": 1, "rule": "3 minutes - ふん→ぷん (voiced)"}]', '[{"jp": "さんぷんです", "en": "It is 3 minutes", "romaji": "sanpun desu"}]', '[{"mistake": "さんふん", "explanation": "3 + fun becomes sanpun (voiced)"}]'),
('ろっぷん', 'Counters', 'N5', '[{"step": 1, "rule": "6 minutes - ろく→ろっ, ふん→ぷん"}]', '[{"jp": "ろっぷんです", "en": "It is 6 minutes", "romaji": "roppun desu"}]', '[{"mistake": "ろくふん", "explanation": "6 + fun becomes roppun"}]'),
('はっぷん', 'Counters', 'N5', '[{"step": 1, "rule": "8 minutes - はち→はっ, ふん→ぷん"}]', '[{"jp": "はっぷんです", "en": "It is 8 minutes", "romaji": "happun desu"}]', '[{"mistake": "はちふん", "explanation": "8 + fun becomes happun"}]'),
('じゅっぷん', 'Counters', 'N5', '[{"step": 1, "rule": "10 minutes - じゅう→じゅっ, ふん→ぷん"}]', '[{"jp": "じゅっぷんです", "en": "It is 10 minutes", "romaji": "juppun desu"}]', '[{"mistake": "じゅうふん", "explanation": "10 + fun becomes juppun"}]'),
('なんぷん', 'Counters', 'N5', '[{"step": 1, "rule": "How many minutes? - ふん→ぷん (voiced)"}]', '[{"jp": "なんぷんですか", "en": "How many minutes is it?", "romaji": "nanpun desu ka"}]', '[{"mistake": "なんふん", "explanation": "Question uses nanpun (voiced)"}]'),
('いっさい', 'Counters', 'N5', '[{"step": 1, "rule": "1 year old - いち→いっ"}]', '[{"jp": "いっさいです", "en": "I am 1 year old", "romaji": "issai desu"}]', '[{"mistake": "いちさい", "explanation": "1 + sai becomes issai"}]'),
('はたち', 'Counters', 'N5', '[{"step": 1, "rule": "20 years old - COMPLETELY UNIQUE (not にじゅっさい!)"}]', '[{"jp": "私ははたちです", "en": "I am 20 years old", "romaji": "watashi wa hatachi desu"}]', '[{"mistake": "にじゅっさい", "explanation": "20 years old is HATACHI, special reading!"}, {"mistake": "にじゅうさい", "explanation": "Never use ni-juu-sai for age 20"}]'),
('なんさい', 'Counters', 'N5', '[{"step": 1, "rule": "How old? - straightforward"}]', '[{"jp": "なんさいですか", "en": "How old are you?", "romaji": "nansai desu ka"}]', '[]');

-- ============================================
-- H. STANDARD DAYS (11-13, 15-19, 21-23, 25-31)
-- These use regular Sino-Japanese + にち
-- ============================================

INSERT INTO grammar_patterns (pattern, category, jlpt_level, formation_rules, examples, common_mistakes) VALUES
('じゅういちにち', 'Counters', 'N5', '[{"step": 1, "rule": "11th day - standard Sino-Japanese + nichi"}]', '[{"jp": "十一月じゅういちにち", "en": "November 11th", "romaji": "juuichigatsu juuichinichi"}]', '[]'),
('じゅうににち', 'Counters', 'N5', '[{"step": 1, "rule": "12th day - standard Sino-Japanese + nichi"}]', '[{"jp": "十二月じゅうににち", "en": "December 12th", "romaji": "juunigatsu juuninichi"}]', '[]'),
('じゅうさんにち', 'Counters', 'N5', '[{"step": 1, "rule": "13th day - standard Sino-Japanese + nichi"}]', '[{"jp": "一月じゅうさんにち", "en": "January 13th", "romaji": "ichigatsu juusannichi"}]', '[]'),
('じゅうごにち', 'Counters', 'N5', '[{"step": 1, "rule": "15th day - standard"}]', '[{"jp": "二月じゅうごにち", "en": "February 15th", "romaji": "nigatsu juugonichi"}]', '[]'),
('じゅうろくにち', 'Counters', 'N5', '[{"step": 1, "rule": "16th day - standard"}]', '[{"jp": "三月じゅうろくにち", "en": "March 16th", "romaji": "sangatsu juurokunichi"}]', '[]'),
('じゅうしちにち', 'Counters', 'N5', '[{"step": 1, "rule": "17th day - standard"}]', '[{"jp": "四月じゅうしちにち", "en": "April 17th", "romaji": "shigatsu juushichinichi"}]', '[]'),
('じゅうはちにち', 'Counters', 'N5', '[{"step": 1, "rule": "18th day - standard"}]', '[{"jp": "五月じゅうはちにち", "en": "May 18th", "romaji": "gogatsu juuhachinichi"}]', '[]'),
('じゅうくにち', 'Counters', 'N5', '[{"step": 1, "rule": "19th day - standard"}]', '[{"jp": "六月じゅうくにち", "en": "June 19th", "romaji": "rokugatsu juukunichi"}]', '[]'),
('にじゅういちにち', 'Counters', 'N5', '[{"step": 1, "rule": "21st day - standard"}]', '[{"jp": "七月にじゅういちにち", "en": "July 21st", "romaji": "shichigatsu nijuuichinichi"}]', '[]'),
('にじゅうににち', 'Counters', 'N5', '[{"step": 1, "rule": "22nd day - standard"}]', '[{"jp": "八月にじゅうににち", "en": "August 22nd", "romaji": "hachigatsu nijuuninichi"}]', '[]'),
('にじゅうさんにち', 'Counters', 'N5', '[{"step": 1, "rule": "23rd day - standard"}]', '[{"jp": "九月にじゅうさんにち", "en": "September 23rd", "romaji": "kugatsu nijuusannichi"}]', '[]');
