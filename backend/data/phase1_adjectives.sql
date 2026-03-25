-- Phase 1: I-Adjective and Na-Adjective Grammar Patterns
-- Generated for speech-practice Phase 1 expansion

-- =====================================================
-- I-ADJECTIVE PATTERNS (8 patterns)
-- =====================================================

INSERT INTO grammar_patterns (pattern, category, jlpt_level, formation_rules, examples, common_mistakes) VALUES
('い→くて (connecting form)', 'I-Adjectives', 'N5',
 '{"formation": "Adjective stem (drop い) + くて", "meaning": "And, Connects adjectives"}'::jsonb,
 '[{"japanese": "この本は安くて面白い。", "romaji": "Kono hon wa yasukute omoshiroi.", "meaning": "This book is cheap and interesting."}, {"japanese": "高くて美味しい。", "romaji": "Takakute oishii.", "meaning": "Expensive and delicious."}]'::jsonb,
 '[{"mistake": "Adding い before くて", "correction": "Drop い completely: 高い→高くて", "explanation": "い-adjectives drop the final い before くて"}]'::jsonb
),
('い→くない (negative)', 'I-Adjectives', 'N5',
 '{"formation": "Adjective stem (drop い) + くない", "meaning": "Not ~"}'::jsonb,
 '[{"japanese": "この映画は面白くない。", "romaji": "Kono eiga wa omoshirokunai.", "meaning": "This movie is not interesting."}, {"japanese": "今日は寒くないです。", "romaji": "Kyou wa samukunai desu.", "meaning": "It is not cold today."}]'::jsonb,
 '[{"mistake": "Using じゃない with i-adjectives", "correction": "Use くない for i-adjectives", "explanation": "I-adjectives conjugate with くない, not じゃない"}]'::jsonb
),
('い→くなかった (past negative)', 'I-Adjectives', 'N5',
 '{"formation": "Adjective stem (drop い) + くなかった", "meaning": "Was not ~"}'::jsonb,
 '[{"japanese": "昨日は暑くなかった。", "romaji": "Kinou wa atsukunakatta.", "meaning": "Yesterday was not hot."}, {"japanese": "試験は難しくなかったです。", "romaji": "Shiken wa muzukashikunakatta desu.", "meaning": "The exam was not difficult."}]'::jsonb,
 '[{"mistake": "Using くないでした", "correction": "Use くなかった (past form of くない)", "explanation": "ない conjugates like an i-adjective"}]'::jsonb
),
('い→かった (past)', 'I-Adjectives', 'N5',
 '{"formation": "Adjective stem (drop い) + かった", "meaning": "Was ~"}'::jsonb,
 '[{"japanese": "昨日は楽しかった。", "romaji": "Kinou wa tanoshikatta.", "meaning": "Yesterday was fun."}, {"japanese": "子供の頃は元気だった。", "romaji": "Kodomo no koro wa genki datta.", "meaning": "I was energetic as a child."}]'::jsonb,
 '[{"mistake": "Adding い before かった", "correction": "Drop い: 楽しい→楽しかった", "explanation": "Past tense drops い and adds かった"}]'::jsonb
),
('い→く (adverb)', 'I-Adjectives', 'N5',
 '{"formation": "Adjective stem (drop い) + く", "meaning": "~ly (adverb form)"}'::jsonb,
 '[{"japanese": "早く行きましょう。", "romaji": "Hayaku ikimashou.", "meaning": "Let\'s go quickly."}, {"japanese": "大きく書いてください。", "romaji": "Ookiku kaite kudasai.", "meaning": "Please write big/large."}]'::jsonb,
 '[{"mistake": "Using い form as adverb", "correction": "Change to く form for adverbs", "explanation": "早い(adjective)→早く(adverb)"}]'::jsonb
),
('い→すぎる (excess)', 'I-Adjectives', 'N4',
 '{"formation": "Adjective stem (drop い) + すぎる", "meaning": "Too ~, Excessively ~"}'::jsonb,
 '[{"japanese": "このケーキは甘すぎる。", "romaji": "Kono keeki wa amasugiru.", "meaning": "This cake is too sweet."}, {"japanese": "高すぎて買えない。", "romaji": "Takasugite kaenai.", "meaning": "Too expensive to buy."}]'::jsonb,
 '[{"mistake": "Keeping い before すぎる", "correction": "Drop い: 高い→高すぎる", "explanation": "すぎる attaches to the stem without い"}]'::jsonb
),
('い→くなる (become)', 'I-Adjectives', 'N4',
 '{"formation": "Adjective stem (drop い) + くなる", "meaning": "Become ~"}'::jsonb,
 '[{"japanese": "春になったら暖かくなる。", "romaji": "Haru ni nattara atatakaku naru.", "meaning": "It will become warm when spring comes."}, {"japanese": "日本語が上手くなりたい。", "romaji": "Nihongo ga umaku naritai.", "meaning": "I want to become good at Japanese."}]'::jsonb,
 '[{"mistake": "Using になる directly", "correction": "Use くなる for i-adjectives", "explanation": "I-adjectives use く, not だ/になる"}]'::jsonb
),
('い→さ (nominalization)', 'I-Adjectives', 'N4',
 '{"formation": "Adjective stem (drop い) + さ", "meaning": "~ness (noun form)"}'::jsonb,
 '[{"japanese": "高さはどのくらいですか。", "romaji": "Takasa wa dono kurai desu ka.", "meaning": "How much is the height?"}, {"japanese": "深さを測る。", "romaji": "Fukasa wo hakaru.", "meaning": "To measure the depth."}]'::jsonb,
 '[{"mistake": "Using み instead of さ", "correction": "さ for objective measurement", "explanation": "さ turns adjective into measurable noun"}]'::jsonb
);

