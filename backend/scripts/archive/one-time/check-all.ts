import { pool } from './db/pool.js';

async function check() {
  const result = await pool.query("SELECT original_text, furigana_html FROM furigana_cache WHERE furigana_html LIKE '%しょ%'");
  console.log('Entries with しょ:', result.rows);
  
  const result2 = await pool.query("SELECT COUNT(*) FROM furigana_cache");
  console.log('Total entries:', result2.rows[0].count);
  
  process.exit(0);
}
check();
