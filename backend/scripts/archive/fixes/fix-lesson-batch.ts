import { pool } from '../src/db/pool.js';

// TE-FORM LESSON FIXES
const TE_FORM_LESSONS = [
  {
    id: '2025-12-15',
    title: 'TE-form Practice and Activity Chains',
    grammar: [
      {
        pattern: '〜て',
        explanation: 'TE-form of verbs - connects actions in sequence. U-verbs: く→いて, ぐ→いで, す→して, つ→って, む/ぶ/ぬ→んで, う→って, る→って. Ru-verbs: る→て. Exceptions: 行く→行って, する→して, 来る→来て.',
        examples: [
          { jp: '食べて', en: 'eat (TE-form)' },
          { jp: '行って', en: 'go (TE-form)' },
          { jp: '買って', en: 'buy (TE-form)' }
        ]
      },
      {
        pattern: '〜て、〜',
        explanation: 'Connect two actions in sequence ("do X, then do Y"). Both actions have the same subject.',
        examples: [
          { jp: '家に帰って、ご飯を食べます', en: 'I go home, then eat dinner' },
          { jp: 'コーヒーを買って、公園で飲みます', en: 'I buy coffee, then drink it in the park' }
        ]
      }
    ],
    practice: [
      { jp: '朝ご飯を食べて、学校に行きます', en: 'I eat breakfast, then go to school' },
      { jp: '電車に乗って、東京へ行きます', en: 'I take the train, then go to Tokyo' },
      { jp: '本を読んで、寝ます', en: 'I read a book, then sleep' },
      { jp: '買い物をして、家に帰ります', en: 'I do shopping, then go home' },
      { jp: '映画を見て、食事をします', en: 'I watch a movie, then eat' }
    ]
  },
  {
    id: '2025-12-17',
    title: 'TE-form Review and Sentence Building',
    grammar: [
      {
        pattern: '〜てください',
        explanation: 'Polite request: "Please do ~". Pattern: TE-form + ください.',
        examples: [
          { jp: '教えてください', en: 'Please tell me' },
          { jp: '待ってください', en: 'Please wait' }
        ]
      },
      {
        pattern: '〜てもいいです',
        explanation: 'Asking/giving permission: "Is it okay to ~?" / "You may ~".',
        examples: [
          { jp: 'ここで写真を撮ってもいいですか？', en: 'Is it okay to take photos here?' },
          { jp: 'はい、撮ってもいいです', en: 'Yes, you may take photos' }
        ]
      },
      {
        pattern: '〜てはいけません',
        explanation: 'Prohibition: "You must not ~". Pattern: TE-form + はいけません.',
        examples: [
          { jp: 'ここで写真を撮ってはいけません', en: 'You must not take photos here' },
          { jp: '廊下で走ってはいけません', en: 'You must not run in the hallway' }
        ]
      }
    ],
    practice: [
      { jp: 'すみません、教えてください', en: 'Excuse me, please tell me' },
      { jp: '待ってください！', en: 'Please wait!' },
      { jp: 'ここで写真を撮ってもいいですか？', en: 'Is it okay to take photos here?' },
      { jp: 'はい、撮ってもいいです', en: 'Yes, you may take photos' },
      { jp: 'ここで写真を撮ってはいけません', en: 'You must not take photos here' }
    ]
  }
];

// EMPTY PRACTICE LESSONS - Add generic but useful practice
const EMPTY_PRACTICE_LESSONS = [
  {
    id: '2025-10-01',
    practice: [
      { jp: '私は学生です', en: 'I am a student' },
      { jp: 'あなたは先生ですか？', en: 'Are you a teacher?' },
      { jp: 'これは本です', en: 'This is a book' },
      { jp: '私の名前は田中です', en: 'My name is Tanaka' }
    ]
  },
  {
    id: '2025-10-08',
    practice: [
      { jp: 'これは何ですか？', en: 'What is this?' },
      { jp: 'それはペンです', en: 'That is a pen' },
      { jp: 'あれは誰の本ですか？', en: 'Whose book is that?' }
    ]
  }
];

async function applyFixes() {
  console.log('Applying fixes...\n');
  
  // Fix TE-form lessons
  for (const lesson of TE_FORM_LESSONS) {
    console.log(`Fixing ${lesson.id}: ${lesson.title}`);
    
    const result = await pool.query(
      `UPDATE lessons 
       SET grammar = $1::jsonb, 
           practice_phrases = $2::jsonb 
       WHERE id = $3 
       RETURNING id`,
      [JSON.stringify(lesson.grammar), JSON.stringify(lesson.practice), lesson.id]
    );
    
    if (result.rowCount && result.rowCount > 0) {
      console.log(`  ✅ Updated: ${lesson.grammar.length} grammar, ${lesson.practice.length} practice`);
    } else {
      console.log(`  ⚠️ Not found or no change`);
    }
  }
  
  // Fix empty practice lessons
  for (const lesson of EMPTY_PRACTICE_LESSONS) {
    console.log(`\nFixing ${lesson.id}: Adding practice phrases`);
    
    const result = await pool.query(
      `UPDATE lessons 
       SET practice_phrases = $1::jsonb 
       WHERE id = $2 AND (practice_phrases IS NULL OR jsonb_array_length(practice_phrases) = 0)
       RETURNING id`,
      [JSON.stringify(lesson.practice), lesson.id]
    );
    
    if (result.rowCount && result.rowCount > 0) {
      console.log(`  ✅ Added ${lesson.practice.length} practice phrases`);
    } else {
      console.log(`  ℹ️ Already has practice phrases or not found`);
    }
  }
  
  console.log('\n✅ Batch fixes complete');
  await pool.end();
}

applyFixes().catch(err => {
  console.error('Fix failed:', err);
  process.exit(1);
});
