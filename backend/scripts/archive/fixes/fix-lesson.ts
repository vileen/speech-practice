import { pool } from '../src/db/pool.js';

async function fixLesson(lessonId: string) {
  const result = await pool.query(
    'SELECT id, title, vocabulary, grammar, practice_phrases FROM lessons WHERE id = $1',
    [lessonId]
  );
  
  if (result.rows.length === 0) {
    console.log(`Lesson ${lessonId} not found`);
    await pool.end();
    return;
  }
  
  const lesson = result.rows[0];
  console.log(`\n========================================`);
  console.log(`Fixing: ${lesson.id} - ${lesson.title}`);
  console.log(`========================================\n`);
  
  // Analyze vocabulary to determine what grammar should be there
  const vocab = lesson.vocabulary || [];
  const vocabWords = vocab.map((v: any) => v.jp);
  
  console.log('Vocabulary:', vocabWords.join(', '));
  console.log(`Current grammar: ${lesson.grammar?.length || 0} items`);
  console.log(`Current practice: ${lesson.practice_phrases?.length || 0} items`);
  
  // Generate appropriate grammar and practice based on title + vocabulary
  let newGrammar: any[] = [];
  let newPractice: any[] = [];
  
  const title = lesson.title.toLowerCase();
  
  // COMPARISONS LESSON
  if (title.includes('comparison') || title.includes('groups')) {
    newGrammar = [
      {
        pattern: '〜の中で〜が一番〜',
        explanation: 'Used to express "among ~, ~ is the most ~". Pattern: [group]の中で[topic]が一番[adjective].',
        examples: [
          { jp: '季節の中で、春が一番好きです', en: 'Among seasons, I like spring the most' },
          { jp: '果物の中で、バナナが一番安いです', en: 'Among fruits, bananas are the cheapest' }
        ]
      },
      {
        pattern: '〜より〜の方が〜',
        explanation: 'Used to compare two things: "A is more ~ than B". Pattern: [B]より[A]の方が[adjective].',
        examples: [
          { jp: '犬より猫の方が好きです', en: 'I like cats more than dogs' },
          { jp: '東京より大阪の方が安いです', en: 'Osaka is cheaper than Tokyo' }
        ]
      },
      {
        pattern: '〜の方が〜',
        explanation: 'Used to indicate "the ~ side/one is more ~" when making a choice.',
        examples: [
          { jp: 'どちらがいいですか？', en: 'Which one is better?' },
          { jp: '赤の方が好きです', en: 'I like the red one better' }
        ]
      }
    ];
    
    newPractice = [
      { jp: '季節の中で、いつが一番好きですか？', en: 'Among seasons, which do you like the most?' },
      { jp: '果物の中で、何が一番好きですか？', en: 'Among fruits, what do you like the most?' },
      { jp: '肉と魚と、どちらの方が好きですか？', en: 'Between meat and fish, which do you prefer?' },
      { jp: '夏より冬の方が好きです', en: 'I like winter more than summer' },
      { jp: 'コーヒーと紅茶と、どちらが安いですか？', en: 'Which is cheaper, coffee or black tea?' },
      { jp: '日本料理の中で、寿司が一番美味しいです', en: 'Among Japanese food, sushi is the most delicious' },
      { jp: '週末の中で、土曜日が一番好きです', en: 'Among weekends, I like Saturday the most' },
      { jp: '高いものと安いものと、どちらがいいですか？', en: 'Between expensive and cheap things, which is better?' }
    ];
  }
  // TE-FORM LESSONS
  else if (title.includes('te-form') || title.includes('te form')) {
    newGrammar = [
      {
        pattern: '〜て',
        explanation: 'TE-form of verbs. Used for connecting verbs, making requests, and various grammatical patterns.',
        examples: [
          { jp: '食べて', en: 'eat (TE-form)' },
          { jp: '行って', en: 'go (TE-form)' }
        ]
      },
      {
        pattern: '〜てください',
        explanation: 'Please do ~ (polite request). Pattern: TE-form + ください.',
        examples: [
          { jp: '教えてください', en: 'Please teach me' },
          { jp: '待ってください', en: 'Please wait' }
        ]
      }
    ];
    
    newPractice = [
      { jp: 'ここで写真を撮ってもいいですか？', en: 'Is it okay to take photos here?' },
      { jp: 'すみません、教えてください', en: 'Excuse me, please tell me' },
      { jp: 'これを食べてはいけません', en: 'You must not eat this' },
      { jp: '待ってください！', en: 'Please wait!' }
    ];
  }
  // KATAKANA LESSONS
  else if (title.includes('katakana')) {
    newGrammar = [
      {
        pattern: 'カタカナ語',
        explanation: 'Foreign words adopted into Japanese, written in katakana.',
        examples: [
          { jp: 'カフェ', en: 'cafe' },
          { jp: 'ホテル', en: 'hotel' }
        ]
      }
    ];
    
    newPractice = [
      { jp: 'ホテルはどこですか？', en: 'Where is the hotel?' },
      { jp: 'カフェでコーヒーを飲みます', en: 'I drink coffee at the cafe' }
    ];
  }
  
  // Update if we have new content
  if (newGrammar.length > 0 || newPractice.length > 0) {
    const updateResult = await pool.query(
      `UPDATE lessons 
       SET grammar = $1::jsonb, 
           practice_phrases = $2::jsonb 
       WHERE id = $3 
       RETURNING id`,
      [
        JSON.stringify(newGrammar.length > 0 ? newGrammar : lesson.grammar),
        JSON.stringify(newPractice.length > 0 ? newPractice : lesson.practice_phrases),
        lessonId
      ]
    );
    
    if (updateResult.rowCount && updateResult.rowCount > 0) {
      console.log('\n✅ Updated successfully!');
      console.log(`   Grammar: ${newGrammar.length} patterns`);
      console.log(`   Practice: ${newPractice.length} phrases`);
    }
  } else {
    console.log('\n⚠️ No fix template for this lesson title');
    console.log('   Manual review needed');
  }
  
  await pool.end();
}

// Get lesson ID from command line
const lessonId = process.argv[2];
if (!lessonId) {
  console.log('Usage: npx tsx scripts/fix-lesson.ts <lesson-id>');
  console.log('Example: npx tsx scripts/fix-lesson.ts 2026-02-19');
  process.exit(1);
}

fixLesson(lessonId).catch(err => {
  console.error('Fix failed:', err);
  process.exit(1);
});
