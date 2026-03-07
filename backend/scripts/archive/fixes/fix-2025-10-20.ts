#!/usr/bin/env node
import { pool } from '../src/db/pool.js';

async function fix2025_10_20() {
  console.log('Fixing 2025-10-20: Katakana Introduction...');
  
  const fixedLesson = {
    id: '2025-10-20',
    date: '2025-10-20',
    title: 'Katakana: Introduction, a-i-u-e-o, ka-ki-ku-ke-ko',
    order: 5,
    topics: ['katakana basics', 'a-i-u-e-o', 'ka-ki-ku-ke-ko', 'dakuon'],
    
    vocabulary: [
      // Basic comparison
      { jp: 'あ', reading: 'a', en: 'hiragana a', tags: ['hiragana'] },
      { jp: 'ア', reading: 'a', en: 'katakana a (angular, two lines)', tags: ['katakana'] },
      { jp: 'い', reading: 'i', en: 'hiragana i (two drops)', tags: ['hiragana'] },
      { jp: 'イ', reading: 'i', en: 'katakana i (straight lines)', tags: ['katakana'] },
      { jp: 'う', reading: 'u', en: 'hiragana u', tags: ['hiragana'] },
      { jp: 'ウ', reading: 'u', en: 'katakana u (angular shape)', tags: ['katakana'] },
      { jp: 'え', reading: 'e', en: 'hiragana e', tags: ['hiragana'] },
      { jp: 'エ', reading: 'e', en: 'katakana e (three lines)', tags: ['katakana'] },
      { jp: 'お', reading: 'o', en: 'hiragana o', tags: ['hiragana'] },
      { jp: 'オ', reading: 'o', en: 'katakana o (angular)', tags: ['katakana'] },
      
      // K-row
      { jp: 'か', reading: 'ka', en: 'hiragana ka', tags: ['hiragana'] },
      { jp: 'カ', reading: 'ka', en: 'katakana ka (angular, no tear drop)', tags: ['katakana'] },
      { jp: 'き', reading: 'ki', en: 'hiragana ki (with loop)', tags: ['hiragana'] },
      { jp: 'キ', reading: 'ki', en: 'katakana ki (three lines)', tags: ['katakana'] },
      { jp: 'く', reading: 'ku', en: 'hiragana ku', tags: ['hiragana'] },
      { jp: 'ク', reading: 'ku', en: 'katakana ku (angular, no belly)', tags: ['katakana'] },
      { jp: 'け', reading: 'ke', en: 'hiragana ke', tags: ['hiragana'] },
      { jp: 'ケ', reading: 'ke', en: 'katakana ke (intersecting lines)', tags: ['katakana'] },
      { jp: 'こ', reading: 'ko', en: 'hiragana ko (two lines)', tags: ['hiragana'] },
      { jp: 'コ', reading: 'ko', en: 'katakana ko (angular two lines)', tags: ['katakana'] },
      
      // Other comparisons
      { jp: 'さ', reading: 'sa', en: 'hiragana sa (drop shape)', tags: ['hiragana'] },
      { jp: 'サ', reading: 'sa', en: 'katakana sa (three lines)', tags: ['katakana'] },
      { jp: 'す', reading: 'su', en: 'hiragana su', tags: ['hiragana'] },
      { jp: 'ス', reading: 'su', en: 'katakana su', tags: ['katakana'] },
      { jp: 'せ', reading: 'se', en: 'hiragana se', tags: ['hiragana'] },
      { jp: 'セ', reading: 'se', en: 'katakana se (angular)', tags: ['katakana'] },
      { jp: 'そ', reading: 'so', en: 'hiragana so', tags: ['hiragana'] },
      { jp: 'ソ', reading: 'so', en: 'katakana so', tags: ['katakana'] },
      
      // N is special
      { jp: 'ん', reading: 'n', en: 'hiragana n', tags: ['hiragana'] },
      { jp: 'ン', reading: 'n', en: 'katakana n (written top to bottom!)', tags: ['katakana'] },
      
      // Common katakana words
      { jp: 'コピー', reading: 'kopī', en: 'copy', tags: ['katakana-word'] },
      { jp: 'カフェ', reading: 'kafe', en: 'cafe', tags: ['katakana-word'] },
      { jp: 'ケーキ', reading: 'kēki', en: 'cake', tags: ['katakana-word'] },
      { jp: 'コーヒー', reading: 'kōhī', en: 'coffee', tags: ['katakana-word'] },
      { jp: 'アイス', reading: 'aisu', en: 'ice (cream)', tags: ['katakana-word'] },
      { jp: 'テレビ', reading: 'terebi', en: 'TV', tags: ['katakana-word'] },
    ],
    
    grammar: [
      {
        pattern: 'What is Katakana?',
        explanation: `Katakana (カタカナ) is one of the two Japanese syllabaries (the other being hiragana).

Key characteristics:
- Used for foreign words, loanwords, and emphasis
- More angular and straight lines compared to hiragana's curves
- Same sounds as hiragana - just different shapes
- 46 basic characters (same as hiragana)`,
        examples: [
          { jp: 'ひらがな', en: 'hiragana (curved)' },
          { jp: 'カタカナ', en: 'katakana (angular)' },
          { jp: 'コーヒー', en: 'kōhī (coffee - foreign word)' },
        ]
      },
      {
        pattern: 'Katakana a-i-u-e-o (アイウエオ)',
        explanation: `The first row of katakana. Comparison with hiragana:

ア - a: Two diagonal lines meeting at top (hiragana: あ is curvy)
イ - i: Two vertical/horizontal lines (hiragana: い has two drops)
ウ - u: Angular shape (hiragana: う is curved)
エ - e: Three horizontal lines (hiragana: え has a hook)
オ - o: Angular with cross (hiragana: お is curved)`,
        examples: [
          { jp: 'ア', en: 'a (katakana)' },
          { jp: 'イ', en: 'i (katakana)' },
          { jp: 'ウ', en: 'u (katakana)' },
          { jp: 'エ', en: 'e (katakana)' },
          { jp: 'オ', en: 'o (katakana)' },
        ]
      },
      {
        pattern: 'Katakana ka-ki-ku-ke-ko (カキクケコ)',
        explanation: `The K-row of katakana:

カ - ka: Like hiragana か but angular, no tear drop
キ - ki: Three separate lines (hiragana き has a loop)
ク - ku: Angular, no curved belly (unlike hiragana く)
ケ - ke: Intersecting lines (hiragana け has a hook)
コ - ko: Two straight angular lines (hiragana こ is curved)`,
        examples: [
          { jp: 'カ', en: 'ka (katakana)' },
          { jp: 'キ', en: 'ki (katakana)' },
          { jp: 'ク', en: 'ku (katakana)' },
          { jp: 'ケ', en: 'ke (katakana)' },
          { jp: 'コ', en: 'ko (katakana)' },
        ]
      },
      {
        pattern: 'Dakuon in Katakana (Voiced Sounds)',
        explanation: `Just like hiragana, katakana uses dakuten (two dots) for voiced sounds:

カ → ガ (ka → ga)
キ → ギ (ki → gi)
ク → グ (ku → gu)
ケ → ゲ (ke → ge)
コ → ゴ (ko → go)

Examples:
- ガス (gasu) - gas
- ギター (gitā) - guitar
- グリーン (gurīn) - green`,
        examples: [
          { jp: 'ガス', en: 'gasu (gas)' },
          { jp: 'ギター', en: 'gitā (guitar)' },
          { jp: 'グリーン', en: 'gurīn (green)' },
          { jp: 'ゲーム', en: 'gēmu (game)' },
          { jp: 'ゴルフ', en: 'gorufu (golf)' },
        ]
      },
      {
        pattern: 'Special: N (ン)',
        explanation: `The katakana ン (n) is IMPORTANT:

- Written from TOP TO BOTTOM (unlike hiragana ん which goes bottom to top)
- In handwriting: start at top right, go down, curve
- In print: often looks like a backwards check mark

Different stroke direction = different character!
ン (katakana n) vs ソ (katakana so) - direction matters!`,
        examples: [
          { jp: 'ン', en: 'n (katakana, top to bottom)' },
          { jp: 'ンー', en: 'n with long vowel' },
          { jp: 'パソコン', en: 'pasokon (PC)' },
        ]
      },
    ],
    
    practice_phrases: [
      'コーヒーをください。',
      'ケーキが好きです。',
      'テレビを見ます。',
      'カフェに行きます。',
      'アイスクリームください。',
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
  
  console.log('✅ 2025-10-20 fixed');
  console.log(`- Vocabulary: ${fixedLesson.vocabulary.length} items`);
  console.log(`- Grammar points: ${fixedLesson.grammar.length}`);
  console.log(`- Practice phrases: ${fixedLesson.practice_phrases.length}`);
}

fix2025_10_20().then(() => process.exit(0)).catch(console.error);
