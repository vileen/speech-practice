import { pool } from './db/pool.js';

async function checkFuriganaCache() {
  try {
    // Get all entries where furigana is same as original (no ruby tags added)
    const result = await pool.query(
      `SELECT original_text, furigana_html 
       FROM furigana_cache 
       WHERE furigana_html NOT LIKE '%<ruby>%'
       ORDER BY original_text`
    );
    
    console.log(`Found ${result.rows.length} entries without proper furigana:`);
    
    for (const row of result.rows) {
      console.log(`  - "${row.original_text}"`);
    }
    
    if (result.rows.length > 0) {
      console.log('\nDeleting these entries...');
      const deleteResult = await pool.query(
        `DELETE FROM furigana_cache 
         WHERE furigana_html NOT LIKE '%<ruby>%'`
      );
      console.log(`Deleted ${deleteResult.rowCount} entries`);
    }
    
    // Show total count
    const totalResult = await pool.query('SELECT COUNT(*) FROM furigana_cache');
    console.log(`\nTotal entries with proper furigana: ${totalResult.rows[0].count}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkFuriganaCache();
