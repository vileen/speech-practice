-- Counters Pattern Relationships for PatternGraph
-- These create connections between related counter patterns
-- Run after inserting patterns to get actual IDs

-- ============================================
-- RELATIONSHIPS: Same counter type, different numbers
-- ============================================

-- Long objects (本) progression
INSERT INTO pattern_relationships (from_pattern_id, to_pattern_id, relationship_type, strength) VALUES
((SELECT id FROM grammar_patterns WHERE pattern = 'いっぽん' ORDER BY id LIMIT 1), (SELECT id FROM grammar_patterns WHERE pattern = 'さんぼん' ORDER BY id LIMIT 1), 'similar', 0.9),
((SELECT id FROM grammar_patterns WHERE pattern = 'いっぽん' ORDER BY id LIMIT 1), (SELECT id FROM grammar_patterns WHERE pattern = 'ろっぽん' ORDER BY id LIMIT 1), 'similar', 0.9),
((SELECT id FROM grammar_patterns WHERE pattern = 'いっぽん' ORDER BY id LIMIT 1), (SELECT id FROM grammar_patterns WHERE pattern = 'はっぽん' ORDER BY id LIMIT 1), 'similar', 0.9),
((SELECT id FROM grammar_patterns WHERE pattern = 'いっぽん' ORDER BY id LIMIT 1), (SELECT id FROM grammar_patterns WHERE pattern = 'じゅっぽん' ORDER BY id LIMIT 1), 'similar', 0.9),
((SELECT id FROM grammar_patterns WHERE pattern = 'ろっぽん' ORDER BY id LIMIT 1), (SELECT id FROM grammar_patterns WHERE pattern = 'じゅっぽん' ORDER BY id LIMIT 1), 'similar', 0.95),
((SELECT id FROM grammar_patterns WHERE pattern = 'さんぼん' ORDER BY id LIMIT 1), (SELECT id FROM grammar_patterns WHERE pattern = 'せんぼん' ORDER BY id LIMIT 1), 'similar', 0.8);

-- Small objects (個) progression
INSERT INTO pattern_relationships (from_pattern_id, to_pattern_id, relationship_type, strength) VALUES
((SELECT id FROM grammar_patterns WHERE pattern = 'いっこ' ORDER BY id LIMIT 1), (SELECT id FROM grammar_patterns WHERE pattern = 'ろっこ' ORDER BY id LIMIT 1), 'similar', 0.9),
((SELECT id FROM grammar_patterns WHERE pattern = 'いっこ' ORDER BY id LIMIT 1), (SELECT id FROM grammar_patterns WHERE pattern = 'はっこ' ORDER BY id LIMIT 1), 'similar', 0.9),
((SELECT id FROM grammar_patterns WHERE pattern = 'いっこ' ORDER BY id LIMIT 1), (SELECT id FROM grammar_patterns WHERE pattern = 'じゅっこ' ORDER BY id LIMIT 1), 'similar', 0.9),
((SELECT id FROM grammar_patterns WHERE pattern = 'ろっこ' ORDER BY id LIMIT 1), (SELECT id FROM grammar_patterns WHERE pattern = 'じゅっこ' ORDER BY id LIMIT 1), 'similar', 0.95),
((SELECT id FROM grammar_patterns WHERE pattern = 'いっこ' ORDER BY id LIMIT 1), (SELECT id FROM grammar_patterns WHERE pattern = 'ひゃっこ' ORDER BY id LIMIT 1), 'similar', 0.85);

