#!/usr/bin/env node
import { pool } from '../src/db/pool.js';

async function fixRemainingPolish() {
  console.log('🇵🇱➡️🇬🇧 Fixing remaining Polish...\n');
  
  const res = await pool.query('SELECT id, vocabulary, grammar FROM lessons');
  let fixed = 0;
  
  const fixes = [
    ['To jest piętka', 'This is 5'],
    ['Ile to jest', 'What number is'],
    ['To jest dziesięć', 'This is 10'],
    ['A', 'And'],
    ['To jest osiem', 'This is 8'],
    ['Ile lat ma', 'How old is'],
    ['ma 19 lat', 'is 19 years old'],
    ['Gramatyka - powtórka pytań', 'Grammar - question review'],
    ['Questandnas about orandgandn', 'Questions about origin'],
    ['Deye kara desu ka', 'Doko kara desu ka'],
    ['Where are you from', 'Where are you from'],
    ['Answer', 'Answer'],
    ['Pycheapa o age', 'Questions about age'],
    ['Ile masz years', 'How old are you'],
    ['landczba', 'number'],
    ['Pycheapa o kla', 'Questions about class'],
    ['Pytania o pochodzenie', 'Questions about origin'],
    ['Odpowiedź', 'Answer'],
    ['miejsce', 'place'],
    ['Pytania o age', 'Questions about age'],
    ['liczba', 'number'],
    ['Pytania o klasę/rok', 'Questions about class/year'],
    ['na whichm rOKu jesteś', 'what year are you in'],
    ['Hiragana: Row ha-hi-fu-he-ho, Voiced sounds, Dialogues', 'Hiragana: Row ha-hi-fu-he-ho, Voiced sounds, Dialogues'],
    ['Kore wa go desu', 'Kore wa go desu'],
    ['Ii wa nan desu ka', 'Ii wa nan desu ka'],
    ['I wa jū desu', 'I wa jū desu'],
    ['F wa', 'F wa'],
    ['F wa hachi desu', 'F wa hachi desu'],
    ['Meri-san wa nan sai desu ka', 'Meri-san wa nan sai desu ka'],
    ['Meri-san wa jū kyū sai desu', 'Meri-san wa jū kyū sai desu'],
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
      
      if (g.examples && Array.isArray(g.examples)) {
        const newExamples = g.examples.map((ex: any) => {
          let fixedEn = ex.en || '';
          for (const [pl, en] of fixes) {
            fixedEn = fixedEn.split(pl).join(en);
          }
          return { jp: ex.jp, en: fixedEn };
        });
        if (JSON.stringify(newExamples) !== JSON.stringify(g.examples)) {
          newG.examples = newExamples;
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

fixRemainingPolish();
