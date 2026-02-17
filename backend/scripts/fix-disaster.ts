#!/usr/bin/env node
import { pool } from '../src/db/pool.js';

async function fixDisaster() {
  console.log('🚨 Fixing broken words from bad replacements...\n');
  
  const res = await pool.query('SELECT id, vocabulary, grammar FROM lessons');
  let fixed = 0;
  
  const brokenFixes: Array<[string, string]> = [
    ['poandnt', 'point'],
    ['możon', 'can'],
    ['pandć', 'pić'],
    ['Seandjandn', 'Seijin'],
    ['shikand', 'shiki'],
    ['celebratandon', 'celebration'],
    ['dorosłoścand', 'dorosłości'],
    ['andn January', 'in January'],
    ['Gandrls', 'Girls'],
    ['ubanderają', 'ubierają'],
    ['sandę', 'się'],
    ['expensivee', 'expensive'],
    ['kandmoon', 'kimono'],
    ['saand', 'sai'],
    ['po prostu', 'simply'],
    ['nenseand', 'nensei'],
    ['yon jū saand', 'yon jū sai'],
    ['sakura (cherry), raku (comfort), mandraand (future)', 'sakura (cherry), raku (comfort), mirai (future)'],
    ['kaorand', 'kaori'],
    ['andce', 'kouri'],
    ['andkandru', 'ikiru'],
    ['ludziach/zwierzętach', 'people/animals'],
    ['thing/objectach', 'things'],
    ['koło ciebie', 'near you'],
    ['dole', 'bottom'],
    ['ozoncz', 'oznacza'],
    ['Contaandns', 'contains'],
    ['as hiragaon', 'as hiragana'],
    ['written from bottom to top', 'Written from bottom to top'],
    ['often bold at bottom', 'often bold at bottom'],
    ['means', 'means'],
    ['exampleon', 'example'],
    ['possessionion', 'possession'],
    ['combined z', 'combined with'],
    ['poprzednią sylabą', 'previous syllable'],
    ['Mande', 'Małe'],
    ['mand', 'small'],
    ['a-and-u-e-o', 'a-i-u-e-o'],
    ['hand-fu', 'hi-fu'],
    ['hand', 'hi'],
    ['on-ni-nu-ne-no', 'na-ni-nu-ne-no'],
    ['on', 'na'],
    ['band', 'bi'],
    ['mand', 'mi'],
  ];
  
  for (const row of res.rows) {
    let needsUpdate = false;
    let vocab = row.vocabulary || [];
    let grammar = row.grammar || [];
    
    vocab = vocab.map((v: any) => {
      let changed = false;
      const newV = { ...v };
      
      for (const [broken, correct] of brokenFixes) {
        if (v.en?.includes(broken)) {
          newV.en = newV.en.split(broken).join(correct);
          changed = true;
        }
        if (v.reading?.includes(broken)) {
          newV.reading = newV.reading.split(broken).join(correct);
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
        for (const [broken, correct] of brokenFixes) {
          fixed = fixed.split(broken).join(correct);
        }
        if (fixed !== g.explanation) {
          newG.explanation = fixed;
          changed = true;
        }
      }
      
      if (g.examples && Array.isArray(g.examples)) {
        const newExamples = g.examples.map((ex: any) => {
          let fixedEn = ex.en || '';
          for (const [broken, correct] of brokenFixes) {
            fixedEn = fixedEn.split(broken).join(correct);
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

fixDisaster();
