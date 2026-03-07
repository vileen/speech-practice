#!/usr/bin/env node
import { pool } from '../src/db/pool.js';

async function getLesson(id) {
  const result = await pool.query('SELECT * FROM lessons WHERE id = $1', [id]);
  return result.rows[0];
}

// Fix 2025-10-01: "afterlitician" → "politician"
async function fix2025_10_01() {
  console.log('Fixing 2025-10-01...');
  const lesson = await getLesson('2025-10-01');
  
  const vocab = lesson.vocabulary.map(item => {
    const newItem = { ...item };
    if (item.en === 'afterlitician') newItem.en = 'politician';
    return newItem;
  });
  
  await pool.query(
    'UPDATE lessons SET vocabulary = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
    [JSON.stringify(vocab), '2025-10-01']
  );
  console.log('✅ 2025-10-01 fixed (1 change)');
}

// Fix 2025-10-06: numbers corrupted
async function fix2025_10_06() {
  console.log('Fixing 2025-10-06...');
  const lesson = await getLesson('2025-10-06');
  
  const fixes = {
    'gabout': 'go',
    'yearat': 'roku', 
    'onon': 'nana',
    'ishi': 'ichi'  // "jū ishi" should be "jū ichi", "ni jū ishi" should be "ni jū ichi"
  };
  
  const vocab = lesson.vocabulary.map(item => {
    const newItem = { ...item };
    
    // Fix jp field
    if (newItem.jp) {
      for (const [bad, good] of Object.entries(fixes)) {
        newItem.jp = newItem.jp.replace(new RegExp(bad, 'g'), good);
      }
    }
    
    // Fix reading field
    if (newItem.reading) {
      for (const [bad, good] of Object.entries(fixes)) {
        newItem.reading = newItem.reading.replace(new RegExp(bad, 'g'), good);
      }
    }
    
    // Fix en field
    if (newItem.en) {
      for (const [bad, good] of Object.entries(fixes)) {
        newItem.en = newItem.en.replace(new RegExp(bad, 'g'), good);
      }
    }
    
    return newItem;
  });
  
  await pool.query(
    'UPDATE lessons SET vocabulary = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
    [JSON.stringify(vocab), '2025-10-06']
  );
  console.log('✅ 2025-10-06 fixed (gabout→go, yearat→roku, onon→nana, ishi→ichi)');
}

async function main() {
  await fix2025_10_01();
  await fix2025_10_06();
  await pool.end();
}

main().catch(console.error);
