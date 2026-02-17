#!/usr/bin/env node
import { pool } from '../src/db/pool.js';

async function quickFix() {
  console.log('⚡ Quick fragment fix...\n');
  
  const res = await pool.query('SELECT id, vocabulary, grammar FROM lessons');
  
  for (const row of res.rows) {
    let needsUpdate = false;
    let vocab = row.vocabulary || [];
    let grammar = row.grammar || [];
    
    vocab = vocab.map((v: any) => {
      if (v.en) {
        let fixed = v.en
          .replace(/meaningenia/g, 'meanings')
          .replace(/bawić się/g, 'play')
          .replace(/exampleszł/g, 'future')
          .replace(/examplekład/g, 'example')
          .replace(/pleasemny smell/g, 'pleasant smell')
          .replace(/icei/g, 'ice')
          .replace(/mieć/g, 'have')
          .replace(/li$/g, 'live')
          .replace(/do$/g, 'do');
        if (fixed !== v.en) {
          needsUpdate = true;
          return {...v, en: fixed};
        }
      }
      return v;
    });
    
    grammar = grammar.map((g: any) => {
      if (g.explanation) {
        let fixed = g.explanation
          .replace(/meaningenia/g, 'meanings')
          .replace(/exampleonleżność/g, 'possession')
          .replace(/Dwa i-adjectives/g, 'Two i-adjectives')
          .replace(/Hiragaon/g, 'Hiragana')
          .replace(/written from/gi, 'Written from');
        if (fixed !== g.explanation) {
          needsUpdate = true;
          return {...g, explanation: fixed};
        }
      }
      return g;
    });
    
    if (needsUpdate) {
      await pool.query('UPDATE lessons SET vocabulary = $1, grammar = $2 WHERE id = $3', 
        [JSON.stringify(vocab), JSON.stringify(grammar), row.id]);
      console.log('Fixed:', row.id);
    }
  }
  
  await pool.end();
  console.log('Done!');
}

quickFix();
