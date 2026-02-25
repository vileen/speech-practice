#!/usr/bin/env node
// scan-furigana.js - Regular furigana health check
// Usage: node scripts/scan-furigana.js [--fix]

import pg from 'pg';
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/speech_practice' });

const FIX_MODE = process.argv.includes('--fix');

async function scanFurigana() {
  console.log(`🔍 Scanning all lessons for missing furigana...${FIX_MODE ? ' (FIX MODE)' : ''}\n`);
  
  const lessons = await pool.query('SELECT id, title, vocabulary, grammar, practice_phrases FROM lessons ORDER BY id');
  
  let totalIssues = 0;
  const missingCache: string[] = [];
  
  for (const row of lessons.rows) {
    let lessonIssues = 0;
    
    // Check vocabulary
    for (const v of row.vocabulary || []) {
      if (!v.reading) {
        const kanji = v.jp.match(/[\u4e00-\u9faf]/g);
        if (kanji) {
          lessonIssues++;
          console.log(`  [VOCAB] ${v.jp} (kanji: ${kanji.join('')})`);
        }
      }
    }
    
    // Check grammar examples
    for (const g of row.grammar || []) {
      for (const ex of g.examples || []) {
        const kanji = ex.jp.match(/[\u4e00-\u9faf]/g);
        if (kanji) {
          const cached = await pool.query('SELECT 1 FROM furigana_cache WHERE original_text = $1', [ex.jp]);
          if (cached.rows.length === 0) {
            lessonIssues++;
            missingCache.push(ex.jp);
            console.log(`  [GRAMMAR] ${ex.jp}`);
          }
        }
      }
    }
    
    // Check practice phrases
    for (const p of row.practice_phrases || []) {
      const kanji = p.jp.match(/[\u4e00-\u9faf]/g);
      if (kanji) {
        const cached = await pool.query('SELECT 1 FROM furigana_cache WHERE original_text = $1', [p.jp]);
        if (cached.rows.length === 0) {
          lessonIssues++;
          missingCache.push(p.jp);
          console.log(`  [PRACTICE] ${p.jp}`);
        }
      }
    }
    
    if (lessonIssues > 0) {
      console.log(`📚 Lesson ${row.id}: ${lessonIssues} issues\n`);
      totalIssues += lessonIssues;
    }
  }
  
  console.log(`\n========================================`);
  console.log(`Total issues: ${totalIssues}`);
  console.log(`Missing from cache: ${missingCache.length} unique phrases`);
  
  if (missingCache.length > 0) {
    console.log(`\nAdd these to scripts/fix-missing-furigana-batch.ts:`);
    for (const text of [...new Set(missingCache)]) {
      console.log(`  ['${text}', 'FURIGANA_HERE'],`);
    }
  }
  
  await pool.end();
}

scanFurigana().catch(console.error);
