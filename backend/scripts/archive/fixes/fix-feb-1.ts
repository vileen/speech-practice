#!/usr/bin/env node
import { pool } from '../src/db/pool.js';

async function fixRemaining() {
  // 2026-01-28: TE-form Review
  console.log('Fixing 2026-01-28: TE-form Review...');
  await pool.query(
    `UPDATE lessons 
     SET vocabulary = $1, grammar = $2, updated_at = CURRENT_TIMESTAMP
     WHERE id = '2026-01-28'`,
    [
      JSON.stringify([
        { jp: '開ける', reading: 'akeru', en: 'to open (transitive)', tags: ['verb', 'ru-verb'] },
        { jp: '閉める', reading: 'shimeru', en: 'to close (transitive)', tags: ['verb', 'ru-verb'] },
        { jp: '空く', reading: 'aku', en: 'to open, become empty (intransitive)', tags: ['verb', 'u-verb'] },
        { jp: '閉まる', reading: 'shimaru', en: 'to close (intransitive)', tags: ['verb', 'u-verb'] },
        { jp: 'つける', reading: 'tsukeru', en: 'to turn on (transitive)', tags: ['verb', 'ru-verb'] },
        { jp: '消す', reading: 'kesu', en: 'to turn off, erase (transitive)', tags: ['verb', 'u-verb'] },
        { jp: 'つく', reading: 'tsuku', en: 'to turn on, be attached (intransitive)', tags: ['verb', 'u-verb'] },
        { jp: '消える', reading: 'kieru', en: 'to disappear, go out (intransitive)', tags: ['verb', 'ru-verb'] },
        { jp: '入れる', reading: 'ireru', en: 'to put in (transitive)', tags: ['verb', 'ru-verb'] },
        { jp: '入る', reading: 'hairu', en: 'to enter (intransitive)', tags: ['verb', 'u-verb'] },
        { jp: '出す', reading: 'dasu', en: 'to take out (transitive)', tags: ['verb', 'u-verb'] },
        { jp: '出る', reading: 'deru', en: 'to exit (intransitive)', tags: ['verb', 'ru-verb'] },
        { jp: '始める', reading: 'hajimeru', en: 'to start (transitive)', tags: ['verb', 'ru-verb'] },
        { jp: '始まる', reading: 'hajimaru', en: 'to begin (intransitive)', tags: ['verb', 'u-verb'] },
        { jp: '止める', reading: 'tomeru', en: 'to stop (transitive)', tags: ['verb', 'ru-verb'] },
        { jp: '止まる', reading: 'tomaru', en: 'to stop (intransitive)', tags: ['verb', 'u-verb'] },
        { jp: '壊す', reading: 'kowasu', en: 'to break (transitive)', tags: ['verb', 'u-verb'] },
        { jp: '壊れる', reading: 'kowareru', en: 'to break (intransitive)', tags: ['verb', 'ru-verb'] },
        { jp: '汚す', reading: 'yogosu', en: 'to dirty (transitive)', tags: ['verb', 'u-verb'] },
        { jp: '汚れる', reading: 'yogoreru', en: 'to get dirty (intransitive)', tags: ['verb', 'ru-verb'] },
        { jp: '窓', reading: 'mado', en: 'window', tags: ['noun'] },
        { jp: 'ドア', reading: 'doa', en: 'door', tags: ['noun'] },
        { jp: '電気', reading: 'denki', en: 'electricity, light', tags: ['noun'] },
        { jp: 'テレビ', reading: 'terebi', en: 'TV', tags: ['noun'] },
        { jp: 'エアコン', reading: 'eakon', en: 'air conditioner', tags: ['noun'] },
        { jp: '冷蔵庫', reading: 'reizouko', en: 'refrigerator', tags: ['noun'] },
      ]),
      JSON.stringify([
        {
          pattern: 'Transitive vs Intransitive Verbs',
          explanation: 'Transitive verbs (他動詞) take a direct object (を).\nIntransitive verbs (自動詞) do not take a direct object.\n\n-eru ending = usually transitive\n-aru ending = usually intransitive',
          examples: [
            { jp: '窓を開ける。', en: 'I open the window.' },
            { jp: '窓が開く。', en: 'The window opens.' },
            { jp: 'ドアを閉める。', en: 'I close the door.' },
            { jp: 'ドアが閉まる。', en: 'The door closes.' },
            { jp: '電気をつける。', en: 'I turn on the light.' },
            { jp: '電気がつく。', en: 'The light turns on.' },
          ]
        },
        {
          pattern: 'TE-form for States',
          explanation: 'TE-form + います can describe ongoing states:\n\n窓が開いています - The window is open\n電気がついています - The light is on\nドアが閉まっています - The door is closed',
          examples: [
            { jp: '窓が開いています。', en: 'The window is open.' },
            { jp: 'テレビがついています。', en: 'The TV is on.' },
            { jp: '冷蔵庫が壊れています。', en: 'The refrigerator is broken.' },
            { jp: 'シャツが汚れています。', en: 'The shirt is dirty.' },
          ]
        },
      ]),
    ]
  );
  console.log('✅ 2026-01-28 fixed');

  // 2026-02-02: Clothing, Colors, Kanji Numbers
  console.log('Fixing 2026-02-02: Clothing, Colors...');
  await pool.query(
    `UPDATE lessons 
     SET vocabulary = $1, grammar = $2, updated_at = CURRENT_TIMESTAMP
     WHERE id = '2026-02-02'`,
    [
      JSON.stringify([
        { jp: '服', reading: 'fuku', en: 'clothes', tags: ['noun'] },
        { jp: 'シャツ', reading: 'shatsu', en: 'shirt', tags: ['noun'] },
        { jp: 'Tシャツ', reading: 'tī-shatsu', en: 't-shirt', tags: ['noun'] },
        { jp: 'セーター', reading: 'sētā', en: 'sweater', tags: ['noun'] },
        { jp: 'コート', reading: 'kōto', en: 'coat', tags: ['noun'] },
        { jp: 'ジャケット', reading: 'jaketto', en: 'jacket', tags: ['noun'] },
        { jp: 'ズボン', reading: 'zubon', en: 'pants, trousers', tags: ['noun'] },
        { jp: 'パンツ', reading: 'pantsu', en: 'underwear (pants in Osaka!)', tags: ['noun'] },
        { jp: 'ジーンズ', reading: 'jīnzu', en: 'jeans', tags: ['noun'] },
        { jp: 'スカート', reading: 'sukāto', en: 'skirt', tags: ['noun'] },
        { jp: 'ドレス', reading: 'doresu', en: 'dress', tags: ['noun'] },
        { jp: '靴', reading: 'kutsu', en: 'shoes', tags: ['noun'] },
        { jp: '靴下', reading: 'kutsushita', en: 'socks', tags: ['noun'] },
        { jp: '帽子', reading: 'boushi', en: 'hat, cap', tags: ['noun'] },
        { jp: 'マフラー', reading: 'mafurā', en: 'scarf', tags: ['noun'] },
        { jp: '手袋', reading: 'tebukuro', en: 'gloves', tags: ['noun'] },
        { jp: '赤い', reading: 'akai', en: 'red', tags: ['i-adjective', 'color'] },
        { jp: '青い', reading: 'aoi', en: 'blue', tags: ['i-adjective', 'color'] },
        { jp: '黄色い', reading: 'kiiroi', en: 'yellow', tags: ['i-adjective', 'color'] },
        { jp: '白い', reading: 'shiroi', en: 'white', tags: ['i-adjective', 'color'] },
        { jp: '黒い', reading: 'kuroi', en: 'black', tags: ['i-adjective', 'color'] },
        { jp: '緑', reading: 'midori', en: 'green', tags: ['na-adjective', 'color'] },
        { jp: '茶色い', reading: 'chairoi', en: 'brown', tags: ['i-adjective', 'color'] },
        { jp: 'ピンク', reading: 'pinku', en: 'pink', tags: ['na-adjective', 'color'] },
        { jp: 'オレンジ', reading: 'orenji', en: 'orange', tags: ['na-adjective', 'color'] },
        { jp: '紫色', reading: 'murasakiiro', en: 'purple', tags: ['noun', 'color'] },
        { jp: '灰色', reading: 'haiiro', en: 'gray', tags: ['noun', 'color'] },
        { jp: '一', reading: 'ichi', en: 'one', tags: ['kanji', 'number'] },
        { jp: '二', reading: 'ni', en: 'two', tags: ['kanji', 'number'] },
        { jp: '三', reading: 'san', en: 'three', tags: ['kanji', 'number'] },
        { jp: '四', reading: 'shi/yon', en: 'four', tags: ['kanji', 'number'] },
        { jp: '五', reading: 'go', en: 'five', tags: ['kanji', 'number'] },
        { jp: '六', reading: 'roku', en: 'six', tags: ['kanji', 'number'] },
        { jp: '七', reading: 'shichi/nana', en: 'seven', tags: ['kanji', 'number'] },
        { jp: '八', reading: 'hachi', en: 'eight', tags: ['kanji', 'number'] },
        { jp: '九', reading: 'kyuu/ku', en: 'nine', tags: ['kanji', 'number'] },
        { jp: '十', reading: 'juu', en: 'ten', tags: ['kanji', 'number'] },
      ]),
      JSON.stringify([
        {
          pattern: 'Clothing Vocabulary',
          explanation: 'Common clothing items:\n\n上身 (upper body): シャツ、セーター、コート、ジャケット\n下身 (lower body): ズボン、パンツ、ジーンズ、スカート\n足 (feet): 靴、靴下\nアクセサリー: 帽子、マフラー、手袋',
          examples: [
            { jp: '赤いシャツ', en: 'red shirt' },
            { jp: '黒いズボン', en: 'black pants' },
            { jp: '白いセーター', en: 'white sweater' },
            { jp: '青いジーンズ', en: 'blue jeans' },
          ]
        },
        {
          pattern: 'Colors in Japanese',
          explanation: 'Most colors are i-adjectives:\n赤い、青い、白い、黒い、黄色い、茶色い\n\nSome are nouns/na-adjectives:\n緑、ピンク、オレンジ、紫色、灰色',
          examples: [
            { jp: '赤い車', en: 'red car' },
            { jp: '白い猫', en: 'white cat' },
            { jp: '緑のセーター', en: 'green sweater' },
            { jp: 'ピンクの花', en: 'pink flower' },
          ]
        },
        {
          pattern: 'Kanji Numbers 1-10',
          explanation: 'Basic kanji numbers:\n一 (1)、二 (2)、三 (3)、四 (4)、五 (5)\n六 (6)、七 (7)、八 (8)、九 (9)、十 (10)\n\nNote: 四 (4) and 九 (9) have alternate readings.\n七 (7) also has two readings.',
          examples: [
            { jp: '一人', en: 'hitori (one person)' },
            { jp: '二人', en: 'futari (two people)' },
            { jp: '三人', en: 'sannin (three people)' },
            { jp: '四月', en: 'shigatsu (April)' },
            { jp: '四時', en: 'yoji (4 o\'clock)' },
          ]
        },
      ]),
    ]
  );
  console.log('✅ 2026-02-02 fixed');

  // 2026-02-04: Days of Month, Counters
  console.log('Fixing 2026-02-04: Days of Month, Counters...');
  await pool.query(
    `UPDATE lessons 
     SET vocabulary = $1, grammar = $2, updated_at = CURRENT_TIMESTAMP
     WHERE id = '2026-02-04'`,
    [
      JSON.stringify([
        { jp: '一日', reading: 'tsuitachi/ichinichi', en: '1st day of month / one day', tags: ['date'] },
        { jp: '二日', reading: 'futsuka', en: '2nd day of month / two days', tags: ['date'] },
        { jp: '三日', reading: 'mikka', en: '3rd day of month / three days', tags: ['date'] },
        { jp: '四日', reading: 'yokka', en: '4th day of month / four days', tags: ['date'] },
        { jp: '五日', reading: 'itsuka', en: '5th day of month / five days', tags: ['date'] },
        { jp: '六日', reading: 'muika', en: '6th day of month / six days', tags: ['date'] },
        { jp: '七日', reading: 'nanoka', en: '7th day of month / seven days', tags: ['date'] },
        { jp: '八日', reading: 'youka', en: '8th day of month / eight days', tags: ['date'] },
        { jp: '九日', reading: 'kokonoka', en: '9th day of month / nine days', tags: ['date'] },
        { jp: '十日', reading: 'tooka', en: '10th day of month / ten days', tags: ['date'] },
        { jp: '十四日', reading: 'juuyokka', en: '14th day of month', tags: ['date'] },
        { jp: '二十日', reading: 'hatsuka', en: '20th day of month', tags: ['date'] },
        { jp: '二十四日', reading: 'nijuuyokka', en: '24th day of month', tags: ['date'] },
        { jp: '今日', reading: 'kyou', en: 'today', tags: ['time'] },
        { jp: '明日', reading: 'ashita', en: 'tomorrow', tags: ['time'] },
        { jp: '昨日', reading: 'kinou', en: 'yesterday', tags: ['time'] },
        { jp: '一昨日', reading: 'ototoi', en: 'day before yesterday', tags: ['time'] },
        { jp: '明後日', reading: 'asatte', en: 'day after tomorrow', tags: ['time'] },
        { jp: '頭', reading: 'atama', en: 'head', tags: ['body'] },
        { jp: '顔', reading: 'kao', en: 'face', tags: ['body'] },
        { jp: '目', reading: 'me', en: 'eye', tags: ['body'] },
        { jp: '耳', reading: 'mimi', en: 'ear', tags: ['body'] },
        { jp: '鼻', reading: 'hana', en: 'nose', tags: ['body'] },
        { jp: '口', reading: 'kuchi', en: 'mouth', tags: ['body'] },
        { jp: '歯', reading: 'ha', en: 'tooth', tags: ['body'] },
        { jp: '首', reading: 'kubi', en: 'neck', tags: ['body'] },
        { jp: '肩', reading: 'kata', en: 'shoulder', tags: ['body'] },
        { jp: '手', reading: 'te', en: 'hand', tags: ['body'] },
        { jp: '指', reading: 'yubi', en: 'finger', tags: ['body'] },
        { jp: '足', reading: 'ashi', en: 'foot, leg', tags: ['body'] },
        { jp: 'ひざ', reading: 'hiza', en: 'knee', tags: ['body'] },
        { jp: 'お腹', reading: 'onaka', en: 'stomach', tags: ['body'] },
        { jp: '背中', reading: 'senaka', en: 'back', tags: ['body'] },
      ]),
      JSON.stringify([
        {
          pattern: 'Days of the Month',
          explanation: 'Special readings for days 1-10 and 14, 20, 24:\n\n1日 - tsuitachi\n2日 - futsuka\n3日 - mikka\n4日 - yokka\n5日 - itsuka\n6日 - muika\n7日 - nanoka\n8日 - youka\n9日 - kokonoka\n10日 - tooka\n\n14日 - juuyokka\n20日 - hatsuka\n24日 - nijuuyokka',
          examples: [
            { jp: '一月一日', en: 'January 1st' },
            { jp: '五月五日', en: 'May 5th' },
            { jp: '十二月二十四日', en: 'December 24th' },
            { jp: '三日間', en: 'for three days' },
          ]
        },
        {
          pattern: 'Body Parts',
          explanation: 'Common body parts vocabulary:\n\n頭 (atama) - head\n顔 (kao) - face\n目 (me) - eye\n耳 (mimi) - ear\n鼻 (hana) - nose\n口 (kuchi) - mouth\n歯 (ha) - tooth\n手 (te) - hand\n足 (ashi) - foot, leg',
          examples: [
            { jp: '頭が痛いです。', en: 'I have a headache.' },
            { jp: '手を洗います。', en: 'I wash my hands.' },
            { jp: '足が疲れました。', en: 'My legs are tired.' },
            { jp: '目が青いです。', en: '(The) eyes are blue.' },
          ]
        },
      ]),
    ]
  );
  console.log('✅ 2026-02-04 fixed');

  await pool.end();
}

fixRemaining().then(() => process.exit(0)).catch(console.error);