-- Minutes (分) - shared sandhi pattern
INSERT INTO pattern_relationships (from_pattern_id, to_pattern_id, relationship_type, strength) VALUES
((SELECT id FROM grammar_patterns WHERE pattern = 'いっぷん' ORDER BY id LIMIT 1), (SELECT id FROM grammar_patterns WHERE pattern = 'ろっぷん' ORDER BY id LIMIT 1), 'similar', 0.95),
((SELECT id FROM grammar_patterns WHERE pattern = 'いっぷん' ORDER BY id LIMIT 1), (SELECT id FROM grammar_patterns WHERE pattern = 'はっぷん' ORDER BY id LIMIT 1), 'similar', 0.95),
((SELECT id FROM grammar_patterns WHERE pattern = 'いっぷん' ORDER BY id LIMIT 1), (SELECT id FROM grammar_patterns WHERE pattern = 'じゅっぷん' ORDER BY id LIMIT 1), 'similar', 0.95),
((SELECT id FROM grammar_patterns WHERE pattern = 'さんぷん' ORDER BY id LIMIT 1), (SELECT id FROM grammar_patterns WHERE pattern = 'なんぷん' ORDER BY id LIMIT 1), 'similar', 0.9);

-- ============================================
-- RELATIONSHIPS: Same number, different counters
-- ============================================

-- Number 1 across all counters (high confusion risk!)
INSERT INTO pattern_relationships (from_pattern_id, to_pattern_id, relationship_type, strength) VALUES
((SELECT id FROM grammar_patterns WHERE pattern = 'いっぽん' ORDER BY id LIMIT 1), (SELECT id FROM grammar_patterns WHERE pattern = 'いっこ' ORDER BY id LIMIT 1), 'related', 0.7),
((SELECT id FROM grammar_patterns WHERE pattern = 'いっぽん' ORDER BY id LIMIT 1), (SELECT id FROM grammar_patterns WHERE pattern = 'いっぷん' ORDER BY id LIMIT 1), 'related', 0.7),
((SELECT id FROM grammar_patterns WHERE pattern = 'いっこ' ORDER BY id LIMIT 1), (SELECT id FROM grammar_patterns WHERE pattern = 'いっさい' ORDER BY id LIMIT 1), 'related', 0.7),
((SELECT id FROM grammar_patterns WHERE pattern = 'いっこ' ORDER BY id LIMIT 1), (SELECT id FROM grammar_patterns WHERE pattern = 'いっかい' ORDER BY id LIMIT 1), 'related', 0.7);

-- Number 6 across all counters
INSERT INTO pattern_relationships (from_pattern_id, to_pattern_id, relationship_type, strength) VALUES
((SELECT id FROM grammar_patterns WHERE pattern = 'ろっぽん' ORDER BY id LIMIT 1), (SELECT id FROM grammar_patterns WHERE pattern = 'ろっこ' ORDER BY id LIMIT 1), 'related', 0.8),
((SELECT id FROM grammar_patterns WHERE pattern = 'ろっぽん' ORDER BY id LIMIT 1), (SELECT id FROM grammar_patterns WHERE pattern = 'ろっぷん' ORDER BY id LIMIT 1), 'related', 0.9),
((SELECT id FROM grammar_patterns WHERE pattern = 'ろっこ' ORDER BY id LIMIT 1), (SELECT id FROM grammar_patterns WHERE pattern = 'ろっぷん' ORDER BY id LIMIT 1), 'related', 0.9);

-- Number 8 across all counters
INSERT INTO pattern_relationships (from_pattern_id, to_pattern_id, relationship_type, strength) VALUES
((SELECT id FROM grammar_patterns WHERE pattern = 'はっぽん' ORDER BY id LIMIT 1), (SELECT id FROM grammar_patterns WHERE pattern = 'はっこ' ORDER BY id LIMIT 1), 'related', 0.8),
((SELECT id FROM grammar_patterns WHERE pattern = 'はっぽん' ORDER BY id LIMIT 1), (SELECT id FROM grammar_patterns WHERE pattern = 'はっぷん' ORDER BY id LIMIT 1), 'related', 0.9),
((SELECT id FROM grammar_patterns WHERE pattern = 'はっこ' ORDER BY id LIMIT 1), (SELECT id FROM grammar_patterns WHERE pattern = 'はっぷん' ORDER BY id LIMIT 1), 'related', 0.9);

