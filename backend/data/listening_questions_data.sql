-- Questions for "At the Convenience Store" (passage_id: 1)
INSERT INTO listening_questions (passage_id, question_text, question_type, options, correct_answer, explanation) VALUES
(1, 'How much was the first item?', 'detail', '["100 yen", "150 yen", "200 yen", "320 yen"]', 1, 'The clerk says "150 en desu" (It is 150 yen).'),
(1, 'What did the customer buy in total?', 'main_idea', '["One item for 150 yen", "Two items for 320 yen", "One item for 320 yen", "Two items for 150 yen"]', 1, 'The total with tax was 320 yen (zeikomi de 320 en ni narimasu).'),
(1, 'Where does this conversation take place?', 'inference', '["At a restaurant", "At a convenience store", "At a department store", "At a train station"]', 1, 'The greeting "Irasshaimase" and the context of buying items indicates a convenience store.'),
(1, 'How much change did the customer receive?', 'detail', '["150 yen", "320 yen", "No change mentioned", "The exact amount is not specified"]', 3, 'The conversation mentions receiving change (otsuri) but does not specify the amount paid.');

-- Questions for "Asking for Directions" (passage_id: 2)
INSERT INTO listening_questions (passage_id, question_text, question_type, options, correct_answer, explanation) VALUES
(2, 'Where does person A want to go?', 'detail', '["To a department store", "To the station", "To a restaurant", "To a convenience store"]', 1, 'A asks "Eki wa doko desu ka?" (Where is the station?)'),
(2, 'Which direction should A turn?', 'detail', '["Right", "Left", "Straight ahead", "Turn around"]', 1, 'B says "hidari ni magatte kudasai" (please turn left).'),
(2, 'What landmark is mentioned?', 'detail', '["A convenience store", "A big department store", "A restaurant", "A park"]', 1, 'B mentions "ookii depaato" (big department store) as a landmark.'),
(2, 'What can we infer about the station location?', 'inference', '["It is very far away", "It is in front of the department store", "It is behind the department store", "It is next to the convenience store"]', 1, 'B says "Sono mae desu" meaning "in front of that" (the department store).');

-- Questions for "Ordering at a Restaurant" (passage_id: 3)
INSERT INTO listening_questions (passage_id, question_text, question_type, options, correct_answer, explanation) VALUES
(3, 'How many people are in the customer''s party?', 'detail', '["Two people", "One person", "Three people", "Four people"]', 1, 'The customer says "Hitori desu" (I am alone/one person).'),
(3, 'What did the waiter ask about the meal size?', 'detail', '["If they want a small portion", "If they want a large portion", "If they want dessert", "If they want to take out"]', 1, 'The waiter asks "Oomori ni saremasu ka?" (Would you like a large portion?)'),
(3, 'What did the customer order to drink?', 'detail', '["Tea", "Coffee", "Water", "Juice"]', 2, 'The customer orders "Mizu wo onegaishimasu" (Water, please).'),
(3, 'What can we infer about the restaurant?', 'inference', '["It is very expensive", "It offers large portions", "It is a fast food restaurant", "It is closed"]', 1, 'The waiter asks about "oomori" (large portion), indicating this option is available.');

-- Questions for "Weekend Plans" (passage_id: 4)
INSERT INTO listening_questions (passage_id, question_text, question_type, options, correct_answer, explanation) VALUES
(4, 'What is person B planning to do?', 'detail', '["Go to a restaurant", "Go to the park", "Stay home", "Go shopping"]', 1, 'B says "kouen ni ikou to omotteimasu" (I am thinking of going to the park).'),
(4, 'What condition does B mention for their plan?', 'detail', '["If they have money", "If the weather is good", "If their friend agrees", "If they have time"]', 1, 'B says "Tenki yokattara" (If the weather is good).'),
(4, 'Has B decided who to go with?', 'detail', '["Yes, with a specific friend", "No, not yet decided", "Yes, with person A", "Yes, alone"]', 1, 'B says "mada kimete imasen" (I haven''t decided yet).'),
(4, 'What will happen at the end?', 'inference', '["B will go alone", "A and B will go together", "They will stay home", "They will go to a restaurant"]', 1, 'B says "Issho ni ikimashou" (Let''s go together) and A agrees.');

-- Questions for "Returning an Item" (passage_id: 5)
INSERT INTO listening_questions (passage_id, question_text, question_type, options, correct_answer, explanation) VALUES
(5, 'What item does the customer want to return?', 'detail', '["Pants", "A shirt", "A jacket", "Shoes"]', 1, 'The customer says "kono shatsu" (this shirt).'),
(5, 'Why does the customer want to return the item?', 'detail', '["It is too expensive", "The size is too small", "The color is wrong", "It is damaged"]', 1, 'The customer says "saizu ga chotto chiisakute" (the size is a bit small).'),
(5, 'What does the clerk ask for?', 'detail', '["The item only", "The receipt", "An ID card", "A reason for return"]', 1, 'The clerk asks "Receipt wa omochi desu ka?" (Do you have the receipt?)'),
(5, 'What will happen to the customer''s money?', 'inference', '["They will get store credit", "They will get a refund", "They will exchange for another item", "They will not get money back"]', 1, 'The clerk says "Okane no henkin ni narimasu" (It will be a refund of money).');
