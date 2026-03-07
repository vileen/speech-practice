#!/usr/bin/env node
import { pool } from '../src/db/pool.js';

async function fix2025_11_03() {
  console.log('Fixing 2025-11-03: Katakana ra-wa, Dictionary Form, Existence Verbs...');
  
  const fixedLesson = {
    id: '2025-11-03',
    date: '2025-11-03',
    title: 'Katakana: ra-wa, Dictionary Form, Existence Verbs (iru/aru)',
    order: 9,
    topics: ['katakana R-row', 'katakana W-row', 'dictionary form', 'iru/aru', 'verb groups'],
    
    vocabulary: [
      // Katakana R-row
      { jp: 'ラ', reading: 'ra', en: 'ra (katakana)', tags: ['katakana'] },
      { jp: 'ラーメン', reading: 'rāmen', en: 'ramen', tags: ['katakana-word'] },
      { jp: 'ラジオ', reading: 'rajio', en: 'radio', tags: ['katakana-word'] },
      { jp: 'リ', reading: 'ri', en: 'ri (katakana)', tags: ['katakana'] },
      { jp: 'リサイクル', reading: 'risaikuru', en: 'recycle', tags: ['katakana-word'] },
      { jp: 'ル', reading: 'ru', en: 'ru (katakana)', tags: ['katakana'] },
      { jp: 'ルール', reading: 'rūru', en: 'rule', tags: ['katakana-word'] },
      { jp: 'レ', reading: 're', en: 're (katakana)', tags: ['katakana'] },
      { jp: 'レストラン', reading: 'resutoran', en: 'restaurant', tags: ['katakana-word'] },
      { jp: 'ロ', reading: 'ro', en: 'ro (katakana)', tags: ['katakana'] },
      { jp: 'ロボット', reading: 'robotto', en: 'robot', tags: ['katakana-word'] },
      
      // Katakana W-row
      { jp: 'ワ', reading: 'wa', en: 'wa (katakana)', tags: ['katakana'] },
      { jp: 'ワイン', reading: 'wain', en: 'wine', tags: ['katakana-word'] },
      { jp: 'ヲ', reading: 'wo', en: 'wo (katakana) - rarely used', tags: ['katakana'] },
      { jp: 'ン', reading: 'n', en: 'n (katakana)', tags: ['katakana'] },
      
      // Existence verbs
      { jp: 'いる', reading: 'iru', en: 'to exist (people, animals)', tags: ['verb', 'ru-verb'] },
      { jp: 'ある', reading: 'aru', en: 'to exist (objects, plants)', tags: ['verb', 'u-verb'] },
      { jp: '人', reading: 'hito', en: 'person, human', tags: ['noun'] },
      { jp: '机', reading: 'tsukue', en: 'desk', tags: ['noun'] },
      { jp: '上', reading: 'ue', en: 'top, above, on', tags: ['noun'] },
      
      // Time words
      { jp: '明日', reading: 'ashita', en: 'tomorrow', tags: ['time'] },
      { jp: '今日', reading: 'kyou', en: 'today', tags: ['time'] },
      { jp: '昨日', reading: 'kinou', en: 'yesterday', tags: ['time'] },
      
      // Weather
      { jp: '雨', reading: 'ame', en: 'rain', tags: ['noun'] },
      { jp: '降る', reading: 'furu', en: 'to fall (rain, snow)', tags: ['verb', 'u-verb'] },
      { jp: '雪', reading: 'yuki', en: 'snow', tags: ['noun'] },
      
      // Other useful words
      { jp: '試合', reading: 'shiai', en: 'match, game, competition', tags: ['noun'] },
      { jp: '牛乳', reading: 'gyuunyuu', en: 'milk (cow milk)', tags: ['noun'] },
      { jp: 'ミルク', reading: 'miruku', en: 'milk (general)', tags: ['katakana-word'] },
      { jp: 'パン', reading: 'pan', en: 'bread', tags: ['katakana-word'] },
      { jp: 'ジュース', reading: 'jūsu', en: 'juice', tags: ['katakana-word'] },
      
      // Dictionary form examples
      { jp: '食べる', reading: 'taberu', en: 'to eat (dict. form)', tags: ['verb', 'ru-verb'] },
      { jp: '見る', reading: 'miru', en: 'to see/watch (dict. form)', tags: ['verb', 'ru-verb'] },
      { jp: '飲む', reading: 'nomu', en: 'to drink (dict. form)', tags: ['verb', 'u-verb'] },
      { jp: '話す', reading: 'hanasu', en: 'to speak (dict. form)', tags: ['verb', 'u-verb'] },
      { jp: '来る', reading: 'kuru', en: 'to come (dict. form)', tags: ['verb', 'irregular'] },
      { jp: 'する', reading: 'suru', en: 'to do (dict. form)', tags: ['verb', 'irregular'] },
      
      // Extended words
      { jp: 'アメリカ', reading: 'amerika', en: 'America, USA', tags: ['katakana-word'] },
      { jp: 'フランス', reading: 'furansu', en: 'France', tags: ['katakana-word'] },
      { jp: 'イギリス', reading: 'igirisu', en: 'UK, Britain', tags: ['katakana-word'] },
      { jp: 'ドイツ', reading: 'doitsu', en: 'Germany', tags: ['katakana-word'] },
      { jp: 'イタリア', reading: 'itaria', en: 'Italy', tags: ['katakana-word'] },
      { jp: 'カナダ', reading: 'kanada', en: 'Canada', tags: ['katakana-word'] },
      { jp: 'オーストラリア', reading: 'ōsutoraria', en: 'Australia', tags: ['katakana-word'] },
    ],
    
    grammar: [
      {
        pattern: 'Complete Katakana Chart',
        explanation: `All 46 katakana characters:

アイウエオ カキクケコ サシスセソ
タチツテト ナニヌネノ ハヒフヘホ
マミムメモ ヤユヨ ラリルレロ
ワヲ ン

Dakuon (voiced sounds):
ガギグゲゴ ザジズゼゾ ダヂヅデド バビブベボ

Handakuon (p-sounds):
パピプペポ

Yoon (contracted sounds):
キャキュキョ シャシュショ チャチュチョ ニャニュニョ etc.`,
        examples: [
          { jp: 'コンピューター', en: 'konpyūtā (computer)' },
          { jp: 'メニュー', en: 'menyū (menu)' },
          { jp: 'シャツ', en: 'shatsu (shirt)' },
          { jp: 'チョコレート', en: 'chokorēto (chocolate)' },
        ]
      },
      {
        pattern: 'R-row and W-row Katakana',
        explanation: `Final katakana rows:

ラリルレロ (ra-ri-ru-re-ro):
- ラ: simple shape
- リ: two vertical lines
- ル: loop + slide
- レ: like hiragana
- ロ: square

ワヲン (wa-wo-n):
- ワ: simple angular
- ヲ: rarely used (particle)
- ン: with dot on top!`,
        examples: [
          { jp: 'ラーメン', en: 'rāmen' },
          { jp: 'レストラン', en: 'resutoran' },
          { jp: 'ロボット', en: 'robotto' },
          { jp: 'ワイン', en: 'wain' },
        ]
      },
      {
        pattern: 'Dictionary Form (Plain Form)',
        explanation: `The dictionary form is the basic, casual form of verbs:

Ru-verbs: Drop ます, add る
- 食べます → 食べる (taberu)
- 見ます → 見る (miru)

U-verbs: Change masu-form ending to u-ending
- 飲みます → 飲む (nomu)
- 行きます → 行く (iku)
- 話します → 話す (hanasu)

Irregular:
- します → する (suru)
- 来ます → 来る (kuru)`,
        examples: [
          { jp: '寿司を食べる。', en: 'I eat sushi. (casual)' },
          { jp: '映画を見る。', en: 'I watch movies. (casual)' },
          { jp: '水を飲む。', en: 'I drink water. (casual)' },
          { jp: '日本語を話す。', en: 'I speak Japanese. (casual)' },
        ]
      },
      {
        pattern: 'Existence Verbs: iru vs aru',
        explanation: `Two verbs for "to exist/be":

いる (iru) - for animate things:
- People, animals
- Example: 猫がいる (neko ga iru - there is a cat)

ある (aru) - for inanimate things:
- Objects, plants, concepts
- Example: 本がある (hon ga aru - there is a book)

Structure: [thing] が [place] に いる/ある
Or: [place] に [thing] が いる/ある`,
        examples: [
          { jp: '犬がいる。', en: 'There is a dog.' },
          { jp: '本がある。', en: 'There is a book.' },
          { jp: '部屋に猫がいる。', en: 'There is a cat in the room.' },
          { jp: '机の上に本がある。', en: 'There is a book on the desk.' },
        ]
      },
      {
        pattern: 'Verb Groups (Classification)',
        explanation: `Japanese verbs are grouped by their dictionary form ending:

Group 1 (U-verbs / Godan):
- End in u, tsu, ru, mu, bu, nu, ku, gu, su
- Example: 飲む, 話す, 行く, 読む

Group 2 (Ru-verbs / Ichidan):
- End in iru or eru (mostly)
- Example: 食べる, 見る, 起きる, 寝る

Group 3 (Irregular):
- Only two: する and 来る
- And compounds with する

Why know this? Different conjugation patterns!`,
        examples: [
          { jp: '飲む (u-verb)', en: 'nomu' },
          { jp: '食べる (ru-verb)', en: 'taberu' },
          { jp: 'する (irregular)', en: 'suru' },
          { jp: '来る (irregular)', en: 'kuru' },
        ]
      },
    ],
    
    practice_phrases: [
      '明日、レストランに行きます。',
      '部屋に机がある。',
      'ラーメンを食べる。',
      '猫がいますか？',
      'ワインを飲みます。',
    ]
  };
  
  await pool.query(
    `UPDATE lessons 
     SET title = $1, topics = $2, vocabulary = $3, grammar = $4, practice_phrases = $5, updated_at = CURRENT_TIMESTAMP
     WHERE id = $6`,
    [
      fixedLesson.title,
      fixedLesson.topics,
      JSON.stringify(fixedLesson.vocabulary),
      JSON.stringify(fixedLesson.grammar),
      fixedLesson.practice_phrases,
      fixedLesson.id
    ]
  );
  
  console.log('✅ 2025-11-03 fixed');
  console.log(`- Vocabulary: ${fixedLesson.vocabulary.length} items`);
  console.log(`- Grammar points: ${fixedLesson.grammar.length}`);
  console.log(`- Practice phrases: ${fixedLesson.practice_phrases.length}`);
}

fix2025_11_03().then(() => process.exit(0)).catch(console.error);
