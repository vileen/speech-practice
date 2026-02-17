#!/usr/bin/env node
import { pool } from '../src/db/pool.js';

async function finalFix() {
  const res = await pool.query('SELECT id, vocabulary FROM lessons');
  
  for (const row of res.rows) {
    let needsUpdate = false;
    let vocab = row.vocabulary || [];
    
    vocab = vocab.map((v: any) => {
      if (v.jp === 'przychodzić') {
        needsUpdate = true;
        return {...v, jp: 'kuru (to come)', en: 'to come'};
      }
      return v;
    });
    
    if (needsUpdate) {
      await pool.query('UPDATE lessons SET vocabulary = $1 WHERE id = $2', 
        [JSON.stringify(vocab), row.id]);
      console.log('Fixed:', row.id);
    }
  }
  
  console.log('Done');
  await pool.end();
}

finalFix();
