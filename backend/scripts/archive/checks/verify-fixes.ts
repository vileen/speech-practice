#!/usr/bin/env node
import { pool } from '../src/db/pool.js';

const lessons = ['2025-10-01', '2025-10-06', '2025-10-08', '2025-10-15'];

for (const id of lessons) {
  const r = await pool.query('SELECT vocabulary FROM lessons WHERE id = $1', [id]);
  const vocab = r.rows[0].vocabulary;
  
  console.log(`\n=== ${id} ===`);
  let found = false;
  for (const item of vocab) {
    const text = JSON.stringify(item);
    if (text.includes('afterlitician') || text.includes('cannabis') || text.includes('yearat') || text.includes('gabout') || text.includes('onon')) {
      console.log('  STILL BROKEN:', item.jp, '|', item.reading, '|', item.en);
      found = true;
    }
  }
  if (!found) console.log('  ✅ Looks clean');
}

await pool.end();
