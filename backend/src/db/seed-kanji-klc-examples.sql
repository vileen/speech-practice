-- Additional kanji examples from Kodansha Kanji Learner's Course (KLC)
-- These examples supplement existing kanji with more vocabulary

-- Update examples for kanji with few or no examples
UPDATE kanji SET examples = '[{"word": "犬", "reading": "いぬ", "meaning": "dog"}, {"word": "子犬", "reading": "こいぬ", "meaning": "puppy"}]'::jsonb WHERE character = '犬';

UPDATE kanji SET examples = '[{"word": "遅い", "reading": "おそい", "meaning": "slow/late"}, {"word": "遅刻", "reading": "ちこく", "meaning": "lateness"}]'::jsonb WHERE character = '遅';

-- Add more examples for common kanji
UPDATE kanji SET examples = '[{"word": "一つ", "reading": "ひとつ", "meaning": "one thing"}, {"word": "一人", "reading": "ひとり", "meaning": "one person"}, {"word": "一月", "reading": "いちがつ", "meaning": "January"}, {"word": "第一", "reading": "だいいち", "meaning": "first/number one"}]'::jsonb WHERE character = '一';

UPDATE kanji SET examples = '[{"word": "二つ", "reading": "ふたつ", "meaning": "two things"}, {"word": "二人", "reading": "ふたり", "meaning": "two people"}, {"word": "二月", "reading": "にがつ", "meaning": "February"}, {"word": "二回", "reading": "にかい", "meaning": "two times"}]'::jsonb WHERE character = '二';

UPDATE kanji SET examples = '[{"word": "三つ", "reading": "みっつ", "meaning": "three things"}, {"word": "三人", "reading": "さんにん", "meaning": "three people"}, {"word": "三月", "reading": "さんがつ", "meaning": "March"}, {"word": "三回", "reading": "さんかい", "meaning": "three times"}]'::jsonb WHERE character = '三';

UPDATE kanji SET examples = '[{"word": "四つ", "reading": "よっつ", "meaning": "four things"}, {"word": "四月", "reading": "しがつ", "meaning": "April"}, {"word": "四角", "reading": "しかく", "meaning": "square"}, {"word": "四回", "reading": "よんかい", "meaning": "four times"}]'::jsonb WHERE character = '四';

UPDATE kanji SET examples = '[{"word": "五つ", "reading": "いつつ", "meaning": "five things"}, {"word": "五人", "reading": "ごにん", "meaning": "five people"}, {"word": "五月", "reading": "ごがつ", "meaning": "May"}, {"word": "五回", "reading": "ごかい", "meaning": "five times"}]'::jsonb WHERE character = '五';

UPDATE kanji SET examples = '[{"word": "六つ", "reading": "むっつ", "meaning": "six things"}, {"word": "六人", "reading": "ろくにん", "meaning": "six people"}, {"word": "六月", "reading": "ろくがつ", "meaning": "June"}]'::jsonb WHERE character = '六';

UPDATE kanji SET examples = '[{"word": "七つ", "reading": "ななつ", "meaning": "seven things"}, {"word": "七人", "reading": "しちにん", "meaning": "seven people"}, {"word": "七月", "reading": "しちがつ", "meaning": "July"}]'::jsonb WHERE character = '七';

UPDATE kanji SET examples = '[{"word": "八つ", "reading": "やっつ", "meaning": "eight things"}, {"word": "八人", "reading": "はちにん", "meaning": "eight people"}, {"word": "八月", "reading": "はちがつ", "meaning": "August"}]'::jsonb WHERE character = '八';

UPDATE kanji SET examples = '[{"word": "九つ", "reading": "ここのつ", "meaning": "nine things"}, {"word": "九人", "reading": "きゅうにん", "meaning": "nine people"}, {"word": "九月", "reading": "くがつ", "meaning": "September"}]'::jsonb WHERE character = '九';

UPDATE kanji SET examples = '[{"word": "十", "reading": "じゅう", "meaning": "ten"}, {"word": "十人", "reading": "じゅうにん", "meaning": "ten people"}, {"word": "十月", "reading": "じゅうがつ", "meaning": "October"}, {"word": "十分", "reading": "じゅっぷん", "meaning": "ten minutes"}]'::jsonb WHERE character = '十';

UPDATE kanji SET examples = '[{"word": "百人", "reading": "ひゃくにん", "meaning": "100 people"}, {"word": "百円", "reading": "ひゃくえん", "meaning": "100 yen"}, {"word": "三百", "reading": "さんびゃく", "meaning": "300"}]'::jsonb WHERE character = '百';

UPDATE kanji SET examples = '[{"word": "千円", "reading": "せんえん", "meaning": "1000 yen"}, {"word": "千人", "reading": "せんにん", "meaning": "1000 people"}, {"word": "三千", "reading": "さんぜん", "meaning": "3000"}]'::jsonb WHERE character = '千';