-- =====================================================
-- NA-ADJECTIVE PATTERNS (7 patterns)
-- =====================================================

INSERT INTO grammar_patterns (pattern, category, jlpt_level, formation_rules, examples, common_mistakes) VALUES
('だ→で (connecting form)', 'Na-Adjectives', 'N5',
 '{"formation": "Adjective + で", "meaning": "And, Connects adjectives"}'::jsonb,
 '[{"japanese": "彼は親切で優しいです。", "romaji": "Kare wa shinsetsu de yasashii desu.", "meaning": "He is kind and gentle."}, {"japanese": "静かで綺麗な場所。", "romaji": "Shizuka de kirei na basho.", "meaning": "A quiet and clean place."}]'::jsonb,
 '[{"mistake": "Using くて with na-adjectives", "correction": "Use で for na-adjectives", "explanation": "Na-adjectives use で, not くて"}]'::jsonb
),
('だ→じゃない (negative)', 'Na-Adjectives', 'N5',
 '{"formation": "Adjective + じゃない / ではない", "meaning": "Not ~"}'::jsonb,
 '[{"japanese": "この町は便利じゃない。", "romaji": "Kono machi wa benri ja nai.", "meaning": "This town is not convenient."}, {"japanese": "簡単じゃないです。", "romaji": "Kantan ja nai desu.", "meaning": "It is not simple."}]'::jsonb,
 '[{"mistake": "Using くない with na-adjectives", "correction": "Use じゃない for na-adjectives", "explanation": "Na-adjectives use じゃない, not くない"}]'::jsonb
),
('だ→じゃなかった (past negative)', 'Na-Adjectives', 'N5',
 '{"formation": "Adjective + じゃなかった / ではなかった", "meaning": "Was not ~"}'::jsonb,
 '[{"japanese": "昨日は暇じゃなかった。", "romaji": "Kinou wa hima ja nakatta.", "meaning": "Yesterday was not free."}, {"japanese": "元気じゃなかったです。", "romaji": "Genki ja nakatta desu.", "meaning": "I was not feeling well."}]'::jsonb,
 '[]'::jsonb
),
('だ→だった (past)', 'Na-Adjectives', 'N5',
 '{"formation": "Adjective + だった", "meaning": "Was ~"}'::jsonb,
 '[{"japanese": "昔は有名だった。", "romaji": "Mukashi wa yuumei datta.", "meaning": "I was famous in the past."}, {"japanese": "学生時代は暇だった。", "romaji": "Gakusei jidai wa hima datta.", "meaning": "I had free time as a student."}]'::jsonb,
 '[{"mistake": "Using でした after adjective directly", "correction": "だった (past of だ)", "explanation": "だった is the casual past of だ"}]'::jsonb
),
('だ→に (adverb)', 'Na-Adjectives', 'N5',
 '{"formation": "Adjective + に", "meaning": "~ly (adverb form)"}'::jsonb,
 '[{"japanese": "静かにしてください。", "romaji": "Shizuka ni shite kudasai.", "meaning": "Please be quiet."}, {"japanese": "元気に過ごしていますか。", "romaji": "Genki ni sugoshite imasu ka.", "meaning": "Are you living energetically?"}]'::jsonb,
 '[{"mistake": "Using く form", "correction": "Use に for na-adjectives", "explanation": "Na-adjectives become adverbs with に"}]'::jsonb
),
('だ→すぎる (excess)', 'Na-Adjectives', 'N4',
 '{"formation": "Adjective + すぎる", "meaning": "Too ~"}'::jsonb,
 '[{"japanese": "彼は真面目すぎる。", "romaji": "Kare wa majime sugiru.", "meaning": "He is too serious."}, {"japanese": "便利すぎて手放せない。", "romaji": "Benri sugite tebanasenai.", "meaning": "Too convenient to let go."}]'::jsonb,
 '[{"mistake": "Using で before すぎる", "correction": "Attach directly: 便利すぎる", "explanation": "すぎる attaches directly to na-adjective"}]'::jsonb
),
('だ→になる (become)', 'Na-Adjectives', 'N4',
 '{"formation": "Adjective + になる", "meaning": "Become ~"}'::jsonb,
 '[{"japanese": "日本語が上手になる。", "romaji": "Nihongo ga jouzu ni naru.", "meaning": "Japanese will become good."}, {"japanese": "毎日が楽しくなる。", "romaji": "Mainichi ga tanoshiku naru.", "meaning": "Every day becomes fun."}]'::jsonb,
 '[{"mistake": "Using くなる", "correction": "Use になる for na-adjectives", "explanation": "Na-adjectives use に, i-adjectives use く"}]'::jsonb
);

-- Note: Add exercises after pattern insertion:
-- INSERT INTO grammar_exercises (pattern_id, type, question, options, correct_answer, explanation)
-- SELECT id, 'recognition', 'Which is the correct connecting form of 高い?', 
--        '["高いで", "高くて", "高だって"]'::jsonb, '高くて',
--        'I-adjectives drop い and add くて'
-- FROM grammar_patterns WHERE pattern = 'い→くて (connecting form)';
