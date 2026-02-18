import { pool } from './db/pool.js';
async function clear() {
  await pool.query("DELETE FROM furigana_cache WHERE original_text IN ('速', '速い', '車よりバイクの方が速いです。', '東京より京都の方が静かです。', '静', '静か', '静かです')");
  console.log('Cleared');
  process.exit(0);
}
clear();
