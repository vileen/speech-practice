-- Phase 1: Pattern Relationships
-- Links patterns for the Pattern Graph visualization

-- Note: Run this AFTER inserting the grammar patterns above
-- This creates relationships between similar/opposite/related patterns

-- =====================================================
-- SIMILAR RELATIONSHIPS (interchangeable/similar meaning)
-- =====================================================

-- Permission patterns are similar to each other
INSERT INTO pattern_relationships (from_pattern_id, to_pattern_id, relationship_type, strength, description)
SELECT 
  p1.id, p2.id, 'similar', 0.9,
  'Both express permission; かまいません is more formal'
FROM grammar_patterns p1, grammar_patterns p2
WHERE p1.pattern = '〜てもいいです' AND p2.pattern = '〜てもかまいません';

INSERT INTO pattern_relationships (from_pattern_id, to_pattern_id, relationship_type, strength, description)
SELECT 
  p1.id, p2.id, 'similar', 0.85,
  'Both express permission; 大丈夫 is slightly more casual'
FROM grammar_patterns p1, grammar_patterns p2
WHERE p1.pattern = '〜てもいいです' AND p2.pattern = '〜ても大丈夫です';

INSERT INTO pattern_relationships (from_pattern_id, to_pattern_id, relationship_type, strength, description)
SELECT 
  p1.id, p2.id, 'similar', 0.95,
  'Very similar meaning, よろしい is more polite'
FROM grammar_patterns p1, grammar_patterns p2
WHERE p1.pattern = '〜てもいいです' AND p2.pattern = '〜てもよろしいでしょうか';

-- Prohibition patterns
INSERT INTO pattern_relationships (from_pattern_id, to_pattern_id, relationship_type, strength, description)
SELECT 
  p1.id, p2.id, 'similar', 0.8,
  'Both mean prohibition; だめ is more casual'
FROM grammar_patterns p1, grammar_patterns p2
WHERE p1.pattern = '〜てはいけません' AND p2.pattern = '〜てはだめです';

INSERT INTO pattern_relationships (from_pattern_id, to_pattern_id, relationship_type, strength, description)
SELECT 
  p1.id, p2.id, 'similar', 0.85,
  'Similar prohibition; なりません is more formal/written'
FROM grammar_patterns p1, grammar_patterns p2
WHERE p1.pattern = '〜てはいけません' AND p2.pattern = '〜てはなりません';

-- Obligation patterns
INSERT INTO pattern_relationships (from_pattern_id, to_pattern_id, relationship_type, strength, description)
SELECT 
  p1.id, p2.id, 'similar', 0.9,
  'Both express strong obligation, slight nuance difference'
FROM grammar_patterns p1, grammar_patterns p2
WHERE p1.pattern = '〜なければなりません' AND p2.pattern = '〜なければいけません';

INSERT INTO pattern_relationships (from_pattern_id, to_pattern_id, relationship_type, strength, description)
SELECT 
  p1.id, p2.id, 'similar', 0.85,
  'Alternative forms; なくては is more formal/written'
FROM grammar_patterns p1, grammar_patterns p2
WHERE p1.pattern = '〜なければなりません' AND p2.pattern = '〜なくてはなりません';

INSERT INTO pattern_relationships (from_pattern_id, to_pattern_id, relationship_type, strength, description)
SELECT 
  p1.id, p2.id, 'similar', 0.8,
  'Casual conversational obligation forms'
FROM grammar_patterns p1, grammar_patterns p2
WHERE p1.pattern = '〜ないとだめです' AND p2.pattern = '〜ないといけません';

-- Lack of obligation
INSERT INTO pattern_relationships (from_pattern_id, to_pattern_id, relationship_type, strength, description)
SELECT 
  p1.id, p2.id, 'similar', 0.9,
  'Both mean lack of obligation; かまいません is more formal'
FROM grammar_patterns p1, grammar_patterns p2
WHERE p1.pattern = '〜なくてもいいです' AND p2.pattern = '〜なくてもかまいません';

-- =====================================================
-- OPPOSITE RELATIONSHIPS (opposite meanings)
-- =====================================================

-- Permission vs Prohibition
INSERT INTO pattern_relationships (from_pattern_id, to_pattern_id, relationship_type, strength, description)
SELECT 
  p1.id, p2.id, 'opposite', 1.0,
  'Direct opposites: permission vs prohibition'
FROM grammar_patterns p1, grammar_patterns p2
WHERE p1.pattern = '〜てもいいです' AND p2.pattern = '〜てはいけません';

INSERT INTO pattern_relationships (from_pattern_id, to_pattern_id, relationship_type, strength, description)
SELECT 
  p1.id, p2.id, 'opposite', 0.95,
  'Permission vs prohibition (polite forms)'