UPDATE kanji SET examples = '[{"word": "一万", "reading": "いちまん", "meaning": "10,000"}, {"word": "十万", "reading": "じゅうまん", "meaning": "100,000"}, {"word": "百万", "reading": "ひゃくまん", "meaning": "1,000,000"}]'::jsonb WHERE character = '万';

UPDATE kanji SET examples = '[{"word": "円", "reading": "えん", "meaning": "yen/circle"}, {"word": "百円", "reading": "ひゃくえん", "meaning": "100 yen"}, {"word": "円い", "reading": "まるい", "meaning": "round"}]'::jsonb WHERE character = '円';

-- More examples for common/basic kanji
UPDATE kanji SET examples = '[{"word": "人", "reading": "ひと", "meaning": "person"}, {"word": "人気", "reading": "にんき", "meaning": "popular"}, {"word": "日本人", "reading": "にほんじん", "meaning": "Japanese person"}, {"word": "三人", "reading": "さんにん", "meaning": "three people"}, {"word": "人口", "reading": "じんこう", "meaning": "population"}]'::jsonb WHERE character = '人';

UPDATE kanji SET examples = '[{"word": "日", "reading": "ひ", "meaning": "day/sun"}, {"word": "日本", "reading": "にほん", "meaning": "Japan"}, {"word": "今日", "reading": "きょう", "meaning": "today"}, {"word": "明日", "reading": "あした", "meaning": "tomorrow"}, {"word": "日曜日", "reading": "にちようび", "meaning": "Sunday"}]'::jsonb WHERE character = '日';

UPDATE kanji SET examples = '[{"word": "月", "reading": "つき", "meaning": "moon/month"}, {"word": "一月", "reading": "いちがつ", "meaning": "January"}, {"word": "月曜日", "reading": "げつようび", "meaning": "Monday"}, {"word": "毎月", "reading": "まいつき", "meaning": "every month"}]'::jsonb WHERE character = '月';

UPDATE kanji SET examples = '[{"word": "火", "reading": "ひ", "meaning": "fire"}, {"word": "火山", "reading": "かざん", "meaning": "volcano"}, {"word": "花火", "reading": "はなび", "meaning": "fireworks"}, {"word": "火曜日", "reading": "かようび", "meaning": "Tuesday"}, {"word": "火事", "reading": "かじ", "meaning": "fire (disaster)"}]'::jsonb WHERE character = '火';

UPDATE kanji SET examples = '[{"word": "水", "reading": "みず", "meaning": "water"}, {"word": "水曜日", "reading": "すいようび", "meaning": "Wednesday"}, {"word": "水色", "reading": "みずいろ", "meaning": "light blue"}, {"word": "洪水", "reading": "こうずい", "meaning": "flood"}]'::jsonb WHERE character = '水';

UPDATE kanji SET examples = '[{"word": "木", "reading": "き", "meaning": "tree/wood"}, {"word": "木曜日", "reading": "もくようび", "meaning": "Thursday"}, {"word": "木造", "reading": "もくぞう", "meaning": "wooden"}, {"word": "原木", "reading": "げんぼく", "meaning": "raw timber"}]'::jsonb WHERE character = '木';

UPDATE kanji SET examples = '[{"word": "金", "reading": "かね", "meaning": "money"}, {"word": "金曜日", "reading": "きんようび", "meaning": "Friday"}, {"word": "お金", "reading": "おかね", "meaning": "money"}, {"word": "金持ち", "reading": "かねもち", "meaning": "rich person"}]'::jsonb WHERE character = '金';

UPDATE kanji SET examples = '[{"word": "土", "reading": "つち", "meaning": "earth/soil"}, {"word": "土曜日", "reading": "どようび", "meaning": "Saturday"}, {"word": "土地", "reading": "とち", "meaning": "land"}, {"word": "泥土", "reading": "でいど", "meaning": "mud"}]'::jsonb WHERE character = '土';

UPDATE kanji SET examples = '[{"word": "本", "reading": "ほん", "meaning": "book"}, {"word": "日本", "reading": "にほん", "meaning": "Japan"}, {"word": "一本", "reading": "いっぽん", "meaning": "one (long thing)"}, {"word": "見本", "reading": "みほん", "meaning": "sample"}]'::jsonb WHERE character = '本';

UPDATE kanji SET examples = '[{"word": "大きい", "reading": "おおきい", "meaning": "big"}, {"word": "大学", "reading": "だいがく", "meaning": "university"}, {"word": "大人", "reading": "おとな", "meaning": "adult"}, {"word": "大切", "reading": "たいせつ", "meaning": "important"}]'::jsonb WHERE character = '大';

UPDATE kanji SET examples = '[{"word": "中", "reading": "なか", "meaning": "inside/middle"}, {"word": "中国", "reading": "ちゅうごく", "meaning": "China"}, {"word": "中学", "reading": "ちゅうがく", "meaning": "middle school"}, {"word": "中心", "reading": "ちゅうしん", "meaning": "center"}]'::jsonb WHERE character = '中';

