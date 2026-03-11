-- Kanji from Lesson 2026-03-04 (Nakereba Narimasen) and 2026-03-09 (Nakute mo ii desu)
-- Lesson #29 and #30

INSERT INTO kanji (character, readings, meanings, jlpt_level, stroke_count, examples, lesson_id, tags) VALUES
-- From Lesson 2026-03-04
('山', '[{"type": "kun", "reading": "やま"}, {"type": "on", "reading": "サン"}]'::jsonb, 
 ARRAY['mountain', 'hill'], 'N5', 3, 
 '[{"word": "火山", "reading": "かざん", "meaning": "volcano"}, {"word": "富士山", "reading": "ふじさん", "meaning": "Mt. Fuji"}, {"word": "山道", "reading": "やまみち", "meaning": "mountain path"}]'::jsonb,
 '2026-03-04', ARRAY['nature', 'geography', 'common']),

('川', '[{"type": "kun", "reading": "かわ"}, {"type": "on", "reading": "セン"}]'::jsonb, 
 ARRAY['river', 'stream'], 'N5', 3, 
 '[{"word": "川口", "reading": "かわぐち", "meaning": "river mouth"}]'::jsonb,
 '2026-03-04', ARRAY['nature', 'geography', 'water']),

('小', '[{"type": "kun", "reading": "ちい"}, {"type": "on", "reading": "ショウ"}, {"type": "prefix", "reading": "お"}, {"type": "prefix", "reading": "こ"}]'::jsonb, 
 ARRAY['small', 'little'], 'N5', 3, 
 '[{"word": "小さい", "reading": "ちいさい", "meaning": "small"}, {"word": "小川", "reading": "おがわ", "meaning": "small river"}]'::jsonb,
 '2026-03-04', ARRAY['size', 'common', 'prefix']),

('火', '[{"type": "kun", "reading": "ひ"}, {"type": "on", "reading": "カ"}]'::jsonb, 
 ARRAY['fire', 'flame'], 'N5', 4, 
 '[{"word": "火山", "reading": "かざん", "meaning": "volcano"}, {"word": "花火", "reading": "はなび", "meaning": "fireworks"}, {"word": "火曜日", "reading": "かようび", "meaning": "Tuesday"}]'::jsonb,
 '2026-03-04', ARRAY['nature', 'elements', 'common']),

('人', '[{"type": "kun", "reading": "ひと"}, {"type": "on", "reading": "ジン"}, {"type": "on", "reading": "ニン"}]'::jsonb, 
 ARRAY['person', 'people', 'human'], 'N5', 2, 
 '[{"word": "人気", "reading": "にんき", "meaning": "popular"}, {"word": "日本人", "reading": "にほんじん", "meaning": "Japanese person"}]'::jsonb,
 '2026-03-04', ARRAY['people', 'common', 'basic']),

('気', '[{"type": "on", "reading": "キ"}, {"type": "on", "reading": "ケ"}]'::jsonb, 
 ARRAY['spirit', 'mind', 'air', 'mood'], 'N5', 6, 
 '[{"word": "人気", "reading": "にんき", "meaning": "popular"}, {"word": "天気", "reading": "てんき", "meaning": "weather"}]'::jsonb,
 '2026-03-04', ARRAY['abstract', 'common']),

('色', '[{"type": "kun", "reading": "いろ"}, {"type": "on", "reading": "ショク"}, {"type": "on", "reading": "シキ"}]'::jsonb, 
 ARRAY['color', 'variety'], 'N5', 6, 
 '[{"word": "色々", "reading": "いろいろ", "meaning": "various"}, {"word": "色", "reading": "いろ", "meaning": "color"}]'::jsonb,
 '2026-03-04', ARRAY['visual', 'common']),

('合', '[{"type": "kun", "reading": "あ"}, {"type": "on", "reading": "ゴウ"}, {"type": "on", "reading": "ガツ"}]'::jsonb, 
 ARRAY['fit', 'suit', 'join', 'match'], 'N5', 6, 
 '[{"word": "合わせる", "reading": "あわせる", "meaning": "to match"}, {"word": "試合", "reading": "しあい", "meaning": "match/game"}]'::jsonb,
 '2026-03-04', ARRAY['action', 'verb-stem']),

