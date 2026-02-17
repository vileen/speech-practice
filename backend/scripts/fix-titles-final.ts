#!/usr/bin/env node
import { pool } from '../src/db/pool.js';

async function finalFix() {
  const result = await pool.query('SELECT id, title FROM lessons');
  for (const row of result.rows) {
    let newTitle = row.title
      .replace(/Timeowniki/gi, 'Verbs')
      .replace(/czasowniki/gi, 'verbs')
      .replace(/o Preferences/gi, 'about Preferences')
      .replace(/i Hiragana/gi, 'and Hiragana')
      .replace(/być/gi, 'to be');
    
    if (newTitle !== row.title) {
      await pool.query('UPDATE lessons SET title = $1 WHERE id = $2', [newTitle, row.id]);
      console.log(`${row.id}: ${row.title} → ${newTitle}`);
    }
  }
  console.log('✅ Final title fixes done!');
  await pool.end();
}

finalFix();
