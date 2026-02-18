import { pool } from './db/pool.js';

async function fix() {
  // Clear all entries for this kanji
  await pool.query("DELETE FROM furigana_cache WHERE original_text = '願'");
  console.log('Cleared 願 from DB');
  
  // Also clear the full word
  await pool.query("DELETE FROM furigana_cache WHERE original_text LIKE '%願%'");
  console.log('Cleared all entries with 願');
  
  process.exit(0);
}
fix();