('易', '[{"type": "kun", "reading": "やさ"}, {"type": "on", "reading": "エキ"}, {"type": "on", "reading": "イ"}]'::jsonb, 
 ARRAY['easy', 'simple'], 'N5', 8, 
 '[{"word": "易しい", "reading": "やさしい", "meaning": "easy"}]'::jsonb,
 '2026-03-04', ARRAY['difficulty', 'adjective']),

('利', '[{"type": "kun", "reading": "き"}, {"type": "on", "reading": "リ"}]'::jsonb, 
 ARRAY['advantage', 'benefit', 'profit'], 'N4', 7, 
 '[{"word": "利用", "reading": "りよう", "meaning": "use/utilization"}, {"word": "便利", "reading": "べんり", "meaning": "convenient"}]'::jsonb,
 '2026-03-04', ARRAY['abstract', 'noun']),

('用', '[{"type": "kun", "reading": "もち"}, {"type": "on", "reading": "ヨウ"}]'::jsonb, 
 ARRAY['use', 'employ', 'utilize'], 'N4', 5, 
 '[{"word": "利用", "reading": "りよう", "meaning": "use/utilization"}]'::jsonb,
 '2026-03-04', ARRAY['action', 'noun']),

('敬', '[{"type": "on", "reading": "ケイ"}]'::jsonb, 
 ARRAY['respect', 'honor'], 'N3', 12, 
 '[{"word": "敬語", "reading": "けいご", "meaning": "honorific language"}]'::jsonb,
 '2026-03-04', ARRAY['language', 'politeness']),

('語', '[{"type": "kun", "reading": "かた"}, {"type": "on", "reading": "ゴ"}]'::jsonb, 
 ARRAY['word', 'language', 'speech'], 'N5', 14, 
 '[{"word": "敬語", "reading": "けいご", "meaning": "honorific language"}, {"word": "日本語", "reading": "にほんご", "meaning": "Japanese language"}]'::jsonb,
 '2026-03-04', ARRAY['language', 'common']),

('汚', '[{"type": "kun", "reading": "きたな"}, {"type": "kun", "reading": "けが"}, {"type": "on", "reading": "オ"}]'::jsonb, 
 ARRAY['dirty', 'pollute', 'disgrace'], 'N4', 6, 
 '[{"word": "汚い", "reading": "きたない", "meaning": "dirty"}]'::jsonb,
 '2026-03-04', ARRAY['adjective', 'state']),

('洗', '[{"type": "kun", "reading": "あら"}, {"type": "on", "reading": "セン"}]'::jsonb, 
 ARRAY['wash', 'cleanse'], 'N4', 9, 
 '[{"word": "洗濯", "reading": "せんたく", "meaning": "laundry"}, {"word": "洗う", "reading": "あらう", "meaning": "to wash"}]'::jsonb,
 '2026-03-04', ARRAY['action', 'verb-stem']),

('濯', '[{"type": "on", "reading": "タク"}]'::jsonb, 
 ARRAY['wash', 'rinse'], 'N1', 17, 
 '[{"word": "洗濯", "reading": "せんたく", "meaning": "laundry"}]'::jsonb,
 '2026-03-04', ARRAY['action', 'compound']),

('借', '[{"type": "kun", "reading": "か"}, {"type": "on", "reading": "シャク"}]'::jsonb, 
 ARRAY['borrow', 'rent'], 'N5', 10, 
 '[{"word": "借りる", "reading": "かりる", "meaning": "to borrow"}]'::jsonb,
 '2026-03-04', ARRAY['action', 'verb-stem']),

('浴', '[{"type": "kun", "reading": "あ"}, {"type": "on", "reading": "ヨク"}]'::jsonb, 
 ARRAY['bathe', 'be flooded with'], 'N3', 10, 
 '[{"word": "浴びる", "reading": "あびる", "meaning": "to take (shower)"}]'::jsonb,
 '2026-03-04', ARRAY['action', 'verb-stem']),

('起', '[{"type": "kun", "reading": "お"}, {"type": "on", "reading": "キ"}]'::jsonb, 
 ARRAY['wake up', 'get up', 'occur'], 'N4', 10, 
 '[{"word": "起きる", "reading": "おきる", "meaning": "to wake up"}, {"word": "起こる", "reading": "おこる", "meaning": "to happen"}]'::jsonb,
 '2026-03-04', ARRAY['action', 'verb-stem', 'common']),

