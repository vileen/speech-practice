import { pool } from '../src/db/pool.js';

async function fix() {
  // Add correct furigana for 使って (tsukatte - to use)
  await pool.query(
    `INSERT INTO furigana_cache (original_text, furigana_html) 
     VALUES ($1, $2)
     ON CONFLICT (original_text) DO UPDATE SET furigana_html = EXCLUDED.furigana_html`,
    ['使って', '<ruby>使<rt>つか</rt></ruby>って']
  );
  
  // Also add dictionary form
  await pool.query(
    `INSERT INTO furigana_cache (original_text, furigana_html) 
     VALUES ($1, $2)
     ON CONFLICT (original_text) DO UPDATE SET furigana_html = EXCLUDED.furigana_html`,
    ['使う', '<ruby>使<rt>つか</rt></ruby>う']
  );
  
  // Check what was inserted
  const result = await pool.query("SELECT * FROM furigana_cache WHERE original_text LIKE '%使%'");
  console.log('Furigana cache entries for 使:');
  for (const row of result.rows) {
    console.log(`  ${row.original_text} -> ${row.furigana_html}`);
  }
  
  await pool.end();
}

fix();
