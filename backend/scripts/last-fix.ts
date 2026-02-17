#!/usr/bin/env node
import { pool } from '../src/db/pool.js';

async function lastFix() {
  const res = await pool.query('SELECT id, vocabulary, grammar FROM lessons WHERE id IN ($1, $2)', 
    ['2025-10-22', '2025-10-27']);
  
  for (const row of res.rows) {
    let needsUpdate = false;
    let grammar = row.grammar || [];
    
    grammar = grammar.map((g: any) => {
      if (g.explanation?.includes('sylabą')) {
        needsUpdate = true;
        return {
          ...g,
          explanation: g.explanation.replace('sylabą', 'syllable')
        };
      }
      return g;
    });
    
    if (needsUpdate) {
      await pool.query('UPDATE lessons SET grammar = $1 WHERE id = $2', 
        [JSON.stringify(grammar), row.id]);
      console.log('Fixed:', row.id);
    }
  }
  
  console.log('Done');
  await pool.end();
}

lastFix();
