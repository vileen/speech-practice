import { pool } from './db/pool.js';

async function migrate() {
  try {
    // Create furigana cache table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS furigana_cache (
        id SERIAL PRIMARY KEY,
        original_text TEXT NOT NULL UNIQUE,
        furigana_html TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_furigana_original ON furigana_cache(original_text)
    `);
    
    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
