import { pool } from '../src/db/pool.js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function fixLessonTranslations(lessonId: string) {
  try {
    // Read the JSON file
    const jsonPath = join(__dirname, '../src/data/lessons', `${lessonId}.json`);
    const jsonData = JSON.parse(readFileSync(jsonPath, 'utf-8'));
    
    console.log(`\nFixing lesson ${lessonId}...`);
    console.log(`Found ${jsonData.practice_phrases?.length || 0} practice phrases in JSON`);
    
    // Get current data from database
    const dbResult = await pool.query(
      'SELECT practice_phrases FROM lessons WHERE id = $1',
      [lessonId]
    );
    
    if (dbResult.rows.length === 0) {
      console.log(`Lesson ${lessonId} not found in database`);
      return;
    }
    
    const currentPhrases = dbResult.rows[0].practice_phrases || [];
    console.log(`Found ${currentPhrases.length} phrases in database`);
    
    // Merge translations from JSON to DB phrases
    const fixedPhrases = currentPhrases.map((dbPhrase: any, index: number) => {
      const jsonPhrase = jsonData.practice_phrases?.[index];
      if (jsonPhrase) {
        return {
          ...dbPhrase,
          jp: jsonPhrase.jp || dbPhrase.jp,
          en: jsonPhrase.en || dbPhrase.en || '',
          romaji: jsonPhrase.romaji || dbPhrase.romaji,
          furigana: jsonPhrase.furigana || dbPhrase.furigana || null
        };
      }
      return dbPhrase;
    });
    
    // Check what changed
    let changedCount = 0;
    fixedPhrases.forEach((phrase: any, i: number) => {
      const oldEn = currentPhrases[i]?.en || '';
      const newEn = phrase.en || '';
      if (oldEn !== newEn && newEn) {
        console.log(`  ${i + 1}. "${phrase.jp}"`);
        console.log(`     OLD: "${oldEn}"`);
        console.log(`     NEW: "${newEn}"`);
        changedCount++;
      }
    });
    
    if (changedCount === 0) {
      console.log('  No changes needed');
      return;
    }
    
    // Update database
    await pool.query(
      'UPDATE lessons SET practice_phrases = $1 WHERE id = $2',
      [JSON.stringify(fixedPhrases), lessonId]
    );
    
    console.log(`\n✅ Fixed ${changedCount} phrases in lesson ${lessonId}`);
    
  } catch (error) {
    console.error(`Error fixing lesson ${lessonId}:`, error);
  }
}

// Get lesson ID from command line or fix all
const lessonId = process.argv[2];

async function main() {
  if (lessonId) {
    await fixLessonTranslations(lessonId);
  } else {
    // Fix lesson 2026-03-16 by default
    await fixLessonTranslations('2026-03-16');
  }
  await pool.end();
}

main();
