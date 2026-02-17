#!/usr/bin/env node
import { pool } from '../src/db/pool.js';

async function fixAllBroken() {
  console.log('🔧 Fixing ALL broken words...\n');
  
  const res = await pool.query('SELECT id, vocabulary, grammar FROM lessons');
  let fixed = 0;
  
  // First fix the broken words from bad "and" replacement
  const brokenWords: Array<[string, string]> = [
    ['Ikandmadream', 'Ikimasu'],
    ['Indandcates', 'Indicates'],
    ['itchyk', 'jak'],
    ['łączna', 'connected'],
    ['Pisana', 'Written'],
    ['nandereg', 'nareg'],
    ['Addandtandnaal', 'Additional'],
    ['uczyć się', 'to study'],
    ['przychodzić', 'to come'],
    ['co/kogo', 'what/who'],
    ['Czytana', 'Read as'],
    ['Pętelka', 'Loop'],
    ['z przytupem', 'with emphasis'],
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
    ['przecięcie', 'crossing'],
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
    
    // Filter out entries that are just Polish headers
    vocab = vocab.filter((v: any) => {
      if (['Znak', 'Czytanie', 'Słówka', 'Przykłady', 'Grupa', 'Wzór', 'Typ', 'Rodzaje', 'Znaczenie'].includes(v.jp)) {
        needsUpdate = true;
        return false;
      }
      return true;
    });
    
    vocab = vocab.map((v: any) => {
      let changed = false;
      const newV = { ...v };
      
      for (const [pl, en] of brokenWords) {
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
        for (const [pl, en] of brokenWords) {
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
          for (const [pl, en] of brokenWords) {
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

fixAllBroken();
