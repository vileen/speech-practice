import { pool } from '../src/db/pool.js';

// KATAKANA LESSONS - Fix generic grammar
const KATAKANA_LESSONS = [
  {
    id: '2025-10-06',
    title: 'Numbers, Age, Prices and Countries',
    grammar: [
      {
        pattern: 'いくらですか',
        explanation: '"How much is it?" - asking about price.',
        examples: [
          { jp: 'これはいくらですか？', en: 'How much is this?' },
          { jp: '１０００円です', en: 'It is 1000 yen' }
        ]
      },
      {
        pattern: '〜歳',
        explanation: 'Age counter. Usage: [number] + 歳 (さい).',
        examples: [
          { jp: '２０歳です', en: 'I am 20 years old' },
          { jp: 'おいくつですか？', en: 'How old are you? (polite)' }
        ]
      },
      {
        pattern: '〜人',
        explanation: 'Nationality suffix. 日本人 = Japanese person, アメリカ人 = American.',
        examples: [
          { jp: '日本人です', en: 'I am Japanese' },
          { jp: 'アメリカ人です', en: 'I am American' }
        ]
      }
    ],
    practice: [
      { jp: 'これはいくらですか？', en: 'How much is this?' },
      { jp: '５００円です', en: 'It is 500 yen' },
      { jp: 'おいくつですか？', en: 'How old are you?' },
      { jp: '２５歳です', en: 'I am 25 years old' },
      { jp: 'イギリス人ですか？', en: 'Are you British?' }
    ]
  },
  {
    id: '2025-10-22',
    title: 'Katakana: ta-chi-tsu-te-to, na-ni-nu-ne-no, ha-hi-fu-he-ho',
    grammar: [
      {
        pattern: 'カタカナ',
        explanation: 'Katakana is used for foreign words, loanwords, onomatopoeia, and emphasis.',
        examples: [
          { jp: 'ホテル', en: 'hotel' },
          { jp: 'コンピューター', en: 'computer' }
        ]
      }
    ],
    practice: [
      { jp: 'ホテルはどこですか？', en: 'Where is the hotel?' },
      { jp: 'カフェでコーヒーを飲みます', en: 'I drink coffee at the cafe' },
      { jp: 'テレビを見ます', en: 'I watch TV' }
    ]
  },
  {
    id: '2025-10-27',
    title: 'Katakana: ma-mi-mu-me-mo, ya-yu-yo, ra-ri-ru-re-ro, wa-wo-n, Verbs',
    grammar: [
      {
        pattern: '〜を〜ます',
        explanation: 'Object marker を with polite verb form. Pattern: [object]を[verb stem] + ます.',
        examples: [
          { jp: '本を読みます', en: 'I read a book' },
          { jp: 'テレビを見ます', en: 'I watch TV' }
        ]
      }
    ],
    practice: [
      { jp: '映画を見ます', en: 'I watch a movie' },
      { jp: '音楽を聞きます', en: 'I listen to music' },
      { jp: 'ピザを食べます', en: 'I eat pizza' }
    ]
  },
  {
    id: '2025-11-05',
    title: 'Katakana: sa-ta, Verb Groups I and II',
    grammar: [
      {
        pattern: 'Ru-verbs (Group II)',
        explanation: 'Verbs ending in -iru/-eru. Conjugate by dropping る and adding endings. Examples: 食べる→食べます, 見る→見ます.',
        examples: [
          { jp: '食べます', en: 'eat (polite)' },
          { jp: '見ます', en: 'watch/see (polite)' }
        ]
      },
      {
        pattern: 'U-verbs (Group I)',
        explanation: 'Most verbs ending in -u. Conjugate by changing the final u-sound. Examples: 買う→買います, 書く→書きます.',
        examples: [
          { jp: '買います', en: 'buy (polite)' },
          { jp: '書きます', en: 'write (polite)' }
        ]
      }
    ],
    practice: [
      { jp: '映画を見ます', en: 'I watch a movie' },
      { jp: '寿司を食べます', en: 'I eat sushi' },
      { jp: '本を買います', en: 'I buy a book' },
      { jp: '手紙を書きます', en: 'I write a letter' }
    ]
  }
];

