import { pool } from '../src/db/pool.js';

async function checkLesson() {
  const result = await pool.query(
    'SELECT id, title, grammar FROM lessons WHERE id = $1',
    ['2026-02-09']
  );
  
  const lesson = result.rows[0];
  console.log(`Lesson: ${lesson.id} - ${lesson.title}\n`);
  console.log('Grammar patterns:');
  for (const g of lesson.grammar) {
    console.log(`  • ${g.pattern}`);
    console.log(`    ${g.explanation.substring(0, 80)}...`);
  }
  
  await pool.end();
}

checkLesson();
