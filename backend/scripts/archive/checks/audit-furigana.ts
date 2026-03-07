import { pool } from '../src/db/pool.js';

async function auditFurigana() {
  const result = await pool.query('SELECT id, title, vocabulary FROM lessons ORDER BY id');
  const issues = [];
  
  for (const row of result.rows) {
    if (!row.vocabulary) continue;
    
    for (const item of row.vocabulary) {
      if (!item.jp || !item.reading) continue;
      
      const jp = item.jp;
      const reading = item.reading;
      
      // Check if reading ends with hiragana that's also at end of jp
      // Example: 安い + やすい = い is repeated
      // Example: 美味しい + おいしい = しい is repeated
      
      const jpHiraganaSuffix = jp.match(/[ぁ-ん]+$/);
      const readingHiraganaSuffix = reading.match(/[ぁ-ん]+$/);
      
      if (jpHiraganaSuffix && readingHiraganaSuffix) {
        const jpSuffix = jpHiraganaSuffix[0];
        const readSuffix = readingHiraganaSuffix[0];
        
        // Check if reading ends with the same suffix as the word
        if (readSuffix.endsWith(jpSuffix) && readSuffix !== jpSuffix) {
          issues.push({
            lesson: row.id,
            title: row.title,
            word: jp,
            reading: reading,
            problem: `Reading contains okurigana suffix "${jpSuffix}" that's already in the word`,
            suggested: reading.slice(0, -jpSuffix.length) || reading
          });
        }
      }
      
      // Also check for pure hiragana words with furigana (redundant)
      if (/^[ぁ-ん]+$/.test(jp) && reading === jp) {
        issues.push({
          lesson: row.id,
          title: row.title,
          word: jp,
          reading: reading,
          problem: 'Hiragana word with identical furigana (redundant)',
          suggested: null
        });
      }
    }
  }
  
  console.log(`Found ${issues.length} furigana issues:\n`);
  for (const issue of issues.slice(0, 30)) {
    console.log(`Lesson ${issue.lesson} (${issue.title}):`);
    console.log(`  ${issue.word} → ${issue.reading}`);
    console.log(`  Problem: ${issue.problem}`);
    if (issue.suggested) console.log(`  Suggested: ${issue.suggested}`);
    console.log('');
  }
  
  if (issues.length > 30) {
    console.log(`... and ${issues.length - 30} more`);
  }
  
  await pool.end();
}

auditFurigana();
