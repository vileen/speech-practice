import { pool } from '../src/db/pool.js';

async function fixFurigana() {
  const result = await pool.query('SELECT id, title, vocabulary FROM lessons ORDER BY id');
  let fixedCount = 0;
  const fixes = [];
  
  for (const row of result.rows) {
    if (!row.vocabulary) continue;
    
    const updatedVocab = row.vocabulary.map((item: any) => {
      if (!item.jp || !item.reading) return item;
      
      const jp = item.jp;
      let reading = item.reading;
      let wasFixed = false;
      
      // Check if word has kanji
      const hasKanji = /[\u4e00-\u9faf]/.test(jp);
      
      if (!hasKanji) {
        // Pure hiragana/katakana - clear furigana
        if (reading && reading !== '') {
          fixes.push({
            lesson: row.id,
            word: jp,
            old: reading,
            new: null,
            reason: 'Pure hiragana - cleared redundant furigana'
          });
          reading = null;
          wasFixed = true;
        }
      } else {
        // Has kanji - check for okurigana to strip
        const okuriganaMatch = jp.match(/[ぁ-ん]+$/);
        if (okuriganaMatch) {
          const okurigana = okuriganaMatch[0];
          // Check if reading ends with this okurigana
          if (reading.endsWith(okurigana) && reading !== okurigana) {
            const newReading = reading.slice(0, -okurigana.length);
            fixes.push({
              lesson: row.id,
              word: jp,
              old: reading,
              new: newReading,
              reason: `Stripped okurigana "${okurigana}"`
            });
            reading = newReading;
            wasFixed = true;
          }
        }
      }
      
      if (wasFixed) fixedCount++;
      
      return {
        ...item,
        reading: reading
      };
    });
    
    // Update database if changes were made
    const hasChanges = JSON.stringify(updatedVocab) !== JSON.stringify(row.vocabulary);
    if (hasChanges) {
      await pool.query(
        'UPDATE lessons SET vocabulary = $1::jsonb WHERE id = $2',
        [JSON.stringify(updatedVocab), row.id]
      );
    }
  }
  
  console.log(`Fixed ${fixedCount} vocabulary entries:\n`);
  for (const fix of fixes) {
    console.log(`Lesson ${fix.lesson}: ${fix.word}`);
    console.log(`  ${fix.old} → ${fix.new} (${fix.reason})`);
  }
  
  await pool.end();
}

fixFurigana().catch(err => {
  console.error('Fix failed:', err);
  process.exit(1);
});
