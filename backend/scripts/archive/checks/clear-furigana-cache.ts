import { pool } from '../src/db/pool.js';

async function clearFuriganaCache() {
  console.log('Checking furigana_cache table...\n');
  
  // Check what's in the cache for the words we fixed
  const wordsToCheck = ['安い', '美味しい', '欲しい', '嫌い', '短い', '長い', '高い', '安い'];
  
  for (const word of wordsToCheck) {
    const result = await pool.query(
      'SELECT original_text, furigana_html FROM furigana_cache WHERE original_text = $1',
      [word]
    );
    if (result.rows.length > 0) {
      console.log(`Found in cache: ${word}`);
      console.log(`  Original: ${result.rows[0].original_text}`);
      console.log(`  Furigana: ${result.rows[0].furigana_html}`);
    }
  }
  
  // Clear the entire cache or specific entries
  console.log('\nClearing furigana cache for all words that might have changed...');
  
  // Option 1: Clear specific words (safer)
  const fixedWords = [
    '安い', '美味しい', '欲しい', '嫌い', '短い', '長い', 
    '軽い', '重い', '太い', '細い', '有る', '居る',
    '近く', '後ろ', '晴れ', '着る', 'お勧め', '好き', '高い'
  ];
  
  for (const word of fixedWords) {
    await pool.query('DELETE FROM furigana_cache WHERE original_text = $1', [word]);
  }
  console.log(`Cleared cache for ${fixedWords.length} specific words.`);
  
  // Option 2: Clear ALL furigana cache (more thorough)
  const allResult = await pool.query('SELECT COUNT(*) FROM furigana_cache');
  console.log(`\nTotal entries in furigana_cache: ${allResult.rows[0].count}`);
  
  console.log('\nDo you want to clear ALL furigana cache? (recommended)');
  console.log('Run: npm run db:clear-furigana-all');
  
  await pool.end();
}

clearFuriganaCache().catch(err => {
  console.error('Failed:', err);
  process.exit(1);
});
