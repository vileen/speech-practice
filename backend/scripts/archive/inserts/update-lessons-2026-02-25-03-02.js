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

async function updateLessons() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Update lesson 2026-03-02
    const lesson0302 = JSON.parse(readFileSync('/Users/postgres/clawd/lesson-2026-03-02.json', 'utf-8'));
    await client.query(
      `UPDATE lessons 
       SET vocabulary = $1,
           grammar = $2,
           practice_phrases = $3,
           updated_at = NOW()
       WHERE id = $4`,
      [
        JSON.stringify(lesson0302.vocabulary),
        JSON.stringify(lesson0302.grammar),
        JSON.stringify(lesson0302.practice_phrases),
        '2026-03-02'
      ]
    );
    console.log('✅ Lekcja 2026-03-02 zaktualizowana');
    console.log(`   Słownictwo: ${lesson0302.vocabulary.length} słów`);
    console.log(`   Gramatyka: ${lesson0302.grammar.length} wzorców`);
    console.log(`   Frazy: ${lesson0302.practice_phrases.length} fraz`);
    
    // Check if lesson 2026-02-25 exists
    const checkResult = await client.query('SELECT id FROM lessons WHERE id = $1', ['2026-02-25']);
    
    const lesson0225 = JSON.parse(readFileSync('/Users/postgres/clawd/lesson-2026-02-25.json', 'utf-8'));
    
    if (checkResult.rows.length > 0) {
      // Update existing lesson
      await client.query(
        `UPDATE lessons 
         SET title = $1,
             topics = $2,
             vocabulary = $3,
             grammar = $4,
             practice_phrases = $5,
             updated_at = NOW()
         WHERE id = $6`,
        [
          lesson0225.title,
          lesson0225.topics,
          JSON.stringify(lesson0225.vocabulary),
          JSON.stringify(lesson0225.grammar),
          JSON.stringify(lesson0225.practice_phrases),
          '2026-02-25'
        ]
      );
      console.log('✅ Lekcja 2026-02-25 zaktualizowana');
    } else {
      // Insert new lesson
      const orderResult = await client.query('SELECT COALESCE(MAX(order_num), 0) + 1 as next_order FROM lessons');
      const orderNum = orderResult.rows[0].next_order;
      
      await client.query(
        `INSERT INTO lessons (id, date, title, order_num, topics, vocabulary, grammar, practice_phrases, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())`,
        [
          lesson0225.id,
          lesson0225.date,
          lesson0225.title,
          orderNum,
          lesson0225.topics,
          JSON.stringify(lesson0225.vocabulary),
          JSON.stringify(lesson0225.grammar),
          JSON.stringify(lesson0225.practice_phrases)
        ]
      );
      console.log('✅ Lekcja 2026-02-25 dodana do bazy');
    }
    
    console.log(`   Słownictwo: ${lesson0225.vocabulary.length} słów`);
    console.log(`   Gramatyka: ${lesson0225.grammar.length} wzorców`);
    console.log(`   Frazy: ${lesson0225.practice_phrases.length} fraz`);
    
    await client.query('COMMIT');
    console.log('\n🎉 Obie lekcje gotowe w aplikacji!');
    
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Błąd:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

updateLessons();