// COMPARISON LESSON
const COMPARISON_LESSON = {
  id: '2026-02-16',
  title: 'Comparisons Practice and Restaurant Scenarios',
  grammar: [
    {
      pattern: '〜と〜と、どちらが〜ですか',
      explanation: 'Asking to choose between two options: "Between A and B, which is more ~?"',
      examples: [
        { jp: '肉と魚と、どちらが好きですか？', en: 'Between meat and fish, which do you like more?' },
        { jp: '赤と青と、どちらがいいですか？', en: 'Between red and blue, which is better?' }
      ]
    },
    {
      pattern: 'お勧めは何ですか',
      explanation: '"What do you recommend?" - asking for recommendations at restaurants/shops.',
      examples: [
        { jp: 'お勧めは何ですか？', en: 'What do you recommend?' },
        { jp: '今日のお勧めは何ですか？', en: 'What is today\'s recommendation?' }
      ]
    }
  ],
  practice: [
    { jp: 'お勧めは何ですか？', en: 'What do you recommend?' },
    { jp: '肉と魚と、どちらが好きですか？', en: 'Between meat and fish, which do you prefer?' },
    { jp: '甘いものと辛いものと、どちらが好きですか？', en: 'Between sweet and spicy things, which do you prefer?' },
    { jp: 'コーヒーと紅茶と、どちらがいいですか？', en: 'Between coffee and tea, which would you like?' }
  ]
};

// EMPTY PRACTICE FIXES
const MORE_EMPTY_LESSONS = [
  {
    id: '2025-10-15',
    practice: [
      { jp: 'すみません、トイレはどこですか？', en: 'Excuse me, where is the bathroom?' },
      { jp: 'それはいくらですか？', en: 'How much is that?' },
      { jp: 'いただきます', en: 'Let\'s eat (before meal)' },
      { jp: 'ごちそうさまでした', en: 'Thank you for the meal' }
    ]
  }
];

async function applyRemainingFixes() {
  console.log('Fixing remaining lessons...\n');
  
  // Fix Katakana lessons
  for (const lesson of KATAKANA_LESSONS) {
    console.log(`Fixing Katakana: ${lesson.id}`);
    
    const result = await pool.query(
      `UPDATE lessons 
       SET grammar = $1::jsonb, 
           practice_phrases = COALESCE($2::jsonb, practice_phrases)
       WHERE id = $3 
       RETURNING id`,
      [JSON.stringify(lesson.grammar), lesson.practice ? JSON.stringify(lesson.practice) : null, lesson.id]
    );
    
    if (result.rowCount && result.rowCount > 0) {
      console.log(`  ✅ Updated: ${lesson.grammar.length} grammar patterns`);
      if (lesson.practice) console.log(`     ${lesson.practice.length} practice phrases`);
    } else {
      console.log(`  ⚠️ Not found`);
    }
  }
  
  // Fix comparison lesson
  console.log(`\nFixing Comparison: ${COMPARISON_LESSON.id}`);
  const compResult = await pool.query(
    `UPDATE lessons 
     SET grammar = $1::jsonb, 
         practice_phrases = $2::jsonb 
     WHERE id = $3 
     RETURNING id`,
    [JSON.stringify(COMPARISON_LESSON.grammar), JSON.stringify(COMPARISON_LESSON.practice), COMPARISON_LESSON.id]
  );
  if (compResult.rowCount && compResult.rowCount > 0) {
    console.log(`  ✅ Updated: ${COMPARISON_LESSON.grammar.length} grammar, ${COMPARISON_LESSON.practice.length} practice`);
  }
  
  // Fix more empty practice
  for (const lesson of MORE_EMPTY_LESSONS) {
    console.log(`\nFixing empty practice: ${lesson.id}`);
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
      console.log(`  ℹ️ Already has practice or not found`);
    }
  }
  
  console.log('\n✅ All remaining fixes applied');
  await pool.end();
}

applyRemainingFixes().catch(err => {
  console.error('Fix failed:', err);
  process.exit(1);
});
