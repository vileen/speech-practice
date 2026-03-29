-- Fix construction exercises to specify full sentence is expected
UPDATE grammar_exercises 
SET prompt = REPLACE(prompt, 'Ask for permission', 'Write a full sentence asking for permission')
WHERE type = 'construction' AND prompt LIKE 'Ask for permission%';

UPDATE grammar_exercises 
SET prompt = REPLACE(prompt, 'Say:', 'Write a full sentence:')
WHERE type = 'construction' AND prompt LIKE 'Say:%';

UPDATE grammar_exercises 
SET prompt = REPLACE(prompt, 'Say ', 'Write a full sentence: ')
WHERE type = 'construction' AND prompt LIKE 'Say %' AND prompt NOT LIKE '%Say you%';

UPDATE grammar_exercises 
SET prompt = REPLACE(prompt, 'Invite someone', 'Write a full sentence to invite someone')
WHERE type = 'construction' AND prompt LIKE 'Invite someone%';

UPDATE grammar_exercises 
SET prompt = REPLACE(prompt, 'Suggest:', 'Write a full sentence suggesting:')
WHERE type = 'construction' AND prompt LIKE 'Suggest:%';

-- Add note about including か for questions and 。at the end
UPDATE grammar_exercises 
SET prompt = prompt || E'\n(Include か for questions and 。at the end)'
WHERE type = 'construction' 
AND correct_answer LIKE '%か。%'
AND prompt NOT LIKE '%か for questions%';

-- Fix fill_blank exercises to specify just fill in the blank
UPDATE grammar_exercises 
SET prompt = 'Fill in the blank with the correct form: ' || prompt || E'\n(Only type the missing words, not the full sentence)'
WHERE type = 'fill_blank' 
AND prompt NOT LIKE '%Fill in the blank%';

-- Fix transformation exercises
UPDATE grammar_exercises 
SET prompt = prompt || E'\n(Rewrite the sentence using the new information)'
WHERE type = 'transformation' AND prompt NOT LIKE '%Rewrite%';