-- Number 10 across all counters
INSERT INTO pattern_relationships (from_pattern_id, to_pattern_id, relationship_type, strength) VALUES
((SELECT id FROM grammar_patterns WHERE pattern = 'じゅっぽん' ORDER BY id LIMIT 1), (SELECT id FROM grammar_patterns WHERE pattern = 'じゅっこ' ORDER BY id LIMIT 1), 'related', 0.8),
((SELECT id FROM grammar_patterns WHERE pattern = 'じゅっぽん' ORDER BY id LIMIT 1), (SELECT id FROM grammar_patterns WHERE pattern = 'じゅっぷん' ORDER BY id LIMIT 1), 'related', 0.9),
((SELECT id FROM grammar_patterns WHERE pattern = 'じゅっこ' ORDER BY id LIMIT 1), (SELECT id FROM grammar_patterns WHERE pattern = 'じゅっぷん' ORDER BY id LIMIT 1), 'related', 0.9);

-- ============================================
-- RELATIONSHIPS: Opposites and contrasts
-- ============================================

-- Opposite: Easy vs Hard counters
INSERT INTO pattern_relationships (from_pattern_id, to_pattern_id, relationship_type, strength) VALUES
((SELECT id FROM grammar_patterns WHERE pattern = 'いちまい' ORDER BY id LIMIT 1), (SELECT id FROM grammar_patterns WHERE pattern = 'いっぽん' ORDER BY id LIMIT 1), 'opposite', 0.8),
((SELECT id FROM grammar_patterns WHERE pattern = 'にまい' ORDER BY id LIMIT 1), (SELECT id FROM grammar_patterns WHERE pattern = 'にほん' ORDER BY id LIMIT 1), 'opposite', 0.8);
-- Explanation: 枚 (mai) has NO exceptions, 本 (hon) has MANY

-- Opposite: Regular vs Exception people counting
INSERT INTO pattern_relationships (from_pattern_id, to_pattern_id, relationship_type, strength) VALUES
((SELECT id FROM grammar_patterns WHERE pattern = 'さんにん' ORDER BY id LIMIT 1), (SELECT id FROM grammar_patterns WHERE pattern = 'ひとり' ORDER BY id LIMIT 1), 'opposite', 0.9),
((SELECT id FROM grammar_patterns WHERE pattern = 'さんにん' ORDER BY id LIMIT 1), (SELECT id FROM grammar_patterns WHERE pattern = 'ふたり' ORDER BY id LIMIT 1), 'opposite', 0.9);
-- Explanation: 3+ people use standard counting, 1-2 are COMPLETELY different

-- Opposite: Regular vs Exception days
INSERT INTO pattern_relationships (from_pattern_id, to_pattern_id, relationship_type, strength) VALUES
((SELECT id FROM grammar_patterns WHERE pattern = 'じゅういちにち' ORDER BY id LIMIT 1), (SELECT id FROM grammar_patterns WHERE pattern = 'ついたち' ORDER BY id LIMIT 1), 'opposite', 0.9),
((SELECT id FROM grammar_patterns WHERE pattern = 'じゅうににち' ORDER BY id LIMIT 1), (SELECT id FROM grammar_patterns WHERE pattern = 'ふつか' ORDER BY id LIMIT 1), 'opposite', 0.85),
((SELECT id FROM grammar_patterns WHERE pattern = 'にじゅういちにち' ORDER BY id LIMIT 1), (SELECT id FROM grammar_patterns WHERE pattern = 'はつか' ORDER BY id LIMIT 1), 'opposite', 0.9);
-- Explanation: 11th, 12th, 21st use standard counting; 1st, 2nd, 20th are exceptions

-- ============================================
-- RELATIONSHIPS: Confusion pairs (for discrimination drills)
-- ============================================

-- People exceptions (most critical!)
INSERT INTO pattern_relationships (from_pattern_id, to_pattern_id, relationship_type, strength) VALUES
((SELECT id FROM grammar_patterns WHERE pattern = 'ひとり' ORDER BY id LIMIT 1), (SELECT id FROM grammar_patterns WHERE pattern = 'いっこ' ORDER BY id LIMIT 1), 'confused', 1.0),
((SELECT id FROM grammar_patterns WHERE pattern = 'ふたり' ORDER BY id LIMIT 1), (SELECT id FROM grammar_patterns WHERE pattern = 'ふたつ' ORDER BY id LIMIT 1), 'confused', 1.0);
-- Learners often confuse hitori with ikko, futari with futatsu

