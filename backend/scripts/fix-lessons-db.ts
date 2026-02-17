#!/usr/bin/env node
/**
 * Fix Polish text in database lessons
 * Run: npx tsx scripts/fix-lessons-db.ts
 */

import { pool } from '../src/db/pool.js';

async function fixLessons() {
  console.log('🔧 Fixing lessons in database...\n');
  
  // Get all lessons
  const result = await pool.query('SELECT id, title, vocabulary, grammar, practice_phrases FROM lessons');
  
  for (const row of result.rows) {
    let needsUpdate = false;
    
    // Fix title - remove "Lekcja 2025-XX-XX — " or "Lesson 2025-XX-XX — " prefix
    let newTitle = row.title;
    const titleMatch = row.title.match(/^(?:Lekcja|Lesson)\s+\d{4}-\d{2}-\d{2}\s*[—-]\s*(.+)$/);
    if (titleMatch) {
      newTitle = titleMatch[1];
      needsUpdate = true;
      console.log(`Title: "${row.title}" → "${newTitle}"`);
    }
    
    // Fix vocabulary - remove dash entries and headers, fix Polish translations
    let vocab = row.vocabulary || [];
    const originalVocabLength = vocab.length;
    
    vocab = vocab.filter((v: any) => {
      // Remove dash-only entries
      if (/^-+$/.test(v.jp)) return false;
      // Remove header entries
      if (['Znak', 'Czytanie', 'Słówka', 'Przykłady', 'Grupa', 'Wzór', 'Typ', 'Japoński'].includes(v.jp)) return false;
      return true;
    });
    
    // Fix Polish translations in vocabulary
    vocab = vocab.map((v: any) => {
      const newV = { ...v };
      if (v.en) {
        const fixedEn = v.en
          .replace(/licznik/g, 'counter')
          .replace(/ubranie/g, 'clothes')
          .replace(/gruby/g, 'thick/fat')
          .replace(/kwiat/g, 'flower')
          .replace(/rozmawiać/g, 'to talk')
          .replace(/pałeczki/g, 'chopsticks')
          .replace(/pudełko/g, 'box')
          .replace(/niski/g, 'short/low')
          .replace(/szkoda/g, 'unfortunate')
          .replace(/głowa/g, 'head')
          .replace(/brzuszek/g, 'tummy')
          .replace(/Odpowiedź/g, 'Answer')
          .replace(/Pytanie/g, 'Question')
          .replace(/Temat/g, 'Topic');
        if (fixedEn !== v.en) {
          newV.en = fixedEn;
          needsUpdate = true;
        }
      }
      if (v.reading) {
        const fixedReading = v.reading
          .replace(/licznik/g, 'counter')
          .replace(/ubranie/g, 'clothes')
          .replace(/gruby/g, 'thick')
          .replace(/Ucinamy/g, 'Cut off')
          .replace(/dodajemy/g, 'add')
          .replace(/Zmieniamy/g, 'Change');
        if (fixedReading !== v.reading) {
          newV.reading = fixedReading;
          needsUpdate = true;
        }
      }
      return newV;
    });
    
    if (vocab.length !== originalVocabLength) {
      needsUpdate = true;
      console.log(`Vocab: ${row.id} removed ${originalVocabLength - vocab.length} entries`);
    }
    
    // Fix practice phrases - remove Polish words
    let phrases = row.practice_phrases || [];
    const newPhrases = phrases.map((p: string) => 
      p.replace(/\[imię\]/g, '[name]').replace(/imię/g, 'name')
    );
    if (JSON.stringify(newPhrases) !== JSON.stringify(phrases)) {
      phrases = newPhrases;
      needsUpdate = true;
      console.log(`Phrases: ${row.id} fixed Polish words`);
    }
    
    // Fix grammar - remove Polish text
    let grammar = row.grammar || [];
    grammar = grammar.map((g: any) => {
      const newG = { ...g };
      if (g.explanation) {
        const fixedExp = g.explanation
          .replace(/Czytanie/g, 'Reading')
          .replace(/Znak/g, 'Character')
          .replace(/Słówka/g, 'Vocabulary')
          .replace(/Przykłady/g, 'Examples')
          .replace(/licznik/g, 'counter')
          .replace(/ubranie/g, 'clothes')
          .replace(/gruby/g, 'thick')
          .replace(/Ucinamy/g, 'Cut off')
          .replace(/dodajemy/g, 'add')
          .replace(/Zmieniamy/g, 'Change')
          .replace(/Wzór/g, 'Pattern')
          .replace(/Przykład/g, 'Example');
        if (fixedExp !== g.explanation) {
          newG.explanation = fixedExp;
          needsUpdate = true;
        }
      }
      // Fix examples array
      if (g.examples && Array.isArray(g.examples)) {
        newG.examples = g.examples.map((ex: any) => ({
          jp: ex.jp,
          en: ex.en?.replace(/licznik/g, 'counter')
                     .replace(/ubranie/g, 'clothes')
                     .replace(/Odpowiedź/g, 'Answer')
                     .replace(/Pytanie/g, 'Question') || ex.en
        }));
        if (JSON.stringify(newG.examples) !== JSON.stringify(g.examples)) {
          needsUpdate = true;
        }
      }
      return newG;
    });
    
    if (needsUpdate) {
      await pool.query(
        `UPDATE lessons SET 
          title = $1, 
          vocabulary = $2, 
          grammar = $3, 
          practice_phrases = $4,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $5`,
        [newTitle, JSON.stringify(vocab), JSON.stringify(grammar), phrases, row.id]
      );
      console.log(`✅ Updated: ${row.id}\n`);
    }
  }
  
  console.log('🎉 Database cleanup complete!');
  await pool.end();
}

fixLessons().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
