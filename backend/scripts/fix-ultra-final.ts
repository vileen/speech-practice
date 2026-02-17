#!/usr/bin/env node
import { pool } from '../src/db/pool.js';

const finalMappings: Record<string, string> = {
  // Descriptions
  'Dwie poziome + środkowa': 'Two horizontal + middle',
  'Pętelka + zjazd': 'Loop + slide',
  'Pętelka + zI/mezd': 'Loop + slide',
  'Pętelka z przytupem': 'Loop with emphasis',
  'Prosta kreska z góry w lewo': 'Straight line from top to left',
  'Prosty kształt jak hiragana': 'Simple shape like hiragana',
  'Prosty kształt': 'Simple shape',
  'Kwadratowy kształt': 'Square shape',
  'Bez pętelki': 'Without loop',
  'Z dołu do góry': 'From bottom to top',
  'Pętelka z dołu do góry': 'Loop from bottom to top',
  'Dwie poziome + środkowa kreska': 'Two horizontal + middle line',
  'Proste krzyżyk': 'Simple cross',
  'krótsza kreska z lewej': 'shorter line from left',
  'Łezka + przecięcie': 'Tear drop + crossing',
  'kanciaste': 'angular',
  'Mała wersja': 'Small version',
  'z góry na dół': 'top to bottom',
  // Headers
  'Katakaon': 'Katakana',
  'Katakana': 'Katakana',
  'particle を (wo/o)': 'Particle を (wo/o)',
  'Partykuła': 'Particle',
  'additional:': 'Additional:',
  'Dodatkowe:': 'Additional:',
  // Grammar
  'Rozróżnienie': 'Distinction',
  'Podsumowanie': 'Summary',
  'wszystkich znaków': 'all characters',
  'czasowniki': 'verbs',
  'Partykuła': 'Particle',
  'przynależność': 'possession',
  'temat': 'topic',
  'podmiot': 'subject',
  'dopełnienie': 'object',
  'dakuon': 'dakuten',
  'dwiema kreseczkami': 'two marks',
  'Pytania o pochodzenie': 'Questions about origin',
  'Skąd jesteś': 'Where are you from',
  'Odpowiedź': 'Answer',
  'Tworzenie nowych dźwięków': 'Creating new sounds',
  'Małe a-i-u-e-o': 'Small a-i-u-e-o',
  'łączone z poprzednią sylabą': 'combined with previous syllable',
  'Z dakuon': 'With dakuten',
  'dwiem kreski': 'two marks',
  'krótki': 'short',
  'powtórka': 'review',
  'poprzedni': 'previous',
  'wiersz': 'row',
  'ćwiczenia': 'exercises',
  'rozpoznawanie': 'recognition',
  'znaki': 'characters',
  'Vocabulary przykładowe': 'Example vocabulary',
  'Czytanki w hiraganie': 'Readings in hiragana',
  'Dialog': 'Dialogue',
  'Czym jest katakana': 'What is katakana',
  'Drugi sylabariusz': 'Second syllabary',
  'pierwszy to': 'first is',
  'Te same dźwięki': 'Same sounds',
  'inne zastosowanie': 'different usage',
  'Zapisywany': 'Written',
  'W druku': 'In print',
  'często pogrubiony': 'often bold',
  'na dole': 'at bottom',
  'oznacza': 'means',
  'Kiru - dwa znaczenia': 'Kiru - two meanings',
  'dwie grupy': 'two groups',
  'ciąć': 'cut',
  'kroić': 'slice',
  'Podobne do hiragana': 'Similar to hiragana',
  'Prosty krzyżyk': 'Simple cross',
  'Zawiera': 'Contains',
  'podstawowych znaków': 'basic characters',
  'Udźwięc': 'Voiced sounds',
  'Tylko trzy zonki': 'Only three characters',
  'trzy zonki': 'three characters',
  'zonki': 'characters',
  'Tylko trzy': 'Only three',
  'Użycie': 'Usage',
  'Wskazuje': 'Indicates',
  'minut': 'minutes',
  'Zamiana': 'Changing',
  'słownik': 'dictionary',
  'czy jesteś w stanie': 'are you able to',
};

async function ultraFinalFix() {
  console.log('🔥 Ultra final cleanup...\n');
  
  const result = await pool.query('SELECT id, vocabulary, grammar FROM lessons');
  let totalFixed = 0;
  
  for (const row of result.rows) {
    let needsUpdate = false;
    let vocab = row.vocabulary || [];
    let grammar = row.grammar || [];
    
    // Fix vocabulary
    vocab = vocab.map((v: any) => {
      const newV = { ...v };
      
      ['reading', 'en'].forEach((field) => {
        if (v[field]) {
          let fixed = v[field];
          for (const [pl, en] of Object.entries(finalMappings)) {
            fixed = fixed.replace(new RegExp(pl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), en);
          }
          // Fix broken partial translations
          fixed = fixed.replace(/zI\/mez/g, 'slide').replace(/zI\/mez/g, 'slide').replace(/I\/me/g, 'itchy');
          if (fixed !== v[field]) {
            (newV as any)[field] = fixed;
            needsUpdate = true;
          }
        }
      });
      
      return newV;
    });
    
    // Fix grammar
    grammar = grammar.map((g: any) => {
      const newG = { ...g };
      
      if (g.explanation) {
        let fixed = g.explanation;
        for (const [pl, en] of Object.entries(finalMappings)) {
          fixed = fixed.replace(new RegExp(pl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), en);
        }
        if (fixed !== g.explanation) {
          newG.explanation = fixed;
          needsUpdate = true;
        }
      }
      
      if (g.examples && Array.isArray(g.examples)) {
        const newExamples = g.examples.map((ex: any) => {
          let fixedEn = ex.en || '';
          for (const [pl, en] of Object.entries(finalMappings)) {
            fixedEn = fixedEn.replace(new RegExp(pl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), en);
          }
          return { jp: ex.jp, en: fixedEn };
        });
        if (JSON.stringify(newExamples) !== JSON.stringify(g.examples)) {
          newG.examples = newExamples;
          needsUpdate = true;
        }
      }
      
      return newG;
    });
    
    if (needsUpdate) {
      await pool.query(
        'UPDATE lessons SET vocabulary = $1, grammar = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
        [JSON.stringify(vocab), JSON.stringify(grammar), row.id]
      );
      console.log(`✅ Fixed: ${row.id}`);
      totalFixed++;
    }
  }
  
  console.log(`\n🎉 Fixed ${totalFixed} lessons!`);
  await pool.end();
}

ultraFinalFix();
