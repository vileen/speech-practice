-- Add common compound minute counters
INSERT INTO grammar_patterns (pattern, base_form, category, jlpt_level, formation_rules, examples, common_mistakes) VALUES
('じゅうごふん', '〜分', 'Counters', 'N5',
 '[{"step": 1, "rule": "15 minutes - 10 changes (じゅっ) but 5 stays standard (ごふん)", "counts": "minutes"}]',
 '[{"jp": "じゅうごふん", "en": "15 minutes", "romaji": "juugofun"}]',
 '[{"mistake": "じゅっごふん", "explanation": "Only the 10s place changes: juugo-fun (not juggofun)"}]'),

('にじゅっぷん', '〜分', 'Counters', 'N5',
 '[{"step": 1, "rule": "20 minutes - 10 changes to じゅっ + ぷん", "counts": "minutes"}]',
 '[{"jp": "にじゅっぷん", "en": "20 minutes", "romaji": "nijuppun"}]',
 '[{"mistake": "にじゅうふん", "explanation": "20 + fun becomes nijuppun (juu → ju)"}]'),

('さんじゅっぷん', '〜分', 'Counters', 'N5',
 '[{"step": 1, "rule": "30 minutes - 10 changes to じゅっ + ぷん", "counts": "minutes"}]',
 '[{"jp": "さんじゅっぷん", "en": "30 minutes", "romaji": "sanjuppun"}]',
 '[{"mistake": "さんじゅうふん", "explanation": "30 + fun becomes sanjuppun (juu → ju)"}]'),

('よんじゅっぷん', '〜分', 'Counters', 'N5',
 '[{"step": 1, "rule": "40 minutes - 10 changes to じゅっ + ぷん", "counts": "minutes"}]',
 '[{"jp": "よんじゅっぷん", "en": "40 minutes", "romaji": "yonjuppun"}]',
 '[{"mistake": "よんじゅうふん", "explanation": "40 + fun becomes yonjuppun (juu → ju)"}]'),

('ごじゅっぷん', '〜分', 'Counters', 'N5',
 '[{"step": 1, "rule": "50 minutes - 10 changes to じゅっ + ぷん", "counts": "minutes"}]',
 '[{"jp": "ごじゅっぷん", "en": "50 minutes", "romaji": "gojuppun"}]',
 '[{"mistake": "ごじゅうふん", "explanation": "50 + fun becomes gojuppun (juu → ju)"}]'),

('ろくじゅっぷん', '〜分', 'Counters', 'N5',
 '[{"step": 1, "rule": "60 minutes - 10 changes to じゅっ + ぷん", "counts": "minutes"}]',
 '[{"jp": "ろくじゅっぷん", "en": "60 minutes", "romaji": "rokujuppun"}]',
 '[{"mistake": "ろくじゅうふん", "explanation": "60 + fun becomes rokujuppun (juu → ju)"}]'),

('ひゃっぷん', '〜分', 'Counters', 'N5',
 '[{"step": 1, "rule": "100 minutes - ひゃく becomes ひゃっ + ぷん", "counts": "minutes"}]',
 '[{"jp": "ひゃっぷん", "en": "100 minutes", "romaji": "hyappun"}]',
 '[{"mistake": "ひゃくふん", "explanation": "100 + fun becomes hyappun (hyaku → hya)"}]');

-- Add exercises for new minutes (fill_blank + error_correction)
INSERT INTO grammar_exercises (pattern_id, type, prompt, context, correct_answer, hints, difficulty) VALUES

-- 15 minutes
((SELECT id FROM grammar_patterns WHERE pattern = 'じゅうごふん'), 'fill_blank', '15 minutes', 'Count minutes', 'じゅうごふん', '["10 changes, 5 stays standard", "15 = juugo + fun", "Only the 10s place has sandhi"]', 2),

-- 20 minutes (exception: 10 changes in compounds too)
((SELECT id FROM grammar_patterns WHERE pattern = 'にじゅっぷん'), 'fill_blank', '20 minutes', 'Count minutes', 'にじゅっぷん', '["20 + fun = ni-juppun", "The 10 in 20 also changes", "Exception: compounds follow same rule"]', 3),

-- 30 minutes
((SELECT id FROM grammar_patterns WHERE pattern = 'さんじゅっぷん'), 'fill_blank', '30 minutes', 'Count minutes', 'さんじゅっぷん', '["30 + fun = san-juppun", "The 10 in 30 also changes", "Remember: 3 is sanpun, 30 is sanjuppun"]', 3),

-- 40 minutes
((SELECT id FROM grammar_patterns WHERE pattern = 'よんじゅっぷん'), 'fill_blank', '40 minutes', 'Count minutes', 'よんじゅっぷん', '["40 + fun = yon-juppun", "The 10 in 40 also changes", "4 stays yon, only 10 changes"]', 2),

-- 50 minutes
((SELECT id FROM grammar_patterns WHERE pattern = 'ごじゅっぷん'), 'fill_blank', '50 minutes', 'Count minutes', 'ごじゅっぷん', '["50 + fun = go-juppun", "The 10 in 50 also changes", "5 stays go, only 10 changes"]', 2),

-- 60 minutes
((SELECT id FROM grammar_patterns WHERE pattern = 'ろくじゅっぷん'), 'fill_blank', '60 minutes', 'Count minutes', 'ろくじゅっぷん', '["60 + fun = roku-juppun", "The 10 in 60 also changes", "Compare: 6 min = roppun, 60 min = rokujuppun"]', 3),

-- 100 minutes
((SELECT id FROM grammar_patterns WHERE pattern = 'ひゃっぷん'), 'fill_blank', '100 minutes', 'Count minutes', 'ひゃっぷん', '["100 + fun = hyappun", "Same rule as 本/個 counters", "hyaku → hya (っぷん)"]', 2);

-- Error correction exercises for compound minute exceptions
INSERT INTO grammar_exercises (pattern_id, type, prompt, context, correct_answer, hints, difficulty)
SELECT
  gp.id,
  'error_correction',
  'Which is correct: ' || cm.mistake || ' or ' || gp.pattern || '?',
  'Minutes: ' || gp.pattern,
  gp.pattern,
  '["Think about compound sandhi rules", "10 changes to じゅっ in compounds", "Remember: 20, 30, 40, 50, 60 all change"]'::jsonb,
  3
FROM grammar_patterns gp
CROSS JOIN LATERAL jsonb_to_recordset(gp.common_mistakes) AS cm(mistake text, explanation text)
WHERE gp.base_form = '〜分'
AND gp.pattern IN ('にじゅっぷん', 'さんじゅっぷん', 'よんじゅっぷん', 'ごじゅっぷん', 'ろくじゅっぷん', 'ひゃっぷん')
AND jsonb_array_length(gp.common_mistakes) > 0;
