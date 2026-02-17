#!/usr/bin/env node
import { pool } from '../src/db/pool.js';

async function finalCleanup() {
  console.log('🔧 Final cleanup...\n');
  
  const result = await pool.query('SELECT id, vocabulary, grammar FROM lessons');
  
  for (const row of result.rows) {
    let needsUpdate = false;
    let vocab = row.vocabulary || [];
    let grammar = row.grammar || [];
    
    // Fix partial translations and broken words
    vocab = vocab.map((v: any) => {
      const newV = { ...v };
      if (v.en) {
        let fixed = v.en
          .replace(/rezerwacI\/me/g, 'reservation')
          .replace(/rezerwac/g, 'reservation')
          .replace(/yoonka/g, 'yonaka')
          .replace(/Pożegonnie/g, 'Farewell')
          .replace(/Pożegan/g, 'Farewell')
          .replace(/starszy mężczyzon/g, 'elderly man')
          .replace(/mężczyzon/g, 'man')
          .replace(/młodszA\/me/g, 'younger')
          .replace(/młodsz/g, 'younger')
          .replace(/brzoskwinA\/me/g, 'peach')
          .replace(/brzoskwin/g, 'peach')
          .replace(/zakupA\/me/g, 'shopping')
          .replace(/zakup/g, 'shopping')
          .replace(/napoje/g, 'drinks')
          .replace(/mA\/me/g, 'dream')
          .replace(/marzenA\/me/g, 'dream')
          .replace(/gorąca wodA\/me/g, 'hot water')
          .replace(/swędzA\/me/g, 'itchy')
          .replace(/środek nocA\/me/g, 'middle of night')
          .replace(/swędzi/g, 'itchy')
          .replace(/żółw/g, 'turtle')
          .replace(/kA\/me/g, 'turtle')
          .replace(/port/g, 'port')
          .replace(/minA\/me/g, 'south')
          .replace(/południe/g, 'south')
          .replace(/ulicA\/me/g, 'street')
          .replace(/ucho/g, 'ear')
          .replace(/michi/g, 'street')
          .replace(/miasto/g, 'city')
          .replace(/czekać/g, 'wait')
          .replace(/jeszcze raz/g, 'again')
          .replace(/oko/g, 'eye')
          .replace(/rodzice/g, 'parents')
          .replace(/rodzic/g, 'parents')
          .replace(/sen\/marzenie/g, 'dream')
          .replace(/dobry/g, 'good')
          .replace(/historiA\/me/g, 'history')
          .replace(/prawda/g, 'truth')
          .replace(/książka/g, 'book')
          .replace(/kobieta/g, 'woman')
          .replace(/mężczyzna/g, 'man')
          .replace(/samochód/g, 'car')
          .replace(/przyszłość/g, 'future')
          .replace(/wygoda/g, 'comfort')
          .replace(/wiśnia/g, 'cherry')
          .replace(/przyjemny zapach/g, 'pleasant smell')
          .replace(/obok2/g, 'next to')
          .replace(/next to2/g, 'next to')
          .replace(/zapach/g, 'smell')
          .replace(/kości/g, 'bones')
          .replace(/szczupły/g, 'slender')
          .replace(/ogień/g, 'fire')
          .replace(/normalny/g, 'normal')
          .replace(/przeciętny/g, 'average')
          .replace(/słowo/g, 'word');
        
        if (fixed !== v.en) {
          newV.en = fixed;
          needsUpdate = true;
        }
      }
      return newV;
    });
    
    // Fix broken table headers in grammar
    grammar = grammar.map((g: any) => {
      const newG = { ...g };
      if (g.explanation) {
        let fixed = g.explanation
          .replace(/vocabulary do comparison/g, 'vocabulary for comparison')
          .replace(/Vocabulary at\/nearkładowe/g, 'Example Vocabulary')
          .replace(/at\/nearkładowe/g, 'Example')
          .replace(/Tylko trzy zonki/g, 'Only three characters')
          .replace(/trzy zonki/g, 'three characters')
          .replace(/zonki/g, 'characters')
          .replace(/I\/mepoński/g, 'Japanese')
          .replace(/Zonczenie/g, 'Meaning')
          .replace(/tonczenie/g, 'Meaning')
          .replace(/Dochira \(which\?\)/g, 'Dochira (which one)')
          .replace(/colors:/g, 'Colors:')
          .replace(/blue\)/g, 'blue)')
          .replace(/red\)/g, 'red)')
          .replace(/na-adjectivei/g, 'na-adjectives')
          .replace(/i-adjectivei/g, 'i-adjectives')
          .replace(/czasowniki/g, 'verbs')
          .replace(/Partykuła/g, 'Particle')
          .replace(/przynależność/g, 'possession')
          .replace(/temat/g, 'topic')
          .replace(/podmiot/g, 'subject')
          .replace(/Tworzenie/g, 'Creating')
          .replace(/nowych dźwięków/g, 'new sounds')
          .replace(/Małe a-i-u-e-o/g, 'Small a-i-u-e-o')
          .replace(/łączone z/g, 'combined with')
          .replace(/poprzednią sylabą/g, 'previous syllable')
          .replace(/Z dakuon/g, 'With dakuten')
          .replace(/dwiema kreseczkami/g, 'two marks')
          .replace(/Pytania o pochodzenie/g, 'Questions about origin')
          .replace(/Skąd jesteś/g, 'Where are you from')
          .replace(/miejscA\/me/g, 'place')
          .replace(/miejsce/g, 'place')
          .replace(/Odpowiedź/g, 'Answer')
          .replace(/Dakuon/g, 'Dakuten')
          .replace(/dwiem kreski/g, 'two marks')
          .replace(/Kiru - dwa znaczenia/g, 'Kiru - two meanings')
          .replace(/dwie grupy/g, 'two groups')
          .replace(/Podsumowanie/g, 'Summary')
          .replace(/wszystkich znaków/g, 'all characters')
          .replace(/Czym jest katakana/g, 'What is katakana')
          .replace(/Drugi sylabariusz/g, 'Second syllabary')
          .replace(/pierwszy to/g, 'first is')
          .replace(/Te same dźwięki/g, 'Same sounds')
          .replace(/inne zastosowanie/g, 'different usage')
          .replace(/Zapisywany/g, 'Written')
          .replace(/W druku/g, 'In print')
          .replace(/często pogrubiony/g, 'often bold')
          .replace(/na dole/g, 'at bottom')
          .replace(/oznacza/g, 'means')
          .replace(/Rozróżnienie/g, 'Distinction')
          .replace(/krótki/g, 'short')
          .replace(/powtórka/g, 'review')
          .replace(/poprzedni/g, 'previous')
          .replace(/wiersz/g, 'row')
          .replace(/ćwiczenia/g, 'exercises')
          .replace(/rozpoznawanie/g, 'recognition')
          .replace(/znaki/g, 'characters')
          .replace(/czy jesteś w stanie/g, 'are you able to');
        
        if (fixed !== g.explanation) {
          newG.explanation = fixed;
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
    }
  }
  
  console.log('\n🎉 Final cleanup complete!');
  await pool.end();
}

finalCleanup();