('登', '[{"type": "kun", "reading": "のぼ"}, {"type": "on", "reading": "トウ"}, {"type": "on", "reading": "ト"}]'::jsonb, 
 ARRAY['climb', 'ascend', 'mount'], 'N4', 12, 
 '[{"word": "登る", "reading": "のぼる", "meaning": "to climb"}]'::jsonb,
 '2026-03-04', ARRAY['action', 'verb-stem']),

('芋', '[{"type": "kun", "reading": "いも"}]'::jsonb, 
 ARRAY['potato', 'tuber'], 'N3', 7, 
 '[{"word": "山芋", "reading": "やまいも", "meaning": "mountain potato"}, {"word": "芋", "reading": "いも", "meaning": "potato"}]'::jsonb,
 '2026-03-04', ARRAY['food', 'nature']),

('野', '[{"type": "kun", "reading": "の"}, {"type": "on", "reading": "ヤ"}, {"type": "on", "reading": "ショ"}]'::jsonb, 
 ARRAY['field', 'plains', 'wild'], 'N4', 11, 
 '[{"word": "野菜", "reading": "やさい", "meaning": "vegetables"}, {"word": "野球", "reading": "やきゅう", "meaning": "baseball"}]'::jsonb,
 '2026-03-04', ARRAY['nature', 'common']),

('菜', '[{"type": "on", "reading": "サイ"}]'::jsonb, 
 ARRAY['vegetable', 'greens'], 'N4', 11, 
 '[{"word": "野菜", "reading": "やさい", "meaning": "vegetables"}]'::jsonb,
 '2026-03-04', ARRAY['food', 'nature']),

('高', '[{"type": "kun", "reading": "たか"}, {"type": "on", "reading": "コウ"}]'::jsonb, 
 ARRAY['high', 'tall', 'expensive', 'loud'], 'N5', 10, 
 '[{"word": "高い", "reading": "たかい", "meaning": "high/tall/expensive"}, {"word": "高校", "reading": "こうこう", "meaning": "high school"}]'::jsonb,
 '2026-03-04', ARRAY['common', 'adjective', 'opposites']),

('短', '[{"type": "kun", "reading": "みじか"}, {"type": "on", "reading": "タン"}]'::jsonb, 
 ARRAY['short', 'brief'], 'N4', 12, 
 '[{"word": "短い", "reading": "みじかい", "meaning": "short (length)"}]'::jsonb,
 '2026-03-04', ARRAY['size', 'adjective', 'opposites']),

('新', '[{"type": "kun", "reading": "あたら"}, {"type": "kun", "reading": "にい"}, {"type": "on", "reading": "シン"}]'::jsonb, 
 ARRAY['new', 'fresh', 'modern'], 'N4', 13, 
 '[{"word": "新しい", "reading": "あたらしい", "meaning": "new"}, {"word": "新聞", "reading": "しんぶん", "meaning": "newspaper"}]'::jsonb,
 '2026-03-04', ARRAY['common', 'adjective', 'time']),

('薬', '[{"type": "kun", "reading": "くすり"}, {"type": "on", "reading": "ヤク"}]'::jsonb, 
 ARRAY['medicine', 'drug', 'chemical'], 'N3', 16, 
 '[{"word": "薬", "reading": "くすり", "meaning": "medicine"}, {"word": "薬局", "reading": "やっきょく", "meaning": "pharmacy"}]'::jsonb,
 '2026-03-04', ARRAY['health', 'noun']),

('試', '[{"type": "kun", "reading": "こころ"}, {"type": "kun", "reading": "ため"}, {"type": "on", "reading": "シ"}]'::jsonb, 
 ARRAY['test', 'try', 'attempt'], 'N4', 13, 
 '[{"word": "試験", "reading": "しけん", "meaning": "exam/test"}, {"word": "試す", "reading": "ためす", "meaning": "to try"}]'::jsonb,
 '2026-03-04', ARRAY['education', 'noun']),

('験', '[{"type": "on", "reading": "ケン"}, {"type": "on", "reading": "ゲン"}]'::jsonb, 
 ARRAY['test', 'examination', 'verification'], 'N3', 18, 
 '[{"word": "試験", "reading": "しけん", "meaning": "exam/test"}, {"word": "体験", "reading": "たいけん", "meaning": "experience"}]'::jsonb,
 '2026-03-04', ARRAY['education', 'compound']),