UPDATE kanji SET examples = '[{"word": "小さい", "reading": "ちいさい", "meaning": "small"}, {"word": "小川", "reading": "おがわ", "meaning": "small river"}, {"word": "小学校", "reading": "しょうがっこう", "meaning": "elementary school"}, {"word": "小切手", "reading": "こぎって", "meaning": "cheque"}]'::jsonb WHERE character = '小';

UPDATE kanji SET examples = '[{"word": "山", "reading": "やま", "meaning": "mountain"}, {"word": "火山", "reading": "かざん", "meaning": "volcano"}, {"word": "富士山", "reading": "ふじさん", "meaning": "Mt. Fuji"}, {"word": "山田", "reading": "やまだ", "meaning": "Yamada (surname)"}]'::jsonb WHERE character = '山';

UPDATE kanji SET examples = '[{"word": "川", "reading": "かわ", "meaning": "river"}, {"word": "小川", "reading": "おがわ", "meaning": "small river"}, {"word": "河川", "reading": "かせん", "meaning": "rivers"}, {"word": "川口", "reading": "かわぐち", "meaning": "river mouth"}]'::jsonb WHERE character = '川';

UPDATE kanji SET examples = '[{"word": "天", "reading": "てん", "meaning": "heaven/sky"}, {"word": "天気", "reading": "てんき", "meaning": "weather"}, {"word": "天才", "reading": "てんさい", "meaning": "genius"}, {"word": "今日", "reading": "きょう", "meaning": "today"}]'::jsonb WHERE character = '天';

-- More verb/action kanji
UPDATE kanji SET examples = '[{"word": "入る", "reading": "はいる", "meaning": "to enter"}, {"word": "入り口", "reading": "いりぐち", "meaning": "entrance"}, {"word": "入学", "reading": "にゅうがく", "meaning": "school admission"}]'::jsonb WHERE character = '入';

UPDATE kanji SET examples = '[{"word": "出る", "reading": "でる", "meaning": "to exit"}, {"word": "出口", "reading": "でぐち", "meaning": "exit"}, {"word": "出かける", "reading": "でかける", "meaning": "to go out"}, {"word": "出発", "reading": "しゅっぱつ", "meaning": "departure"}]'::jsonb WHERE character = '出';

UPDATE kanji SET examples = '[{"word": "上", "reading": "うえ", "meaning": "up/above"}, {"word": "上る", "reading": "のぼる", "meaning": "to climb"}, {"word": "上着", "reading": "うわぎ", "meaning": "jacket"}, {"word": "上手", "reading": "じょうず", "meaning": "skilled"}]'::jsonb WHERE character = '上';

UPDATE kanji SET examples = '[{"word": "下", "reading": "した", "meaning": "down/below"}, {"word": "下る", "reading": "くだる", "meaning": "to descend"}, {"word": "地下", "reading": "ちか", "meaning": "underground"}, {"word": "下着", "reading": "したぎ", "meaning": "underwear"}]'::jsonb WHERE character = '下';

UPDATE kanji SET examples = '[{"word": "左", "reading": "ひだり", "meaning": "left"}, {"word": "左手", "reading": "ひだりて", "meaning": "left hand"}, {"word": "左側", "reading": "ひだりがわ", "meaning": "left side"}]'::jsonb WHERE character = '左';

UPDATE kanji SET examples = '[{"word": "右", "reading": "みぎ", "meaning": "right"}, {"word": "右手", "reading": "みぎて", "meaning": "right hand"}, {"word": "右側", "reading": "みぎがわ", "meaning": "right side"}]'::jsonb WHERE character = '右';

UPDATE kanji SET examples = '[{"word": "北", "reading": "きた", "meaning": "north"}, {"word": "北海道", "reading": "ほっかいどう", "meaning": "Hokkaido"}, {"word": "北京", "reading": "ペキン", "meaning": "Beijing"}]'::jsonb WHERE character = '北';

UPDATE kanji SET examples = '[{"word": "南", "reading": "みなみ", "meaning": "south"}, {"word": "南口", "reading": "みなみぐち", "meaning": "south exit"}, {"word": "南京", "reading": "ナンキン", "meaning": "Nanjing"}]'::jsonb WHERE character = '南';

UPDATE kanji SET examples = '[{"word": "東", "reading": "ひがし", "meaning": "east"}, {"word": "東京", "reading": "とうきょう", "meaning": "Tokyo"}, {"word": "東口", "reading": "ひがしぐち", "meaning": "east exit"}]'::jsonb WHERE character = '東';

UPDATE kanji SET examples = '[{"word": "西", "reading": "にし", "meaning": "west"}, {"word": "西洋", "reading": "せいよう", "meaning": "the West"}, {"word": "西口", "reading": "にしぐち", "meaning": "west exit"}]'::jsonb WHERE character = '西';
