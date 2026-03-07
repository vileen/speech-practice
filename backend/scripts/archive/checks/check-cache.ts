import { pool } from '../src/db/pool.js';

async function check() {
  const result = await pool.query("SELECT * FROM furigana_cache WHERE original_text LIKE '%使%'");
  for (const row of result.rows) {
    console.log(row.original_text, '->', row.furigana_html);
  }
  await pool.end();
}

check();
