import { pool } from './db/pool.js';


async function clearSpecific() {
  await pool.query("DELETE FROM furigana_cache WHERE original_text = '眠'");
  console.log('Cleared 眠');
  process.exit(0);
}

clearSpecific();