-- Days with similar sounds
INSERT INTO pattern_relationships (from_pattern_id, to_pattern_id, relationship_type, strength) VALUES
((SELECT id FROM grammar_patterns WHERE pattern = 'みっか' ORDER BY id LIMIT 1), (SELECT id FROM grammar_patterns WHERE pattern = 'みっつ' ORDER BY id LIMIT 1), 'confused', 0.9),
((SELECT id FROM grammar_patterns WHERE pattern = 'よっか' ORDER BY id LIMIT 1), (SELECT id FROM grammar_patterns WHERE pattern = 'よっつ' ORDER BY id LIMIT 1), 'confused', 0.9),
((SELECT id FROM grammar_patterns WHERE pattern = 'むいか' ORDER BY id LIMIT 1), (SELECT id FROM grammar_patterns WHERE pattern = 'むっつ' ORDER BY id LIMIT 1), 'confused', 0.85),
((SELECT id FROM grammar_patterns WHERE pattern = 'ここのか' ORDER BY id LIMIT 1), (SELECT id FROM grammar_patterns WHERE pattern = 'ここのつ' ORDER BY id LIMIT 1), 'confused', 0.9);

-- 100 counters with sandhi
INSERT INTO pattern_relationships (from_pattern_id, to_pattern_id, relationship_type, strength) VALUES
((SELECT id FROM grammar_patterns WHERE pattern = 'ひゃっぽん' ORDER BY id LIMIT 1), (SELECT id FROM grammar_patterns WHERE pattern = 'ひゃっこ' ORDER BY id LIMIT 1), 'related', 0.8),
((SELECT id FROM grammar_patterns WHERE pattern = 'ひゃっぽん' ORDER BY id LIMIT 1), (SELECT id FROM grammar_patterns WHERE pattern = 'ひゃくまい' ORDER BY id LIMIT 1), 'opposite', 0.7);
-- 100 + hon = hyappon (sandhi), 100 + mai = hyakumai (no change!)

-- ============================================
-- RELATIONSHIPS: Category grouping
-- ============================================

-- All "ipp-" patterns are related
INSERT INTO pattern_relationships (from_pattern_id, to_pattern_id, relationship_type, strength) VALUES
((SELECT id FROM grammar_patterns WHERE pattern = 'いっぽん' ORDER BY id LIMIT 1), (SELECT id FROM grammar_patterns WHERE pattern = 'いっこ' ORDER BY id LIMIT 1), 'related', 0.75),
((SELECT id FROM grammar_patterns WHERE pattern = 'いっぽん' ORDER BY id LIMIT 1), (SELECT id FROM grammar_patterns WHERE pattern = 'いっぷん' ORDER BY id LIMIT 1), 'related', 0.75),
((SELECT id FROM grammar_patterns WHERE pattern = 'いっこ' ORDER BY id LIMIT 1), (SELECT id FROM grammar_patterns WHERE pattern = 'いっぷん' ORDER BY id LIMIT 1), 'related', 0.75);

-- All "ropp-" patterns are closely related
INSERT INTO pattern_relationships (from_pattern_id, to_pattern_id, relationship_type, strength) VALUES
((SELECT id FROM grammar_patterns WHERE pattern = 'ろっぽん' ORDER BY id LIMIT 1), (SELECT id FROM grammar_patterns WHERE pattern = 'ろっこ' ORDER BY id LIMIT 1), 'related', 0.85),
((SELECT id FROM grammar_patterns WHERE pattern = 'ろっぽん' ORDER BY id LIMIT 1), (SELECT id FROM grammar_patterns WHERE pattern = 'ろっぷん' ORDER BY id LIMIT 1), 'related', 0.9),
((SELECT id FROM grammar_patterns WHERE pattern = 'ろっこ' ORDER BY id LIMIT 1), (SELECT id FROM grammar_patterns WHERE pattern = 'ろっぷん' ORDER BY id LIMIT 1), 'related', 0.9);

