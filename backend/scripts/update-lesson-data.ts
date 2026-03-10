import { pool } from '../src/db/pool.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function updateLesson() {
  const lessonFile = join(__dirname, '../src/data/lessons/lesson-2026-03-09.json');
  const lesson = JSON.parse(readFileSync(lessonFile, 'utf-8'));
  
  console.log('Updating lesson with data from JSON...');
  
  await pool.query(
    `UPDATE lessons 
     SET vocabulary = $1::jsonb,
         grammar = $2::jsonb,
         practice_phrases = $3::jsonb
     WHERE id = $4`,
    [
      JSON.stringify(lesson.vocabulary),
      JSON.stringify(lesson.grammar),
      JSON.stringify(lesson.practice_phrases),
      lesson.id
    ]
  );
  
  console.log('✅ Lesson data updated!');
  console.log(`   Vocabulary: ${lesson.vocabulary.length} items`);
  console.log(`   Grammar: ${lesson.grammar.length} patterns`);
  console.log(`   Practice phrases: ${lesson.practice_phrases.length} phrases`);
  
  await pool.end();
}

updateLesson().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
