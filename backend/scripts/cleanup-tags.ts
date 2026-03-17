import { pool } from '../src/db/pool.js';

async function cleanupTags() {
  try {
    const result = await pool.query('SELECT id, topics FROM lessons');
    let updated = 0;
    
    for (const row of result.rows) {
      const originalTags = row.topics || [];
      
      // Clean up tags
      const cleaned = originalTags
        .filter((t: string) => t !== '000' && !t.match(/^-\d+$/)) // Remove "000" and things like "-123"
        .map((t: string) => {
          // Fix specific malformed tags
          return t
            .replace(/^-describing-appearance-heightweight$/, 'describing-appearance')
            .replace(/^-continuous-forms-teimasu$/, 'continuous-forms')
            .replace(/kanji-numbers-1-10/, 'kanji-numbers')
            .replace(/^-/, ''); // Remove leading dash
        });
      
      if (JSON.stringify(cleaned) !== JSON.stringify(originalTags)) {
        await pool.query('UPDATE lessons SET topics = $1::text[] WHERE id = $2', [cleaned, row.id]);
        console.log('✅', row.id, ':', originalTags, '→', cleaned);
        updated++;
      }
    }
    
    console.log(`\n📈 Cleaned ${updated} lessons`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

cleanupTags();
