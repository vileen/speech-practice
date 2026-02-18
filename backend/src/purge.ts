import { pool } from './db/pool.js';

async function purge() {
  // Clear all entries that might be wrong
  const badReadings = ['ねむる', 'ねぶる'];
  for (const reading of badReadings) {
    const result = await pool.query(
      "DELETE FROM furigana_cache WHERE furigana_html LIKE $1",
      [`%${reading}%`]
    );
    console.log(`Deleted ${result.rowCount} entries with ${reading}`);
  }
  
  // Clear specific kanji
  const kanjiList = ['眠', '待', '妹'];
  for (const kanji of kanjiList) {
    const result = await pool.query(
      "DELETE FROM furigana_cache WHERE original_text = $1",
      [kanji]
    );
    console.log(`Deleted ${result.rowCount} entries for ${kanji}`);
  }
  
  process.exit(0);
}

purge();
