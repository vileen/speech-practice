import { pool } from '../src/db/pool.js';

async function validateJapaneseData() {
  const result = await pool.query('SELECT id, title, vocabulary, grammar FROM lessons ORDER BY id');
  const issues = [];
  
  for (const row of result.rows) {
    // Check vocabulary
    if (row.vocabulary) {
      for (const item of row.vocabulary) {
        if (!item.jp) continue;
        
        const jp = item.jp;
        const reading = item.reading;
        const hasKanji = /[\u4e00-\u9faf]/.test(jp);
        
        // Check 1: Pure hiragana should have null/empty reading
        if (!hasKanji && reading) {
          issues.push({
            lesson: row.id,
            field: 'vocab.reading',
            word: jp,
            problem: 'Pure hiragana word has redundant furigana',
            current: reading,
            fix: 'Set reading to null'
          });
        }
        
        // Check 2: Kanji words shouldn't have okurigana in reading
        if (hasKanji && reading) {
          const okuriganaMatch = jp.match(/[ぁ-ん]+$/);
          if (okuriganaMatch) {
            const okurigana = okuriganaMatch[0];
            if (reading.endsWith(okurigana) && reading !== okurigana) {
              issues.push({
                lesson: row.id,
                field: 'vocab.reading',
                word: jp,
                problem: `Reading contains okurigana "${okurigana}"`,
                current: reading,
                fix: `Strip to "${reading.slice(0, -okurigana.length)}"`
              });
            }
          }
        }
        
        // Check 3: No Polish words in Japanese field
        const polishWords = ['rok', 'dzień', 'tydzień', 'miesiąc', 'godzina', 'minuta', 'sekunda'];
        for (const word of polishWords) {
          if (jp.toLowerCase().includes(word.toLowerCase())) {
            issues.push({
              lesson: row.id,
              field: 'vocab.jp',
              word: jp,
              problem: `Contains Polish word: "${word}"`,
              current: jp,
              fix: 'Replace with proper Japanese'
            });
          }
        }
      }
    }
    
    // Check grammar
    if (row.grammar) {
      for (const item of row.grammar) {
        if (item.explanation) {
          // Check for garbled fragments
          const fragments = ['long', 'this', 'after', 'forml'];
          for (const frag of fragments) {
            if (item.explanation.toLowerCase().includes(frag)) {
              issues.push({
                lesson: row.id,
                field: 'grammar.explanation',
                word: item.pattern || 'N/A',
                problem: `Contains fragment: "${frag}"`,
                current: item.explanation.substring(0, 50) + '...',
                fix: 'Rewrite explanation'
              });
            }
          }
        }
      }
    }
  }
  
  if (issues.length === 0) {
    console.log('✅ All validation checks passed!');
  } else {
    console.log(`Found ${issues.length} issues:\n`);
    for (const issue of issues) {
      console.log(`Lesson ${issue.lesson}: ${issue.word}`);
      console.log(`  Field: ${issue.field}`);
      console.log(`  Problem: ${issue.problem}`);
      console.log(`  Current: ${issue.current}`);
      console.log(`  Fix: ${issue.fix}`);
      console.log('');
    }
  }
  
  await pool.end();
}

validateJapaneseData().catch(err => {
  console.error('Validation failed:', err);
  process.exit(1);
});
