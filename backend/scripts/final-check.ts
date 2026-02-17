#!/usr/bin/env node
import { pool } from '../src/db/pool.js';

async function finalCheck() {
  const res = await pool.query('SELECT id, vocabulary, grammar FROM lessons');
  let foundPolish = 0;
  
  for (const row of res.rows) {
    const vocab = row.vocabulary || [];
    const grammar = row.grammar || [];
    
    for (const v of vocab) {
      const en = v.en || '';
      const reading = v.reading || '';
      
      // Check for actual Polish words (not just fragments)
      const polishWords = ['pieniądze', 'Pętelka', 'przecięcie', 'kanciaste', 'przytupem', 
        'Czytanki', 'przykładowe', 'poprzednią', 'sylabą', 'Rozróżnienie', 'Podsumowanie',
        'wszystkich', 'znaków', 'Tworzenie', 'dźwięków', 'łączone', 'Pytania', 'pochodzenie',
        'Skąd', 'jesteś', 'Odpowiedź', 'krótki', 'powtórka', 'poprzedni', 'wiersz',
        'ćwiczenia', 'rozpoznawanie', 'znaki', 'Czytanki', 'hiraganie', 'Dialog', 'Czym',
        'jest', 'katakana', 'Drugi', 'sylabariusz', 'pierwszy', 'same', 'dźwięki',
        'inne', 'zastosowanie', 'Zapisywany', 'druku', 'często', 'pogrubiony', 'dole',
        'oznacza', 'dwie', 'grupy', 'ciąć', 'kroić'];
      
      for (const word of polishWords) {
        if (en.includes(word) || reading.includes(word)) {
          console.log(`${row.id} VOCAB: "${word}" in: ${en.substring(0, 50)}...`);
          foundPolish++;
          break;
        }
      }
    }
    
    for (const g of grammar) {
      const exp = g.explanation || '';
      const polishWords = ['Pętelka', 'przecięcie', 'kanciaste', 'przytupem', 
        'Czytanki', 'przykładowe', 'poprzednią', 'sylabą', 'Rozróżnienie', 'Podsumowanie',
        'wszystkich', 'znaków', 'Tworzenie', 'dźwięków', 'łączone', 'Pytania', 'pochodzenie',
        'Skąd', 'jesteś', 'Odpowiedź', 'krótki', 'powtórka', 'poprzedni', 'wiersz',
        'ćwiczenia', 'rozpoznawanie', 'znaki', 'Czytanki', 'hiraganie', 'Dialog', 'Czym',
        'jest', 'katakana', 'Drugi', 'sylabariusz', 'pierwszy', 'same', 'dźwięki',
        'inne', 'zastosowanie', 'Zapisywany', 'druku', 'często', 'pogrubiony', 'dole',
        'oznacza', 'dwie', 'grupy', 'ciąć', 'kroić'];
      
      for (const word of polishWords) {
        if (exp.includes(word)) {
          console.log(`${row.id} GRAMMAR: "${word}" in: ${exp.substring(0, 80)}...`);
          foundPolish++;
          break;
        }
      }
    }
  }
  
  if (foundPolish === 0) {
    console.log('✅ No Polish words found! All clean!');
  } else {
    console.log(`\n⚠️ Found ${foundPolish} entries with Polish words`);
  }
  
  await pool.end();
}

finalCheck();
