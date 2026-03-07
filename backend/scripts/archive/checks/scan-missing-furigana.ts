import { pool } from '../src/db/pool.js';

async function scanMissingFurigana() {
  console.log('🔍 Scanning all lessons for missing furigana...\n');
  
  const lessons = await pool.query('SELECT id, title, vocabulary, grammar, practice_phrases FROM lessons ORDER BY id');
  
  const issues: Array<{lesson: string, field: string, text: string, kanji: string}> = [];
  
  for (const row of lessons.rows) {
    // Check vocabulary
    for (const v of row.vocabulary || []) {
      if (!v.reading) {
        const kanji = v.jp.match(/[\u4e00-\u9faf]/g);
        if (kanji) {
          issues.push({lesson: row.id, field: 'vocabulary', text: v.jp, kanji: kanji.join('')});
        }
      }
    }
    
    // Check grammar examples
    for (const g of row.grammar || []) {
      for (const ex of g.examples || []) {
        const kanji = ex.jp.match(/[\u4e00-\u9faf]/g);
        if (kanji) {
          // Check if we have cached furigana
          const cached = await pool.query('SELECT furigana_html FROM furigana_cache WHERE original_text = $1', [ex.jp]);
          if (cached.rows.length === 0) {
            issues.push({lesson: row.id, field: 'grammar example', text: ex.jp, kanji: kanji.join('')});
          }
        }
      }
    }
    
    // Check practice phrases
    for (const p of row.practice_phrases || []) {
      const kanji = p.jp.match(/[\u4e00-\u9faf]/g);
      if (kanji) {
        const cached = await pool.query('SELECT furigana_html FROM furigana_cache WHERE original_text = $1', [p.jp]);
        if (cached.rows.length === 0) {
          issues.push({lesson: row.id, field: 'practice phrase', text: p.jp, kanji: kanji.join('')});
        }
      }
    }
  }
  
  console.log(`Found ${issues.length} items with missing furigana:\n`);
  
  // Group by lesson
  const byLesson: Record<string, typeof issues> = {};
  for (const issue of issues) {
    if (!byLesson[issue.lesson]) byLesson[issue.lesson] = [];
    byLesson[issue.lesson].push(issue);
  }
  
  for (const [lesson, items] of Object.entries(byLesson)) {
    console.log(`\n📚 Lesson ${lesson}:`);
    for (const item of items) {
      console.log(`  [${item.field}] ${item.text} (kanji: ${item.kanji})`);
    }
  }
  
  await pool.end();
}

scanMissingFurigana();
