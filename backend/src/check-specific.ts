import { pool } from './db/pool.js';

async function check() {
  const result = await pool.query("SELECT * FROM furigana_cache WHERE original_text IN ('寒', '暑', '寒い', '暑い')");
  console.log(result.rows);
  process.exit(0);
}
check();
