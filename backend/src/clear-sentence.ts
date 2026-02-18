import { pool } from './db/pool.js';
async function clear() {
  await pool.query("DELETE FROM furigana_cache WHERE original_text = $1", ["車よりバイクの方が速いです。"]);
  console.log('Cleared sentence cache');
  process.exit(0);
}
clear();
