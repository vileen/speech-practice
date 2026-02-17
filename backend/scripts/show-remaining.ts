#!/usr/bin/env node
import { pool } from '../src/db/pool.js';

async function showRemaining() {
  const res = await pool.query('SELECT id, vocabulary, grammar FROM lessons WHERE id = $1', ['2025-10-27']);
  const vocab = res.rows[0]?.vocabulary || [];

  console.log('Remaining Polish in 2025-10-27:');
  for (const v of vocab) {
    if (/[ąćęłńóśźż]/.test(v.en || '') || /[ąćęłńóśźż]/.test(v.reading || '')) {
      console.log('JP:', v.jp);
      console.log('Reading:', v.reading);
      console.log('EN:', v.en?.substring(0, 100));
      console.log('---');
    }
  }
  await pool.end();
}

showRemaining();
