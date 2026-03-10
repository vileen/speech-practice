const { Pool } = require('pg');
const lesson = require('../src/data/lessons/lesson-2026-03-09.json');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/speech_practice'
});

async function insertLesson() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Insert lesson
    const lessonResult = await client.query(
      `INSERT INTO lessons (id, date, title, duration, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       ON CONFLICT (id) DO UPDATE SET
       title = EXCLUDED.title,
       duration = EXCLUDED.duration,
       updated_at = NOW()
       RETURNING id`,
      [lesson.id, lesson.date, lesson.title, lesson.duration]
    );
    
    const lessonId = lessonResult.rows[0].id;
    
    // Insert vocabulary
    for (const vocab of lesson.vocabulary) {
      await client.query(
        `INSERT INTO vocabulary (lesson_id, jp, en, type, romaji, reading, furigana)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT DO NOTHING`,
        [lessonId, vocab.jp, vocab.en, vocab.type, vocab.romaji, vocab.reading, vocab.furigana]
      );
    }
    
    // Insert grammar
    for (const grammar of lesson.grammar) {
      const grammarResult = await client.query(
        `INSERT INTO grammar_patterns (lesson_id, pattern, explanation)
         VALUES ($1, $2, $3)
         ON CONFLICT DO NOTHING
         RETURNING id`,
        [lessonId, grammar.pattern, grammar.explanation]
      );
      
      if (grammarResult.rows[0]) {
        const grammarId = grammarResult.rows[0].id;
        for (const ex of grammar.examples) {
          await client.query(
            `INSERT INTO grammar_examples (grammar_id, jp, en, furigana)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT DO NOTHING`,
            [grammarId, ex.jp, ex.en, ex.furigana]
          );
        }
      }
    }
    
    // Insert practice phrases
    for (const phrase of lesson.practice_phrases) {
      await client.query(
        `INSERT INTO practice_phrases (lesson_id, jp, en, romaji, furigana)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT DO NOTHING`,
        [lessonId, phrase.jp, phrase.en, phrase.romaji, phrase.furigana]
      );
    }
    
    await client.query('COMMIT');
    console.log(`✅ Lesson ${lessonId} imported successfully!`);
    console.log(`   Vocabulary: ${lesson.vocabulary.length}`);
    console.log(`   Grammar patterns: ${lesson.grammar.length}`);
    console.log(`   Practice phrases: ${lesson.practice_phrases.length}`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error:', err.message);
  } finally {
    client.release();
    pool.end();
  }
}

insertLesson();
