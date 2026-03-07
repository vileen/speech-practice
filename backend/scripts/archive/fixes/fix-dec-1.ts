#!/usr/bin/env node
import { pool } from '../src/db/pool.js';

async function fixLessons() {
  // Fix 2025-12-01: Frequency Adverbs
  console.log('Fixing 2025-12-01: Frequency Adverbs and Suggestions...');
  await pool.query(
    `UPDATE lessons 
     SET vocabulary = $1, grammar = $2, updated_at = CURRENT_TIMESTAMP
     WHERE id = '2025-12-01'`,
    [
      JSON.stringify([
        { jp: '毎日', reading: 'mainichi', en: 'every day', tags: ['adverb', 'time'] },
        { jp: 'いつも', reading: 'itsumo', en: 'always', tags: ['adverb'] },
        { jp: 'よく', reading: 'yoku', en: 'often, well', tags: ['adverb'] },
        { jp: 'たいてい', reading: 'taitei', en: 'usually, mostly', tags: ['adverb'] },
        { jp: '時々', reading: 'tokidoki', en: 'sometimes', tags: ['adverb'] },
        { jp: 'たまに', reading: 'tamani', en: 'occasionally', tags: ['adverb'] },
        { jp: 'あまり～ません', reading: 'amari ~masen', en: 'not very much (negative)', tags: ['grammar'] },
        { jp: '全然～ません', reading: 'zenzen ~masen', en: 'not at all (negative)', tags: ['grammar'] },
        { jp: '滅多に～ません', reading: 'metta ni ~masen', en: 'rarely, hardly (negative)', tags: ['grammar'] },
        { jp: '十分～ません', reading: 'juubun ~masen', en: 'not enough (negative)', tags: ['grammar'] },
        { jp: '少しも～ません', reading: 'sukoshi mo ~masen', en: 'not even a little (negative)', tags: ['grammar'] },
      ]),
      JSON.stringify([
        {
          pattern: 'Frequency Adverbs',
          explanation: 'Adverbs to describe how often something happens, from most to least frequent:\n\n毎日 (mainichi) - every day\nいつも (itsumo) - always\nよく (yoku) - often\nたいてい (taitei) - usually\n時々 (tokidoki) - sometimes\nたまに (tamani) - occasionally\nあまり～ません (amari ~masen) - not very much\n全然～ません (zenzen ~masen) - not at all',
          examples: [
            { jp: '毎日日本語を勉強します。', en: 'I study Japanese every day.' },
            { jp: 'いつも電車で行きます。', en: 'I always go by train.' },
            { jp: 'よく公園を散歩します。', en: 'I often walk in the park.' },
            { jp: '時々レストランで食べます。', en: 'I sometimes eat at restaurants.' },
            { jp: 'あまりコーヒーを飲みません。', en: 'I do not drink coffee much.' },
            { jp: '全然雑誌を読みません。', en: 'I do not read magazines at all.' },
          ]
        },
        {
          pattern: 'Making Suggestions (～ませんか？)',
          explanation: 'To make a polite suggestion, use the negative form + か:\n\nStructure: [verb-masen] + か\n\nThis means "Won\'t you...?" or "Shall we...?"',
          examples: [
            { jp: '行きませんか？', en: 'Shall we go?' },
            { jp: '一緒に食べませんか？', en: 'Won\'t you eat together?' },
            { jp: '映画を見ませんか？', en: 'Shall we watch a movie?' },
            { jp: '明日、勉強しませんか？', en: 'Shall we study tomorrow?' },
          ]
        },
      ]),
    ]
  );
  console.log('✅ 2025-12-01 fixed');

  // Fix 2025-12-03: Existence Verbs
  console.log('Fixing 2025-12-03: Existence Verbs and Food Vocabulary...');
  await pool.query(
    `UPDATE lessons 
     SET vocabulary = $1, grammar = $2, updated_at = CURRENT_TIMESTAMP
     WHERE id = '2025-12-03'`,
    [
      JSON.stringify([
        { jp: 'あります', reading: 'arimasu', en: 'to exist (non-living things)', tags: ['verb'] },
        { jp: 'います', reading: 'imasu', en: 'to exist (living things)', tags: ['verb'] },
        { jp: 'ありません', reading: 'arimasen', en: 'do not exist (non-living, polite negative)', tags: ['verb'] },
        { jp: 'いません', reading: 'imasen', en: 'do not exist (living, polite negative)', tags: ['verb'] },
        { jp: 'ない', reading: 'nai', en: 'do not exist (non-living, casual)', tags: ['verb'] },
        { jp: 'いない', reading: 'inai', en: 'do not exist (living, casual)', tags: ['verb'] },
        { jp: 'お金', reading: 'okane', en: 'money', tags: ['noun'] },
        { jp: '予定', reading: 'yotei', en: 'plans, schedule', tags: ['noun'] },
        { jp: '授業', reading: 'jugyou', en: 'class, lesson', tags: ['noun'] },
        { jp: '試験', reading: 'shiken', en: 'exam, test', tags: ['noun'] },
        { jp: '会議', reading: 'kaigi', en: 'meeting', tags: ['noun'] },
        { jp: 'パソコン', reading: 'pasokon', en: 'PC, computer', tags: ['noun'] },
        { jp: '冷蔵庫', reading: 'reizouko', en: 'refrigerator', tags: ['noun'] },
        { jp: '近く', reading: 'chikaku', en: 'nearby, vicinity', tags: ['noun'] },
        { jp: '誰か', reading: 'dareka', en: 'someone', tags: ['pronoun'] },
        { jp: '誰も', reading: 'daremo', en: 'no one (with negative)', tags: ['pronoun'] },
        { jp: '来週', reading: 'raishuu', en: 'next week', tags: ['time'] },
        { jp: '週末', reading: 'shuumatsu', en: 'weekend', tags: ['time'] },
        { jp: '火曜日', reading: 'kayoubi', en: 'Tuesday', tags: ['time'] },
        { jp: '動物園', reading: 'doubutsuen', en: 'zoo', tags: ['noun'] },
        { jp: 'ゴリラ', reading: 'gorira', en: 'gorilla', tags: ['noun'] },
        { jp: 'マリア・キュリー', reading: 'Maria Curie', en: 'Marie Curie', tags: ['name'] },
        { jp: '～について', reading: 'nitsuite', en: 'about, concerning', tags: ['grammar'] },
      ]),
      JSON.stringify([
        {
          pattern: 'Existence Verbs: arimasu vs imasu',
          explanation: 'あります for non-living things (objects, events, abstract things)\nいます for living things (people, animals)\n\nStructure: [thing] が [place] に あります/います',
          examples: [
            { jp: '本があります。', en: 'There is a book.' },
            { jp: '犬がいます。', en: 'There is a dog.' },
            { jp: '駅の近くにコンビニがあります。', en: 'There is a convenience store near the station.' },
            { jp: '公園に子供がいます。', en: 'There are children in the park.' },
            { jp: '明日テストがあります。', en: 'There is a test tomorrow.' },
          ]
        },
        {
          pattern: 'Negative Form of Existence',
          explanation: 'Polite: ありません / いません\nCasual: ない / いない\n\nUse 誰も/何も with negative for "no one"/"nothing"',
          examples: [
            { jp: 'お金がありません。', en: 'I don\'t have money.' },
            { jp: '猫がいません。', en: 'There is no cat.' },
            { jp: '家に誰もいません。', en: 'There is no one at home.' },
            { jp: '明日予定がありません。', en: 'I don\'t have plans tomorrow.' },
          ]
        },
      ]),
    ]
  );
  console.log('✅ 2025-12-03 fixed');

  // Fix 2025-12-10: Location Words
  console.log('Fixing 2025-12-10: Location Words and Positional Phrases...');
  await pool.query(
    `UPDATE lessons 
     SET vocabulary = $1, grammar = $2, updated_at = CURRENT_TIMESTAMP
     WHERE id = '2025-12-10'`,
    [
      JSON.stringify([
        { jp: '上', reading: 'ue', en: 'on, above, top', tags: ['location'] },
        { jp: '下', reading: 'shita', en: 'under, below', tags: ['location'] },
        { jp: '中', reading: 'naka', en: 'inside, in', tags: ['location'] },
        { jp: '外', reading: 'soto', en: 'outside', tags: ['location'] },
        { jp: '前', reading: 'mae', en: 'front, before', tags: ['location'] },
        { jp: '後ろ', reading: 'ushiro', en: 'back, behind', tags: ['location'] },
        { jp: '隣', reading: 'tonari', en: 'next to, neighboring', tags: ['location'] },
        { jp: '近く', reading: 'chikaku', en: 'near, close to', tags: ['location'] },
        { jp: '間', reading: 'aida', en: 'between, interval', tags: ['location'] },
        { jp: '向こう', reading: 'mukou', en: 'across, over there', tags: ['location'] },
        { jp: '側', reading: 'soba', en: 'beside, near', tags: ['location'] },
        { jp: '横', reading: 'yoko', en: 'beside, to the side', tags: ['location'] },
        { jp: '裏', reading: 'ura', en: 'behind, reverse side', tags: ['location'] },
        { jp: '周り', reading: 'mawari', en: 'around, surroundings', tags: ['location'] },
        { jp: '図書館', reading: 'toshokan', en: 'library', tags: ['place'] },
        { jp: '郵便局', reading: 'yuubinkyoku', en: 'post office', tags: ['place'] },
        { jp: '駅', reading: 'eki', en: 'station', tags: ['place'] },
        { jp: '銀行', reading: 'ginkou', en: 'bank', tags: ['place'] },
        { jp: '辞書', reading: 'jisho', en: 'dictionary', tags: ['noun'] },
        { jp: '傘', reading: 'kasa', en: 'umbrella', tags: ['noun'] },
        { jp: '鞄', reading: 'kaban', en: 'bag, briefcase', tags: ['noun'] },
        { jp: '椅子', reading: 'isu', en: 'chair', tags: ['noun'] },
        { jp: '机', reading: 'tsukue', en: 'desk', tags: ['noun'] },
        { jp: '建物', reading: 'tatemono', en: 'building', tags: ['noun'] },
        { jp: 'ホテル', reading: 'hoteru', en: 'hotel', tags: ['place'] },
        { jp: '公園', reading: 'kouen', en: 'park', tags: ['place'] },
        { jp: '学校', reading: 'gakkou', en: 'school', tags: ['place'] },
      ]),
      JSON.stringify([
        {
          pattern: 'Location Words',
          explanation: 'Use の to connect location nouns:\n\n[place] の [location word]\n\n上 (ue) - on, above\n下 (shita) - under, below\n中 (naka) - inside\n外 (soto) - outside\n前 (mae) - front\n後ろ (ushiro) - behind\n隣 (tonari) - next to\n近く (chikaku) - near',
          examples: [
            { jp: '机の上', en: 'on the desk' },
            { jp: '椅子の下', en: 'under the chair' },
            { jp: '鞄の中', en: 'inside the bag' },
            { jp: '建物の外', en: 'outside the building' },
            { jp: '学校の前', en: 'in front of the school' },
            { jp: '郵便局の後ろ', en: 'behind the post office' },
            { jp: '銀行の隣', en: 'next to the bank' },
            { jp: '駅の近く', en: 'near the station' },
          ]
        },
        {
          pattern: 'Asking and Describing Location',
          explanation: 'Ask where something is:\n[thing] は どこ です か？\n\nAnswer:\n[thing] は [place] の [location] です',
          examples: [
            { jp: '図書館はどこですか？', en: 'Where is the library?' },
            { jp: '郵便局はどこですか？', en: 'Where is the post office?' },
            { jp: 'スーさんの辞書はどこですか？', en: 'Where is Ms. Su\'s dictionary?' },
            { jp: 'リュウさんの傘は机の上です。', en: 'Ms. Ryu\'s umbrella is on the desk.' },
            { jp: 'スーさんの辞書は鞄の中です。', en: 'Ms. Su\'s dictionary is in the bag.' },
          ]
        },
      ]),
    ]
  );
  console.log('✅ 2025-12-10 fixed');

  await pool.end();
}

fixLessons().then(() => process.exit(0)).catch(console.error);
