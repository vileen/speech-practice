#!/usr/bin/env node
import { pool } from '../src/db/pool.js';

async function fix2025_10_27() {
  console.log('Fixing 2025-10-27: Katakana ma-ya-ra, Negations, Verbs...');
  
  const fixedLesson = {
    id: '2025-10-27',
    date: '2025-10-27',
    title: 'Katakana: ma-mi-mu-me-mo, ya-yu-yo, ra-ri-ru-re-ro, wa-wo-n, Verbs',
    order: 7,
    topics: ['katakana M-row', 'katakana Y-row', 'katakana R-row', 'katakana W-row', 'masu form', 'negative verbs'],
    
    vocabulary: [
      // M-row
      { jp: 'マ', reading: 'ma', en: 'ma (katakana) - like hiragana', tags: ['katakana'] },
      { jp: 'ミ', reading: 'mi', en: 'mi (katakana) - three horizontal lines', tags: ['katakana'] },
      { jp: 'ム', reading: 'mu', en: 'mu (katakana) - loop with tail', tags: ['katakana'] },
      { jp: 'メ', reading: 'me', en: 'me (katakana) - like hiragana', tags: ['katakana'] },
      { jp: 'モ', reading: 'mo', en: 'mo (katakana) - two lines + middle', tags: ['katakana'] },
      
      // Y-row
      { jp: 'ヤ', reading: 'ya', en: 'ya (katakana) - simple shape', tags: ['katakana'] },
      { jp: 'ユ', reading: 'yu', en: 'yu (katakana) - angular hiragana', tags: ['katakana'] },
      { jp: 'ヨ', reading: 'yo', en: 'yo (katakana) - square shape', tags: ['katakana'] },
      
      // R-row
      { jp: 'ラ', reading: 'ra', en: 'ra (katakana) - simple shape', tags: ['katakana'] },
      { jp: 'リ', reading: 'ri', en: 'ri (katakana) - two straight lines', tags: ['katakana'] },
      { jp: 'ル', reading: 'ru', en: 'ru (katakana) - loop + slide down', tags: ['katakana'] },
      { jp: 'レ', reading: 're', en: 're (katakana) - like hiragana', tags: ['katakana'] },
      { jp: 'ロ', reading: 'ro', en: 'ro (katakana) - square', tags: ['katakana'] },
      
      // W-row + N
      { jp: 'ワ', reading: 'wa', en: 'wa (katakana) - without loops', tags: ['katakana'] },
      { jp: 'ヲ', reading: 'wo', en: 'wo (katakana) - rarely used (particle)', tags: ['katakana'] },
      { jp: 'ン', reading: 'n', en: 'n (katakana) - with dot on top!', tags: ['katakana'] },
      
      // Verbs - masu form
      { jp: '食べます', reading: 'tabemasu', en: 'eat (polite)', tags: ['verb', 'ru-verb'] },
      { jp: '食べません', reading: 'tabemasen', en: 'do not eat (polite)', tags: ['verb', 'ru-verb', 'negative'] },
      { jp: '見ます', reading: 'mimasu', en: 'watch/see (polite)', tags: ['verb', 'ru-verb'] },
      { jp: '見ません', reading: 'mimasen', en: 'do not watch (polite)', tags: ['verb', 'ru-verb', 'negative'] },
      { jp: '読みます', reading: 'yomimasu', en: 'read (polite)', tags: ['verb', 'u-verb'] },
      { jp: '読みません', reading: 'yomimasen', en: 'do not read (polite)', tags: ['verb', 'u-verb', 'negative'] },
      { jp: '行きます', reading: 'ikimasu', en: 'go (polite)', tags: ['verb', 'u-verb'] },
      { jp: '行きません', reading: 'ikimasen', en: 'do not go (polite)', tags: ['verb', 'u-verb', 'negative'] },
      { jp: 'します', reading: 'shimasu', en: 'do (polite)', tags: ['verb', 'irregular'] },
      { jp: 'しません', reading: 'shimasen', en: 'do not do (polite)', tags: ['verb', 'irregular', 'negative'] },
      { jp: '来ます', reading: 'kimasu', en: 'come (polite)', tags: ['verb', 'irregular'] },
      { jp: '来ません', reading: 'kimasen', en: 'do not come (polite)', tags: ['verb', 'irregular', 'negative'] },
      
      // Suru compounds
      { jp: '勉強する', reading: 'benkyō suru', en: 'to study', tags: ['verb', 'suru-verb'] },
      { jp: '勉強します', reading: 'benkyō shimasu', en: 'study (polite)', tags: ['verb', 'suru-verb'] },
      { jp: 'スポーツする', reading: 'supōtsu suru', en: 'to do sports', tags: ['verb', 'suru-verb'] },
      { jp: 'スポーツします', reading: 'supōtsu shimasu', en: 'do sports (polite)', tags: ['verb', 'suru-verb'] },
      
      // Common words
      { jp: 'マンガ', reading: 'manga', en: 'manga, comics', tags: ['katakana-word'] },
      { jp: 'ミュージック', reading: 'myūjikku', en: 'music', tags: ['katakana-word'] },
      { jp: 'メール', reading: 'mēru', en: 'email', tags: ['katakana-word'] },
      { jp: 'レストラン', reading: 'resutoran', en: 'restaurant', tags: ['katakana-word'] },
      { jp: 'ワイン', reading: 'wain', en: 'wine', tags: ['katakana-word'] },
    ],
    
    grammar: [
      {
        pattern: 'Katakana M-row: ma-mi-mu-me-mo (マミムメモ)',
        explanation: `The M-row of katakana:

マ - ma: Similar to hiragana
ミ - mi: Three horizontal lines
ム - mu: Loop with tail at top
メ - me: Like hiragana
モ - mo: Two lines with center connection`,
        examples: [
          { jp: 'マンガ', en: 'manga (comics)' },
          { jp: 'ミュージック', en: 'myūjikku (music)' },
          { jp: 'メール', en: 'mēru (email)' },
        ]
      },
      {
        pattern: 'Katakana Y-row: ya-yu-yo (ヤユヨ)',
        explanation: `The Y-row of katakana (only 3 characters):

ヤ - ya: Simple angular shape
ユ - yu: Like hiragana but more angular
ヨ - yo: Square-like shape`,
        examples: [
          { jp: 'ヤクザ', en: 'yakuza' },
          { jp: 'ユニーク', en: 'yunīku (unique)' },
          { jp: 'ヨーロッパ', en: 'yōroppa (Europe)' },
        ]
      },
      {
        pattern: 'Katakana R-row: ra-ri-ru-re-ro (ラリルレロ)',
        explanation: `The R-row of katakana:

ラ - ra: Simple shape
リ - ri: Two straight vertical lines
ル - ru: Loop with slide down
レ - re: Like hiragana
ロ - ro: Square shape (looks like katakana 口!)`,
        examples: [
          { jp: 'ラーメン', en: 'rāmen' },
          { jp: 'リモコン', en: 'rimokon (remote control)' },
          { jp: 'レストラン', en: 'resutoran (restaurant)' },
          { jp: 'ロボット', en: 'robotto (robot)' },
        ]
      },
      {
        pattern: 'Katakana W-row + N: wa-wo-n (ワヲン)',
        explanation: `The final katakana:

ワ - wa: Simple shape without loops
ヲ - wo: Rarely used (particle, read as "o")
ン - n: Written with dot on top!

Note: ン must be distinguished from:
- ソ (so) - different stroke direction
- シ (shi) - flatter`,
        examples: [
          { jp: 'ワイン', en: 'wain (wine)' },
          { jp: 'ワンワン', en: 'wanwan (woof woof)' },
          { jp: 'シンデレラ', en: 'shinderera (Cinderella)' },
        ]
      },
      {
        pattern: 'Complete Katakana Chart',
        explanation: `All katakana characters:

アイウエオ (a-i-u-e-o)
カキクケコ (ka-ki-ku-ke-ko)
サシスセソ (sa-shi-su-se-so)
タチツテト (ta-chi-tsu-te-to)
ナニヌネノ (na-ni-nu-ne-no)
ハヒフヘホ (ha-hi-fu-he-ho)
マミムメモ (ma-mi-mu-me-mo)
ヤユヨ (ya-yu-yo)
ラリルレロ (ra-ri-ru-re-ro)
ワヲ (wa-wo)
ン (n)`,
        examples: [
          { jp: 'カタカナ', en: 'katakana' },
          { jp: 'アメリカ', en: 'amerika (America)' },
          { jp: 'コンピューター', en: 'konpyūtā (computer)' },
        ]
      },
      {
        pattern: 'Verb masu Form (Polite)',
        explanation: `The masu form is the polite present affirmative:

Ru-verbs: Drop る + ます
- 食べる → 食べます (tabemasu)
- 見る → 見ます (mimasu)

U-verbs: Change final u to i + ます
- 読む → 読みます (yomimasu)
- 行く → 行きます (ikimasu)
- 話す → 話します (hanashimasu)

Irregular:
- する → します (shimasu)
- 来る → 来ます (kimasu)`,
        examples: [
          { jp: '寿司を食べます。', en: 'I eat sushi.' },
          { jp: '映画を見ます。', en: 'I watch a movie.' },
          { jp: '本を読みます。', en: 'I read a book.' },
          { jp: '学校に行きます。', en: 'I go to school.' },
        ]
      },
      {
        pattern: 'Verb masen Form (Polite Negative)',
        explanation: `The masen form is the polite present negative:

Ru-verbs: Drop る + ません
- 食べる → 食べません
- 見る → 見ません

U-verbs: Change final u to i + ません
- 読む → 読みません
- 行く → 行きません
- 話す → 話しません

Irregular:
- する → しません
- 来る → 来ません`,
        examples: [
          { jp: '肉を食べません。', en: 'I do not eat meat.' },
          { jp: 'テレビを見ません。', en: 'I do not watch TV.' },
          { jp: '日本に行きません。', en: 'I do not go to Japan.' },
          { jp: '勉強しません。', en: 'I do not study.' },
        ]
      },
    ],
    
    practice_phrases: [
      '日本に行きます。',
      '肉を食べません。',
      '本を読みます。',
      'テレビを見ません。',
      'レストランに行きます。',
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
  
  console.log('✅ 2025-10-27 fixed');
  console.log(`- Vocabulary: ${fixedLesson.vocabulary.length} items`);
  console.log(`- Grammar points: ${fixedLesson.grammar.length}`);
  console.log(`- Practice phrases: ${fixedLesson.practice_phrases.length}`);
}

fix2025_10_27().then(() => process.exit(0)).catch(console.error);
