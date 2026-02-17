#!/usr/bin/env node
import { pool } from '../src/db/pool.js';

async function finalPolishFix() {
  console.log('🇵🇱➡️🇬🇧 Final Polish cleanup...\n');
  
  const res = await pool.query('SELECT id, vocabulary, grammar FROM lessons');
  let fixed = 0;
  
  const exactReplacements: Array<[string, string]> = [
    ['dwa meanings', 'two meanings'],
    ['dwa ', 'two '],
    ['Hatachi (20 lat)', 'Hatachi (20 years old)'],
    ['lat - pełnoletność', 'years old - adulthood'],
    ['W Japonii 20 lat', 'In Japan 20 years'],
    ['Hatachi (20 years old):\n- W Japonii 20 years = pełnoletność (dorosłość)', 'Hatachi (20 years old):\n- In Japan 20 years = adulthood (coming of age)'],
    ['Pętelka z przytupem', 'Loop with emphasis'],
    ['Pętelka', 'Loop'],
    ['przecięcie', 'crossing'],
    ['kanciaste', 'angular'],
    ['z przytupem', 'with emphasis'],
    ['przytupem', 'emphasis'],
    ['Czasownik', 'Verb'],
    ['Użycie', 'Usage'],
    ['Skąd jesteś', 'Where are you from'],
    ['Odpowiedź', 'Answer'],
    ['Zapisywany z dołu do góry', 'Written from bottom to top'],
    ['W druku często pogrubiony na dole', 'In print often bold at bottom'],
    ['oznacza', 'means'],
    ['Wskazuje', 'Indicates'],
    ['dopełnienie', 'object'],
    ['temat', 'topic'],
    ['podmiot', 'subject'],
    ['przynależność', 'possession'],
    ['possessionion', 'possession'],
    ['combined z', 'combined with'],
    ['poprzednią sylabą', 'previous syllable'],
    ['Tworzenie nowych dźwięków', 'Creating new sounds'],
    ['Małe a-i-u-e-o', 'Small a-i-u-e-o'],
    ['łączone z', 'combined with'],
    ['Z dakuon', 'With dakuten'],
    ['dwiema kreseczkami', 'two marks'],
    ['Pytania o pochodzenie', 'Questions about origin'],
    ['Rozróżnienie', 'Distinction'],
    ['Podsumowanie wszystkich znaków', 'Summary of all characters'],
    ['Czytanki w hiraganie', 'Readings in hiragana'],
    ['Dialog 1:', 'Dialogue 1:'],
    ['Dialog 2:', 'Dialogue 2:'],
    ['Zamiana', 'Changing'],
    ['słownik', 'dictionary'],
    ['form', 'form'],
  ];
  
  for (const row of res.rows) {
    let needsUpdate = false;
    let vocab = row.vocabulary || [];
    let grammar = row.grammar || [];
    
    vocab = vocab.map((v: any) => {
      let changed = false;
      const newV = { ...v };
      
      for (const [pl, en] of exactReplacements) {
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
        for (const [pl, en] of exactReplacements) {
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
          for (const [pl, en] of exactReplacements) {
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

finalPolishFix();
