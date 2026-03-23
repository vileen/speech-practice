-- Generate pattern relationships for grammar patterns (non-counters)

DELETE FROM pattern_relationships 
WHERE from_pattern_id IN (SELECT id FROM grammar_patterns WHERE category != 'Counters');

-- Create simple hardcoded relationships based on known IDs
-- Permission (id around 1-10) vs Prohibition (id around 11-20)
INSERT INTO pattern_relationships (from_pattern_id, to_pattern_id, relationship_type, strength, description)
SELECT 
  p1.id, p2.id, 'opposite', 1.0, 'Permission vs Prohibition'
FROM grammar_patterns p1, grammar_patterns p2
WHERE p1.category = 'Permission' AND p2.category = 'Prohibition'
AND p1.category != 'Counters' AND p2.category != 'Counters'
LIMIT 1;

-- Ability patterns are related
INSERT INTO pattern_relationships (from_pattern_id, to_pattern_id, relationship_type, strength, description)
SELECT 
  p1.id, p2.id, 'similar', 0.9, 'Similar ability expressions'
FROM grammar_patterns p1, grammar_patterns p2
WHERE p1.category = 'Ability' AND p2.category = 'Ability'
AND p1.id < p2.id
AND p1.category != 'Counters'
LIMIT 5;

-- Desire patterns are related
INSERT INTO pattern_relationships (from_pattern_id, to_pattern_id, relationship_type, strength, description)
SELECT 
  p1.id, p2.id, 'similar', 0.85, 'Similar desire expressions'
FROM grammar_patterns p1, grammar_patterns p2
WHERE p1.category = 'Desire' AND p2.category = 'Desire'
AND p1.id < p2.id
AND p1.category != 'Counters'
LIMIT 5;

-- Suggestion patterns
INSERT INTO pattern_relationships (from_pattern_id, to_pattern_id, relationship_type, strength, description)
SELECT 
  p1.id, p2.id, 'similar', 0.85, 'Similar suggestion forms'
FROM grammar_patterns p1, grammar_patterns p2
WHERE p1.category = 'Suggestion' AND p2.category = 'Suggestion'
AND p1.id < p2.id
AND p1.category != 'Counters'
LIMIT 5;

-- Obligation vs Prohibition (opposites)
INSERT INTO pattern_relationships (from_pattern_id, to_pattern_id, relationship_type, strength, description)
SELECT 
  p1.id, p2.id, 'opposite', 0.95, 'Obligation vs Prohibition'
FROM grammar_patterns p1, grammar_patterns p2
WHERE p1.category = 'Obligation' AND p2.category = 'Prohibition'
AND p1.category != 'Counters' AND p2.category != 'Counters'
LIMIT 3;

-- Invitation vs Suggestion (related)
INSERT INTO pattern_relationships (from_pattern_id, to_pattern_id, relationship_type, strength, description)
SELECT 
  p1.id, p2.id, 'related', 0.8, 'Invitation and suggestion are similar'
FROM grammar_patterns p1, grammar_patterns p2
WHERE p1.category = 'Invitation' AND p2.category = 'Suggestion'
AND p1.category != 'Counters' AND p2.category != 'Counters'
LIMIT 2;

-- Verb Conjugation patterns (confused - same group different forms)
INSERT INTO pattern_relationships (from_pattern_id, to_pattern_id, relationship_type, strength, description)
SELECT 
  p1.id, p2.id, 'confused', 0.9, 'Same conjugation, different forms'
FROM grammar_patterns p1, grammar_patterns p2
WHERE p1.category = 'Verb Conjugation' AND p2.category = 'Verb Conjugation'
AND p1.pattern LIKE 'Godan%' AND p2.pattern LIKE 'Godan%'
AND p1.id < p2.id
LIMIT 10;

INSERT INTO pattern_relationships (from_pattern_id, to_pattern_id, relationship_type, strength, description)
SELECT 
  p1.id, p2.id, 'confused', 0.85, 'Different verb groups'
FROM grammar_patterns p1, grammar_patterns p2
WHERE p1.category = 'Verb Conjugation' AND p2.category = 'Verb Conjugation'
AND p1.pattern LIKE 'Godan%' AND p2.pattern LIKE 'Ichidan%'
LIMIT 5;

-- Report
SELECT 'Total grammar relationships: ' || COUNT(*)::text as result 
FROM pattern_relationships 
WHERE from_pattern_id IN (SELECT id FROM grammar_patterns WHERE category != 'Counters');
