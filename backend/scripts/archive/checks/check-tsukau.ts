import { pool } from '../src/db/pool.js';

async function check() {
  const result = await pool.query('SELECT vocabulary FROM lessons WHERE id = $1', ['2026-02-23']);
  const vocab = result.rows[0]?.vocabulary || [];
  
  console.log('Looking for 使って or 使う in vocabulary:\n');
  for (const v of vocab) {
    if (v.jp.includes('使') || v.jp.includes('って')) {
      console.log(`JP: ${v.jp}`);
      console.log(`Reading: ${v.reading}`);
      console.log(`Romaji: ${v.romaji}`);
      console.log(`English: ${v.en}`);
      console.log('---');
    }
  }
  
  await pool.end();
}

check();
