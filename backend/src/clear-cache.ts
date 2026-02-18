import { pool } from './db/pool.js';

async function clearCache() {
  try {
    // Clear all furigana cache entries that don't contain ruby tags
    const result = await pool.query(
      "DELETE FROM furigana_cache WHERE furigana_html NOT LIKE '%<ruby>%'"
    );
    console.log(`Cleared ${result.rowCount} entries without furigana`);
    
    // Show remaining entries
    const remaining = await pool.query('SELECT COUNT(*) FROM furigana_cache');
    console.log(`Remaining entries: ${remaining.rows[0].count}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

clearCache();
