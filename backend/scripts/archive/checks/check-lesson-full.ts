import { pool } from '../src/db/pool.js';

async function checkLesson() {
  const result = await pool.query(
    'SELECT id, title, vocabulary, grammar, practice_phrases FROM lessons WHERE id = $1',
    ['2026-02-11']
  );
  
  const lesson = result.rows[0];
  console.log(`Lesson: ${lesson.id} - ${lesson.title}\n`);
  
  console.log('Vocabulary:');
  for (const v of lesson.vocabulary || []) {
    console.log(`  ${v.jp} [${v.reading}] = ${v.en}`);
  }
  
  console.log('\nGrammar:');
  for (const g of lesson.grammar || []) {
    console.log(`  Pattern: ${g.pattern}`);
    console.log(`  Romaji: ${g.romaji || 'N/A'}`);
    console.log(`  Explanation: ${g.explanation.substring(0, 60)}...`);
    console.log('');
  }
  
  console.log('Practice phrases:', lesson.practice_phrases?.length || 0);
  
  await pool.end();
}

checkLesson();