('毎', '[{"type": "on", "reading": "マイ"}]'::jsonb, 
 ARRAY['every', 'each'], 'N5', 6, 
 '[{"word": "毎日", "reading": "まいにち", "meaning": "every day"}, {"word": "毎週", "reading": "まいしゅう", "meaning": "every week"}]'::jsonb,
 '2026-03-04', ARRAY['time', 'common', 'prefix']),

('明', '[{"type": "kun", "reading": "あ"}, {"type": "kun", "reading": "あか"}, {"type": "kun", "reading": "あき"}, {"type": "on", "reading": "メイ"}, {"type": "on", "reading": "ミョウ"}]'::jsonb, 
 ARRAY['bright', 'light', 'tomorrow'], 'N4', 8, 
 '[{"word": "明日", "reading": "あした", "meaning": "tomorrow"}, {"word": "明るい", "reading": "あかるい", "meaning": "bright"}]'::jsonb,
 '2026-03-04', ARRAY['time', 'common']),

('朝', '[{"type": "kun", "reading": "あさ"}, {"type": "on", "reading": "チョウ"}]'::jsonb, 
 ARRAY['morning', 'dynasty'], 'N5', 12, 
 '[{"word": "朝", "reading": "あさ", "meaning": "morning"}, {"word": "朝ご飯", "reading": "あさごはん", "meaning": "breakfast"}]'::jsonb,
 '2026-03-04', ARRAY['time', 'common']),

('脱', '[{"type": "kun", "reading": "ぬ"}, {"type": "on", "reading": "ダツ"}]'::jsonb, 
 ARRAY['remove', 'take off', 'undress'], 'N3', 11, 
 '[{"word": "脱ぐ", "reading": "ぬぐ", "meaning": "to take off (clothes)"}]'::jsonb,
 '2026-03-04', ARRAY['action', 'verb-stem', 'clothing']),

('着', '[{"type": "kun", "reading": "き"}, {"type": "kun", "reading": "つ"}, {"type": "on", "reading": "チャク"}, {"type": "on", "reading": "ジャク"}]'::jsonb, 
 ARRAY['wear', 'arrive', 'counter for clothes'], 'N5', 12, 
 '[{"word": "着る", "reading": "きる", "meaning": "to wear"}, {"word": "着く", "reading": "つく", "meaning": "to arrive"}]'::jsonb,
 '2026-03-04', ARRAY['action', 'verb-stem', 'clothing', 'common']),

-- From Lesson 2026-03-09
('急', '[{"type": "kun", "reading": "いそ"}, {"type": "on", "reading": "キュウ"}]'::jsonb, 
 ARRAY['hurry', 'emergency', 'sudden'], 'N4', 9, 
 '[{"word": "急ぐ", "reading": "いそぐ", "meaning": "to hurry"}]'::jsonb,
 '2026-03-09', ARRAY['action', 'verb-stem', 'time']),

('走', '[{"type": "kun", "reading": "はし"}, {"type": "on", "reading": "ソウ"}]'::jsonb, 
 ARRAY['run', 'dash'], 'N5', 7, 
 '[{"word": "走る", "reading": "はしる", "meaning": "to run"}]'::jsonb,
 '2026-03-09', ARRAY['action', 'verb-stem', 'movement']),

('時', '[{"type": "kun", "reading": "とき"}, {"type": "on", "reading": "ジ"}]'::jsonb, 
 ARRAY['time', 'hour', 'moment'], 'N5', 10, 
 '[{"word": "時間", "reading": "じかん", "meaning": "time"}, {"word": "時", "reading": "とき", "meaning": "time/when"}]'::jsonb,
 '2026-03-09', ARRAY['time', 'common', 'basic']),

('間', '[{"type": "kun", "reading": "あいだ"}, {"type": "kun", "reading": "ま"}, {"type": "on", "reading": "カン"}, {"type": "on", "reading": "ケン"}]'::jsonb, 
 ARRAY['interval', 'space', 'between'], 'N5', 12, 
 '[{"word": "時間", "reading": "じかん", "meaning": "time"}, {"word": "間", "reading": "あいだ", "meaning": "between/while"}]'::jsonb,
 '2026-03-09', ARRAY['time', 'common', 'basic']),

