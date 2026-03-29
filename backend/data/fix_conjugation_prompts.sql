-- Fix conjugation exercises to include expected answer format
-- Add explicit instructions about what to type

UPDATE grammar_exercises 
SET prompt = 'Type the past form of する (just the conjugated verb)'
WHERE pattern_id = 264 AND correct_answer = 'した';

UPDATE grammar_exercises 
SET prompt = 'Type the polite (masu) form of する (just the conjugated verb)'
WHERE pattern_id = 264 AND correct_answer = 'します';

UPDATE grammar_exercises 
SET prompt = 'Type the te-form of する (just the conjugated verb)'
WHERE pattern_id = 264 AND correct_answer = 'して';

UPDATE grammar_exercises 
SET prompt = 'Type the negative (nai) form of する (just the conjugated verb)'
WHERE pattern_id = 264 AND correct_answer = 'しない';

-- Fix all other conjugation exercises to specify format
UPDATE grammar_exercises 
SET prompt = REPLACE(prompt, 'Conjugate ', 'Type the conjugated form of ')
WHERE type = 'conjugation' AND prompt LIKE 'Conjugate %';

-- Add "(just the conjugated verb)" to conjugation exercises that don't have it
UPDATE grammar_exercises 
SET prompt = prompt || ' (just the conjugated verb, e.g., 書きます, 待って, しない)'
WHERE type = 'conjugation' 
AND prompt NOT LIKE '%(just%' 
AND prompt NOT LIKE '%e.g.%';
