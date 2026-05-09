-- Counters Exercises - Clean Import
-- Creates discrimination drills, fill-in-blank, and transformation exercises

-- ============================================
-- EXERCISE TYPE 1: Error Correction (Discrimination)
-- ============================================

INSERT INTO grammar_exercises (pattern_id, type, prompt, context, correct_answer, hints, difficulty)
SELECT
  gp.id,
  'error_correction',
  'Which is correct: ' || cm.mistake || ' or ' || gp.pattern || '?',
  'Counter: ' || gp.pattern,
  gp.pattern,
  '["Think about the sandhi rules", "Remember the small っ for certain numbers", "Check if the number requires sound change"]'::jsonb,
  CASE
    WHEN gp.pattern LIKE '%っ%' THEN 2
    WHEN gp.pattern IN ('ひとり', 'ふたり', 'はたち', 'ついたち') THEN 3
    ELSE 1
  END
FROM grammar_patterns gp
CROSS JOIN LATERAL jsonb_to_recordset(gp.common_mistakes) AS cm(mistake text, explanation text)
WHERE gp.category = 'Counters'
AND jsonb_array_length(gp.common_mistakes) > 0;

-- ============================================
-- EXERCISE TYPE 2: Fill in the Blank
-- ============================================

INSERT INTO grammar_exercises (pattern_id, type, prompt, context, correct_answer, hints, difficulty) VALUES

-- ~つ (general counters)
((SELECT id FROM grammar_patterns WHERE pattern = 'ひとつ'), 'fill_blank', '1 apple', 'Count general items', 'ひとつ', '["Count the items", "Use the general counter", "Remember: hitotsu not ichi"]', 1),
((SELECT id FROM grammar_patterns WHERE pattern = 'ふたつ'), 'fill_blank', '2 books', 'Count general items', 'ふたつ', '["Count the items", "Use the general counter", "Remember: futatsu not ni"]', 1),
((SELECT id FROM grammar_patterns WHERE pattern = 'みっつ'), 'fill_blank', '3 balls', 'Count general items', 'みっつ', '["Count the items", "General counter", "Remember the small っ"]', 1),
((SELECT id FROM grammar_patterns WHERE pattern = 'とお'), 'fill_blank', '10 buttons', 'Count general items', 'とお', '["Count the items", "General counter for 10", "Unique reading: too"]', 1),

-- ~本 (long objects)
((SELECT id FROM grammar_patterns WHERE pattern = 'いっぽん'), 'fill_blank', '1 pencil', 'Count long objects', 'いっぽん', '["Pencils are long objects", "Use ~hon counter", "1 becomes いっぽん"]', 2),
((SELECT id FROM grammar_patterns WHERE pattern = 'さんぼん'), 'fill_blank', '3 bottles', 'Count long objects', 'さんぼん', '["Bottles are long objects", "Use ~hon counter", "3 becomes さんぼん with voiced b"]', 2),
((SELECT id FROM grammar_patterns WHERE pattern = 'ろっぽん'), 'fill_blank', '6 umbrellas', 'Count long objects', 'ろっぽん', '["Umbrellas are long objects", "Use ~hon counter", "6 becomes ろっぽん"]', 2),
((SELECT id FROM grammar_patterns WHERE pattern = 'なんぼん'), 'fill_blank', 'How many pens?', 'Ask quantity', 'なんぼん', '["How many = nan", "Long objects use ~hon", "Question form uses nanbon (voiced)"]', 2),

-- ~枚 (flat objects)
((SELECT id FROM grammar_patterns WHERE pattern = 'いちまい'), 'fill_blank', '1 sheet of paper', 'Count flat objects', 'いちまい', '["Paper is flat", "Use ~mai counter", "No sound changes for mai!"]', 1),
((SELECT id FROM grammar_patterns WHERE pattern = 'にまい'), 'fill_blank', '2 tickets', 'Count flat objects', 'にまい', '["Tickets are flat", "Use ~mai counter", "Straightforward counting"]', 1),
((SELECT id FROM grammar_patterns WHERE pattern = 'なんまい'), 'fill_blank', 'How many sheets?', 'Ask quantity', 'なんまい', '["How many = nan", "Flat objects use ~mai", "No sound changes!"]', 1),

