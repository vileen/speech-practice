#!/usr/bin/env node
import { pool } from '../src/db/pool.js';

async function findLessons() {
  const result = await pool.query(
    "SELECT id, title, vocabulary, grammar FROM lessons WHERE title ILIKE '%compar%' OR title ILIKE '%restaurant%' ORDER BY id"
  );
  
  for (const row of result.rows) {
    console.log(`\n=== ${row.id}: ${row.title} ===\n`);
    
    // Show vocabulary issues
    console.log('VOCABULARY:');
    for (const item of row.vocabulary || []) {
      const text = JSON.stringify(item);
      const issues = [];
      
      if (text.includes('this') && !text.includes('this ') && !text.match(/\bthis\b/)) issues.push('contains "this" fragment');
      if (text.includes('after') && text.match(/after[a-z]/)) issues.push('contains "after" fragment');
      if (text.includes('tabout')) issues.push('contains "tabout"');
      if (text.includes('nabout')) issues.push('contains "nabout"');
      if (text.includes('rat') && text.includes('erat')) issues.push('contains "rat" fragment');
      if (text.includes('whatm')) issues.push('contains "whatm"');
      if (text.includes('aloneui')) issues.push('contains "aloneui"');
      
      if (issues.length > 0) {
        console.log(`  ❌ ${item.jp || '-'} (${item.reading || '-'}) = ${item.en || '-'}`);
        console.log(`     Issues: ${issues.join(', ')}`);
      }
    }
    
    // Show grammar issues
    console.log('\nGRAMMAR:');
    for (const item of row.grammar || []) {
      const text = JSON.stringify(item);
      const issues = [];
      
      if (text.includes('this') && text.match(/this[^\s\']/)) issues.push('contains "this" fragment');
      if (text.includes('after') && text.match(/after[a-z]/)) issues.push('contains "after" fragment');
      if (text.includes('tabout')) issues.push('contains "tabout"');
      if (text.includes('nabout')) issues.push('contains "nabout"');
      if (text.includes('rat') && text.includes('erat')) issues.push('contains "rat" fragment');
      
      if (issues.length > 0) {
        console.log(`  ❌ Pattern: ${item.pattern || '-'}`);
        console.log(`     Issues: ${issues.join(', ')}`);
        if (item.explanation) console.log(`     Explanation snippet: ${item.explanation.substring(0, 100)}...`);
      }
    }
  }
  
  await pool.end();
}

findLessons().catch(console.error);
