-- Sample Reading Passages and Questions
-- N5 Level (Beginner)

INSERT INTO reading_passages (title, content, level, topic, character_count) VALUES
('わたしのかぞく', 'わたしのなまえはたなかたろうです。にほんじんです。いま、とうきょうにすんでいます。わたしのかぞくはよにんです。ちちとははといもうととわたしです。ちちはいしゃです。かいしゃにつとめています。はははしゅふです。いもうとはだいがくせいです。かれしがいます。わたしはべんきょうしています。まいにち、にほんごをべんきょうします。しゅうまつはともだちとあそびます。', 'N5', 'Family', 187);

INSERT INTO reading_questions (passage_id, question, options, correct_answer, explanation, question_type) VALUES
((SELECT id FROM reading_passages WHERE title = 'わたしのかぞく'),
'たなかさんのかぞくはなんにんですか。',
'["さんにん", "よにん", "ごにん", "ろくにん"]'::jsonb,
1,
'「わたしのかぞくはよにんです」というぶんから、かぞくは４にんです。',
'detail');

INSERT INTO reading_questions (passage_id, question, options, correct_answer, explanation, question_type) VALUES
((SELECT id FROM reading_passages WHERE title = 'わたしのかぞく'),
'たなかさんのちちのしごとはなんですか。',
'["いしゃ", "しゅふ", "だいがくせい", "べんきょう"]'::jsonb,
0,
'「ちちはいしゃです」というぶんから、ちちはいしゃです。',
'detail');

INSERT INTO reading_questions (passage_id, question, options, correct_answer, explanation, question_type) VALUES
((SELECT id FROM reading_passages WHERE title = 'わたしのかぞく'),
'このぶんしょうのメインアイディアはなんですか。',
'["たなかさんのにほんごのべんきょう", "たなかさんのかぞくのしょうかい", "たなかさんのともだち", "たなかさんのしゅうまつ"]'::jsonb,
1,
'このぶんしょうはたなかさんのかぞくについてかいています。かぞくのだれかについてかいています。',
'main_idea');

-- N4 Level (Elementary)

INSERT INTO reading_passages (title, content, level, topic, character_count) VALUES
('たびのよてい', 'らいしゅう、きょうとへりょこうにいくことになりました。きょうとはにほんのむかしのみやこで、おてらやじんじゃがおおいです。ともだちといっしょにいきます。しんかんせんでいきます。あさくにのはなびをみます。ひるはきょうりょうりをたべます。ゆうがたはまちをさんぽします。よるはりょかんでやすみます。おみやげをかいたいとおもいます。きれいなものをかいます。たのしみです。',
'N4', 'Travel', 174);

INSERT INTO reading_questions (passage_id, question, options, correct_answer, explanation, question_type) VALUES
((SELECT id FROM reading_passages WHERE title = 'たびのよてい'),
'きょうとへなんでありきますか。',
'["ひこうき", "しんかんせん", "くるま", "バス"]'::jsonb,
1,
'「しんかんせんでいきます」というぶんから、しんかんせんでいきます。',
'detail');

INSERT INTO reading_questions (passage_id, question, options, correct_answer, explanation, question_type) VALUES
((SELECT id FROM reading_passages WHERE title = 'たびのよてい'),
'よるはなにしますか。',
'["おてらをみます", "りょかんでやすみます", "さんぽします", "はなびをみます"]'::jsonb,
1,
'「よるはりょかんでやすみます」というぶんから、よるはりょかんでやすみます。',
'detail');

INSERT INTO reading_questions (passage_id, question, options, correct_answer, explanation, question_type) VALUES
((SELECT id FROM reading_passages WHERE title = 'たびのよてい'),
'このひとがきょうとできょうりょうりをたべるじかんはいつですか。',
'["あさ", "ひる", "ゆうがた", "よる"]'::jsonb,
1,
'「ひるはきょうりょうりをたべます」というぶんから、ひるにたべます。',
'inference');

-- N3 Level (Intermediate)

INSERT INTO reading_passages (title, content, level, topic, character_count) VALUES
('でんしゃのちこく', 'きょうはしごとにでんしゃでいくつもりでした。しかし、あさおきたとき、でんしゃがちこくしていることがわかりました。てんきがわるくて、あめがふっていたからです。えきについたら、ひとがおおくて、でんしゃにのるのにじかんがかかりました。しごとにつくのがおそくなるとおもいました。かちょうにでんわをして、ちこくすることをつたえました。かちょうは「わかった。きをつけてきてください」といいました。しごとについたとき、かちょうはおこっていませんでした。でも、わたしはきんちょうしました。つぎからは、じかんにはやくでかけるようにします。',
'N3', 'Work', 226);

INSERT INTO reading_questions (passage_id, question, options, correct_answer, explanation, question_type) VALUES
((SELECT id FROM reading_passages WHERE title = 'でんしゃのちこく'),
'でんしゃがちこくしたりゆうはなんですか。',
'["てんきがわるかった", "えきがとおかった", "かちょうがよんだ", "あさおきられなかった"]'::jsonb,
0,
'「てんきがわるくて、あめがふっていたからです」というぶんから、てんきがわるかったからです。',
'detail');

INSERT INTO reading_questions (passage_id, question, options, correct_answer, explanation, question_type) VALUES
((SELECT id FROM reading_passages WHERE title = 'でんしゃのちこく'),
'かちょうはどうおもいましたか。',
'["おこっていました", "きんちょうしていました", "おこっていませんでした", "しらない"]'::jsonb,
2,
'「かちょうはおこっていませんでした」というぶんから、かちょうはおこっていませんでした。',
'inference');

INSERT INTO reading_questions (passage_id, question, options, correct_answer, explanation, question_type) VALUES
((SELECT id FROM reading_passages WHERE title = 'でんしゃのちこく'),
'このぶんしょうからわかることはどれですか。',
'["きょうはしごとをやすみました", "つぎからじかんにはやくでかけます", "かちょうにしかられました", "でんしゃにのれませんでした"]'::jsonb,
1,
'さいごのぶん「つぎからは、じかんにはやくでかけるようにします」から、つぎからはやくでかけるとおもっています。',
'main_idea');
