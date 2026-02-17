#!/usr/bin/env node
import { pool } from '../src/db/pool.js';

async function checkSpecific() {
  const res = await pool.query('SELECT vocabulary, grammar FROM lessons WHERE id = $1', ['2025-10-15']);
  const vocab = res.rows[0]?.vocabulary || [];
  const grammar = res.rows[0]?.grammar || [];
  
  console.log('VOCAB WITH POLISH:');
  for (const v of vocab) {
    if (/[ąćęłńóśźż]/.test(v.en || '')) {
      console.log(JSON.stringify(v));
    }
  }
  
  console.log('\nGRAMMAR WITH POLISH:');
  for (const g of grammar) {
    if (/[ąćęłńóśźż]/.test(g.explanation || '')) {
      console.log(g.explanation.substring(0, 100));
    }
  }
  
  await pool.end();
}

checkSpecific();
