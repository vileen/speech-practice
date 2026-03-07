#!/usr/bin/env node
import { pool } from '../src/db/pool.js';

async function getLesson(id) {
  const result = await pool.query('SELECT * FROM lessons WHERE id = $1', [id]);
  return result.rows[0];
}

// Fix 2025-10-08: Hiragana H-row
async function fix2025_10_08() {
  console.log('Fixing 2025-10-08...');
  const lesson = await getLesson('2025-10-08');
  
  const vocab = lesson.vocabulary.map(item => {
    const newItem = { ...item };
    
    // Fix specific corrupted entries
    if (newItem.jp === 'ことば' && newItem.reading === 'cannabis') {
      newItem.reading = 'kotoba';
    }
    if (newItem.jp === 'ひ' && newItem.reading === 'fire') {
      newItem.reading = 'hi';
    }
    if (newItem.jp === 'ひくい' && newItem.reading === 'short') {
      newItem.reading = 'hikui';
    }
    if (newItem.jp === 'へい' && newItem.reading === 'fence') {
      newItem.reading = 'hei';
    }
    if (newItem.jp === 'ほほ' && newItem.reading === 'cheek') {
      newItem.reading = 'hoho';
    }
    if (newItem.jp === 'futoi') {
      newItem.jp = 'ふとい';
      newItem.reading = 'futoi';
    }
    if (newItem.jp === 'nodo') {
      newItem.jp = 'のど';
      newItem.reading = 'nodo';
    }
    
    return newItem;
  });
  
  // Fix grammar - remove "rok" artifacts if any
  const grammar = lesson.grammar.map(item => {
    const newItem = { ...item };
    if (newItem.explanation) {
      // Clean up any stray artifacts
      newItem.explanation = newItem.explanation.replace(/rok\b/g, '');
    }
    return newItem;
  });
  
  await pool.query(
    'UPDATE lessons SET vocabulary = $1, grammar = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
    [JSON.stringify(vocab), JSON.stringify(grammar), '2025-10-08']
  );
  console.log('✅ 2025-10-08 fixed');
}

async function main() {
  await fix2025_10_08();
  await pool.end();
}

main().catch(console.error);
