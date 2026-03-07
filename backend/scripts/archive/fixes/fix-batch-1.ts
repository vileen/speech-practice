#!/usr/bin/env node
import { pool } from '../src/db/pool.js';

async function getLesson(id) {
  const result = await pool.query('SELECT * FROM lessons WHERE id = $1', [id]);
  return result.rows[0];
}

async function fix2025_10_01() {
  console.log('Fixing 2025-10-01...');
  const lesson = await getLesson('2025-10-01');
  
  // Fix vocabulary: "afterlitician" should be "politician"
  const vocab = lesson.vocabulary.map(item => {
    if (item.en && item.en.includes('afterlitician')) {
      return { ...item, en: item.en.replace('afterlitician', 'politician') };
    }
    return item;
  });
  
  await pool.query(
    'UPDATE lessons SET vocabulary = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
    [JSON.stringify(vocab), '2025-10-01']
  );
  
  console.log('✅ 2025-10-01 fixed');
}

async function fix2025_10_06() {
  console.log('Fixing 2025-10-06...');
  const lesson = await getLesson('2025-10-06');
  
  // Fix: "jū roku" → "jūroku" (16), "yearat jū" → "nenjū" (year)
  const vocab = lesson.vocabulary.map(item => {
    let newReading = item.reading;
    if (newReading) {
      newReading = newReading.replace('jū roku', 'jūroku');
      newReading = newReading.replace(/yearat/g, 'nen');
      newReading = newReading.replace(/\bat\b/g, ''); // remove stray "at"
      newReading = newReading.trim();
    }
    return { ...item, reading: newReading };
  });
  
  await pool.query(
    'UPDATE lessons SET vocabulary = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
    [JSON.stringify(vocab), '2025-10-06']
  );
  
  console.log('✅ 2025-10-06 fixed');
}

async function main() {
  await fix2025_10_01();
  await fix2025_10_06();
  await pool.end();
}

main().catch(console.error);
