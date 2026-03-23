-- Create pattern_relationships table for dynamic relationship management
-- This replaces the hardcoded PREDEFINED_CONNECTIONS in PatternGraph.tsx

CREATE TABLE IF NOT EXISTS pattern_relationships (
  id SERIAL PRIMARY KEY,
  from_pattern_id INTEGER REFERENCES grammar_patterns(id) ON DELETE CASCADE,
  to_pattern_id INTEGER REFERENCES grammar_patterns(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL CHECK (relationship_type IN ('opposite', 'similar', 'related', 'confused')),
  strength FLOAT NOT NULL CHECK (strength >= 0 AND strength <= 1),
  description TEXT,                -- Optional explanation of the relationship
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(from_pattern_id, to_pattern_id, relationship_type)
);

-- Indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_relationships_from ON pattern_relationships(from_pattern_id);
CREATE INDEX IF NOT EXISTS idx_relationships_to ON pattern_relationships(to_pattern_id);
CREATE INDEX IF NOT EXISTS idx_relationships_type ON pattern_relationships(relationship_type);

-- ============================================
-- MIGRATE: Existing related_patterns array to relationship table
-- Convert simple array references to 'related' type with default strength
-- ============================================

INSERT INTO pattern_relationships (from_pattern_id, to_pattern_id, relationship_type, strength, description)
SELECT 
  gp.id as from_pattern_id,
  related_id as to_pattern_id,
  'related' as relationship_type,
  0.7 as strength,
  'Auto-migrated from related_patterns array' as description
FROM grammar_patterns gp,
LATERAL UNNEST(gp.related_patterns) AS related_id
WHERE gp.related_patterns IS NOT NULL 
  AND array_length(gp.related_patterns, 1) > 0
ON CONFLICT (from_pattern_id, to_pattern_id, relationship_type) DO NOTHING;

-- ============================================
-- ADD: Counters category relationships
-- These were in counters_relationships.sql but table didn't exist
-- ============================================

-- Long objects (本) progression
INSERT INTO pattern_relationships (from_pattern_id, to_pattern_id, relationship_type, strength, description)
SELECT 
  (SELECT id FROM grammar_patterns WHERE pattern = 'いっぽん'),
  (SELECT id FROM grammar_patterns WHERE pattern = 'さんぼん'),
  'similar', 0.9, 'Same counter type (long objects), different numbers'
ON CONFLICT DO NOTHING;

INSERT INTO pattern_relationships (from_pattern_id, to_pattern_id, relationship_type, strength, description)
SELECT 
  (SELECT id FROM grammar_patterns WHERE pattern = 'いっぽん'),
  (SELECT id FROM grammar_patterns WHERE pattern = 'ろっぽん'),
  'similar', 0.9, 'Same counter type (long objects), both use っ'
ON CONFLICT DO NOTHING;

INSERT INTO pattern_relationships (from_pattern_id, to_pattern_id, relationship_type, strength, description)
SELECT 
  (SELECT id FROM grammar_patterns WHERE pattern = 'いっぽん'),
  (SELECT id FROM grammar_patterns WHERE pattern = 'はっぽん'),
  'similar', 0.9, 'Same counter type (long objects), both use っ'
ON CONFLICT DO NOTHING;

INSERT INTO pattern_relationships (from_pattern_id, to_pattern_id, relationship_type, strength, description)
SELECT 
  (SELECT id FROM grammar_patterns WHERE pattern = 'いっぽん'),
  (SELECT id FROM grammar_patterns WHERE pattern = 'じゅっぽん'),
  'similar', 0.9, 'Same counter type (long objects), both use っ'
ON CONFLICT DO NOTHING;

INSERT INTO pattern_relationships (from_pattern_id, to_pattern_id, relationship_type, strength, description)
SELECT 
  (SELECT id FROM grammar_patterns WHERE pattern = 'ろっぽん'),
  (SELECT id FROM grammar_patterns WHERE pattern = 'じゅっぽん'),
  'similar', 0.95, 'Same sandhi pattern (ろっ/じゅっ + ぽん)'
ON CONFLICT DO NOTHING;

-- Small objects (個) progression
INSERT INTO pattern_relationships (from_pattern_id, to_pattern_id, relationship_type, strength, description)
SELECT 
  (SELECT id FROM grammar_patterns WHERE pattern = 'いっこ'),
  (SELECT id FROM grammar_patterns WHERE pattern = 'ろっこ'),
  'similar', 0.9, 'Same sandhi pattern (いっ/ろっ + こ)'
ON CONFLICT DO NOTHING;

INSERT INTO pattern_relationships (from_pattern_id, to_pattern_id, relationship_type, strength, description)
SELECT 
  (SELECT id FROM grammar_patterns WHERE pattern = 'いっこ'),
  (SELECT id FROM grammar_patterns WHERE pattern = 'はっこ'),
  'similar', 0.9, 'Same sandhi pattern (いっ/はっ + こ)'
ON CONFLICT DO NOTHING;

INSERT INTO pattern_relationships (from_pattern_id, to_pattern_id, relationship_type, strength, description)
SELECT 
  (SELECT id FROM grammar_patterns WHERE pattern = 'いっこ'),
  (SELECT id FROM grammar_patterns WHERE pattern = 'じゅっこ'),
  'similar', 0.9, 'Same sandhi pattern (いっ/じゅっ + こ)'
ON CONFLICT DO NOTHING;

-- Minutes (分) sandhi patterns
INSERT INTO pattern_relationships (from_pattern_id, to_pattern_id, relationship_type, strength, description)
SELECT 
  (SELECT id FROM grammar_patterns WHERE pattern = 'いっぷん'),
  (SELECT id FROM grammar_patterns WHERE pattern = 'ろっぷん'),
  'similar', 0.95, 'Same sandhi pattern (いっ/ろっ + ぷん)'
ON CONFLICT DO NOTHING;

INSERT INTO pattern_relationships (from_pattern_id, to_pattern_id, relationship_type, strength, description)
SELECT 
  (SELECT id FROM grammar_patterns WHERE pattern = 'いっぷん'),
  (SELECT id FROM grammar_patterns WHERE pattern = 'はっぷん'),
  'similar', 0.95, 'Same sandhi pattern (いっ/はっ + ぷん)'
ON CONFLICT DO NOTHING;

INSERT INTO pattern_relationships (from_pattern_id, to_pattern_id, relationship_type, strength, description)
SELECT 
  (SELECT id FROM grammar_patterns WHERE pattern = 'いっぷん'),
  (SELECT id FROM grammar_patterns WHERE pattern = 'じゅっぷん'),
  'similar', 0.95, 'Same sandhi pattern (いっ/じゅっ + ぷん)'
ON CONFLICT DO NOTHING;

-- Same number across different counters (confusion risk)
INSERT INTO pattern_relationships (from_pattern_id, to_pattern_id, relationship_type, strength, description)
SELECT 
  (SELECT id FROM grammar_patterns WHERE pattern = 'いっぽん'),
  (SELECT id FROM grammar_patterns WHERE pattern = 'いっこ'),
  'confused', 0.7, 'Same number (1), different counters - easy to mix up'
ON CONFLICT DO NOTHING;

INSERT INTO pattern_relationships (from_pattern_id, to_pattern_id, relationship_type, strength, description)
SELECT 
  (SELECT id FROM grammar_patterns WHERE pattern = 'いっぽん'),
  (SELECT id FROM grammar_patterns WHERE pattern = 'いっぷん'),
  'confused', 0.7, 'Same number (1), different counters - easy to mix up'
ON CONFLICT DO NOTHING;

INSERT INTO pattern_relationships (from_pattern_id, to_pattern_id, relationship_type, strength, description)
SELECT 
  (SELECT id FROM grammar_patterns WHERE pattern = 'ろっぽん'),
  (SELECT id FROM grammar_patterns WHERE pattern = 'ろっこ'),
  'related', 0.8, 'Same number (6), same sandhi pattern'
ON CONFLICT DO NOTHING;

INSERT INTO pattern_relationships (from_pattern_id, to_pattern_id, relationship_type, strength, description)
SELECT 
  (SELECT id FROM grammar_patterns WHERE pattern = 'ろっぽん'),
  (SELECT id FROM grammar_patterns WHERE pattern = 'ろっぷん'),
  'similar', 0.9, 'Same number (6), same sandhi pattern (ろっ + ぽん/ぷん)'
ON CONFLICT DO NOTHING;

-- Easy vs Hard counters (opposites)
INSERT INTO pattern_relationships (from_pattern_id, to_pattern_id, relationship_type, strength, description)
SELECT 
  (SELECT id FROM grammar_patterns WHERE pattern = 'いちまい'),
  (SELECT id FROM grammar_patterns WHERE pattern = 'いっぽん'),
  'opposite', 0.8, 'Easy (no changes) vs Hard (sandhi) - same number 1'
ON CONFLICT DO NOTHING;

-- People exceptions (most critical!)
INSERT INTO pattern_relationships (from_pattern_id, to_pattern_id, relationship_type, strength, description)
SELECT 
  (SELECT id FROM grammar_patterns WHERE pattern = 'さんにん'),
  (SELECT id FROM grammar_patterns WHERE pattern = 'ひとり'),
  'opposite', 0.9, 'Standard counting (3+) vs Exception (1 person)'
ON CONFLICT DO NOTHING;

INSERT INTO pattern_relationships (from_pattern_id, to_pattern_id, relationship_type, strength, description)
SELECT 
  (SELECT id FROM grammar_patterns WHERE pattern = 'さんにん'),
  (SELECT id FROM grammar_patterns WHERE pattern = 'ふたり'),
  'opposite', 0.9, 'Standard counting (3+) vs Exception (2 people)'
ON CONFLICT DO NOTHING;

INSERT INTO pattern_relationships (from_pattern_id, to_pattern_id, relationship_type, strength, description)
SELECT 
  (SELECT id FROM grammar_patterns WHERE pattern = 'ひとり'),
  (SELECT id FROM grammar_patterns WHERE pattern = 'いっこ'),
  'confused', 1.0, 'Common learner mistake: mixing hitori with ikko'
ON CONFLICT DO NOTHING;

INSERT INTO pattern_relationships (from_pattern_id, to_pattern_id, relationship_type, strength, description)
SELECT 
  (SELECT id FROM grammar_patterns WHERE pattern = 'ふたり'),
  (SELECT id FROM grammar_patterns WHERE pattern = 'ふたつ'),
  'confused', 1.0, 'Common learner mistake: mixing futari with futatsu'
ON CONFLICT DO NOTHING;

-- Days of month
INSERT INTO pattern_relationships (from_pattern_id, to_pattern_id, relationship_type, strength, description)
SELECT 
  (SELECT id FROM grammar_patterns WHERE pattern = 'じゅういちにち'),
  (SELECT id FROM grammar_patterns WHERE pattern = 'ついたち'),
  'opposite', 0.9, 'Standard (11th) vs Exception (1st)'
ON CONFLICT DO NOTHING;

INSERT INTO pattern_relationships (from_pattern_id, to_pattern_id, relationship_type, strength, description)
SELECT 
  (SELECT id FROM grammar_patterns WHERE pattern = 'じゅうににち'),
  (SELECT id FROM grammar_patterns WHERE pattern = 'ふつか'),
  'opposite', 0.85, 'Standard (12th) vs Exception (2nd)'
ON CONFLICT DO NOTHING;

INSERT INTO pattern_relationships (from_pattern_id, to_pattern_id, relationship_type, strength, description)
SELECT 
  (SELECT id FROM grammar_patterns WHERE pattern = 'にじゅういちにち'),
  (SELECT id FROM grammar_patterns WHERE pattern = 'はつか'),
  'opposite', 0.9, 'Standard (21st) vs Exception (20th)'
ON CONFLICT DO NOTHING;

-- General vs specific counters
INSERT INTO pattern_relationships (from_pattern_id, to_pattern_id, relationship_type, strength, description)
SELECT 
  (SELECT id FROM grammar_patterns WHERE pattern = 'ひとつ'),
  (SELECT id FROM grammar_patterns WHERE pattern = 'いっこ'),
  'related', 0.75, 'General counter vs Specific counter (small objects)'
ON CONFLICT DO NOTHING;

INSERT INTO pattern_relationships (from_pattern_id, to_pattern_id, relationship_type, strength, description)
SELECT 
  (SELECT id FROM grammar_patterns WHERE pattern = 'ふたつ'),
  (SELECT id FROM grammar_patterns WHERE pattern = 'にこ'),
  'related', 0.75, 'General counter vs Specific counter (small objects)'
ON CONFLICT DO NOTHING;

-- Age exception
INSERT INTO pattern_relationships (from_pattern_id, to_pattern_id, relationship_type, strength, description)
SELECT 
  (SELECT id FROM grammar_patterns WHERE pattern = 'にじゅういちにち'),
  (SELECT id FROM grammar_patterns WHERE pattern = 'はたち'),
  'opposite', 0.9, 'Standard counting (21) vs Exception (20 years old)'
ON CONFLICT DO NOTHING;

-- ============================================
-- VERIFY: Check relationship counts
-- ============================================

SELECT 'Total relationships' as metric, COUNT(*)::text as value FROM pattern_relationships
UNION ALL
SELECT 'By type:', relationship_type || ': ' || COUNT(*)::text FROM pattern_relationships GROUP BY relationship_type
UNION ALL
SELECT 'Counters category:', COUNT(*)::text FROM pattern_relationships pr
  JOIN grammar_patterns gp ON pr.from_pattern_id = gp.id WHERE gp.category = 'Counters';
