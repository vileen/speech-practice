import { pool } from '../src/db/pool.js';

async function check() {
  const result = await pool.query('SELECT id, title, grammar, practice_phrases FROM lessons WHERE id = $1', ['2026-02-23']);
  const lesson = result.rows[0];
  
  console.log(`Lesson: ${lesson.id} - ${lesson.title}\n`);
  
  console.log('Grammar examples:');
  for (const g of lesson.grammar || []) {
    for (const ex of g.examples || []) {
      if (ex.jp.includes('使')) {
        console.log(`  ${ex.jp}`);
      }
    }
  }
  
  console.log('\nPractice phrases:');
  for (const p of lesson.practice_phrases || []) {
    if (p.jp.includes('使')) {
      console.log(`  ${p.jp}`);
    }
  }
  
  await pool.end();
}

check();
