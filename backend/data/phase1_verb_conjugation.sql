-- Phase 1: Additional Verb Conjugation Patterns
-- Generated for speech-practice Phase 1 expansion

-- =====================================================
-- ADDITIONAL VERB CONJUGATION PATTERNS (10 patterns)
-- =====================================================

INSERT INTO grammar_patterns (pattern, category, jlpt_level, formation_rules, examples, common_mistakes) VALUES
('Godan: つ→って', 'Verb Conjugation', 'N5',
 '{"formation": "Godan verb ending in つ → change to って", "meaning": "TE-form for tsu-verbs"}'::jsonb,
 '[{"japanese": "待つ→待って", "romaji": "Matsu → matte", "meaning": "Wait → wait (and)"}, {"japanese": "待っています。", "romaji": "Matte imasu.", "meaning": "I am waiting."}]'::jsonb,
 '[{"mistake": "つ→て instead of って", "correction": "Must change to small tsu (っ)", "explanation": "つ becomes って with small tsu"}]'::jsonb
),
('Godan: る→って', 'Verb Conjugation', 'N5',
 '{"formation": "Godan verb ending in る → change to って", "meaning": "TE-form for ru-verbs (Godan)"}'::jsonb,
 '[{"japanese": "帰る→帰って", "romaji": "Kaeru → kaette", "meaning": "Return → return (and)"}, {"japanese": "帰ってきました。", "romaji": "Kaette kimashita.", "meaning": "I came back."}]'::jsonb,
 '[{"mistake": "Confusing with Ichidan る→て", "correction": "Godan る-verbs become って, not て", "explanation": "帰る(Godan)→帰って, 食べる(Ichidan)→食べて"}]'::jsonb
),
('Godan: む→んで', 'Verb Conjugation', 'N5',
 '{"formation": "Godan verb ending in む → change to んで", "meaning": "TE-form for mu-verbs"}'::jsonb,
 '[{"japanese": "読む→読んで", "romaji": "Yomu → yonde", "meaning": "Read → read (and)"}, {"japanese": "本を読んでいます。", "romaji": "Hon wo yonde imasu.", "meaning": "I am reading a book."}]'::jsonb,
 '[]'::jsonb
),
('Godan: る→らない', 'Verb Conjugation', 'N5',
 '{"formation": "Godan verb ending in る → change to らない", "meaning": "Nai-form for ru-verbs (Godan)"}'::jsonb,
 '[{"japanese": "帰る→帰らない", "romaji": "Kaeru → kaeranai", "meaning": "Return → not return"}, {"japanese": "今日は帰らない。", "romaji": "Kyou wa kaeranai.", "meaning": "I won\'t go home today."}]'::jsonb,
 '[{"mistake": "Confusing with Ichidan る→ない", "correction": "Godan る-verbs become らない", "explanation": "帰る→帰らない, 食べる→食べない"}]'::jsonb
),
('Godan: う→わない', 'Verb Conjugation', 'N5',
 '{"formation": "Godan verb ending in う → change to わない", "meaning": "Nai-form for u-verbs"}'::jsonb,
 '[{"japanese": "買う→買わない", "romaji": "Kau → kawanai", "meaning": "Buy → not buy"}, {"japanese": "買わないでください。", "romaji": "Kawanaide kudasai.", "meaning": "Please don\'t buy."}]'::jsonb,
 '[{"mistake": "う→あない", "correction": "う becomes わ, not just あ", "explanation": "Special rule: 買う→買わない (wa, not a)"}]'::jsonb
),
('Ichidan: る→ろ', 'Verb Conjugation', 'N5',
 '{"formation": "Ichidan verb ending in る → change to ろ", "meaning": "Imperative form"}'::jsonb,
 '[{"japanese": "食べる→食べろ", "romaji": "Taberu → tabero", "meaning": "Eat → eat! (command)"}, {"japanese": "見ろ！", "romaji": "Miro!", "meaning": "Look!"}]'::jsonb,
 '[{"mistake": "Using with strangers/superiors", "correction": "Use polite forms for strangers", "explanation": "Imperative is rude in most contexts"}]'::jsonb
),
('Dictionary → Conditional (えば)', 'Verb Conjugation', 'N4',
 '{"formation": "Godan: change to え-row + ば, Ichidan: れば", "meaning": "If ~, Conditional form"}'::jsonb,
 '[{"japanese": "行く→行けば", "romaji": "Iku → ikeba", "meaning": "Go → if go"}, {"japanese": "食べる→食べれば", "romaji": "Taberu → tabereba", "meaning": "Eat → if eat"}, {"japanese": "行けば分かります。", "romaji": "Ikeba wakarimasu.", "meaning": "You\'ll understand if you go."}]'::jsonb,
 '[{"mistake": "Godan verbs not changing to え-row", "correction": "買う→買えば, 待つ→待てば", "explanation": "Must change final kana to え-row"}]'::jsonb
),
('Dictionary → Potential (える/られる)', 'Verb Conjugation', 'N4',
 '{"formation": "Godan: え-row + る, Ichidan: られる", "meaning": "Can do ~, Potential form"}'::jsonb,
 '[{"japanese": "読む→読める", "romaji": "Yomu → yomeru", "meaning": "Read → can read"}, {"japanese": "食べる→食べられる", "romaji": "Taberu → taberareru", "meaning": "Eat → can eat"}, {"japanese": "漢字が読めます。", "romaji": "Kanji ga yomemasu.", "meaning": "I can read kanji."}]'::jsonb,
 '[{"mistake": "Using を with potential form", "correction": "Use が with potential verbs", "explanation": "漢字が読める (not を読める)"}]'::jsonb
),
('Dictionary → Passive (れる/られる)', 'Verb Conjugation', 'N4',
 '{"formation": "Godan: あ-row + れる, Ichidan: られる", "meaning": "Is/was ~ed, Passive form"}'::jsonb,
 '[{"japanese": "言う→言われる", "romaji": "Iu → iwareru", "meaning": "Say → is said"}, {"japanese": "褒められる。", "romaji": "Homerareru.", "meaning": "To be praised."}, {"japanese": "先生に褒められました。", "romaji": "Sensei ni homeraremashita.", "meaning": "I was praised by the teacher."}]'::jsonb,
 '[{"mistake": "Same form for Ichidan potential and passive", "correction": "Context determines meaning", "explanation": "食べられる = can eat OR is eaten"}]'::jsonb
),
('Dictionary → Causative (せる/させる)', 'Verb Conjugation', 'N4',
 '{"formation": "Godan: あ-row + せる, Ichidan: させる", "meaning": "Make/let someone do ~, Causative form"}'::jsonb,
 '[{"japanese": "食べる→食べさせる", "romaji": "Taberu → tabesaseru", "meaning": "Eat → make/let eat"}, {"japanese": "子供に野菜を食べさせる。", "romaji": "Kodomo ni yasai wo tabesaseru.", "meaning": "I make my child eat vegetables."}, {"japanese": "行かせてください。", "romaji": "Ikasete kudasai.", "meaning": "Please let me go."}]'::jsonb,
 '[{"mistake": "Confusing with passive", "correction": "Causative = せる/させる, Passive = れる/られる", "explanation": "Different endings for different meanings"}]'::jsonb
);

-- Note: Add exercises after pattern insertion:
-- INSERT INTO grammar_exercises (pattern_id, type, question, options, correct_answer, explanation)
-- SELECT id, 'construction', 'Change 待つ to TE-form',
--        '["待て", "待って", "待てて"]'::jsonb, '待って',
--        'つ-verbs change to って with small tsu'
-- FROM grammar_patterns WHERE pattern = 'Godan: つ→って';
