import pg from 'pg';
import { readFileSync } from 'fs';

const { Pool } = pg;

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'speech_practice',
  user: 'postgres',
});

async function updateLesson() {
  const client = await pool.connect();
  
  try {
    const lesson = JSON.parse(readFileSync('/Users/postgres/clawd/lesson-2026-03-02.json', 'utf-8'));
    
    await client.query(
      `UPDATE lessons 
       SET vocabulary = $1,
           updated_at = NOW()
       WHERE id = $2`,
      [
        JSON.stringify(lesson.vocabulary),
        '2026-03-02'
      ]
    );
    
    console.log('✅ Lekcja 2026-03-02 zaktualizowana');
    console.log(`   Słownictwo: ${lesson.vocabulary.length} słów`);
    console.log('   Nowe słowa:', lesson.vocabulary.slice(31).map(v => v.jp).join(', '));
    
  } catch (err) {
    console.error('❌ Błąd:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

updateLesson();
