#!/usr/bin/env node
import { pool } from '../src/db/pool.js';

async function fixRemaining() {
  // 2026-02-09: Describing Appearance, Weather, Kanji 人
  console.log('Fixing 2026-02-09: Appearance, Weather, Kanji...');
  await pool.query(
    `UPDATE lessons 
     SET vocabulary = $1, grammar = $2, updated_at = CURRENT_TIMESTAMP
     WHERE id = '2026-02-09'`,
    [
      JSON.stringify([
        { jp: '人', reading: 'hito/jin/nin', en: 'person', tags: ['kanji'] },
        { jp: '日本人', reading: 'nihonjin', en: 'Japanese person', tags: ['kanji'] },
        { jp: 'アメリカ人', reading: 'amerikajin', en: 'American person', tags: ['kanji'] },
        { jp: '一人', reading: 'hitori', en: 'one person', tags: ['kanji'] },
        { jp: '二人', reading: 'futari', en: 'two people', tags: ['kanji'] },
        { jp: '三人', reading: 'sannin', en: 'three people', tags: ['kanji'] },
        { jp: '大人', reading: 'otona', en: 'adult', tags: ['kanji'] },
        { jp: '人口', reading: 'jinkou', en: 'population', tags: ['kanji'] },
        { jp: '天気', reading: 'tenki', en: 'weather', tags: ['noun'] },
        { jp: '晴れ', reading: 'hare', en: 'sunny, clear', tags: ['noun'] },
        { jp: '曇り', reading: 'kumori', en: 'cloudy', tags: ['noun'] },
        { jp: '雨', reading: 'ame', en: 'rain', tags: ['noun'] },
        { jp: '雪', reading: 'yuki', en: 'snow', tags: ['noun'] },
        { jp: '風', reading: 'kaze', en: 'wind', tags: ['noun'] },
        { jp: '嵐', reading: 'arashi', en: 'storm', tags: ['noun'] },
        { jp: '寒い', reading: 'samui', en: 'cold (weather)', tags: ['i-adjective'] },
        { jp: '暑い', reading: 'atsui', en: 'hot (weather)', tags: ['i-adjective'] },
        { jp: '涼しい', reading: 'suzushii', en: 'cool, refreshing', tags: ['i-adjective'] },
        { jp: '暖かい', reading: 'atatakai', en: 'warm', tags: ['i-adjective'] },
        { jp: '気温', reading: 'kion', en: 'temperature', tags: ['noun'] },
        { jp: '湿度', reading: 'shitsudo', en: 'humidity', tags: ['noun'] },
        { jp: '季節', reading: 'kisetsu', en: 'season', tags: ['noun'] },
        { jp: '春', reading: 'haru', en: 'spring', tags: ['noun'] },
        { jp: '夏', reading: 'natsu', en: 'summer', tags: ['noun'] },
        { jp: '秋', reading: 'aki', en: 'autumn, fall', tags: ['noun'] },
        { jp: '冬', reading: 'fuyu', en: 'winter', tags: ['noun'] },
        { jp: '髪の毛', reading: 'kaminoke', en: 'hair (on head)', tags: ['noun'] },
        { jp: '真っ直ぐ', reading: 'massugu', en: 'straight', tags: ['na-adjective'] },
        { jp: '巻き毛', reading: 'makige', en: 'curly hair', tags: ['noun'] },
        { jp: '目', reading: 'me', en: 'eye', tags: ['noun'] },
        { jp: '鼻', reading: 'hana', en: 'nose', tags: ['noun'] },
        { jp: '口', reading: 'kuchi', en: 'mouth', tags: ['noun'] },
        { jp: '丸い', reading: 'marui', en: 'round', tags: ['i-adjective'] },
      ]),
      JSON.stringify([
        {
          pattern: 'Kanji 人',
          explanation: 'The kanji 人 means "person."\n\nReadings:\nひと - standalone\nじん - nationality (after country name)\nにん - counter for people\n\nExceptions: 一人 (hitori)、二人 (futari)',
          examples: [
            { jp: '人', en: 'hito (person)' },
            { jp: '日本人', en: 'nihonjin (Japanese person)' },
            { jp: '一人', en: 'hitori (one person)' },
            { jp: '三人', en: 'sannin (three people)' },
            { jp: '大人', en: 'otona (adult)' },
          ]
        },
        {
          pattern: 'Weather Expressions',
          explanation: 'Common weather vocabulary:\n\n晴れ (hare) - sunny\n曇り (kumori) - cloudy\n雨 (ame) - rain\n雪 (yuki) - snow\n風 (kaze) - wind\n\nUse です for states:\n晴れです - It is sunny',
          examples: [
            { jp: '今日は晴れです。', en: 'Today is sunny.' },
            { jp: '明日は雨です。', en: 'Tomorrow is rain.' },
            { jp: '昨日は曇りでした。', en: 'Yesterday was cloudy.' },
            { jp: '夏は暑いです。', en: 'Summer is hot.' },
            { jp: '冬は寒いです。', en: 'Winter is cold.' },
          ]
        },
        {
          pattern: 'Describing Appearance',
          explanation: 'Talking about physical features:\n\n髪の毛が長い/短い - long/short hair\n髪の毛が真っ直ぐ/巻き毛 - straight/curly hair\n目が大きい/小さい - big/small eyes\n背が高い/低い - tall/short',
          examples: [
            { jp: '髪の毛が長いです。', en: '(The person) has long hair.' },
            { jp: '巻き毛です。', en: '(The person) has curly hair.' },
            { jp: '目が大きいです。', en: '(The person) has big eyes.' },
            { jp: '背が高くて、髪が黒いです。', en: '(The person) is tall and has black hair.' },
          ]
        },
      ]),
    ]
  );
  console.log('✅ 2026-02-09 fixed');

  // 2026-02-11: Comparisons, Preferences, Days of Week
  console.log('Fixing 2026-02-11: Comparisons, Preferences...');
  await pool.query(
    `UPDATE lessons 
     SET vocabulary = $1, grammar = $2, updated_at = CURRENT_TIMESTAMP
     WHERE id = '2026-02-11'`,
    [
      JSON.stringify([
        { jp: '月曜日', reading: 'getsuyoubi', en: 'Monday', tags: ['time'] },
        { jp: '火曜日', reading: 'kayoubi', en: 'Tuesday', tags: ['time'] },
        { jp: '水曜日', reading: 'suiyoubi', en: 'Wednesday', tags: ['time'] },
        { jp: '木曜日', reading: 'mokuyoubi', en: 'Thursday', tags: ['time'] },
        { jp: '金曜日', reading: 'kinyoubi', en: 'Friday', tags: ['time'] },
        { jp: '土曜日', reading: 'doyoubi', en: 'Saturday', tags: ['time'] },
        { jp: '日曜日', reading: 'nichiyoubi', en: 'Sunday', tags: ['time'] },
        { jp: '何曜日', reading: 'naniyoubi', en: 'what day of the week', tags: ['question'] },
        { jp: '週末', reading: 'shuumatsu', en: 'weekend', tags: ['time'] },
        { jp: '平日', reading: 'heijitsu', en: 'weekday', tags: ['time'] },
        { jp: '犬', reading: 'inu', en: 'dog', tags: ['noun'] },
        { jp: '猫', reading: 'neko', en: 'cat', tags: ['noun'] },
        { jp: '本', reading: 'hon', en: 'book', tags: ['noun'] },
        { jp: '映画', reading: 'eiga', en: 'movie', tags: ['noun'] },
        { jp: '寒い', reading: 'samui', en: 'cold', tags: ['i-adjective'] },
        { jp: '暑い', reading: 'atsui', en: 'hot', tags: ['i-adjective'] },
        { jp: '赤い', reading: 'akai', en: 'red', tags: ['i-adjective'] },
        { jp: '青い', reading: 'aoi', en: 'blue', tags: ['i-adjective'] },
        { jp: '白い', reading: 'shiroi', en: 'white', tags: ['i-adjective'] },
        { jp: '黒い', reading: 'kuroi', en: 'black', tags: ['i-adjective'] },
        { jp: '長い', reading: 'nagai', en: 'long', tags: ['i-adjective'] },
        { jp: '短い', reading: 'mijikai', en: 'short', tags: ['i-adjective'] },
        { jp: 'どちら', reading: 'dochira', en: 'which one (polite)', tags: ['question'] },
        { jp: 'どっち', reading: 'docchi', en: 'which one (casual)', tags: ['question'] },
        { jp: 'どちらも', reading: 'dochira mo', en: 'both, either', tags: ['pronoun'] },
        { jp: '～の方が', reading: 'no hou ga', en: 'the one that is more ~', tags: ['grammar'] },
        { jp: '～と～と', reading: 'to to', en: '~ and ~ (particle)', tags: ['grammar'] },
        { jp: '特に', reading: 'tokuni', en: 'particularly, especially', tags: ['adverb'] },
        { jp: 'ただ', reading: 'tada', en: 'just, simply', tags: ['adverb'] },
        { jp: '理由', reading: 'riyuu', en: 'reason', tags: ['noun'] },
      ]),
      JSON.stringify([
        {
          pattern: 'Days of the Week',
          explanation: 'Days of the week all end with 曜日:\n\n月曜日 (Monday) - getsuyoubi\n火曜日 (Tuesday) - kayoubi\n水曜日 (Wednesday) - suiyoubi\n木曜日 (Thursday) - mokuyoubi\n金曜日 (Friday) - kinyoubi\n土曜日 (Saturday) - doyoubi\n日曜日 (Sunday) - nichiyoubi',
          examples: [
            { jp: '月曜日に会いましょう。', en: 'Let\'s meet on Monday.' },
            { jp: '週末は何をしますか？', en: 'What will you do on the weekend?' },
            { jp: '平日は忙しいです。', en: 'Weekdays are busy.' },
            { jp: '土曜日と日曜日は休みです。', en: 'Saturday and Sunday are days off.' },
          ]
        },
        {
          pattern: 'Making Comparisons: ～の方が',
          explanation: 'Use の方が to indicate which is more ~:\n\nStructure: [A] の方が [B] より [adjective]\n\nOr ask: [A] と [B] と どちらが [adjective] ですか？',
          examples: [
            { jp: '犬と猫とどちらが好きですか？', en: 'Which do you prefer, dogs or cats?' },
            { jp: '猫の方が好きです。', en: 'I prefer cats.' },
            { jp: '本より映画の方が好きです。', en: 'I prefer movies to books.' },
            { jp: '夏より冬の方が好きです。', en: 'I prefer winter to summer.' },
          ]
        },
        {
          pattern: 'Expressing "Both" or "Neither"',
          explanation: 'どちらも + positive = both\nどちらも + negative = neither\n\nどちらも好きです - I like both\nどちらも嫌いです - I dislike both',
          examples: [
            { jp: 'どちらも好きです。', en: 'I like both.' },
            { jp: 'どちらも嫌いです。', en: 'I dislike both.' },
            { jp: 'どちらも大切です。', en: 'Both are important.' },
            { jp: 'どちらも知りません。', en: 'I know neither.' },
          ]
        },
      ]),
    ]
  );
  console.log('✅ 2026-02-11 fixed');

  // 2026-02-16: Comparisons Practice, Restaurant
  console.log('Fixing 2026-02-16: Comparisons Practice, Restaurant...');
  await pool.query(
    `UPDATE lessons 
     SET vocabulary = $1, grammar = $2, updated_at = CURRENT_TIMESTAMP
     WHERE id = '2026-02-16'`,
    [
      JSON.stringify([
        { jp: 'より', reading: 'yori', en: 'than (used in comparisons)', tags: ['particle'] },
        { jp: 'の方が', reading: 'no hou ga', en: 'is more / the one that is', tags: ['grammar'] },
        { jp: 'どちら', reading: 'dochira', en: 'which one (polite)', tags: ['question'] },
        { jp: 'どっち', reading: 'docchi', en: 'which one (casual)', tags: ['question'] },
        { jp: '伝統的', reading: 'dentouteki', en: 'traditional', tags: ['na-adjective'] },
        { jp: '人気', reading: 'ninki', en: 'popular', tags: ['na-adjective'] },
        { jp: '想像する', reading: 'souzou suru', en: 'to imagine', tags: ['verb'] },
        { jp: '選ぶ', reading: 'erabu', en: 'to choose, select', tags: ['verb'] },
        { jp: 'レストラン', reading: 'resutoran', en: 'restaurant', tags: ['noun'] },
        { jp: '作り方', reading: 'tsukurikata', en: 'how to make', tags: ['noun'] },
        { jp: '京都', reading: 'kyouto', en: 'Kyoto', tags: ['place'] },
        { jp: '東京', reading: 'toukyou', en: 'Tokyo', tags: ['place'] },
        { jp: 'バイク', reading: 'baiku', en: 'motorcycle', tags: ['noun'] },
        { jp: '車', reading: 'kuruma', en: 'car', tags: ['noun'] },
        { jp: 'どうして', reading: 'doushite', en: 'why (casual)', tags: ['question'] },
        { jp: 'なぜ', reading: 'naze', en: 'why (formal)', tags: ['question'] },
        { jp: '例えば', reading: 'tatoeba', en: 'for example', tags: ['adverb'] },
        { jp: '一度も', reading: 'ichido mo', en: 'not even once (with negative)', tags: ['adverb'] },
        { jp: 'ほんの少し', reading: 'honno sukoshi', en: 'just a little', tags: ['adverb'] },
        { jp: 'だから', reading: 'dakara', en: 'therefore, so', tags: ['conjunction'] },
        { jp: 'お勧め', reading: 'osusume', en: 'recommendation', tags: ['noun'] },
        { jp: 'メニュー', reading: 'menyuu', en: 'menu', tags: ['noun'] },
        { jp: '注文', reading: 'chuumon', en: 'order', tags: ['noun'] },
        { jp: 'お会計', reading: 'okaikei', en: 'check, bill', tags: ['noun'] },
        { jp: 'お願いします', reading: 'onegaishimasu', en: 'please (request)', tags: ['expression'] },
        { jp: '～をください', reading: 'wo kudasai', en: 'please give me ~', tags: ['grammar'] },
        { jp: '～をお願いします', reading: 'wo onegaishimasu', en: 'I will have ~ (order)', tags: ['grammar'] },
      ]),
      JSON.stringify([
        {
          pattern: 'Comparing Two Things: AよりBの方が～',
          explanation: 'Structure: [A] より [B] の方が [adjective]\n\nMeans: B is more ~ than A',
          examples: [
            { jp: '東京より京都の方が静かです。', en: 'Kyoto is quieter than Tokyo.' },
            { jp: '車よりバイクの方が速いです。', en: 'Motorcycles are faster than cars.' },
            { jp: '冬より夏の方が好きです。', en: 'I prefer summer to winter.' },
          ]
        },
        {
          pattern: 'Asking "Which one?"',
          explanation: 'Use と to list options, then どちらが to ask:\n\n[A] と [B] と どちらが [adjective] ですか？',
          examples: [
            { jp: '犬と猫とどちらが好きですか？', en: 'Which do you like more, dogs or cats?' },
            { jp: '本と映画とどちらが好きですか？', en: 'Which do you prefer, books or movies?' },
            { jp: '寒いと暑いとどちらの方が嫌いですか？', en: 'Which do you hate more, cold or hot?' },
          ]
        },
        {
          pattern: 'At a Restaurant',
          explanation: 'Useful restaurant phrases:\n\nメニューをください。 - Menu, please.\n～をください。 - Please give me ~\n～をお願いします。 - I will have ~\nお勧めは何ですか？ - What do you recommend?\nお会計お願いします。 - Check, please.',
          examples: [
            { jp: 'メニューをください。', en: 'Menu, please.' },
            { jp: '寿司をください。', en: 'Sushi, please.' },
            { jp: 'ラーメンをお願いします。', en: 'I will have ramen.' },
            { jp: 'お勧めは何ですか？', en: 'What do you recommend?' },
            { jp: 'お会計お願いします。', en: 'Check, please.' },
          ]
        },
        {
          pattern: 'Giving Reasons: なぜ/どうして/だから',
          explanation: 'Ask why: なぜ/どうして + [sentence] + ですか？\nGive reason: [reason] + だから + [result]',
          examples: [
            { jp: 'なぜ日本語を勉強しますか？', en: 'Why do you study Japanese?' },
            { jp: '日本が好きだからです。', en: 'Because I like Japan.' },
            { jp: 'どうして遅れましたか？', en: 'Why were you late?' },
            { jp: '電車が遅れたからです。', en: 'Because the train was late.' },
          ]
        },
      ]),
    ]
  );
  console.log('✅ 2026-02-16 fixed');

  await pool.end();
}

fixRemaining().then(() => process.exit(0)).catch(console.error);