('節', '[{"type": "kun", "reading": "ふし"}, {"type": "on", "reading": "セツ"}, {"type": "on", "reading": "セチ"}]'::jsonb, 
 ARRAY['node', 'season', 'joint'], 'N2', 13, 
 '[{"word": "節分", "reading": "せつぶん", "meaning": "Setsubun festival"}]'::jsonb,
 '2026-03-09', ARRAY['seasons', 'culture', 'festival']),

('分', '[{"type": "kun", "reading": "わ"}, {"type": "on", "reading": "フン"}, {"type": "on", "reading": "ブン"}]'::jsonb, 
 ARRAY['minute', 'part', 'understand', 'divide'], 'N5', 4, 
 '[{"word": "節分", "reading": "せつぶん", "meaning": "Setsubun festival"}, {"word": "分かる", "reading": "わかる", "meaning": "to understand"}]'::jsonb,
 '2026-03-09', ARRAY['time', 'common', 'basic']),

('鬼', '[{"type": "on", "reading": "キ"}]'::jsonb, 
 ARRAY['demon', 'ogre'], 'N2', 10, 
 '[{"word": "鬼", "reading": "おに", "meaning": "demon/ogre"}]'::jsonb,
 '2026-03-09', ARRAY['culture', 'festival', 'folklore']),

('福', '[{"type": "on", "reading": "フク"}]'::jsonb, 
 ARRAY['fortune', 'luck', 'blessing'], 'N3', 13, 
 '[{"word": "福", "reading": "ふく", "meaning": "fortune/luck"}, {"word": "幸福", "reading": "こうふく", "meaning": "happiness"}]'::jsonb,
 '2026-03-09', ARRAY['culture', 'festival', 'abstract']),

('外', '[{"type": "kun", "reading": "そと"}, {"type": "kun", "reading": "ほか"}, {"type": "kun", "reading": "はず"}, {"type": "on", "reading": "ガイ"}, {"type": "on", "reading": "ゲ"}]'::jsonb, 
 ARRAY['outside', 'external', 'other'], 'N5', 5, 
 '[{"word": "外", "reading": "そと", "meaning": "outside"}, {"word": "外国", "reading": "がいこく", "meaning": "foreign country"}]'::jsonb,
 '2026-03-09', ARRAY['location', 'common', 'basic', 'opposites']),

('内', '[{"type": "kun", "reading": "うち"}, {"type": "on", "reading": "ナイ"}, {"type": "on", "reading": "ダイ"}]'::jsonb, 
 ARRAY['inside', 'within', 'home'], 'N5', 4, 
 '[{"word": "内", "reading": "うち", "meaning": "inside/home"}]'::jsonb,
 '2026-03-09', ARRAY['location', 'common', 'opposites']),

('豆', '[{"type": "kun", "reading": "まめ"}, {"type": "on", "reading": "トウ"}, {"type": "on", "reading": "ズ"}]'::jsonb, 
 ARRAY['beans', 'pea'], 'N3', 7, 
 '[{"word": "豆", "reading": "まめ", "meaning": "beans"}, {"word": "豆まき", "reading": "まめまき", "meaning": "bean throwing"}]'::jsonb,
 '2026-03-09', ARRAY['food', 'culture', 'festival']),

('春', '[{"type": "kun", "reading": "はる"}, {"type": "on", "reading": "シュン"}]'::jsonb, 
 ARRAY['spring'], 'N4', 9, 
 '[{"word": "春", "reading": "はる", "meaning": "spring"}, {"word": "春休み", "reading": "はるやすみ", "meaning": "spring break"}]'::jsonb,
 '2026-03-09', ARRAY['seasons', 'time', 'nature']),

('夏', '[{"type": "kun", "reading": "なつ"}, {"type": "on", "reading": "カ"}]'::jsonb, 
 ARRAY['summer'], 'N4', 10, 
 '[{"word": "夏", "reading": "なつ", "meaning": "summer"}, {"word": "夏休み", "reading": "なつやすみ", "meaning": "summer vacation"}]'::jsonb,
 '2026-03-09', ARRAY['seasons', 'time', 'nature']),

