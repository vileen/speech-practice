import { pool } from './db/pool.js';
async function clear() {
  await pool.query("DELETE FROM furigana_cache WHERE original_text IN ('暑', '暑い', '寒', '寒い')");
  console.log('Cleared');
  process.exit(0);
}
clear();
