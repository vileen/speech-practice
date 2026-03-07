#!/usr/bin/env node
import { pool } from '../src/db/pool.js';

async function fixRemaining() {
  // 2025-12-15: TE-form Practice
  console.log('Fixing 2025-12-15: TE-form Practice...');
  await pool.query(
    `UPDATE lessons 
     SET vocabulary = $1, grammar = $2, updated_at = CURRENT_TIMESTAMP
     WHERE id = '2025-12-15'`,
    [
      JSON.stringify([
        { jp: '食べて', reading: 'tabete', en: 'eat (te-form)', tags: ['te-form'] },
        { jp: '見て', reading: 'mite', en: 'see/watch (te-form)', tags: ['te-form'] },
        { jp: 'して', reading: 'shite', en: 'do (te-form)', tags: ['te-form'] },
        { jp: '来て', reading: 'kite', en: 'come (te-form)', tags: ['te-form'] },
        { jp: '行って', reading: 'itte', en: 'go (te-form)', tags: ['te-form'] },
        { jp: '飲んで', reading: 'nonde', en: 'drink (te-form)', tags: ['te-form'] },
        { jp: '読んで', reading: 'yonde', en: 'read (te-form)', tags: ['te-form'] },
        { jp: '帰って', reading: 'kaette', en: 'return (te-form)', tags: ['te-form'] },
        { jp: '話して', reading: 'hanashite', en: 'speak (te-form)', tags: ['te-form'] },
        { jp: '書いて', reading: 'kaite', en: 'write (te-form)', tags: ['te-form'] },
        { jp: '買って', reading: 'katte', en: 'buy (te-form)', tags: ['te-form'] },
        { jp: '待って', reading: 'matte', en: 'wait (te-form)', tags: ['te-form'] },
        { jp: '死んで', reading: 'shinde', en: 'die (te-form)', tags: ['te-form'] },
        { jp: '遊んで', reading: 'asonde', en: 'play (te-form)', tags: ['te-form'] },
        { jp: '泳いで', reading: 'oyoide', en: 'swim (te-form)', tags: ['te-form'] },
        { jp: '急いで', reading: 'isoide', en: 'hurry (te-form)', tags: ['te-form'] },
        { jp: '切って', reading: 'kitte', en: 'cut (te-form)', tags: ['te-form'] },
        { jp: '作って', reading: 'tsukutte', en: 'make (te-form)', tags: ['te-form'] },
        { jp: '持って', reading: 'motte', en: 'hold (te-form)', tags: ['te-form'] },
        { jp: '死ぬ', reading: 'shinu', en: 'to die', tags: ['verb'] },
        { jp: '急ぐ', reading: 'isogu', en: 'to hurry', tags: ['verb'] },
        { jp: '泳ぐ', reading: 'oyogu', en: 'to swim', tags: ['verb'] },
      ]),
      JSON.stringify([
        {
          pattern: 'TE-form Conjugation Rules',
          explanation: 'Ru-verbs: Drop る + て\nU-verbs vary by ending:\n- u/tsu/ru → tte\n- mu/bu/nu → nde\n- ku → ite (gu → ide)\n- su → shite\nIrregular: する→して, 来る→来て, 行く→行って',
          examples: [
            { jp: '食べる → 食べて', en: 'eat' },
            { jp: '飲む → 飲んで', en: 'drink' },
            { jp: '書く → 書いて', en: 'write' },
            { jp: '泳ぐ → 泳いで', en: 'swim' },
            { jp: '話す → 話して', en: 'speak' },
            { jp: '待つ → 待って', en: 'wait' },
            { jp: '死ぬ → 死んで', en: 'die' },
            { jp: '遊ぶ → 遊んで', en: 'play' },
          ]
        },
        {
          pattern: 'Connecting Activities with TE-form',
          explanation: 'Use TE-form to connect multiple actions in sequence:\n\n[action 1 te-form] + [action 2]',
          examples: [
            { jp: '朝ご飯を食べて、学校に行きます。', en: 'I eat breakfast and go to school.' },
            { jp: '本を読んで、寝ます。', en: 'I read a book and sleep.' },
            { jp: '買い物して、帰ります。', en: 'I shop and go home.' },
          ]
        },
      ]),
    ]
  );
  console.log('✅ 2025-12-15 fixed');

  // 2025-12-17: TE-form Review
  console.log('Fixing 2025-12-17: TE-form Review...');
  await pool.query(
    `UPDATE lessons 
     SET vocabulary = $1, grammar = $2, updated_at = CURRENT_TIMESTAMP
     WHERE id = '2025-12-17'`,
    [
      JSON.stringify([
        { jp: '～ています', reading: 'te imasu', en: 'ongoing action / current state', tags: ['grammar'] },
        { jp: '～てください', reading: 'te kudasai', en: 'please do ~', tags: ['grammar'] },
        { jp: '～てもいいです', reading: 'te mo ii desu', en: 'it is okay to ~', tags: ['grammar'] },
        { jp: '～てはいけません', reading: 'te wa ikemasen', en: 'you must not ~', tags: ['grammar'] },
        { jp: '勉強しています', reading: 'benkyou shite imasu', en: 'studying (ongoing)', tags: ['example'] },
        { jp: '食べています', reading: 'tabete imasu', en: 'eating (ongoing)', tags: ['example'] },
        { jp: '行ってください', reading: 'itte kudasai', en: 'please go', tags: ['example'] },
        { jp: '見てもいいです', reading: 'mite mo ii desu', en: 'you may watch', tags: ['example'] },
        { jp: '触ってはいけません', reading: 'sawatte wa ikemasen', en: 'do not touch', tags: ['example'] },
        { jp: '助けて', reading: 'tasukete', en: 'help!', tags: ['expression'] },
        { jp: '危ない', reading: 'abunai', en: 'dangerous', tags: ['i-adjective'] },
        { jp: '触る', reading: 'sawaru', en: 'to touch', tags: ['verb'] },
      ]),
      JSON.stringify([
        {
          pattern: 'TE-form + います (Ongoing Action)',
          explanation: 'TE-form + います indicates an action in progress:\n\n[verb te-form] + います',
          examples: [
            { jp: '今、食べています。', en: 'I am eating now.' },
            { jp: '日本語を勉強しています。', en: 'I am studying Japanese.' },
            { jp: '雨が降っています。', en: 'It is raining.' },
          ]
        },
        {
          pattern: 'TE-form + ください (Request)',
          explanation: 'TE-form + ください makes a polite request:\n\n[verb te-form] + ください',
          examples: [
            { jp: '水を飲んでください。', en: 'Please drink water.' },
            { jp: 'ここに書いてください。', en: 'Please write here.' },
            { jp: '助けてください！', en: 'Please help me!' },
          ]
        },
        {
          pattern: 'TE-form + もいいです (Permission)',
          explanation: 'TE-form + もいいです gives permission:\n\n[verb te-form] + もいいです',
          examples: [
            { jp: '写真を撮ってもいいです。', en: 'You may take photos.' },
            { jp: 'ここに座ってもいいですか？', en: 'May I sit here?' },
            { jp: 'はい、座ってもいいです。', en: 'Yes, you may sit.' },
          ]
        },
        {
          pattern: 'TE-form + はいけません (Prohibition)',
          explanation: 'TE-form + はいけません prohibits an action:\n\n[verb te-form] + はいけません',
          examples: [
            { jp: 'ここで写真を撮ってはいけません。', en: 'You must not take photos here.' },
            { jp: '危ない！触ってはいけません。', en: 'Dangerous! Do not touch!' },
            { jp: 'ここに入ってはいけません。', en: 'You must not enter here.' },
          ]
        },
      ]),
    ]
  );
  console.log('✅ 2025-12-17 fixed');

  // 2025-12-23: TE-form Describing Appearance
  console.log('Fixing 2025-12-23: TE-form Describing Appearance...');
  await pool.query(
    `UPDATE lessons 
     SET vocabulary = $1, grammar = $2, updated_at = CURRENT_TIMESTAMP
     WHERE id = '2025-12-23'`,
    [
      JSON.stringify([
        { jp: '着る', reading: 'kiru', en: 'to wear (upper body)', tags: ['verb'] },
        { jp: '履く', reading: 'haku', en: 'to wear (lower body, footwear)', tags: ['verb'] },
        { jp: '被る', reading: 'kaburu', en: 'to wear (on head)', tags: ['verb'] },
        { jp: 'かける', reading: 'kakeru', en: 'to wear (glasses)', tags: ['verb'] },
        { jp: '身長', reading: 'shinchou', en: 'height', tags: ['noun'] },
        { jp: '体重', reading: 'taijuu', en: 'weight', tags: ['noun'] },
        { jp: '背が高い', reading: 'se ga takai', en: 'tall (person)', tags: ['i-adjective'] },
        { jp: '背が低い', reading: 'se ga hikui', en: 'short (person)', tags: ['i-adjective'] },
        { jp: '髪', reading: 'kami', en: 'hair', tags: ['noun'] },
        { jp: '長い', reading: 'nagai', en: 'long', tags: ['i-adjective'] },
        { jp: '短い', reading: 'mijikai', en: 'short', tags: ['i-adjective'] },
        { jp: '目', reading: 'me', en: 'eye', tags: ['noun'] },
        { jp: '大きい', reading: 'ookii', en: 'big', tags: ['i-adjective'] },
        { jp: '小さい', reading: 'chiisai', en: 'small', tags: ['i-adjective'] },
        { jp: '青い', reading: 'aoi', en: 'blue', tags: ['i-adjective'] },
        { jp: '黒い', reading: 'kuroi', en: 'black', tags: ['i-adjective'] },
        { jp: '茶色い', reading: 'chairoi', en: 'brown', tags: ['i-adjective'] },
        { jp: '金髪', reading: 'kinpatsu', en: 'blonde hair', tags: ['noun'] },
        { jp: '眼鏡', reading: 'megane', en: 'glasses', tags: ['noun'] },
        { jp: 'ひげ', reading: 'hige', en: 'beard, mustache', tags: ['noun'] },
        { jp: '～をしています', reading: 'wo shite imasu', en: 'wearing ~ (state)', tags: ['grammar'] },
        { jp: '～が～です', reading: 'ga ~desu', en: 'has ~ (feature)', tags: ['grammar'] },
      ]),
      JSON.stringify([
        {
          pattern: 'Describing What Someone is Wearing',
          explanation: 'Use TE-form + います to describe what someone is wearing:\n\n[clothing] を [wear-verb te-form] + います\n\nOr more simply:\n[clothing] を しています',
          examples: [
            { jp: 'シャツを着ています。', en: '(He/she) is wearing a shirt.' },
            { jp: 'ジーンズを履いています。', en: '(He/she) is wearing jeans.' },
            { jp: '帽子を被っています。', en: '(He/she) is wearing a hat.' },
            { jp: '眼鏡をかけています。', en: '(He/she) is wearing glasses.' },
          ]
        },
        {
          pattern: 'Describing Physical Appearance',
          explanation: 'Use ～が to describe features someone has:\n\n背が高い/低い - tall/short\n髪が長い/短い - long/short hair\n目が大きい/小さい - big/small eyes',
          examples: [
            { jp: '背が高いです。', en: '(He/she) is tall.' },
            { jp: '髪が長いです。', en: '(He/she) has long hair.' },
            { jp: '青い目をしています。', en: '(He/she) has blue eyes.' },
            { jp: '眼鏡をかけています。', en: '(He/she) wears glasses.' },
            { jp: 'ひげを生やしています。', en: '(He/she) has a beard.' },
          ]
        },
      ]),
    ]
  );
  console.log('✅ 2025-12-23 fixed');

  await pool.end();
}

fixRemaining().then(() => process.exit(0)).catch(console.error);
