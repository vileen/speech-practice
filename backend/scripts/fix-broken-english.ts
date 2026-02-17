#!/usr/bin/env node
import { pool } from '../src/db/pool.js';

async function fixBrokenEnglish() {
  console.log('🔧 Fixing broken English words...\n');
  
  const res = await pool.query('SELECT id, vocabulary, grammar FROM lessons');
  let fixed = 0;
  
  // Fix broken words from bad replacements
  const brokenFixes = [
    ['possessina', 'possession'],
    ['associatina', 'association'],
    ['cnanects', 'connects'],
    ['listandng', 'listing'],
    ['andtems', 'items'],
    ['Expressandng', 'Expressing'],
    ['usandng', 'using'],
    ['Creatandng', 'Creating'],
    ['prevandous', 'previous'],
    ['sylabą', 'syllable'],
    ['Indandcates', 'Indicates'],
    ['co/kogo', 'what/who'],
    ['poandnt', 'point'],
    ['możon', 'can'],
    ['pandć', 'drink'],
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
    ['nenseand', 'nensei'],
    ['mand', 'mi'],
    ['hand', 'hi'],
    ['band', 'bi'],
    ['on-ni', 'na-ni'],
    ['on dół', 'down'],
    ['dole', 'bottom'],
    ['ozoncz', 'means'],
    ['Katakaon', 'Katakana'],
    ['Contaandns', 'contains'],
    ['as hiragaon', 'as hiragana'],
    ['written from', 'Written from'],
    ['often bold at', 'often bold at'],
    ['means', 'means'],
    ['exampleon', 'example'],
    ['possessionion', 'possession'],
    ['combined z', 'combined with'],
    ['poprzednią', 'previous'],
    ['Mande', 'Małe'],
    ['a-and-u-e-o', 'a-i-u-e-o'],
    ['hand-fu', 'hi-fu'],
    ['na-nand-nu-ne-no', 'na-ni-nu-ne-no'],
    ['Ikandmadream', 'Ikimasu'],
    ['itchyk', 'jak'],
    ['łączna', 'connected'],
    ['Pisana', 'Written'],
    ['nandereg', 'nareg'],
    ['Addandtandnaal', 'Additional'],
    ['uczyć się', 'to study'],
    ['Addandtandonal', 'Additional'],
    ['kandmono', 'kaimono'],
    ['nomandmono', 'nomimono'],
    ['shoppandng', 'shopping'],
    ['drandnks', 'drinks'],
    ['exampletupem', 'przytupem'],
    ['Pętelka z przytupem', 'Loop with emphasis'],
    ['kaorand', 'kaori'],
    ['andce', 'kouri'],
    ['andkandru', 'ikiru'],
    ['mandraand', 'mirai'],
    ['exampleszł', 'future'],
    ['examplekład', 'example'],
    ['pleasemny', 'pleasant'],
    ['at/nearkładowe', 'Example Vocabulary'],
    ['at/nearjemny', 'pleasant'],
    ['at/nearszł', 'future'],
    ['at/nearkład', 'example'],
    ['toonri', 'tonari'],
    ['at/nearonleżność', 'possession'],
    ['pieniądze', 'money'],
    ['Pętelka', 'Loop'],
    ['przecięcie', 'crossing'],
    ['kanciaste', 'angular'],
    ['z przytupem', 'with emphasis'],
    ['przytupem', 'emphasis'],
    ['Prosta kreska', 'Straight line'],
    ['z góry w lewo', 'from top to left'],
    ['Prosty kształt', 'Simple shape'],
    ['jak hiragana', 'like hiragana'],
    ['Bez pętelki', 'Without loop'],
    ['kanciasty', 'angular'],
    ['Z dołu do góry', 'From bottom to top'],
    ['Dwie poziome', 'Two horizontal'],
    ['środkowa', 'middle'],
    ['Proste krzyżyk', 'Simple cross'],
    ['krótsza kreska', 'shorter line'],
    ['z lewej', 'from left'],
    ['Łezka', 'Tear drop'],
    ['Mała wersja', 'Small version'],
    ['z góry na dół', 'top to bottom'],
    ['Podobne do', 'Similar to'],
    ['Prosty krzyżyk', 'Simple cross'],
    ['Zawiera', 'Contains'],
    ['podstawowych', 'basic'],
    ['Rozróżnienie', 'Distinction'],
    ['Podsumowanie', 'Summary'],
    ['wszystkich znaków', 'all characters'],
    ['Tworzenie', 'Creating'],
    ['nowych dźwięków', 'new sounds'],
    ['Małe a-i-u-e-o', 'Small a-i-u-e-o'],
    ['łączone z', 'combined with'],
    ['poprzednią sylabą', 'previous syllable'],
    ['Z dakuon', 'With dakuten'],
    ['dwiema kreseczkami', 'two marks'],
    ['Pytania o', 'Questions about'],
    ['pochodzenie', 'origin'],
    ['Skąd jesteś', 'Where are you from'],
    ['miejsce', 'place'],
    ['Odpowiedź', 'Answer'],
    ['krótki', 'short'],
    ['powtórka', 'review'],
    ['poprzedni', 'previous'],
    ['wiersz', 'row'],
    ['ćwiczenia', 'exercises'],
    ['rozpoznawanie', 'recognition'],
    ['znaki', 'characters'],
    ['Vocabulary przykładowe', 'Example vocabulary'],
    ['Czytanki w hiraganie', 'Readings in hiragana'],
    ['Dialog', 'Dialogue'],
    ['Czym jest katakana', 'What is katakana'],
    ['Drugi sylabariusz', 'Second syllabary'],
    ['pierwszy to', 'first is'],
    ['Te same dźwięki', 'Same sounds'],
    ['inne zastosowanie', 'different usage'],
    ['Zapisywany', 'Written'],
    ['W druku', 'In print'],
    ['często pogrubiony', 'often bold'],
    ['na dole', 'at bottom'],
    ['oznacza', 'means'],
    ['Kiru - dwa', 'Kiru - two'],
    ['dwie grupy', 'two groups'],
    ['ciąć', 'cut'],
    ['kroić', 'slice'],
    ['Katakana zawiera', 'Katakana contains'],
    ['Tylko trzy', 'Only three'],
    ['znaki', 'characters'],
    ['Dwa czasowniki', 'Two verbs'],
    ['Zamiana', 'Changing'],
    ['formy', 'form'],
    ['słownik', 'dictionary'],
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

fixBrokenEnglish();
