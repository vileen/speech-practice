-- Counters Pattern Relationships for PatternGraph
-- These create connections between related counter patterns
-- Run after inserting patterns to get actual IDs

-- ============================================
-- RELATIONSHIPS: Same counter type, different numbers
-- ============================================

-- Long objects (本) progression
INSERT INTO pattern_relationships (from_pattern_id, to_pattern_id, relationship_type, strength) VALUES
((SELECT id FROM grammar_patterns WHERE pattern = 'いっぽん'), (SELECT id FROM grammar_patterns WHERE pattern = 'さんぼん'), 'similar', 0.9),
((SELECT id FROM grammar_patterns WHERE pattern = 'いっぽん'), (SELECT id FROM grammar_patterns WHERE pattern = 'ろっぽん'), 'similar', 0.9),
((SELECT id FROM grammar_patterns WHERE pattern = 'いっぽん'), (SELECT id FROM grammar_patterns WHERE pattern = 'はっぽん'), 'similar', 0.9),
((SELECT id FROM grammar_patterns WHERE pattern = 'いっぽん'), (SELECT id FROM grammar_patterns WHERE pattern = 'じゅっぽん'), 'similar', 0.9),
((SELECT id FROM grammar_patterns WHERE pattern = 'ろっぽん'), (SELECT id FROM grammar_patterns WHERE pattern = 'じゅっぽん'), 'similar', 0.95),
((SELECT id FROM grammar_patterns WHERE pattern = 'さんぼん'), (SELECT id FROM grammar_patterns WHERE pattern = 'せんぼん'), 'similar', 0.8);

-- Small objects (個) progression
INSERT INTO pattern_relationships (from_pattern_id, to_pattern_id, relationship_type, strength) VALUES
((SELECT id FROM grammar_patterns WHERE pattern = 'いっこ'), (SELECT id FROM grammar_patterns WHERE pattern = 'ろっこ'), 'similar', 0.9),
((SELECT id FROM grammar_patterns WHERE pattern = 'いっこ'), (SELECT id FROM grammar_patterns WHERE pattern = 'はっこ'), 'similar', 0.9),
((SELECT id FROM grammar_patterns WHERE pattern = 'いっこ'), (SELECT id FROM grammar_patterns WHERE pattern = 'じゅっこ'), 'similar', 0.9),
((SELECT id FROM grammar_patterns WHERE pattern = 'ろっこ'), (SELECT id FROM grammar_patterns WHERE pattern = 'じゅっこ'), 'similar', 0.95),
((SELECT id FROM grammar_patterns WHERE pattern = 'いっこ'), (SELECT id FROM grammar_patterns WHERE pattern = 'ひゃっこ'), 'similar', 0.85);

-- Minutes (分) - shared sandhi pattern
INSERT INTO pattern_relationships (from_pattern_id, to_pattern_id, relationship_type, strength) VALUES
((SELECT id FROM grammar_patterns WHERE pattern = 'いっぷん'), (SELECT id FROM grammar_patterns WHERE pattern = 'ろっぷん'), 'similar', 0.95),
((SELECT id FROM grammar_patterns WHERE pattern = 'いっぷん'), (SELECT id FROM grammar_patterns WHERE pattern = 'はっぷん'), 'similar', 0.95),
((SELECT id FROM grammar_patterns WHERE pattern = 'いっぷん'), (SELECT id FROM grammar_patterns WHERE pattern = 'じゅっぷん'), 'similar', 0.95),
((SELECT id FROM grammar_patterns WHERE pattern = 'さんぷん'), (SELECT id FROM grammar_patterns WHERE pattern = 'なんぷん'), 'similar', 0.9);

-- ============================================
-- RELATIONSHIPS: Same number, different counters
-- ============================================