('冬', '[{"type": "kun", "reading": "ふゆ"}, {"type": "on", "reading": "トウ"}]'::jsonb, 
 ARRAY['winter'], 'N4', 5, 
 '[{"word": "冬", "reading": "ふゆ", "meaning": "winter"}, {"word": "冬休み", "reading": "ふゆやすみ", "meaning": "winter break"}]'::jsonb,
 '2026-03-09', ARRAY['seasons', 'time', 'nature']),

('寂', '[{"type": "on", "reading": "ジャク"}, {"type": "on", "reading": "セキ"}]'::jsonb, 
 ARRAY['lonely', 'desolate'], 'N3', 11, 
 '[{"word": "寂しい", "reading": "さびしい", "meaning": "lonely"}]'::jsonb,
 '2026-03-09', ARRAY['emotions', 'adjective']),

('丁', '[{"type": "on", "reading": "チョウ"}, {"type": "on", "reading": "テイ"}]'::jsonb, 
 ARRAY['street', 'ward', 'counter for guns'], 'N3', 2, 
 '[{"word": "丁寧", "reading": "ていねい", "meaning": "polite"}]'::jsonb,
 '2026-03-09', ARRAY['politeness', 'abstract']),

('寧', '[{"type": "on", "reading": "ネイ"}]'::jsonb, 
 ARRAY['rather', 'peaceful'], 'N1', 14, 
 '[{"word": "丁寧", "reading": "ていねい", "meaning": "polite"}]'::jsonb,
 '2026-03-09', ARRAY['politeness', 'compound']),

('掃', '[{"type": "kun", "reading": "は"}, {"type": "on", "reading": "ソウ"}, {"type": "on", "reading": "ショウ"}]'::jsonb, 
 ARRAY['sweep', 'clean'], 'N3', 11, 
 '[{"word": "掃除", "reading": "そうじ", "meaning": "cleaning"}]'::jsonb,
 '2026-03-09', ARRAY['action', 'verb-stem', 'housework']),

('除', '[{"type": "kun", "reading": "のぞ"}, {"type": "on", "reading": "ジョ"}, {"type": "on", "reading": "ジ"}]'::jsonb, 
 ARRAY['exclude', 'remove'], 'N3', 10, 
 '[{"word": "掃除", "reading": "そうじ", "meaning": "cleaning"}]'::jsonb,
 '2026-03-09', ARRAY['action', 'compound', 'housework']),

('傘', '[{"type": "kun", "reading": "かさ"}]'::jsonb, 
 ARRAY['umbrella'], 'N3', 12, 
 '[{"word": "傘", "reading": "かさ", "meaning": "umbrella"}]'::jsonb,
 '2026-03-09', ARRAY['objects', 'weather', 'noun']),

('引', '[{"type": "kun", "reading": "ひ"}, {"type": "on", "reading": "イン"}]'::jsonb, 
 ARRAY['pull', 'draw', 'subtract'], 'N4', 4, 
 '[{"word": "引く", "reading": "ひく", "meaning": "to pull"}]'::jsonb,
 '2026-03-09', ARRAY['action', 'verb-stem', 'common']),

('開', '[{"type": "kun", "reading": "ひら"}, {"type": "kun", "reading": "あ"}, {"type": "on", "reading": "カイ"}]'::jsonb, 
 ARRAY['open', 'unfold', 'develop'], 'N4', 12, 
 '[{"word": "開く", "reading": "ひらく", "meaning": "to open"}]'::jsonb,
 '2026-03-09', ARRAY['action', 'verb-stem', 'common']),

('電', '[{"type": "on", "reading": "デン"}]'::jsonb, 
 ARRAY['electricity', 'electric'], 'N4', 13, 
 '[{"word": "電気", "reading": "でんき", "meaning": "electricity"}, {"word": "電話", "reading": "でんわ", "meaning": "telephone"}]'::jsonb,
 '2026-03-09', ARRAY['technology', 'common', 'modern']),

('消', '[{"type": "kun", "reading": "き"}, {"type": "kun", "reading": "け"}, {"type": "on", "reading": "ショウ"}]'::jsonb, 
 ARRAY['turn off', 'erase', 'disappear'], 'N4', 10, 
 '[{"word": "消す", "reading": "けす", "meaning": "to turn off"}]'::jsonb,
 '2026-03-09', ARRAY['action', 'verb-stem', 'common']),

