import pg from 'pg';
import { readFileSync } from 'fs';
import { config } from 'dotenv';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
config({ path: resolve(__dirname, '.env.local') });

const { Pool } = pg;

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'speech_practice',
  user: process.env.USER || 'postgres',
});

async function updateLesson() {
  const lesson = JSON.parse(readFileSync('/Users/postgres/clawd/lesson-2026-03-02.json', 'utf-8'));
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Update existing lesson with new data
    await client.query(
      `UPDATE lessons 
       SET vocabulary = $1,
           practice_phrases = $2,
           updated_at = NOW()
       WHERE id = $3`,
      [
        JSON.stringify(lesson.vocabulary),
        JSON.stringify(lesson.practice_phrases),
        lesson.id
      ]
    );
    
    await client.query('COMMIT');
    console.log('✅ Lekcja 2026-03-02 zaktualizowana!');
    console.log(`📚 Słownictwo: ${lesson.vocabulary.length} słów`);
    console.log(`🎯 Frazy: ${lesson.practice_phrases.length} fraz`);
    
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Błąd:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

updateLesson();