-- Number 1 across all counters (high confusion risk!)
INSERT INTO pattern_relationships (from_pattern_id, to_pattern_id, relationship_type, strength) VALUES
((SELECT id FROM grammar_patterns WHERE pattern = 'いっぽん'), (SELECT id FROM grammar_patterns WHERE pattern = 'いっこ'), 'related', 0.7),
((SELECT id FROM grammar_patterns WHERE pattern = 'いっぽん'), (SELECT id FROM grammar_patterns WHERE pattern = 'いっぷん'), 'related', 0.7),
((SELECT id FROM grammar_patterns WHERE pattern = 'いっこ'), (SELECT id FROM grammar_patterns WHERE pattern = 'いっさい'), 'related', 0.7),
((SELECT id FROM grammar_patterns WHERE pattern = 'いっこ'), (SELECT id FROM grammar_patterns WHERE pattern = 'いっかい'), 'related', 0.7);

-- Number 6 across all counters
INSERT INTO pattern_relationships (from_pattern_id, to_pattern_id, relationship_type, strength) VALUES
((SELECT id FROM grammar_patterns WHERE pattern = 'ろっぽん'), (SELECT id FROM grammar_patterns WHERE pattern = 'ろっこ'), 'related', 0.8),
((SELECT id FROM grammar_patterns WHERE pattern = 'ろっぽん'), (SELECT id FROM grammar_patterns WHERE pattern = 'ろっぷん'), 'related', 0.9),
((SELECT id FROM grammar_patterns WHERE pattern = 'ろっこ'), (SELECT id FROM grammar_patterns WHERE pattern = 'ろっぷん'), 'related', 0.9);

-- Number 8 across all counters
INSERT INTO pattern_relationships (from_pattern_id, to_pattern_id, relationship_type, strength) VALUES
((SELECT id FROM grammar_patterns WHERE pattern = 'はっぽん'), (SELECT id FROM grammar_patterns WHERE pattern = 'はっこ'), 'related', 0.8),
((SELECT id FROM grammar_patterns WHERE pattern = 'はっぽん'), (SELECT id FROM grammar_patterns WHERE pattern = 'はっぷん'), 'related', 0.9),
((SELECT id FROM grammar_patterns WHERE pattern = 'はっこ'), (SELECT id FROM grammar_patterns WHERE pattern = 'はっぷん'), 'related', 0.9);

-- Number 10 across all counters
INSERT INTO pattern_relationships (from_pattern_id, to_pattern_id, relationship_type, strength) VALUES
((SELECT id FROM grammar_patterns WHERE pattern = 'じゅっぽん'), (SELECT id FROM grammar_patterns WHERE pattern = 'じゅっこ'), 'related', 0.8),
((SELECT id FROM grammar_patterns WHERE pattern = 'じゅっぽん'), (SELECT id FROM grammar_patterns WHERE pattern = 'じゅっぷん'), 'related', 0.9),
((SELECT id FROM grammar_patterns WHERE pattern = 'じゅっこ'), (SELECT id FROM grammar_patterns WHERE pattern = 'じゅっぷん'), 'related', 0.9);

-- ============================================
-- RELATIONSHIPS: Opposites and contrasts
-- ============================================

-- Opposite: Easy vs Hard counters
INSERT INTO pattern_relationships (from_pattern_id, to_pattern_id, relationship_type, strength) VALUES
((SELECT id FROM grammar_patterns WHERE pattern = 'いちまい'), (SELECT id FROM grammar_patterns WHERE pattern = 'いっぽん'), 'opposite', 0.8),
((SELECT id FROM grammar_patterns WHERE pattern = 'にまい'), (SELECT id FROM grammar_patterns WHERE pattern = 'にほん'), 'opposite', 0.8);
-- Explanation: 枚 (mai) has NO exceptions, 本 (hon) has MANY

-- Opposite: Regular vs Exception people counting
INSERT INTO pattern_relationships (from_pattern_id, to_pattern_id, relationship_type, strength) VALUES
((SELECT id FROM grammar_patterns WHERE pattern = 'さんにん'), (SELECT id FROM grammar_patterns WHERE pattern = 'ひとり'), 'opposite', 0.9),
((SELECT id FROM grammar_patterns WHERE pattern = 'さんにん'), (SELECT id FROM grammar_patterns WHERE pattern = 'ふたり'), 'opposite', 0.9);
-- Explanation: 3+ people use standard counting, 1-2 are COMPLETELY different

