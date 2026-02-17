#!/usr/bin/env node
import { pool } from '../src/db/pool.js';

async function fixMoreIssues() {
  console.log('🔧 Fixing more issues...\n');
  
  const res = await pool.query('SELECT id, vocabulary, grammar FROM lessons');
  let fixed = 0;
  
  const fixes = [
    ['Obie', 'Both'],
    ['form OK', 'forms OK'],
    ['Nie', 'No'],
    ['jestem', 'I am'],
    ['chory', 'sick'],
    ['szkoła (ogólnie)', 'school (general)'],
    ['pierwszak', 'first year'],
    ['liceum', 'high school'],
    ['szkoła podstawowa', 'elementary school'],
    ['Specitchylne', 'Special'],
    ['podwojnae', 'double'],
    ['NIE andchi-sai', 'NOT hachi-sai'],
    ['1 rok', '1 year'],
    ['8 lat', '8 years'],
    ['10 lat', '10 years'],
    ['40 lat', '40 years'],
    ['yna jū sai', 'yon jū sai'],
    ['pić', 'drink'],
    ['Ceremnay', 'Ceremony'],
    ['celebratina', 'celebration'],
    ['dorosłości', 'adulthood'],
    ['ubierają się w', 'dress in'],
    ['kimnao', 'kimono'],
  ];
  
  for (const row of res.rows) {
    let needsUpdate = false;
    let vocab = row.vocabulary || [];
    let grammar = row.grammar || [];
    
    vocab = vocab.map((v: any) => {
      let changed = false;
      const newV = { ...v };
      
      for (const [pl, en] of fixes) {
        if (v.en?.includes(pl)) {
          newV.en = newV.en.split(pl).join(en);
          changed = true;
        }
        if (v.reading?.includes(pl)) {
          newV.reading = newV.reading.split(pl).join(en);
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
        let fixed = g.explanation;
        for (const [pl, en] of fixes) {
          fixed = fixed.split(pl).join(en);
        }
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
  
  console.log(`\n✅ Fixed ${fixed} lessons`);
  await pool.end();
}

fixMoreIssues();