-- ~個 (small objects)
((SELECT id FROM grammar_patterns WHERE pattern = 'いっこ'), 'fill_blank', '1 egg', 'Count small objects', 'いっこ', '["Eggs are small objects", "Use ~ko counter", "1 becomes いっこ"]', 2),
((SELECT id FROM grammar_patterns WHERE pattern = 'ろっこ'), 'fill_blank', '6 balls', 'Count small objects', 'ろっこ', '["Balls are small objects", "Use ~ko counter", "6 becomes ろっこ"]', 2),
((SELECT id FROM grammar_patterns WHERE pattern = 'なんこ'), 'fill_blank', 'How many apples?', 'Ask quantity', 'なんこ', '["How many = nan", "Small objects use ~ko", "Straightforward"]', 1),

-- ~人 (people - critical exceptions!)
((SELECT id FROM grammar_patterns WHERE pattern = 'ひとり'), 'fill_blank', '1 person', 'Count people', 'ひとり', '["People use ~nin, BUT...", "1 person is special: hitori", "Never say ichi-nin!"]', 3),
((SELECT id FROM grammar_patterns WHERE pattern = 'ふたり'), 'fill_blank', '2 people', 'Count people', 'ふたり', '["People use ~nin, BUT...", "2 people is special: futari", "Never say ni-nin!"]', 3),
((SELECT id FROM grammar_patterns WHERE pattern = 'さんにん'), 'fill_blank', '3 students', 'Count people', 'さんにん', '["From 3 onwards, use standard counting", "3 + nin = sannin", "Remember the exception stops at 2"]', 2),
((SELECT id FROM grammar_patterns WHERE pattern = 'なんにん'), 'fill_blank', 'How many people?', 'Ask quantity', 'なんにん', '["How many people = nannin", "Standard from 3 onwards"]', 2),

-- ~日 (days of the month)
((SELECT id FROM grammar_patterns WHERE pattern = 'ついたち'), 'fill_blank', '1st day of month', 'Days of the month', 'ついたち', '["Days 1-10 are special", "1st is tsuitachi (completely unique)", "Not ichi-nichi!"]', 3),
((SELECT id FROM grammar_patterns WHERE pattern = 'ふつか'), 'fill_blank', '2nd day of month', 'Days of the month', 'ふつか', '["2nd day uses Japanese reading", "Not ni-nichi!"]', 2),
((SELECT id FROM grammar_patterns WHERE pattern = 'みっか'), 'fill_blank', '3rd day of month', 'Days of the month', 'みっか', '["3rd day uses mikka", "Remember the small っ"]', 2),
((SELECT id FROM grammar_patterns WHERE pattern = 'よっか'), 'fill_blank', '4th day of month', 'Days of the month', 'よっか', '["4th day uses yokka", "Same for 14th and 24th!"]', 2),
((SELECT id FROM grammar_patterns WHERE pattern = 'とおか'), 'fill_blank', '10th day of month', 'Days of the month', 'とおか', '["10th day uses tooka", "Not juu-nichi!"]', 2),
((SELECT id FROM grammar_patterns WHERE pattern = 'じゅうよっか'), 'fill_blank', '14th day of month', 'Days of the month', 'じゅうよっか', '["14th reverts to yokka", "Not juu-yon-nichi!"]', 3),
((SELECT id FROM grammar_patterns WHERE pattern = 'はつか'), 'fill_blank', '20th day of month', 'Days of the month', 'はつか', '["20th is special: hatsuka", "Not ni-juu-nichi!"]', 3),
((SELECT id FROM grammar_patterns WHERE pattern = 'にじゅうよっか'), 'fill_blank', '24th day of month', 'Days of the month', 'にじゅうよっか', '["24th reverts to yokka", "Not ni-juu-yon-nichi!"]', 3),
((SELECT id FROM grammar_patterns WHERE pattern = 'さんじゅうにち'), 'fill_blank', '30th day of month', 'Days of the month', 'さんじゅうにち', '[]', 1),
((SELECT id FROM grammar_patterns WHERE pattern = 'なんにち'), 'fill_blank', 'Which day of the month?', 'Ask which day', 'なんにち', '["What day = nan-nichi", "Standard question form"]', 1),