-- Opposite: Regular vs Exception days
INSERT INTO pattern_relationships (from_pattern_id, to_pattern_id, relationship_type, strength) VALUES
((SELECT id FROM grammar_patterns WHERE pattern = 'じゅういちにち'), (SELECT id FROM grammar_patterns WHERE pattern = 'ついたち'), 'opposite', 0.9),
((SELECT id FROM grammar_patterns WHERE pattern = 'じゅうににち'), (SELECT id FROM grammar_patterns WHERE pattern = 'ふつか'), 'opposite', 0.85),
((SELECT id FROM grammar_patterns WHERE pattern = 'にじゅういちにち'), (SELECT id FROM grammar_patterns WHERE pattern = 'はつか'), 'opposite', 0.9);
-- Explanation: 11th, 12th, 21st use standard counting; 1st, 2nd, 20th are exceptions

-- ============================================
-- RELATIONSHIPS: Confusion pairs (for discrimination drills)
-- ============================================

-- People exceptions (most critical!)
INSERT INTO pattern_relationships (from_pattern_id, to_pattern_id, relationship_type, strength) VALUES
((SELECT id FROM grammar_patterns WHERE pattern = 'ひとり'), (SELECT id FROM grammar_patterns WHERE pattern = 'いっこ'), 'confused', 1.0),
((SELECT id FROM grammar_patterns WHERE pattern = 'ふたり'), (SELECT id FROM grammar_patterns WHERE pattern = 'ふたつ'), 'confused', 1.0);
-- Learners often confuse hitori with ikko, futari with futatsu

-- Days with similar sounds
INSERT INTO pattern_relationships (from_pattern_id, to_pattern_id, relationship_type, strength) VALUES
((SELECT id FROM grammar_patterns WHERE pattern = 'みっか'), (SELECT id FROM grammar_patterns WHERE pattern = 'みっつ'), 'confused', 0.9),
((SELECT id FROM grammar_patterns WHERE pattern = 'よっか'), (SELECT id FROM grammar_patterns WHERE pattern = 'よっつ'), 'confused', 0.9),
((SELECT id FROM grammar_patterns WHERE pattern = 'むいか'), (SELECT id FROM grammar_patterns WHERE pattern = 'むっつ'), 'confused', 0.85),
((SELECT id FROM grammar_patterns WHERE pattern = 'ここのか'), (SELECT id FROM grammar_patterns WHERE pattern = 'ここのつ'), 'confused', 0.9);

-- 100 counters with sandhi
INSERT INTO pattern_relationships (from_pattern_id, to_pattern_id, relationship_type, strength) VALUES
((SELECT id FROM grammar_patterns WHERE pattern = 'ひゃっぽん'), (SELECT id FROM grammar_patterns WHERE pattern = 'ひゃっこ'), 'related', 0.8),
((SELECT id FROM grammar_patterns WHERE pattern = 'ひゃっぽん'), (SELECT id FROM grammar_patterns WHERE pattern = 'ひゃくまい'), 'opposite', 0.7);
-- 100 + hon = hyappon (sandhi), 100 + mai = hyakumai (no change!)

-- ============================================
-- RELATIONSHIPS: Category grouping
-- ============================================

-- All "ipp-" patterns are related
INSERT INTO pattern_relationships (from_pattern_id, to_pattern_id, relationship_type, strength) VALUES
((SELECT id FROM grammar_patterns WHERE pattern = 'いっぽん'), (SELECT id FROM grammar_patterns WHERE pattern = 'いっこ'), 'related', 0.75),
((SELECT id FROM grammar_patterns WHERE pattern = 'いっぽん'), (SELECT id FROM grammar_patterns WHERE pattern = 'いっぷん'), 'related', 0.75),
((SELECT id FROM grammar_patterns WHERE pattern = 'いっこ'), (SELECT id FROM grammar_patterns WHERE pattern = 'いっぷん'), 'related', 0.75);

