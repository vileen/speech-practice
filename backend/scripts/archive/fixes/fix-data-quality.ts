#!/usr/bin/env node
/**
 * Japanese Data Quality Fix Script
 * Clears corrupted practice_phrases and fixes grammar issues
 */

import { pool } from '../src/db/pool.js';

const lessonsToFix = [
  '2025-10-01', '2025-10-08', '2025-10-15', '2025-10-20', 
  '2025-10-22', '2025-10-27', '2025-11-03', '2025-11-12',
  '2025-12-01', '2025-12-10', '2025-12-17', '2025-12-23',
  '2026-01-28', '2026-02-02', '2026-02-04', '2026-02-09',
  '2026-02-11', '2026-02-16', '2026-02-19'
];

async function fixData() {
  console.log('🔧 Starting data quality fixes...\n');
  
  let fixedCount = 0;
  
  // Fix 1: Clear corrupted practice_phrases from affected lessons
  console.log('📋 Step 1: Clearing corrupted practice_phrases...');
  for (const lessonId of lessonsToFix) {
    await pool.query(
      'UPDATE lessons SET practice_phrases = $1, updated_at = NOW() WHERE id = $2',
      [JSON.stringify([]), lessonId]
    );
    console.log(`  ✅ Cleared practice_phrases for lesson ${lessonId}`);
    fixedCount++;
  }
  
  // Fix 2: Fix grammar explanation in lesson 2025-11-12
  console.log('\n📋 Step 2: Fixing grammar explanation...');
  
  // Get current grammar
  const result = await pool.query(
    'SELECT grammar FROM lessons WHERE id = $1',
    ['2025-11-12']
  );
  
  if (result.rows.length > 0) {
    let grammar = result.rows[0].grammar;
    
    // Find and fix the corrupted "ga" explanation
    let fixed = false;
    for (let i = 0; i < grammar.length; i++) {
      if (grammar[i].pattern === 'ga' && grammar[i].explanation === ' z iru.') {
        grammar[i].explanation = 'Subject particle - marks the grammatical subject. Used with iru to express existence of animate things.';
        fixed = true;
        console.log('  ✅ Fixed grammar explanation for pattern "ga"');
        break;
      }
    }
    
    if (fixed) {
      await pool.query(
        'UPDATE lessons SET grammar = $1, updated_at = NOW() WHERE id = $2',
        [JSON.stringify(grammar), '2025-11-12']
      );
    }
  }
  
  console.log(`\n✨ Fix complete!`);
  console.log(`   - Cleared practice_phrases from ${lessonsToFix.length} lessons`);
  console.log(`   - Fixed 1 grammar explanation`);
  console.log(`   - Total fixes: ${fixedCount + 1}`);
  
  await pool.end();
}

fixData().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
