#!/usr/bin/env node
import { pool } from '../src/db/pool.js';

const patterns: Array<[string, string]> = [
  ['meaningenia', 'meanings'],
  ['bawić się', 'play'],
  ['exampleonleżność', 'possession'],
  ['examplekład', 'example'],
  ['exampleszł', 'future'],
  ['pleasemny', 'pleasant'],
  ['Hiragaon', 'Hiragana'],
  ['zonków', 'characters'],
  ['zoncz', 'meaning'],
  ['zonc', 'meaning'],
  ['zon', 'character'],
  ['ludziach', 'people'],
  ['zwierzętach', 'animals'],
  ['thing/objectach', 'things'],
  ['koło ciebie', 'near you'],
  ['niesmaczny', 'not tasty'],
  ['drogi', 'expensive'],
  ['podstawowych', 'basic'],
  ['na-adjectivei', 'na-adjectives'],
  ['i-adjectivei', 'i-adjectives'],
  ['Dwa i-', 'Two i-'],
  ['particle no (exampleon', 'particle no (possession'],
  ['Czasownik', 'Verb'],
  ['Użycie', 'Usage'],
  ['ki adjectives', 'i-adjectives'],
  ['hand', 'hi'],
  ['na-ni-nu-ne-hand', 'na-ni-nu-ne-no'],
  ['Dakuten \\(two', 'Dakuten (voiced'],
  ['marks\\)', 'marks)'],
  ['Combined with', 'combined with'],
  ['previousą', 'previous'],
  ['Written From', 'Written from'],
  ['bottom to top', 'bottom to top'],
  ['dole', 'bottom'],
  ['ozoncz', 'means'],
  ['on-ni', 'na-ni'],
  ['on dół', 'down'],
  ['Katakaon', 'Katakana'],
];

async function fixRemaining() {
  const res = await pool.query('SELECT id, vocabulary, grammar FROM lessons');
  let fixed = 0;

  for (const row of res.rows) {
    let needsUpdate = false;
    let vocab = row.vocabulary || [];
    let grammar = row.grammar || [];

    vocab = vocab.map((v: any) => {
      let changed = false;
      const newV = { ...v };
      for (const [pl, en] of patterns) {
        if (v.en?.includes(pl)) {
          newV.en = newV.en.replace(new RegExp(pl, 'g'), en);
          changed = true;
        }
        if (v.reading?.includes(pl)) {
          newV.reading = newV.reading.replace(new RegExp(pl, 'g'), en);
          changed = true;
        }
      }
      if (changed) needsUpdate = true;
      return newV;
    });

    grammar = grammar.map((g: any) => {
      let changed = false;
      const newG = { ...g };
      for (const [pl, en] of patterns) {
        if (g.explanation?.includes(pl)) {
          newG.explanation = newG.explanation.replace(new RegExp(pl, 'g'), en);
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

  console.log('\nTotal fixed:', fixed);
  await pool.end();
}

fixRemaining();