-- All "ropp-" patterns are closely related
INSERT INTO pattern_relationships (from_pattern_id, to_pattern_id, relationship_type, strength) VALUES
((SELECT id FROM grammar_patterns WHERE pattern = 'ろっぽん'), (SELECT id FROM grammar_patterns WHERE pattern = 'ろっこ'), 'related', 0.85),
((SELECT id FROM grammar_patterns WHERE pattern = 'ろっぽん'), (SELECT id FROM grammar_patterns WHERE pattern = 'ろっぷん'), 'related', 0.9),
((SELECT id FROM grammar_patterns WHERE pattern = 'ろっこ'), (SELECT id FROM grammar_patterns WHERE pattern = 'ろっぷん'), 'related', 0.9);

-- All "happ-" patterns are closely related
INSERT INTO pattern_relationships (from_pattern_id, to_pattern_id, relationship_type, strength) VALUES
((SELECT id FROM grammar_patterns WHERE pattern = 'はっぽん'), (SELECT id FROM grammar_patterns WHERE pattern = 'はっこ'), 'related', 0.85),
((SELECT id FROM grammar_patterns WHERE pattern = 'はっぽん'), (SELECT id FROM grammar_patterns WHERE pattern = 'はっぷん'), 'related', 0.9),
((SELECT id FROM grammar_patterns WHERE pattern = 'はっこ'), (SELECT id FROM grammar_patterns WHERE pattern = 'はっぷん'), 'related', 0.9);

-- ============================================
-- RELATIONSHIPS: Question forms to their answers
-- ============================================

-- nanbon connects to specific counts
INSERT INTO pattern_relationships (from_pattern_id, to_pattern_id, relationship_type, strength) VALUES
((SELECT id FROM grammar_patterns WHERE pattern = 'なんぼん'), (SELECT id FROM grammar_patterns WHERE pattern = 'いっぽん'), 'related', 0.8),
((SELECT id FROM grammar_patterns WHERE pattern = 'なんぼん'), (SELECT id FROM grammar_patterns WHERE pattern = 'さんぼん'), 'related', 0.8),
((SELECT id FROM grammar_patterns WHERE pattern = 'なんぼん'), (SELECT id FROM grammar_patterns WHERE pattern = 'ろっぽん'), 'related', 0.8);

-- nannin connects to specific counts
INSERT INTO pattern_relationships (from_pattern_id, to_pattern_id, relationship_type, strength) VALUES
((SELECT id FROM grammar_patterns WHERE pattern = 'なんにん'), (SELECT id FROM grammar_patterns WHERE pattern = 'ひとり'), 'related', 0.7),
((SELECT id FROM grammar_patterns WHERE pattern = 'なんにん'), (SELECT id FROM grammar_patterns WHERE pattern = 'ふたり'), 'related', 0.7),
((SELECT id FROM grammar_patterns WHERE pattern = 'なんにん'), (SELECT id FROM grammar_patterns WHERE pattern = 'さんにん'), 'related', 0.8);

-- nannichi connects to specific days
INSERT INTO pattern_relationships (from_pattern_id, to_pattern_id, relationship_type, strength) VALUES
((SELECT id FROM grammar_patterns WHERE pattern = 'なんにち'), (SELECT id FROM grammar_patterns WHERE pattern = 'ついたち'), 'related', 0.7),
((SELECT id FROM grammar_patterns WHERE pattern = 'なんにち'), (SELECT id FROM grammar_patterns WHERE pattern = 'ふつか'), 'related', 0.7),
((SELECT id FROM grammar_patterns WHERE pattern = 'なんにち'), (SELECT id FROM grammar_patterns WHERE pattern = 'はつか'), 'related', 0.7),
((SELECT id FROM grammar_patterns WHERE pattern = 'なんにち'), (SELECT id FROM grammar_patterns WHERE pattern = 'じゅういちにち'), 'related', 0.8);