('付', '[{"type": "kun", "reading": "つ"}, {"type": "on", "reading": "フ"}]'::jsonb, 
 ARRAY['attach', 'apply', 'turn on'], 'N4', 5, 
 '[{"word": "付ける", "reading": "つける", "meaning": "to turn on/attach"}]'::jsonb,
 '2026-03-09', ARRAY['action', 'verb-stem', 'common']),

('涼', '[{"type": "kun", "reading": "すず"}]'::jsonb, 
 ARRAY['cool', 'refreshing'], 'N3', 11, 
 '[{"word": "涼しい", "reading": "すずしい", "meaning": "cool/refreshing"}]'::jsonb,
 '2026-03-09', ARRAY['weather', 'adjective', 'nature']),

('風', '[{"type": "kun", "reading": "かぜ"}, {"type": "on", "reading": "フウ"}, {"type": "on", "reading": "フ"}]'::jsonb, 
 ARRAY['wind', 'style'], 'N4', 9, 
 '[{"word": "風", "reading": "かぜ", "meaning": "wind"}]'::jsonb,
 '2026-03-09', ARRAY['weather', 'nature', 'common']),

('入', '[{"type": "kun", "reading": "はい"}, {"type": "kun", "reading": "い"}, {"type": "on", "reading": "ニュウ"}]'::jsonb, 
 ARRAY['enter', 'insert'], 'N5', 2, 
 '[{"word": "入る", "reading": "はいる", "meaning": "to enter"}]'::jsonb,
 '2026-03-09', ARRAY['action', 'verb-stem', 'common', 'basic']),

('金', '[{"type": "kun", "reading": "かね"}, {"type": "on", "reading": "キン"}, {"type": "on", "reading": "コン"}]'::jsonb, 
 ARRAY['money', 'gold', 'metal'], 'N5', 8, 
 '[{"word": "お金", "reading": "おかね", "meaning": "money"}, {"word": "金曜日", "reading": "きんようび", "meaning": "Friday"}]'::jsonb,
 '2026-03-09', ARRAY['money', 'common', 'basic']),

('持', '[{"type": "kun", "reading": "も"}, {"type": "on", "reading": "ジ"}]'::jsonb, 
 ARRAY['hold', 'carry', 'have'], 'N4', 9, 
 '[{"word": "持つ", "reading": "もつ", "meaning": "to hold/carry"}]'::jsonb,
 '2026-03-09', ARRAY['action', 'verb-stem', 'common']),

('仕', '[{"type": "kun", "reading": "つか"}, {"type": "on", "reading": "シ"}, {"type": "on", "reading": "ジ"}]'::jsonb, 
 ARRAY['serve', 'do', 'official'], 'N4', 5, 
 '[{"word": "仕事", "reading": "しごと", "meaning": "work"}]'::jsonb,
 '2026-03-09', ARRAY['work', 'verb-stem', 'common']),

('事', '[{"type": "kun", "reading": "こと"}, {"type": "on", "reading": "ジ"}, {"type": "on", "reading": "ズ"}]'::jsonb, 
 ARRAY['thing', 'matter', 'fact'], 'N4', 8, 
 '[{"word": "仕事", "reading": "しごと", "meaning": "work"}, {"word": "食事", "reading": "しょくじ", "meaning": "meal"}]'::jsonb,
 '2026-03-09', ARRAY['abstract', 'common']),

('日', '[{"type": "kun", "reading": "ひ"}, {"type": "kun", "reading": "か"}, {"type": "on", "reading": "ニチ"}, {"type": "on", "reading": "ジツ"}]'::jsonb, 
 ARRAY['day', 'sun'], 'N5', 4, 
 '[{"word": "日曜日", "reading": "にちようび", "meaning": "Sunday"}, {"word": "今日", "reading": "きょう", "meaning": "today"}]'::jsonb,
 '2026-03-09', ARRAY['time', 'common', 'basic', 'days']),

('曜', '[{"type": "on", "reading": "ヨウ"}]'::jsonb, 
 ARRAY['weekday'], 'N4', 18, 
 '[{"word": "日曜日", "reading": "にちようび", "meaning": "Sunday"}]'::jsonb,
 '2026-03-09', ARRAY['time', 'days', 'compound']);