FROM grammar_patterns p1, grammar_patterns p2
WHERE p1.pattern = '〜てもかまいません' AND p2.pattern = '〜てはなりません';

-- Obligation vs Lack of Obligation
INSERT INTO pattern_relationships (from_pattern_id, to_pattern_id, relationship_type, strength, description)
SELECT 
  p1.id, p2.id, 'opposite', 1.0,
  'Direct opposites: must do vs don\'t have to do'
FROM grammar_patterns p1, grammar_patterns p2
WHERE p1.pattern = '〜なければなりません' AND p2.pattern = '〜なくてもいいです';

INSERT INTO pattern_relationships (from_pattern_id, to_pattern_id, relationship_type, strength, description)
SELECT 
  p1.id, p2.id, 'opposite', 0.95,
  'Obligation vs lack of obligation (alternative forms)'
FROM grammar_patterns p1, grammar_patterns p2
WHERE p1.pattern = '〜なければいけません' AND p2.pattern = '〜なくてもかまいません';

-- I-adjective affirmative vs negative
INSERT INTO pattern_relationships (from_pattern_id, to_pattern_id, relationship_type, strength, description)
SELECT 
  p1.id, p2.id, 'opposite', 0.9,
  'Positive and negative forms of i-adjectives'
FROM grammar_patterns p1, grammar_patterns p2
WHERE p1.pattern = 'い→かった (past)' AND p2.pattern = 'い→くなかった (past negative)';

-- Na-adjective affirmative vs negative
INSERT INTO pattern_relationships (from_pattern_id, to_pattern_id, relationship_type, strength, description)
SELECT 
  p1.id, p2.id, 'opposite', 0.9,
  'Positive and negative forms of na-adjectives'
FROM grammar_patterns p1, grammar_patterns p2
WHERE p1.pattern = 'だ→だった (past)' AND p2.pattern = 'だ→じゃなかった (past negative)';

-- =====================================================
-- CONFUSED RELATIONSHIPS (commonly mixed up)
-- =====================================================

-- Particles: に vs で location
INSERT INTO pattern_relationships (from_pattern_id, to_pattern_id, relationship_type, strength, description)
SELECT 
  p1.id, p2.id, 'confused', 0.95,
  'Commonly confused: に = destination, で = location of action'
FROM grammar_patterns p1, grammar_patterns p2
WHERE p1.pattern = 'に (location/target)' AND p2.pattern = 'で (location of action)';

-- は vs が
INSERT INTO pattern_relationships (from_pattern_id, to_pattern_id, relationship_type, strength, description)
SELECT 
  p1.id, p2.id, 'confused', 0.9,
  'Most confusing particles: は = topic, が = subject'
FROM grammar_patterns p1, grammar_patterns p2
WHERE p1.pattern = 'は vs が (contrastive は)' AND p2.pattern = 'に (location/target)';  -- Adjust based on actual patterns

-- Godan vs Ichidan TE-form
INSERT INTO pattern_relationships (from_pattern_id, to_pattern_id, relationship_type, strength, description)
SELECT 
  p1.id, p2.id, 'confused', 0.85,
  'Godan る-verbs end in って, Ichidan in て'
FROM grammar_patterns p1, grammar_patterns p2
WHERE p1.pattern = 'Godan: る→って' AND p2.pattern = 'Ichidan: る→て';

-- Godan vs Ichidan NAI-form
INSERT INTO pattern_relationships (from_pattern_id, to_pattern_id, relationship_type, strength, description)
SELECT 
  p1.id, p2.id, 'confused', 0.85,
  'Godan る-verbs end in らない, Ichidan in ない'
FROM grammar_patterns p1, grammar_patterns p2
WHERE p1.pattern = 'Godan: る→らない' AND p2.pattern = 'Ichidan: る→ない';

-- Potential vs Passive (Ichidan)
INSERT INTO pattern_relationships (from_pattern_id, to_pattern_id, relationship_type, strength, description)
SELECT 
  p1.id, p2.id, 'confused', 0.9,
  'Same form for Ichidan verbs: 食べられる = can eat OR is eaten'
FROM grammar_patterns p1, grammar_patterns p2
WHERE p1.pattern = 'Dictionary → Potential (える/られる)' AND p2.pattern = 'Dictionary → Passive (れる/られる)';

-- I-adjective vs Na-adjective negative
INSERT INTO pattern_relationships (from_pattern_id, to_pattern_id, relationship_type, strength, description)
SELECT 
  p1.id, p2.id, 'confused', 0.9,
  'I-adj: くない, Na-adj: じゃない'
FROM grammar_patterns p1, grammar_patterns p2
WHERE p1.pattern = 'い→くない (negative)' AND p2.pattern = 'だ→じゃない (negative)';

