#!/usr/bin/env node
import { pool } from '../src/db/pool.js';

async function getLesson(id) {
  const result = await pool.query('SELECT * FROM lessons WHERE id = $1', [id]);
  return result.rows[0];
}

// Fix 2025-10-15: ma-mi-mu-me-mo, ya-yu-yo, Time, Family
async function fix2025_10_15() {
  console.log('Fixing 2025-10-15...');
  const lesson = await getLesson('2025-10-15');
  
  const vocab = lesson.vocabulary.map(item => {
    const newItem = { ...item };
    
    // Fix specific corrupted entries
    if (newItem.jp === 'む' && newItem.en === 'mushi (insect), sleepy (sleepy), mukashi (long ago)') {
      newItem.en = 'mushi (insect), nemui (sleepy), mukashi (long ago)';
    }
    if (newItem.jp === 'まち' && newItem.reading === 'mashi') {
      newItem.reading = 'machi';
    }
    if (newItem.jp === 'まつ' && newItem.reading === 'wait') {
      newItem.reading = 'matsu';
      newItem.en = 'to wait';
    }
    
    // Clean up any "after" fragments in en field
    if (newItem.en) {
      newItem.en = newItem.en.replace(/after/g, '');
      // Fix "Goo" → "Good" if truncated
      if (newItem.en === 'Goo') newItem.en = 'Good';
    }
    
    return newItem;
  });
  
  await pool.query(
    'UPDATE lessons SET vocabulary = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
    [JSON.stringify(vocab), '2025-10-15']
  );
  console.log('✅ 2025-10-15 fixed');
}

async function main() {
  await fix2025_10_15();
  await pool.end();
}

main().catch(console.error);
