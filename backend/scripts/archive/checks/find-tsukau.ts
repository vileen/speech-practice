import { pool } from '../src/db/pool.js';

async function find() {
  const lessons = await pool.query('SELECT id, title, vocabulary FROM lessons');
  
  for (const row of lessons.rows) {
    const vocab = row.vocabulary || [];
    for (const v of vocab) {
      if (v.jp && v.jp.includes('使')) {
        console.log(`Lesson ${row.id}: ${row.title}`);
        console.log(`  JP: ${v.jp}`);
        console.log(`  Reading: ${v.reading}`);
        console.log(`  Romaji: ${v.romaji}`);
        console.log('');
      }
    }
  }
  
  await pool.end();
}

find();