-- =====================================================
-- RELATED RELATIONSHIPS (connected concepts)
-- =====================================================

-- TE-form connects to Permission
INSERT INTO pattern_relationships (from_pattern_id, to_pattern_id, relationship_type, strength, description)
SELECT 
  p1.id, p2.id, 'related', 0.8,
  'Permission uses TE-form + もいいです'
FROM grammar_patterns p1, grammar_patterns p2
WHERE p1.pattern = 'Godan: う→って' AND p2.pattern = '〜てもいいです';

-- TE-form connects to Prohibition
INSERT INTO pattern_relationships (from_pattern_id, to_pattern_id, relationship_type, strength, description)
SELECT 
  p1.id, p2.id, 'related', 0.8,
  'Prohibition uses TE-form + はいけません'
FROM grammar_patterns p1, grammar_patterns p2
WHERE p1.pattern = 'Godan: う→って' AND p2.pattern = '〜てはいけません';

-- NAI-form connects to Obligation
INSERT INTO pattern_relationships (from_pattern_id, to_pattern_id, relationship_type, strength, description)
SELECT 
  p1.id, p2.id, 'related', 0.8,
  'Obligation uses NAI-form + なければなりません'
FROM grammar_patterns p1, grammar_patterns p2
WHERE p1.pattern = 'Godan: う→わない' AND p2.pattern = '〜なければなりません';

-- NAI-form connects to Lack of Obligation
INSERT INTO pattern_relationships (from_pattern_id, to_pattern_id, relationship_type, strength, description)
SELECT 
  p1.id, p2.id, 'related', 0.8,
  'Lack of obligation uses NAI-form + くてもいい'
FROM grammar_patterns p1, grammar_patterns p2
WHERE p1.pattern = 'Godan: う→わない' AND p2.pattern = '〜なくてもいいです';

-- I-adjective connecting form to nouns
INSERT INTO pattern_relationships (from_pattern_id, to_pattern_id, relationship_type, strength, description)
SELECT 
  p1.id, p2.id, 'related', 0.7,
  'くて connects multiple adjectives'
FROM grammar_patterns p1, grammar_patterns p2
WHERE p1.pattern = 'い→くて (connecting form)' AND p2.pattern = 'い→く (adverb)';

-- Conditional related to potential
INSERT INTO pattern_relationships (from_pattern_id, to_pattern_id, relationship_type, strength, description)
SELECT 
  p1.id, p2.id, 'related', 0.75,
  'Both involve え-row changes for Godan verbs'
FROM grammar_patterns p1, grammar_patterns p2
WHERE p1.pattern = 'Dictionary → Conditional (えば)' AND p2.pattern = 'Dictionary → Potential (える/られる)';

-- Causative related to Passive
INSERT INTO pattern_relationships (from_pattern_id, to_pattern_id, relationship_type, strength, description)
SELECT 
  p1.id, p2.id, 'related', 0.8,
  'Both involve あ-row + auxiliary verb'
FROM grammar_patterns p1, grammar_patterns p2
WHERE p1.pattern = 'Dictionary → Causative (せる/させる)' AND p2.pattern = 'Dictionary → Passive (れる/られる)';

-- Passive related to Potential (for Godan)
INSERT INTO pattern_relationships (from_pattern_id, to_pattern_id, relationship_type, strength, description)
SELECT 
  p1.id, p2.id, 'related', 0.75,
  'Godan: different forms, Ichidan: same form'
FROM grammar_patterns p1, grammar_patterns p2
WHERE p1.pattern = 'Dictionary → Passive (れる/られる)' AND p2.pattern = 'Dictionary → Potential (える/られる)';

-- TE-form building blocks
INSERT INTO pattern_relationships (from_pattern_id, to_pattern_id, relationship_type, strength, description)
SELECT 
  p1.id, p2.id, 'related', 0.7,
  'Different Godan conjugation patterns'
FROM grammar_patterns p1, grammar_patterns p2
WHERE p1.pattern = 'Godan: う→って' AND p2.pattern = 'Godan: く→いて';

INSERT INTO pattern_relationships (from_pattern_id, to_pattern_id, relationship_type, strength, description)
SELECT 
  p1.id, p2.id, 'related', 0.7,
  'Different Godan conjugation patterns'
FROM grammar_patterns p1, grammar_patterns p2
WHERE p1.pattern = 'Godan: く→いて' AND p2.pattern = 'Godan: つ→って';

-- From/To particles
INSERT INTO pattern_relationships (from_pattern_id, to_pattern_id, relationship_type, strength, description)
SELECT 
  p1.id, p2.id, 'related', 0.85,
  'Commonly used together: from ~ to ~'
FROM grammar_patterns p1, grammar_patterns p2
WHERE p1.pattern = 'から (starting point)' AND p2.pattern = 'まで (ending point)';