-- ~月 (months)
((SELECT id FROM grammar_patterns WHERE pattern = 'いちがつ'), 'fill_blank', 'January', 'Months of the year', 'いちがつ', '["Month counter: ~gatsu", "Straightforward for most months"]', 1),
((SELECT id FROM grammar_patterns WHERE pattern = 'しがつ'), 'fill_blank', 'April', 'Months of the year', 'しがつ', '["April is SHIGATSU (not yon-gatsu!)", "Use shi for 4 in months"]', 2),
((SELECT id FROM grammar_patterns WHERE pattern = 'しちがつ'), 'fill_blank', 'July', 'Months of the year', 'しちがつ', '["July is SHICHIGATSU (not nana-gatsu!)", "Use shichi for 7 in months"]', 2),
((SELECT id FROM grammar_patterns WHERE pattern = 'くがつ'), 'fill_blank', 'September', 'Months of the year', 'くがつ', '["September is KUGATSU (not kyuu-gatsu!)", "Use ku for 9 in months"]', 2),
((SELECT id FROM grammar_patterns WHERE pattern = 'なんがつ'), 'fill_blank', 'Which month?', 'Ask which month', 'なんがつ', '["Which month = nan-gatsu", "Standard question form"]', 1),

-- ~分 (minutes)
((SELECT id FROM grammar_patterns WHERE pattern = 'いっぷん'), 'fill_blank', '1 minute', 'Count minutes', 'いっぷん', '["Minutes use ~fun", "BUT 1, 3, 6, 8, 10 change to ~pun", "1 becomes いっぷん"]', 2),
((SELECT id FROM grammar_patterns WHERE pattern = 'さんぷん'), 'fill_blank', '3 minutes', 'Count minutes', 'さんぷん', '["3 minutes becomes sanpun", "Voiced p sound"]', 2),
((SELECT id FROM grammar_patterns WHERE pattern = 'ろっぷん'), 'fill_blank', '6 minutes', 'Count minutes', 'ろっぷん', '["6 minutes becomes roppun", "Double change: roku→ro + fun→pun"]', 2),
((SELECT id FROM grammar_patterns WHERE pattern = 'なんぷん'), 'fill_blank', 'How many minutes?', 'Ask quantity', 'なんぷん', '["How many minutes = nanpun", "Voiced p in question form"]', 2),

-- ~才/歳 (age)
((SELECT id FROM grammar_patterns WHERE pattern = 'いっさい'), 'fill_blank', '1 year old', 'Age', 'いっさい', '["1 year old is issai", "1 + sai becomes issai"]', 2),
((SELECT id FROM grammar_patterns WHERE pattern = 'はたち'), 'fill_blank', '20 years old', 'Age', 'はたち', '["Ages use ~sai", "BUT 20 is special: hatachi", "Never say ni-juu-sai!"]', 3),
((SELECT id FROM grammar_patterns WHERE pattern = 'なんさい'), 'fill_blank', 'How old?', 'Ask age', 'なんさい', '["How old = nan-sai", "Standard question form"]', 1),

-- ~杯 / ~冊 / ~回
((SELECT id FROM grammar_patterns WHERE pattern = 'いっぱい'), 'fill_blank', '1 cup of tea', 'Count cups', 'いっぱい', '["Cups use ~hai", "1 becomes ippai"]', 2),
((SELECT id FROM grammar_patterns WHERE pattern = 'いっさつ'), 'fill_blank', '1 book', 'Count books', 'いっさつ', '["Books use ~satsu", "1 becomes issatsu"]', 2),
((SELECT id FROM grammar_patterns WHERE pattern = 'いっかい'), 'fill_blank', '1 time', 'Count times', 'いっかい', '["Times use ~kai", "1 becomes ikkai"]', 2),
((SELECT id FROM grammar_patterns WHERE pattern = 'なんかい'), 'fill_blank', 'How many times?', 'Ask quantity', 'なんかい', '["How many times = nankai", "Straightforward"]', 1);

