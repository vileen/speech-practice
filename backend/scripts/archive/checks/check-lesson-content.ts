import { pool } from '../src/db/pool.js';

async function checkLessonContent() {
  // Check the specific lesson mentioned
  const result = await pool.query(
    'SELECT id, title, vocabulary, grammar, practice_phrases FROM lessons WHERE title LIKE $1',
    ['%Comparisons Within Groups%']
  );
  
  if (result.rows.length === 0) {
    console.log('Lesson not found');
    await pool.end();
    return;
  }
  
  const lesson = result.rows[0];
  console.log(`Lesson: ${lesson.id} - ${lesson.title}\n`);
  
  console.log('Vocabulary count:', lesson.vocabulary?.length || 0);
  console.log('Grammar count:', lesson.grammar?.length || 0);
  console.log('Practice phrases count:', lesson.practice_phrases?.length || 0);
  
  console.log('\n--- GRAMMAR ---');
  if (lesson.grammar) {
    for (const g of lesson.grammar) {
      console.log(`Pattern: ${g.pattern}`);
      console.log(`Explanation: ${g.explanation?.substring(0, 100)}...`);
      if (g.examples) {
        console.log(`Examples: ${g.examples.length}`);
        for (const ex of g.examples.slice(0, 3)) {
          console.log(`  - ${ex.jp} = ${ex.en}`);
        }
      }
      console.log('');
    }
  }
  
  console.log('\n--- PRACTICE PHRASES ---');
  if (lesson.practice_phrases) {
    for (const p of lesson.practice_phrases.slice(0, 10)) {
      console.log(`- ${p.jp} = ${p.en}`);
    }
    if (lesson.practice_phrases.length > 10) {
      console.log(`... and ${lesson.practice_phrases.length - 10} more`);
    }
  } else {
    console.log('NO PRACTICE PHRASES!');
  }
  
  await pool.end();
}

checkLessonContent().catch(err => {
  console.error('Check failed:', err);
  process.exit(1);
});
