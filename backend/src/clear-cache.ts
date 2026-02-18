import { pool } from './db/pool.js';

async function clear() {
  // Clear words with wrong readings
  const wordsToClear = ['暑', '暑い', '寒', '寒い'];
  for (const word of wordsToClear) {
    await pool.query("DELETE FROM furigana_cache WHERE original_text = $1", [word]);
    console.log(`Cleared: ${word}`);
  }
  process.exit(0);
}
clear();
