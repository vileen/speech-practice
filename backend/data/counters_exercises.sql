-- Counters Exercises
-- To be inserted after the patterns are added
-- This creates discrimination drills, fill-in-blank, and transformation exercises

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
-- EXERCISE TYPE 2: Fill in the Blank (Image-based)
-- ============================================

INSERT INTO grammar_exercises (pattern_id, type, prompt, context, correct_answer, hints, difficulty) VALUES
-- Hitotsu exercises
((SELECT id FROM grammar_patterns WHERE pattern = 'ひとつ'), 'fill_blank', 'Image: One apple', 'Show 1 apple', 'りんごがひとつあります', '["Count the items", "Use the general counter", "Remember: hitotsu not ichi"]', 1),

-- Futatsu exercises  
((SELECT id FROM grammar_patterns WHERE pattern = 'ふたつ'), 'fill_blank', 'Image: Two books', 'Show 2 books', '本がふたつあります', '["Count the items", "Use the general counter", "Remember: futatsu not ni"]', 1),

-- Long objects (hon)
((SELECT id FROM grammar_patterns WHERE pattern = 'いっぽん'), 'fill_blank', 'Image: One pencil', 'Show 1 pencil', '鉛筆がいっぽんあります', '["Pencils are long objects", "Use ~hon counter", "1 becomes いっぽん"]', 2),
((SELECT id FROM grammar_patterns WHERE pattern = 'さんぼん'), 'fill_blank', 'Image: Three bottles', 'Show 3 bottles', 'びんがさんぼんあります', '["Bottles are long objects", "Use ~hon counter", "3 becomes さんぼん with voiced b"]', 2),
((SELECT id FROM grammar_patterns WHERE pattern = 'ろっぽん'), 'fill_blank', 'Image: Six umbrellas', 'Show 6 umbrellas', 'かさがろっぽんあります', '["Umbrellas are long objects", "Use ~hon counter", "6 becomes ろっぽん"]', 2),

-- Flat objects (mai)
((SELECT id FROM grammar_patterns WHERE pattern = 'いちまい'), 'fill_blank', 'Image: One sheet of paper', 'Show 1 paper', '紙がいちまいあります', '["Paper is flat", "Use ~mai counter", "No sound changes for mai!"]', 1),
((SELECT id FROM grammar_patterns WHERE pattern = 'にまい'), 'fill_blank', 'Image: Two tickets', 'Show 2 tickets', '切符がにまいあります', '["Tickets are flat", "Use ~mai counter", "Straightforward counting"]', 1),

-- Small objects (ko)
((SELECT id FROM grammar_patterns WHERE pattern = 'いっこ'), 'fill_blank', 'Image: One egg', 'Show 1 egg', 'たまごがいっこあります', '["Eggs are small objects", "Use ~ko counter", "1 becomes いっこ"]', 2),
((SELECT id FROM grammar_patterns WHERE pattern = 'ろっこ'), 'fill_blank', 'Image: Six balls', 'Show 6 balls', 'ボールがろっこあります', '["Balls are small objects", "Use ~ko counter", "6 becomes ろっこ"]', 2),

-- People (critical exceptions!)
((SELECT id FROM grammar_patterns WHERE pattern = 'ひとり'), 'fill_blank', 'Image: One person', 'Show 1 person', 'ひとりです', '["People use ~nin, BUT...", "1 person is special: hitori", "Never say ichi-nin!"]', 3),
((SELECT id FROM grammar_patterns WHERE pattern = 'ふたり'), 'fill_blank', 'Image: Two people', 'Show 2 people', 'ふたりです', '["People use ~nin, BUT...", "2 people is special: futari", "Never say ni-nin!"]', 3),
((SELECT id FROM grammar_patterns WHERE pattern = 'さんにん'), 'fill_blank', 'Image: Three students', 'Show 3 students', '学生がさんにんいます', '["From 3 onwards, use standard counting", "3 + nin = sannin", "Remember the exception stops at 2"]', 2),

-- Days of month (critical exceptions!)
((SELECT id FROM grammar_patterns WHERE pattern = 'ついたち'), 'fill_blank', 'Image: Calendar showing Jan 1', 'Show 1st', 'ついたちです', '["Days 1-10 are special", "1st is tsuitachi (completely unique)", "Not ichi-nichi!"]', 3),
((SELECT id FROM grammar_patterns WHERE pattern = 'ふつか'), 'fill_blank', 'Image: Calendar showing Feb 2', 'Show 2nd', 'ふつかです', '["2nd day uses Japanese reading", "Not ni-nichi!"]', 2),
((SELECT id FROM grammar_patterns WHERE pattern = 'みっか'), 'fill_blank', 'Image: Calendar showing March 3', 'Show 3rd', 'みっかです', '["3rd day uses mikka", "Remember the small っ"]', 2),
((SELECT id FROM grammar_patterns WHERE pattern = 'よっか'), 'fill_blank', 'Image: Calendar showing April 4', 'Show 4th', 'よっかです', '["4th day uses yokka", "Same for 14th and 24th!"]', 2),
((SELECT id FROM grammar_patterns WHERE pattern = 'はつか'), 'fill_blank', 'Image: Calendar showing 20th', 'Show 20th', 'はつかです', '["20th is special: hatsuka", "Not ni-juu-nichi!"]', 3),
((SELECT id FROM grammar_patterns WHERE pattern = 'じゅうよっか'), 'fill_blank', 'Image: Calendar showing 14th', 'Show 14th', 'じゅうよっかです', '["14th reverts to yokka", "Not juu-yon-nichi!"]', 3),