-- ============================================
-- EXERCISE TYPE 3: Construction (Build the phrase)
-- ============================================

INSERT INTO grammar_exercises (pattern_id, type, prompt, context, correct_answer, hints, difficulty) VALUES
-- Construction exercises for sandhi patterns
((SELECT id FROM grammar_patterns WHERE pattern = 'いっぽん'), 'construction', 'Build: 1 pencil', 'Components: 鉛筆, が, いっぽん, あります', '鉛筆がいっぽんあります', '["Subject first", "Counter comes after particle ga", "Remember: ippon not ichi-hon"]', 2),
((SELECT id FROM grammar_patterns WHERE pattern = 'さんぼん'), 'construction', 'Build: 3 bottles', 'Components: びん, が, さんぼん, あります', 'びんがさんぼんあります', '["Subject first", "3 + hon becomes sanbon (voiced)"]', 2),
((SELECT id FROM grammar_patterns WHERE pattern = 'ろっぽん'), 'construction', 'Build: 6 umbrellas', 'Components: かさ, が, ろっぽん, あります', 'かさがろっぽんあります', '["6 + hon becomes roppon", "Double change: ろく→ろっ + ほ→ぽ"]', 3),

-- Construction for people
((SELECT id FROM grammar_patterns WHERE pattern = 'ひとり'), 'construction', 'Build: 1 person is here', 'Components: ひとり, が, います', 'ひとりがいます', '["No number + nin!", "Hitori is the complete word"]', 3),
((SELECT id FROM grammar_patterns WHERE pattern = 'さんにん'), 'construction', 'Build: 3 students', 'Components: 学生, が, さんにん, います', '学生がさんにんいます', '["From 3, use standard counting", "Student = gakusei"]', 2),

-- Construction for days
((SELECT id FROM grammar_patterns WHERE pattern = 'ついたち'), 'construction', 'Build: It is the 1st', 'Components: ついたち, です', 'ついたちです', '["1st day = tsuitachi (unique)", "No ichi-nichi!"]', 3);

-- ============================================
-- EXERCISE TYPE 4: Transformation (Change the number)
-- ============================================

INSERT INTO grammar_exercises (pattern_id, type, prompt, context, correct_answer, hints, difficulty) VALUES
-- Transform: singular to plural
((SELECT id FROM grammar_patterns WHERE pattern = 'ふたつ'), 'transformation', 'Change: りんごがひとつ → 2 apples', 'Make plural', 'りんごがふたつ', '["Change hitotsu to futatsu", "Everything else stays the same"]', 1),
((SELECT id FROM grammar_patterns WHERE pattern = 'さんぼん'), 'transformation', 'Change: 鉛筆がにほん → 3 pencils', 'Change number', '鉛筆がさんぼん', '["2 = nihon, 3 = sanbon", "Remember the voiced b for 3"]', 2),
((SELECT id FROM grammar_patterns WHERE pattern = 'ろっぽん'), 'transformation', 'Change: びんがさんぼん → 6 bottles', 'Change number', 'びんがろっぽん', '["6 + hon = roppon", "Both consonant changes!"]', 3),

-- Transform: standard to exception
((SELECT id FROM grammar_patterns WHERE pattern = 'ひとり'), 'transformation', 'Change: 学生がさんにん → 1 student', 'Change to 1', '学生がひとり', '["From 3 to 1 requires EXCEPTION", "1 person = hitori (never ichi-nin!)"]', 3),
((SELECT id FROM grammar_patterns WHERE pattern = 'ふたり'), 'transformation', 'Change: 先生がさんにん → 2 teachers', 'Change to 2', '先生がふたり', '["2 people = futari (never ni-nin!)"]', 3);
