import { pool } from './db/pool.js';

async function check() {
  const result = await pool.query("SELECT * FROM furigana_cache WHERE original_text = '眠'");
  console.log('Result:', result.rows);
  process.exit(0);
}
check();
