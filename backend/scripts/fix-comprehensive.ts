#!/usr/bin/env node
import { pool } from '../src/db/pool.js';

async function comprehensiveFix() {
  console.log('🔧 Comprehensive database cleanup...\n');
  
  const result = await pool.query('SELECT id, title, vocabulary, grammar, practice_phrases FROM lessons');
  
  for (const row of result.rows) {
    let needsUpdate = false;
    let vocab = row.vocabulary || [];
    let grammar = row.grammar || [];
    let phrases = row.practice_phrases || [];
    
    // 1. Remove useless vocab entries (headers, dashes, Polish explanations)
    const originalVocabLength = vocab.length;
    vocab = vocab.filter((v: any) => {
      const jp = v.jp || '';
      const reading = v.reading || '';
      const en = v.en || '';
      
      // Remove dash-only entries
      if (/^-+$/.test(jp)) return false;
      // Remove header entries
      if (['Znak', 'Czytanie', 'Słówka', 'Przykłady', 'Grupa', 'Wzór', 'Typ', 'Japoński', 'Examples', 'Pattern', 'Group', 'Rodzaje', 'Znaczenie'].includes(jp)) return false;
      // Remove entries where reading is Polish text explaining, not actual reading
      if (reading && /[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/.test(reading)) return false;
      // Remove entries where en is just Polish description
      if (en && /^[A-Z][a-z]+:$/.test(en)) return false; // "Examples:", "Pattern:"
      
      return true;
    });
    
    if (vocab.length !== originalVocabLength) {
      needsUpdate = true;
      console.log(`${row.id}: Removed ${originalVocabLength - vocab.length} useless vocab entries`);
    }
    
    // 2. Fix Polish text in vocabulary
    vocab = vocab.map((v: any) => {
      const newV = { ...v };
      if (v.reading) {
        const fixed = v.reading
          .replace(/Przykłady/g, 'Examples')
          .replace(/Krótka powtórka/g, 'Short review')
          .replace(/poprzedniego wiersza/g, 'of previous row')
          .replace(/Ćwiczenia rozpoznawania znaków/g, 'Character recognition exercises')
          .replace(/czy jesteś w stanie/g, 'are you able to')
          .replace(/pies/g, 'dog')
          .replace(/gardło/g, 'throat')
          .replace(/zapach/g, 'smell')
          .replace(/pieniądze/g, 'money')
          .replace(/Odpowiedzi/g, 'Answers')
          .replace(/klasy/g, 'grades')
          .replace(/lat/g, 'years')
          .replace(/pełnoletność/g, 'adulthood')
          .replace(/dorosłość/g, 'coming of age')
          .replace(/można pić/g, 'can drink')
          .replace(/alkohol/g, 'alcohol')
          .replace(/głosować/g, 'vote')
          .replace(/święto/g, 'ceremony')
          .replace(/ubierają/g, 'dress')
          .replace(/kimona/g, 'kimono')
          .replace(/Szkoły/g, 'Schools')
          .replace(/Rodzaje/g, 'Types')
          .replace(/Szkoła/g, 'School')
          .replace(/podstawowa/g, 'elementary')
          .replace(/gimnazjum/g, 'junior high')
          .replace(/liceum/g, 'high school');
        if (fixed !== v.reading) {
          newV.reading = fixed;
          needsUpdate = true;
        }
      }
      if (v.en) {
        const fixed = v.en
          .replace(/Japoński/g, 'Japanese')
          .replace(/Znaczenie/g, 'Meaning')
          .replace(/Użycie/g, 'Usage')
          .replace(/Przykład/g, 'Example')
          .replace(/na którym roku/g, 'which year')
          .replace(/jesteś/g, 'are you')
          .replace(/którą klasą/g, 'which grade')
          .replace(/roku szkolny/g, 'school year')
          .replace(/lat/g, 'years old')
          .replace(/W Japonii/g, 'In Japan')
          .replace(/Od tego momentu/g, 'From this point')
          .replace(/Ceremonia/g, 'Ceremony')
          .replace(/święto/g, 'celebration')
          .replace(/Dziewczyny/g, 'Girls')
          .replace(/UWAGA/g, 'Note')
          .replace(/Nie dodajemy/g, 'We do not add')
          .replace(/mówi się/g, 'we say');
        if (fixed !== v.en) {
          newV.en = fixed;
          needsUpdate = true;
        }
      }
      return newV;
    });
    
    // 3. Fix grammar explanations
    grammar = grammar.map((g: any) => {
      const newG = { ...g };
      if (g.explanation) {
        let fixed = g.explanation
          .replace(/### Pytanie o/g, '### Question about')
          .replace(/rok szkolny/g, 'school year')
          .replace(/Na którym roku jesteś/g, 'What year are you in')
          .replace(/Którą klasą jesteś/g, 'What grade are you')
          .replace(/Odpowiedzi/g, 'Answers')
          .replace(/klasy/g, 'grades')
          .replace(/W Japonii/g, 'In Japan')
          .replace(/pełnoletność/g, 'adulthood')
          .replace(/dorosłość/g, 'coming of age')
          .replace(/Od tego momentu/g, 'From this point')
          .replace(/można pić alkohol/g, 'you can drink alcohol')
          .replace(/głosować/g, 'vote')
          .replace(/Ceremonia/g, 'Ceremony')
          .replace(/święto dorosłości/g, 'coming of age ceremony')
          .replace(/w styczniu/g, 'in January')
          .replace(/Dziewczyny ubierają się/g, 'Girls dress in')
          .replace(/drogie kimona/g, 'expensive kimono')
          .replace(/UWAGA/g, 'NOTE')
          .replace(/Nie dodajemy/g, 'We do not add')
          .replace(/mówi się po prostu/g, 'we simply say')
          .replace(/Szkoły i Rok Szkolny/g, 'Schools and School Year')
          .replace(/Rodzaje szkół/g, 'School Types')
          .replace(/Szkoła podstawowa/g, 'Elementary school')
          .replace(/gimnazjum/g, 'junior high')
          .replace(/liceum/g, 'high school')
          .replace(/Krótka powtórka/g, 'Short review')
          .replace(/poprzedniego wiersza/g, 'of previous row')
          .replace(/Ćwiczenia rozpoznawania znaków/g, 'Character recognition exercises')
          .replace(/Powtórka hiragany/g, 'Hiragana review')
          .replace(/Vocabulary:/g, 'Vocabulary:');
        
        // Remove broken table markdown artifacts
        fixed = fixed.replace(/\|\s*-\s*\|/g, '');
        
        if (fixed !== g.explanation) {
          newG.explanation = fixed;
          needsUpdate = true;
        }
      }
      
      // Fix grammar examples too
      if (g.examples && Array.isArray(g.examples)) {
        const newExamples = g.examples.map((ex: any) => ({
          jp: ex.jp,
          en: (ex.en || '')
            .replace(/krótki/g, 'short')
            .replace(/powtórka/g, 'review')
            .replace(/poprzedni/g, 'previous')
            .replace(/wiersz/g, 'row')
            .replace(/ćwiczenia/g, 'exercises')
            .replace(/rozpoznawanie/g, 'recognition')
            .replace(/znaki/g, 'characters')
            .replace(/pies/g, 'dog')
            .replace(/gardło/g, 'throat')
            .replace(/zapach/g, 'smell')
        }));
        if (JSON.stringify(newExamples) !== JSON.stringify(g.examples)) {
          newG.examples = newExamples;
          needsUpdate = true;
        }
      }
      
      return newG;
    });
    
    // 4. Fix practice phrases
    const newPhrases = phrases.map((p: string) =>
      p.replace(/Co to jest/g, 'What is this')
       .replace(/jesteś/g, 'are you')
       .replace(/którym roku/g, 'which year')
    );
    if (JSON.stringify(newPhrases) !== JSON.stringify(phrases)) {
      phrases = newPhrases;
      needsUpdate = true;
    }
    
    if (needsUpdate) {
      await pool.query(
        `UPDATE lessons SET vocabulary = $1, grammar = $2, practice_phrases = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4`,
        [JSON.stringify(vocab), JSON.stringify(grammar), phrases, row.id]
      );
      console.log(`✅ Updated: ${row.id}\n`);
    }
  }
  
  console.log('🎉 Comprehensive cleanup complete!');
  await pool.end();
}

comprehensiveFix().catch(console.error);
