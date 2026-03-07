import { pool } from '../src/db/pool.js';

const MORE_VOCAB: Record<string, any[]> = {
  '2025-10-15': [
    { jp: '時', reading: 'じ', romaji: 'ji', en: 'o\'clock', type: 'time' },
    { jp: '分', reading: 'ふん', romaji: 'fun', en: 'minute', type: 'time' },
    { jp: '半', reading: 'はん', romaji: 'han', en: 'half', type: 'time' },
    { jp: '朝', reading: 'あさ', romaji: 'asa', en: 'morning', type: 'time' },
    { jp: '昼', reading: 'ひる', romaji: 'hiru', en: 'noon/daytime', type: 'time' },
    { jp: '晩', reading: 'ばん', romaji: 'ban', en: 'evening', type: 'time' },
    { jp: '夜', reading: 'よる', romaji: 'yoru', en: 'night', type: 'time' },
    { jp: '今日', reading: 'きょう', romaji: 'kyou', en: 'today', type: 'time' },
    { jp: '明日', reading: 'あした', romaji: 'ashita', en: 'tomorrow', type: 'time' },
    { jp: '昨日', reading: 'きのう', romaji: 'kinou', en: 'yesterday', type: 'time' },
    { jp: '母', reading: 'はは', romaji: 'haha', en: 'mother (my)', type: 'family' },
    { jp: '父', reading: 'ちち', romaji: 'chichi', en: 'father (my)', type: 'family' },
    { jp: '友達', reading: 'ともだち', romaji: 'tomodachi', en: 'friend', type: 'noun' }
  ],
  
  '2025-10-16': [
    { jp: '大きい', reading: 'おおきい', romaji: 'ookii', en: 'big', type: 'i-adj' },
    { jp: '小さい', reading: 'ちいさい', romaji: 'chiisai', en: 'small', type: 'i-adj' },
    { jp: '新しい', reading: 'あたらしい', romaji: 'atarashii', en: 'new', type: 'i-adj' },
    { jp: '古い', reading: 'ふるい', romaji: 'furui', en: 'old', type: 'i-adj' },
    { jp: '元気', reading: 'げんき', romaji: 'genki', en: 'healthy/energetic', type: 'na-adj' },
    { jp: '静か', reading: 'しずか', romaji: 'shizuka', en: 'quiet', type: 'na-adj' },
    { jp: '賑やか', reading: 'にぎやか', romaji: 'nigiyaka', en: 'lively', type: 'na-adj' },
    { jp: '便利', reading: 'べんり', romaji: 'benri', en: 'convenient', type: 'na-adj' }
  ],
  
  '2025-10-20': [
    { jp: 'カフェ', reading: 'かふぇ', romaji: 'kafe', en: 'cafe', type: 'katakana' },
    { jp: 'ホテル', reading: 'ほてる', romaji: 'hoteru', en: 'hotel', type: 'katakana' },
    { jp: 'レストラン', reading: 'れすとらん', romaji: 'resutoran', en: 'restaurant', type: 'katakana' },
    { jp: 'コンビニ', reading: 'こんびに', romaji: 'konbini', en: 'convenience store', type: 'katakana' },
    { jp: 'パン', reading: 'ぱん', romaji: 'pan', en: 'bread', type: 'katakana' },
    { jp: 'ケーキ', reading: 'けーき', romaji: 'keeki', en: 'cake', type: 'katakana' },
    { jp: 'コーヒー', reading: 'こーひー', romaji: 'koohii', en: 'coffee', type: 'katakana' },
    { jp: 'ジュース', reading: 'じゅーす', romaji: 'juusu', en: 'juice', type: 'katakana' }
  ],
  
  '2025-10-22': [
    { jp: 'テレビ', reading: 'てれび', romaji: 'terebi', en: 'TV', type: 'katakana' },
    { jp: 'コンピューター', reading: 'こんぴゅーたー', romaji: 'konpyuutaa', en: 'computer', type: 'katakana' },
    { jp: 'テーブル', reading: 'てーぶる', romaji: 'teeburu', en: 'table', type: 'katakana' },
    { jp: '椅子', reading: 'いす', romaji: 'isu', en: 'chair', type: 'noun' },
    { jp: 'ドア', reading: 'どあ', romaji: 'doa', en: 'door', type: 'katakana' },
    { jp: '窓', reading: 'まど', romaji: 'mado', en: 'window', type: 'noun' },
    { jp: 'バッグ', reading: 'ばっぐ', romaji: 'baggu', en: 'bag', type: 'katakana' },
    { jp: '財布', reading: 'さいふ', romaji: 'saifu', en: 'wallet', type: 'noun' }
  ],
  
  '2025-10-27': [
    { jp: '見る', reading: 'みる', romaji: 'miru', en: 'to see/watch', type: 'ru-verb' },
    { jp: '食べる', reading: 'たべる', romaji: 'taberu', en: 'to eat', type: 'ru-verb' },
    { jp: '飲む', reading: 'のむ', romaji: 'nomu', en: 'to drink', type: 'u-verb' },
    { jp: '読む', reading: 'よむ', romaji: 'yomu', en: 'to read', type: 'u-verb' },
    { jp: '聞く', reading: 'きく', romaji: 'kiku', en: 'to listen/ask', type: 'u-verb' },
    { jp: '行く', reading: 'いく', romaji: 'iku', en: 'to go', type: 'u-verb' },
    { jp: '来る', reading: 'くる', romaji: 'kuru', en: 'to come', type: 'irregular' },
    { jp: 'する', reading: 'する', romaji: 'suru', en: 'to do', type: 'irregular' }
  ],
  
  '2025-10-29': [
    { jp: '好き', reading: 'すき', romaji: 'suki', en: 'liked/favorite', type: 'na-adj' },
    { jp: '嫌い', reading: 'きらい', romaji: 'kirai', en: 'disliked/hated', type: 'na-adj' },
    { jp: '上手', reading: 'じょうず', romaji: 'jouzu', en: 'good at/skilled', type: 'na-adj' },
    { jp: '下手', reading: 'へた', romaji: 'heta', en: 'bad at/poor', type: 'na-adj' },
    { jp: '料理', reading: 'りょうり', romaji: 'ryouri', en: 'cooking/dish', type: 'noun' },
    { jp: 'スポーツ', reading: 'すぽーつ', romaji: 'supootsu', en: 'sports', type: 'katakana' },
    { jp: '音楽', reading: 'おんがく', romaji: 'ongaku', en: 'music', type: 'noun' },
    { jp: '切手', reading: 'きって', romaji: 'kitte', en: 'postage stamp', type: 'noun' }
  ],
  
  '2025-11-03': [
    { jp: 'ある', reading: 'ある', romaji: 'aru', en: 'to exist (inanimate)', type: 'u-verb' },
    { jp: 'いる', reading: 'いる', romaji: 'iru', en: 'to exist (animate)', type: 'ru-verb' },
    { jp: '物', reading: 'もの', romaji: 'mono', en: 'thing', type: 'noun' },
    { jp: '人', reading: 'ひと', romaji: 'hito', en: 'person', type: 'noun' },
    { jp: '動物', reading: 'どうぶつ', romaji: 'doubutsu', en: 'animal', type: 'noun' },
    { jp: '猫', reading: 'ねこ', romaji: 'neko', en: 'cat', type: 'noun' },
    { jp: '犬', reading: 'いぬ', romaji: 'inu', en: 'dog', type: 'noun' },
    { jp: '鳥', reading: 'とり', romaji: 'tori', en: 'bird', type: 'noun' },
    { jp: '魚', reading: 'さかな', romaji: 'sakana', en: 'fish', type: 'noun' }
  ],
  
  '2025-11-05': [
    { jp: '帰る', reading: 'かえる', romaji: 'kaeru', en: 'to return/home', type: 'u-verb' },
    { jp: '入る', reading: 'はいる', romaji: 'hairu', en: 'to enter', type: 'u-verb' },
    { jp: '出る', reading: 'でる', romaji: 'deru', en: 'to exit/leave', type: 'ru-verb' },
    { jp: '買う', reading: 'かう', romaji: 'kau', en: 'to buy', type: 'u-verb' },
    { jp: '待つ', reading: 'まつ', romaji: 'matsu', en: 'to wait', type: 'u-verb' },
    { jp: '死ぬ', reading: 'しぬ', romaji: 'shinu', en: 'to die', type: 'u-verb' },
    { jp: '泳ぐ', reading: 'およぐ', romaji: 'oyogu', en: 'to swim', type: 'u-verb' },
    { jp: '遊ぶ', reading: 'あそぶ', romaji: 'asobu', en: 'to play', type: 'u-verb' }
  ],
  
  '2025-11-12': [
    { jp: '分かる', reading: 'わかる', romaji: 'wakaru', en: 'to understand', type: 'u-verb' },
    { jp: '思う', reading: 'おもう', romaji: 'omou', en: 'to think', type: 'u-verb' },
    { jp: '知る', reading: 'しる', romaji: 'shiru', en: 'to know', type: 'u-verb' },
    { jp: '言う', reading: 'いう', romaji: 'iu', en: 'to say', type: 'u-verb' },
    { jp: '話す', reading: 'はなす', romaji: 'hanasu', en: 'to speak/talk', type: 'u-verb' },
    { jp: '書く', reading: 'かく', romaji: 'kaku', en: 'to write', type: 'u-verb' },
    { jp: '起きる', reading: 'おきる', romaji: 'okiru', en: 'to wake up', type: 'ru-verb' },
    { jp: '寝る', reading: 'ねる', romaji: 'neru', en: 'to sleep', type: 'ru-verb' }
  ],
  
  '2025-12-01': [
    { jp: '毎日', reading: 'まいにち', romaji: 'mainichi', en: 'every day', type: 'time' },
    { jp: '毎週', reading: 'まいしゅう', romaji: 'maishuu', en: 'every week', type: 'time' },
    { jp: '毎月', reading: 'まいつき', romaji: 'maitsuki', en: 'every month', type: 'time' },
    { jp: '毎年', reading: 'まいとし', romaji: 'maitoshi', en: 'every year', type: 'time' },
    { jp: '時々', reading: 'ときどき', romaji: 'tokidoki', en: 'sometimes', type: 'adverb' },
    { jp: '全然', reading: 'ぜんぜん', romaji: 'zenzen', en: 'not at all', type: 'adverb' },
    { jp: '一緒に', reading: 'いっしょに', romaji: 'issho ni', en: 'together', type: 'adverb' },
    { jp: '一人で', reading: 'ひとりで', romaji: 'hitori de', en: 'alone/by oneself', type: 'adverb' }
  ],
  
  '2025-12-03': [
    { jp: '家', reading: 'いえ', romaji: 'ie', en: 'house/home', type: 'noun' },
    { jp: '部屋', reading: 'へや', romaji: 'heya', en: 'room', type: 'noun' },
    { jp: '庭', reading: 'にわ', romaji: 'niwa', en: 'garden', type: 'noun' },
    { jp: '台所', reading: 'だいどころ', romaji: 'daidokoro', en: 'kitchen', type: 'noun' },
    { jp: '居間', reading: 'いま', romaji: 'ima', en: 'living room', type: 'noun' },
    { jp: '寝室', reading: 'しんしつ', romaji: 'shinshitsu', en: 'bedroom', type: 'noun' },
    { jp: 'お風呂', reading: 'おふろ', romaji: 'ofuro', en: 'bath', type: 'noun' },
    { jp: 'トイレ', reading: 'といれ', romaji: 'toire', en: 'toilet', type: 'noun' }
  ],
  
  '2025-12-10': [
    { jp: '駅', reading: 'えき', romaji: 'eki', en: 'station', type: 'noun' },
    { jp: '銀行', reading: 'ぎんこう', romaji: 'ginkou', en: 'bank', type: 'noun' },
    { jp: '郵便局', reading: 'ゆうびんきょく', romaji: 'yuubinkyoku', en: 'post office', type: 'noun' },
    { jp: '図書館', reading: 'としょかん', romaji: 'toshokan', en: 'library', type: 'noun' },
    { jp: '病院', reading: 'びょういん', romaji: 'byouin', en: 'hospital', type: 'noun' },
    { jp: '薬局', reading: 'やっきょく', romaji: 'yakkyoku', en: 'pharmacy', type: 'noun' },
    { jp: '警察署', reading: 'けいさつしょ', romaji: 'keisatsusho', en: 'police station', type: 'noun' },
    { jp: '交番', reading: 'こうばん', romaji: 'kouban', en: 'police box', type: 'noun' }
  ],
  
  '2025-12-15': [
    { jp: '掃除する', reading: 'そうじする', romaji: 'souji suru', en: 'to clean', type: 'suru-verb' },
    { jp: '洗濯する', reading: 'せんたくする', romaji: 'sentaku suru', en: 'to do laundry', type: 'suru-verb' },
    { jp: '料理する', reading: 'りょうりする', romaji: 'ryouri suru', en: 'to cook', type: 'suru-verb' },
    { jp: '買い物', reading: 'かいもの', romaji: 'kaimono', en: 'shopping', type: 'noun' },
    { jp: '朝ご飯', reading: 'あさごはん', romaji: 'asagohan', en: 'breakfast', type: 'noun' },
    { jp: '昼ご飯', reading: 'ひるごはん', romaji: 'hirugohan', en: 'lunch', type: 'noun' },
    { jp: '晩ご飯', reading: 'ばんごはん', romaji: 'bangohan', en: 'dinner', type: 'noun' }
  ],
  
  '2025-12-17': [
    { jp: '手伝う', reading: 'てつだう', romaji: 'tetsudau', en: 'to help', type: 'u-verb' },
    { jp: '教える', reading: 'おしえる', romaji: 'oshieru', en: 'to teach/tell', type: 'ru-verb' },
    { jp: '借りる', reading: 'かりる', romaji: 'kariru', en: 'to borrow', type: 'ru-verb' },
    { jp: '貸す', reading: 'かす', romaji: 'kasu', en: 'to lend', type: 'u-verb' },
    { jp: '開ける', reading: 'あける', romaji: 'akeru', en: 'to open', type: 'ru-verb' },
    { jp: '閉める', reading: 'しめる', romaji: 'shimeru', en: 'to close', type: 'ru-verb' },
    { jp: '電気', reading: 'でんき', romaji: 'denki', en: 'electricity/light', type: 'noun' },
    { jp: '窓', reading: 'まど', romaji: 'mado', en: 'window', type: 'noun' }
  ],
  
  '2025-12-23': [
    { jp: '服', reading: 'ふく', romaji: 'fuku', en: 'clothes', type: 'noun' },
    { jp: 'セーター', reading: 'せーたー', romaji: 'seetaa', en: 'sweater', type: 'katakana' },
    { jp: 'コート', reading: 'こーと', romaji: 'kooto', en: 'coat', type: 'katakana' },
    { jp: 'シャツ', reading: 'しゃつ', romaji: 'shatsu', en: 'shirt', type: 'katakana' },
    { jp: 'ズボン', reading: 'ずぼん', romaji: 'zubon', en: 'pants', type: 'katakana' },
    { jp: 'スカート', reading: 'すかーと', romaji: 'sukaato', en: 'skirt', type: 'katakana' },
    { jp: '靴', reading: 'くつ', romaji: 'kutsu', en: 'shoes', type: 'noun' },
    { jp: '眼鏡', reading: 'めがね', romaji: 'megane', en: 'glasses', type: 'noun' }
  ],
  
  '2026-01-28': [
    { jp: 'ドア', reading: 'どあ', romaji: 'doa', en: 'door', type: 'katakana' },
    { jp: 'エアコン', reading: 'えあこん', romaji: 'eakon', en: 'air conditioner', type: 'katakana' },
    { jp: 'テレビ', reading: 'てれび', romaji: 'terebi', en: 'TV', type: 'katakana' },
    { jp: 'パソコン', reading: 'ぱそこん', romaji: 'pasokon', en: 'PC', type: 'katakana' },
    { jp: '冷蔵庫', reading: 'れいぞうこ', romaji: 'reizouko', en: 'refrigerator', type: 'noun' },
    { jp: '洗濯機', reading: 'せんたくき', romaji: 'sentakuki', en: 'washing machine', type: 'noun' },
    { jp: '掃除機', reading: 'そうじき', romaji: 'soujiki', en: 'vacuum cleaner', type: 'noun' },
    { jp: '電池', reading: 'でんち', romaji: 'denchi', en: 'battery', type: 'noun' }
  ],
  
  '2026-02-02': [
    { jp: '赤い', reading: 'あかい', romaji: 'akai', en: 'red', type: 'i-adj' },
    { jp: '青い', reading: 'あおい', romaji: 'aoi', en: 'blue', type: 'i-adj' },
    { jp: '白い', reading: 'しろい', romaji: 'shiroi', en: 'white', type: 'i-adj' },
    { jp: '黒い', reading: 'くろい', romaji: 'kuroi', en: 'black', type: 'i-adj' },
    { jp: '黄色い', reading: 'きいろい', romaji: 'kiiroi', en: 'yellow', type: 'i-adj' },
    { jp: '緑', reading: 'みどり', romaji: 'midori', en: 'green', type: 'noun' },
    { jp: '茶色', reading: 'ちゃいろ', romaji: 'chairo', en: 'brown', type: 'noun' },
    { jp: 'ピンク', reading: 'ぴんく', romaji: 'pinku', en: 'pink', type: 'katakana' }
  ],
  
  '2026-02-04': [
    { jp: '頭', reading: 'あたま', romaji: 'atama', en: 'head', type: 'body' },
    { jp: '顔', reading: 'かお', romaji: 'kao', en: 'face', type: 'body' },
    { jp: '目', reading: 'め', romaji: 'me', en: 'eye', type: 'body' },
    { jp: '耳', reading: 'みみ', romaji: 'mimi', en: 'ear', type: 'body' },
    { jp: '鼻', reading: 'はな', romaji: 'hana', en: 'nose', type: 'body' },
    { jp: '口', reading: 'くち', romaji: 'kuchi', en: 'mouth', type: 'body' },
    { jp: '手', reading: 'て', romaji: 'te', en: 'hand', type: 'body' },
    { jp: '足', reading: 'あし', romaji: 'ashi', en: 'foot/leg', type: 'body' },
    { jp: '歯', reading: 'は', romaji: 'ha', en: 'tooth', type: 'body' },
    { jp: 'お腹', reading: 'おなか', romaji: 'onaka', en: 'stomach', type: 'body' }
  ],
  
  '2026-02-09': [
    { jp: '晴れ', reading: 'はれ', romaji: 'hare', en: 'sunny/clear', type: 'noun' },
    { jp: '雨', reading: 'あめ', romaji: 'ame', en: 'rain', type: 'noun' },
    { jp: '曇り', reading: 'くもり', romaji: 'kumori', en: 'cloudy', type: 'noun' },
    { jp: '雪', reading: 'ゆき', romaji: 'yuki', en: 'snow', type: 'noun' },
    { jp: '風', reading: 'かぜ', romaji: 'kaze', en: 'wind', type: 'noun' },
    { jp: '寒い', reading: 'さむい', romaji: 'samui', en: 'cold (weather)', type: 'i-adj' },
    { jp: '暑い', reading: 'あつい', romaji: 'atsui', en: 'hot (weather)', type: 'i-adj' },
    { jp: '暖かい', reading: 'あたたかい', romaji: 'atatakai', en: 'warm', type: 'i-adj' },
    { jp: '涼しい', reading: 'すずしい', romaji: 'suzushii', en: 'cool/refreshing', type: 'i-adj' }
  ],
  
  '2026-02-16': [
    { jp: 'メニュー', reading: 'めにゅー', romaji: 'menyuu', en: 'menu', type: 'katakana' },
    { jp: '注文', reading: 'ちゅうもん', romaji: 'chuumon', en: 'order', type: 'noun' },
    { jp: 'お会計', reading: 'おかいけい', romaji: 'okaikei', en: 'bill/check', type: 'noun' },
    { jp: 'お水', reading: 'おみず', romaji: 'omizu', en: 'water', type: 'noun' },
    { jp: 'お茶', reading: 'おちゃ', romaji: 'ocha', en: 'tea', type: 'noun' },
    { jp: 'お酒', reading: 'おさけ', romaji: 'osake', en: 'alcohol/sake', type: 'noun' },
    { jp: '甘い', reading: 'あまい', romaji: 'amai', en: 'sweet', type: 'i-adj' },
    { jp: '辛い', reading: 'からい', romaji: 'karai', en: 'spicy/hot', type: 'i-adj' }
  ],
  
  '2026-02-19': [
    { jp: '曜日', reading: 'ようび', romaji: 'youbi', en: 'day of week', type: 'noun' },
    { jp: '昨日', reading: 'きのう', romaji: 'kinou', en: 'yesterday', type: 'time' },
    { jp: '今日', reading: 'きょう', romaji: 'kyou', en: 'today', type: 'time' },
    { jp: '明日', reading: 'あした', romaji: 'ashita', en: 'tomorrow', type: 'time' },
    { jp: '今年', reading: 'ことし', romaji: 'kotoshi', en: 'this year', type: 'time' },
    { jp: '去年', reading: 'きょねん', romaji: 'kyonen', en: 'last year', type: 'time' },
    { jp: '来年', reading: 'らいねん', romaji: 'rainen', en: 'next year', type: 'time' }
  ],
  
  '2026-02-23': [
    { jp: 'ドライヤー', reading: 'どらいやー', romaji: 'doraiyaa', en: 'hair dryer', type: 'katakana' },
    { jp: 'アイロン', reading: 'あいろん', romaji: 'airon', en: 'iron', type: 'katakana' },
    { jp: 'シャンプー', reading: 'しゃんぷー', romaji: 'shanpuu', en: 'shampoo', type: 'katakana' },
    { jp: 'リンス', reading: 'りんす', romaji: 'rinsu', en: 'conditioner', type: 'katakana' },
    { jp: 'タオル', reading: 'たおる', romaji: 'taoru', en: 'towel', type: 'katakana' },
    { jp: '鏡', reading: 'かがみ', romaji: 'kagami', en: 'mirror', type: 'noun' },
    { jp: '歯ブラシ', reading: 'はぶらし', romaji: 'haburashi', en: 'toothbrush', type: 'noun' },
    { jp: '歯磨き粉', reading: 'はみがきこ', romaji: 'hamigakiko', en: 'toothpaste', type: 'noun' }
  ]
};

async function extendMore() {
  console.log('Extending more vocabulary...\n');
  
  for (const [lessonId, vocab] of Object.entries(MORE_VOCAB)) {
    const current = await pool.query('SELECT vocabulary FROM lessons WHERE id = $1', [lessonId]);
    const currentVocab = current.rows[0]?.vocabulary || [];
    
    const existingJp = new Set(currentVocab.map((v: any) => v.jp));
    const newItems = vocab.filter((v: any) => !existingJp.has(v.jp));
    const merged = [...currentVocab, ...newItems];
    
    await pool.query(
      'UPDATE lessons SET vocabulary = $1::jsonb WHERE id = $2',
      [JSON.stringify(merged), lessonId]
    );
    
    console.log(`✅ ${lessonId}: ${currentVocab.length} → ${merged.length} (${newItems.length} new)`);
  }
  
  console.log('\n✅ All vocabulary extended');
  await pool.end();
}

extendMore().catch(console.error);
