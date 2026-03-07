import { pool } from '../src/db/pool.js';

async function checkVocab() {
  const result = await pool.query(
    'SELECT vocabulary FROM lessons WHERE id = $1',
    ['2026-02-19']
  );
  
  const vocab = result.rows[0]?.vocabulary || [];
  console.log('Vocabulary data for lesson 2026-02-19:\n');
  
  for (const item of vocab) {
    console.log(`Word: ${item.jp}`);
    console.log(`Reading: ${item.reading}`);
    console.log(`English: ${item.en}`);
    console.log('---');
  }
  
  await pool.end();
}

checkVocab();
