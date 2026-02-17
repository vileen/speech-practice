#!/usr/bin/env node
import { pool } from '../src/db/pool.js';

async function fixBrokenWords() {
  console.log('🔧 Fixing broken words from previous replacements...\n');
  
  const res = await pool.query('SELECT id, vocabulary, grammar FROM lessons');
  let fixed = 0;
  
  for (const row of res.rows) {
    let needsUpdate = false;
    let vocab = row.vocabulary || [];
    let grammar = row.grammar || [];
    
    vocab = vocab.map((v: any) => {
      let changed = false;
      const newV = { ...v };
      
      if (v.en) {
        let fixed = v.en
          // Fix broken words from "and" replacement
          .replace(/mandraand/g, 'mirai')
          .replace(/kaorand/g, 'kaori')
          .replace(/andce/g, 'kouri')
          .replace(/andkandru/g, 'ikiru')
          .replace(/kandmono/g, 'kaimono')
          .replace(/nomandmono/g, 'nomimono')
          .replace(/shoppandng/g, 'shopping')
          .replace(/drandnks/g, 'drinks')
          .replace(/exampletupem/g, 'przytupem')
          .replace(/Pętelka z przytupem/g, 'Loop with emphasis');
        
        if (fixed !== v.en) {
          newV.en = fixed;
          changed = true;
        }
      }
      
      if (changed) needsUpdate = true;
      return newV;
    });
    
    grammar = grammar.map((g: any) => {
      let changed = false;
      const newG = { ...g };
      
      if (g.explanation) {
        let fixed = g.explanation
          // Fix broken words
          .replace(/Kandru/g, 'Kiru')
          .replace(/Contaandns/g, 'contains')
          .replace(/Romajand/g, 'Romaji')
          .replace(/Handragana/g, 'Hiragana')
          .replace(/A-and-u-e-o/g, 'A-i-u-e-o')
          .replace(/mandraand/g, 'mirai')
          .replace(/co hiragana/g, 'as hiragana')
          .replace(/co /g, 'as ');
        
        if (fixed !== g.explanation) {
          newG.explanation = fixed;
          changed = true;
        }
      }
      
      if (changed) needsUpdate = true;
      return newG;
    });
    
    if (needsUpdate) {
      await pool.query('UPDATE lessons SET vocabulary = $1, grammar = $2 WHERE id = $3', 
        [JSON.stringify(vocab), JSON.stringify(grammar), row.id]);
      console.log('Fixed:', row.id);
      fixed++;
    }
  }
  
  console.log('\nFixed', fixed, 'lessons');
  await pool.end();
}

fixBrokenWords();
