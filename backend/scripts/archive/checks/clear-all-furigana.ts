import { pool } from '../src/db/pool.js';

async function clearAllFurigana() {
  const result = await pool.query('DELETE FROM furigana_cache');
  console.log(`✅ Cleared ${result.rowCount} entries from furigana_cache`);
  await pool.end();
}

clearAllFurigana().catch(err => {
  console.error('Failed:', err);
  process.exit(1);
});