-- Minutes
((SELECT id FROM grammar_patterns WHERE pattern = 'いっぷん'), 'fill_blank', 'Image: Clock showing 1 minute', 'Show 1 min', 'いっぷんです', '["Minutes use ~fun", "BUT 1, 3, 6, 8, 10 change to ~pun", "1 becomes いっぷん"]', 2),
((SELECT id FROM grammar_patterns WHERE pattern = 'さんぷん'), 'fill_blank', 'Image: Clock showing 3 minutes', 'Show 3 min', 'さんぷんです', '["3 minutes becomes sanpun", "Voiced p sound"]', 2),

-- Age
((SELECT id FROM grammar_patterns WHERE pattern = 'はたち'), 'fill_blank', 'Image: 20th birthday', 'Show age 20', 'はたちです', '["Ages use ~sai", "BUT 20 is special: hatachi", "Never say ni-juu-sai!"]', 3),
((SELECT id FROM grammar_patterns WHERE pattern = 'いっさい'), 'fill_blank', 'Image: 1 year old baby', 'Show age 1', 'いっさいです', '["1 year old is issai", "1 + sai becomes issai"]', 2);

-- ============================================
-- EXERCISE TYPE 3: Construction (Build the sentence)
-- ============================================

INSERT INTO grammar_exercises (pattern_id, type, prompt, context, correct_answer, hints, difficulty) VALUES
-- Construction exercises for sandhi patterns
((SELECT id FROM grammar_patterns WHERE pattern = 'いっぽん'), 'construction', 'Build: 1 pencil', 'Components: 鉛筆, が, いっぽん, あります', '鉛筆がいっぽんあります', '["Subject first", "Counter comes after particle ga", "Remember: ippon not ichi-hon"]', 2),
((SELECT id FROM grammar_patterns WHERE pattern = 'さんぼん'), 'construction', 'Build: 3 bottles', 'Components: びん, が, さんぼん, あります', 'びんがさんぼんあります', '["Subject first", "3 + hon becomes sanbon (voiced)"]', 2),
((SELECT id FROM grammar_patterns WHERE pattern = 'ろっぽん'), 'construction', 'Build: 6 umbrellas', 'Components: かさ, が, ろっぽん, あります', 'かさがろっぽんあります', '["6 + hon becomes roppon", "Double change: ろく→ろっ + ほ→ぽ"]', 3),

-- Construction for people
((SELECT id FROM grammar_patterns WHERE pattern = 'ひとり'), 'construction', 'Build: 1 person', 'Components: ひとり, が, います', 'ひとりがいます', '["No number + nin!", "Hitori is the complete word"]', 3),
((SELECT id FROM grammar_patterns WHERE pattern = 'さんにん'), 'construction', 'Build: 3 students', 'Components: 学生, が, さんにん, います', '学生がさんにんいます', '["From 3, use standard counting", "Student = gakusei"]', 2);

-- ============================================
-- EXERCISE TYPE 4: Transformation (Change the number)
-- ============================================

INSERT INTO grammar_exercises (pattern_id, type, prompt, context, correct_answer, hints, difficulty) VALUES
-- Transform: singular to plural
((SELECT id FROM grammar_patterns WHERE pattern = 'ふたつ'), 'transformation', 'Change: りんごがひとつあります → 2 apples', 'Make plural', 'りんごがふたつあります', '["Change hitotsu to futatsu", "Everything else stays the same"]', 1),
((SELECT id FROM grammar_patterns WHERE pattern = 'さんぼん'), 'transformation', 'Change: 鉛筆がにほんあります → 3 pencils', 'Change number', '鉛筆がさんぼんあります', '["2 = nihon, 3 = sanbon", "Remember the voiced b for 3"]', 2),
((SELECT id FROM grammar_patterns WHERE pattern = 'ろっぽん'), 'transformation', 'Change: びんがさんぼんあります → 6 bottles', 'Change number', 'びんがろっぽんあります', '["6 + hon = roppon", "Both consonant changes!"]', 3),

-- Transform: standard to exception
((SELECT id FROM grammar_patterns WHERE pattern = 'ひとり'), 'transformation', 'Change: 学生がさんにんいます → 1 student', 'Change to 1', '学生がひとりいます', '["From 3 to 1 requires EXCEPTION", "1 person = hitori (never ichi-nin!)"]', 3),
((SELECT id FROM grammar_patterns WHERE pattern = 'ふたり'), 'transformation', 'Change: 先生がさんにんいます → 2 teachers', 'Change to 2', '先生がふたりいます', '["2 people = futari (never ni-nin!)"]', 3);

-- ============================================
-- EXERCISE TYPE 5: Question/Answer
-- ============================================

INSERT INTO grammar_exercises (pattern_id, type, prompt, context, correct_answer, hints, difficulty) VALUES
-- Question forms
((SELECT id FROM grammar_patterns WHERE pattern = 'なんぼん'), 'fill_blank', 'Question: How many pencils?', 'Show pencils, ask quantity', '鉛筆がなんぼんありますか', '["How many = nan", "Long objects use ~hon", "Question form uses nanbon (voiced)"]', 2),
((SELECT id FROM grammar_patterns WHERE pattern = 'なんまい'), 'fill_blank', 'Question: How many sheets?', 'Show papers, ask quantity', '紙がなんまいありますか', '["How many = nan", "Flat objects use ~mai", "No sound changes!"]', 1),
((SELECT id FROM grammar_patterns WHERE pattern = 'なんにん'), 'fill_blank', 'Question: How many people?', 'Show group, ask quantity', '人がなんにんいますか', '["How many people = nannin", "Standard from 3 onwards"]', 2),
((SELECT id FROM grammar_patterns WHERE pattern = 'なんにち'), 'fill_blank', 'Question: What day is today?', 'Show calendar', 'きょうはなんにちですか', '["What day = nan-nichi", "Standard question form"]', 1);