-- All "happ-" patterns are closely related
INSERT INTO pattern_relationships (from_pattern_id, to_pattern_id, relationship_type, strength) VALUES
((SELECT id FROM grammar_patterns WHERE pattern = 'はっぽん' ORDER BY id LIMIT 1), (SELECT id FROM grammar_patterns WHERE pattern = 'はっこ' ORDER BY id LIMIT 1), 'related', 0.85),
((SELECT id FROM grammar_patterns WHERE pattern = 'はっぽん' ORDER BY id LIMIT 1), (SELECT id FROM grammar_patterns WHERE pattern = 'はっぷん' ORDER BY id LIMIT 1), 'related', 0.9),
((SELECT id FROM grammar_patterns WHERE pattern = 'はっこ' ORDER BY id LIMIT 1), (SELECT id FROM grammar_patterns WHERE pattern = 'はっぷん' ORDER BY id LIMIT 1), 'related', 0.9);

-- ============================================
-- RELATIONSHIPS: Question forms to their answers
-- ============================================

-- nanbon connects to specific counts
INSERT INTO pattern_relationships (from_pattern_id, to_pattern_id, relationship_type, strength) VALUES
((SELECT id FROM grammar_patterns WHERE pattern = 'なんぼん' ORDER BY id LIMIT 1), (SELECT id FROM grammar_patterns WHERE pattern = 'いっぽん' ORDER BY id LIMIT 1), 'related', 0.8),
((SELECT id FROM grammar_patterns WHERE pattern = 'なんぼん' ORDER BY id LIMIT 1), (SELECT id FROM grammar_patterns WHERE pattern = 'さんぼん' ORDER BY id LIMIT 1), 'related', 0.8),
((SELECT id FROM grammar_patterns WHERE pattern = 'なんぼん' ORDER BY id LIMIT 1), (SELECT id FROM grammar_patterns WHERE pattern = 'ろっぽん' ORDER BY id LIMIT 1), 'related', 0.8);

-- nannin connects to specific counts
INSERT INTO pattern_relationships (from_pattern_id, to_pattern_id, relationship_type, strength) VALUES
((SELECT id FROM grammar_patterns WHERE pattern = 'なんにん' ORDER BY id LIMIT 1), (SELECT id FROM grammar_patterns WHERE pattern = 'ひとり' ORDER BY id LIMIT 1), 'related', 0.7),
((SELECT id FROM grammar_patterns WHERE pattern = 'なんにん' ORDER BY id LIMIT 1), (SELECT id FROM grammar_patterns WHERE pattern = 'ふたり' ORDER BY id LIMIT 1), 'related', 0.7),
((SELECT id FROM grammar_patterns WHERE pattern = 'なんにん' ORDER BY id LIMIT 1), (SELECT id FROM grammar_patterns WHERE pattern = 'さんにん' ORDER BY id LIMIT 1), 'related', 0.8);

-- nannichi connects to specific days
INSERT INTO pattern_relationships (from_pattern_id, to_pattern_id, relationship_type, strength) VALUES
((SELECT id FROM grammar_patterns WHERE pattern = 'なんにち' ORDER BY id LIMIT 1), (SELECT id FROM grammar_patterns WHERE pattern = 'ついたち' ORDER BY id LIMIT 1), 'related', 0.7),
((SELECT id FROM grammar_patterns WHERE pattern = 'なんにち' ORDER BY id LIMIT 1), (SELECT id FROM grammar_patterns WHERE pattern = 'ふつか' ORDER BY id LIMIT 1), 'related', 0.7),
((SELECT id FROM grammar_patterns WHERE pattern = 'なんにち' ORDER BY id LIMIT 1), (SELECT id FROM grammar_patterns WHERE pattern = 'はつか' ORDER BY id LIMIT 1), 'related', 0.7),
((SELECT id FROM grammar_patterns WHERE pattern = 'なんにち' ORDER BY id LIMIT 1), (SELECT id FROM grammar_patterns WHERE pattern = 'じゅういちにち' ORDER BY id LIMIT 1), 'related', 0.8);
