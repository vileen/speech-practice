#!/usr/bin/env node
import { pool } from '../src/db/pool.js';

async function fix2025_10_22() {
  console.log('Fixing 2025-10-22: Katakana ta-to, na-no, ha-ho...');
  
  const fixedLesson = {
    id: '2025-10-22',
    date: '2025-10-22',
    title: 'Katakana: ta-chi-tsu-te-to, na-ni-nu-ne-no, ha-hi-fu-he-ho',
    order: 6,
    topics: ['katakana T-row', 'katakana N-row', 'katakana H-row', 'katakana words'],
    
    vocabulary: [
      // T-row
      { jp: 'タ', reading: 'ta', en: 'ta (katakana) - angular with intersection', tags: ['katakana'] },
      { jp: 'チ', reading: 'chi', en: 'chi (katakana) - like hiragana but angular', tags: ['katakana'] },
      { jp: 'ツ', reading: 'tsu', en: 'tsu (katakana) - three strokes, top is flat', tags: ['katakana'] },
      { jp: 'テ', reading: 'te', en: 'te (katakana) - two horizontal + vertical', tags: ['katakana'] },
      { jp: 'ト', reading: 'to', en: 'to (katakana) - vertical + hook right', tags: ['katakana'] },
      
      // N-row
      { jp: 'ナ', reading: 'na', en: 'na (katakana) - cross with short left', tags: ['katakana'] },
      { jp: 'ニ', reading: 'ni', en: 'ni (katakana) - two horizontal lines', tags: ['katakana'] },
      { jp: 'ヌ', reading: 'nu', en: 'nu (katakana) - loop shape', tags: ['katakana'] },
      { jp: 'ネ', reading: 'ne', en: 'ne (katakana) - loop + intersection', tags: ['katakana'] },
      { jp: 'ノ', reading: 'no', en: 'no (katakana) - diagonal line', tags: ['katakana'] },
      
      // H-row
      { jp: 'ハ', reading: 'ha', en: 'ha (katakana) - V shape', tags: ['katakana'] },
      { jp: 'ヒ', reading: 'hi', en: 'hi (katakana) - two vertical lines', tags: ['katakana'] },
      { jp: 'フ', reading: 'fu', en: 'fu (katakana) - angular, no loop', tags: ['katakana'] },
      { jp: 'ヘ', reading: 'he', en: 'he (katakana) - same as hiragana!', tags: ['katakana'] },
      { jp: 'ホ', reading: 'ho', en: 'ho (katakana) - cross + horizontal lines', tags: ['katakana'] },
      
      // Katakana words
      { jp: 'タオル', reading: 'taoru', en: 'towel', tags: ['katakana-word'] },
      { jp: 'タコ', reading: 'tako', en: 'octopus', tags: ['katakana-word'] },
      { jp: 'タクシー', reading: 'takushī', en: 'taxi', tags: ['katakana-word'] },
      { jp: 'チキン', reading: 'chikin', en: 'chicken', tags: ['katakana-word'] },
      { jp: 'チーズ', reading: 'chīzu', en: 'cheese', tags: ['katakana-word'] },
      { jp: 'テスト', reading: 'tesuto', en: 'test', tags: ['katakana-word'] },
      { jp: 'ナイフ', reading: 'naifu', en: 'knife', tags: ['katakana-word'] },
      { jp: 'ニュース', reading: 'nyūsu', en: 'news', tags: ['katakana-word'] },
      { jp: 'ノート', reading: 'nōto', en: 'notebook', tags: ['katakana-word'] },
      { jp: 'ハロウィン', reading: 'harowin', en: 'Halloween', tags: ['katakana-word'] },
      { jp: 'パーティー', reading: 'pātī', en: 'party', tags: ['katakana-word'] },
      { jp: 'ホテル', reading: 'hoteru', en: 'hotel', tags: ['katakana-word'] },
      { jp: 'ハーフ', reading: 'hāfu', en: 'half, mixed race', tags: ['katakana-word'] },
      
      // Adjective conjugation review (negative)
      { jp: '美味しくない', reading: 'oishikunai', en: 'not delicious', tags: ['grammar', 'i-adjective'] },
      { jp: '高くない', reading: 'takakunai', en: 'not expensive/tall', tags: ['grammar', 'i-adjective'] },
      { jp: '安くない', reading: 'yasukunai', en: 'not cheap', tags: ['grammar', 'i-adjective'] },
      { jp: '大きくない', reading: 'ookikunai', en: 'not big', tags: ['grammar', 'i-adjective'] },
      { jp: '小さくない', reading: 'chiisakunai', en: 'not small', tags: ['grammar', 'i-adjective'] },
      { jp: '新しくない', reading: 'atarashikunai', en: 'not new', tags: ['grammar', 'i-adjective'] },
      { jp: '古くない', reading: 'furukunai', en: 'not old', tags: ['grammar', 'i-adjective'] },
      { jp: '面白くない', reading: 'omoshirokunai', en: 'not interesting/boring', tags: ['grammar', 'i-adjective'] },
      
      // Na-adjective negative
      { jp: '元気じゃない', reading: 'genki janai', en: 'not energetic/sick', tags: ['grammar', 'na-adjective'] },
      { jp: '綺麗じゃない', reading: 'kirei janai', en: 'not pretty/ugly', tags: ['grammar', 'na-adjective'] },
      { jp: '簡単じゃない', reading: 'kantan janai', en: 'not simple/difficult', tags: ['grammar', 'na-adjective'] },
      { jp: '静かじゃない', reading: 'shizuka janai', en: 'not quiet/noisy', tags: ['grammar', 'na-adjective'] },
    ],
    
    grammar: [
      {
        pattern: 'Katakana Review: a-ho (ア-ホ)',
        explanation: `All katakana rows so far:

アイウエオ (a-i-u-e-o)
カキクケコ (ka-ki-ku-ke-ko)
サシスセソ (sa-shi-su-se-so)
タチツテト (ta-chi-tsu-te-to)
ナニヌネノ (na-ni-nu-ne-no)
ハヒフヘホ (ha-hi-fu-he-ho)

Important distinctions:
- シ (shi) vs ツ (tsu) - シ is flatter, ツ is taller
- ン (n) vs ソ (so) vs シ (shi) - stroke direction!`,
        examples: [
          { jp: 'シ', en: 'shi (flatter)' },
          { jp: 'ツ', en: 'tsu (taller)' },
          { jp: 'ン', en: 'n (top to bottom)' },
          { jp: 'ソ', en: 'so (bottom to top)' },
        ]
      },
      {
        pattern: 'T-row: ta-chi-tsu-te-to (タチツテト)',
        explanation: `The T-row of katakana:

タ - ta: Angular with intersection
チ - chi: Like hiragana but angular
ツ - tsu: Three strokes, flat top (compare to シ shi!)
テ - te: Two horizontal + one vertical
ト - to: Vertical line with right hook`,
        examples: [
          { jp: 'タオル', en: 'taoru (towel)' },
          { jp: 'タクシー', en: 'takushī (taxi)' },
          { jp: 'チーズ', en: 'chīzu (cheese)' },
          { jp: 'テスト', en: 'tesuto (test)' },
        ]
      },
      {
        pattern: 'N-row: na-ni-nu-ne-no (ナニヌネノ)',
        explanation: `The N-row of katakana:

ナ - na: Cross with short left arm
ニ - ni: Two parallel horizontal lines
ヌ - nu: Loop shape
ネ - ne: Loop with intersection
ノ - no: Single diagonal line`,
        examples: [
          { jp: 'ナイフ', en: 'naifu (knife)' },
          { jp: 'ニュース', en: 'nyūsu (news)' },
          { jp: 'ノート', en: 'nōto (notebook)' },
        ]
      },
      {
        pattern: 'H-row: ha-hi-fu-he-ho (ハヒフヘホ)',
        explanation: `The H-row of katakana:

ハ - ha: Simple V shape
ヒ - hi: Two vertical strokes
フ - fu: Angular, no loop (unlike hiragana ふ)
ヘ - he: Same as hiragana へ!
ホ - ho: Cross with two horizontal lines

Note: ヘ is the only character that looks identical in both kana!`,
        examples: [
          { jp: 'ハロウィン', en: 'harowin (Halloween)' },
          { jp: 'パーティー', en: 'pātī (party)' },
          { jp: 'ホテル', en: 'hoteru (hotel)' },
        ]
      },
      {
        pattern: 'I-adjective Negative Form',
        explanation: `To make i-adjectives negative:
Replace final い with くない

Examples:
- 高い (expensive) → 高くない (not expensive)
- 大きい (big) → 大きくない (not big)
- 美味しい (delicious) → 美味しくない (not delicious)`,
        examples: [
          { jp: '高くないです。', en: 'It is not expensive.' },
          { jp: '大きくないです。', en: 'It is not big.' },
          { jp: '面白くないです。', en: 'It is boring.' },
        ]
      },
      {
        pattern: 'Na-adjective Negative Form',
        explanation: `To make na-adjectives negative:
Add じゃない instead of です

Examples:
- 元気です (healthy) → 元気じゃない (not healthy)
- 綺麗です (pretty) → 綺麗じゃない (not pretty)
- 簡単です (simple) → 簡単じゃない (not simple)`,
        examples: [
          { jp: '元気じゃないです。', en: 'I am not feeling well.' },
          { jp: '簡単じゃないです。', en: 'It is not simple.' },
          { jp: '静かじゃないです。', en: 'It is not quiet.' },
        ]
      },
    ],
    
    practice_phrases: [
      'タクシーに乗ります。',
      'ホテルに泊まります。',
      'パーティーに行きます。',
      'このテストは難しくないです。',
      'そのホテルは高くないです。',
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
  
  console.log('✅ 2025-10-22 fixed');
  console.log(`- Vocabulary: ${fixedLesson.vocabulary.length} items`);
  console.log(`- Grammar points: ${fixedLesson.grammar.length}`);
  console.log(`- Practice phrases: ${fixedLesson.practice_phrases.length}`);
}

fix2025_10_22().then(() => process.exit(0)).catch(console.error);
