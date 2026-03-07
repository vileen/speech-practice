import pg from 'pg';
import { readFileSync } from 'fs';
import { config } from 'dotenv';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
config({ path: resolve(__dirname, '../.env.local') });

const { Pool } = pg;

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'speech_practice',
  user: process.env.USER || 'postgres',
});

async function insertLesson() {
  const lesson = JSON.parse(readFileSync('/Users/postgres/Projects/speech-practice/backend/src/data/lessons/lesson-2026-03-04.json', 'utf-8'));
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Check if lesson exists
    const checkResult = await client.query('SELECT id FROM lessons WHERE id = $1', [lesson.id]);
    
    if (checkResult.rows.length > 0) {
      console.log('ℹ️ Lekcja już istnieje, aktualizuję...');
    }
    
    // Get next order_num
    const orderResult = await client.query('SELECT COALESCE(MAX(order_num), 0) + 1 as next_order FROM lessons');
    const orderNum = orderResult.rows[0].next_order;
    
    // Insert or update lesson
    await client.query(
      `INSERT INTO lessons (id, date, title, order_num, topics, vocabulary, grammar, practice_phrases, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
       ON CONFLICT (id) DO UPDATE SET
         title = EXCLUDED.title,
         topics = EXCLUDED.topics,
         vocabulary = EXCLUDED.vocabulary,
         grammar = EXCLUDED.grammar,
         practice_phrases = EXCLUDED.practice_phrases,
         updated_at = NOW()`,
      [
        lesson.id,
        lesson.date,
        lesson.title,
        orderNum,
        lesson.topics || [],
        JSON.stringify(lesson.vocabulary),
        JSON.stringify(lesson.grammar),
        JSON.stringify(lesson.practice_phrases)
      ]
    );
    
    await client.query('COMMIT');
    console.log('✅ Lekcja 2026-03-04 dodana/zaaktualizowana pomyślnie!');
    console.log(`📚 Tytuł: ${lesson.title}`);
    console.log(`📝 Słownictwo: ${lesson.vocabulary.length} słów`);
    console.log(`📖 Gramatyka: ${lesson.grammar.length} wzorców`);
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

insertLesson();
