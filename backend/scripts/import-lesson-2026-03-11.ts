import { pool } from '../src/db/pool.js';
import lesson from '../src/data/lessons/2026-03-11.json';

async function importLesson() {
  console.log(`Importing lesson ${lesson.id}...\n`);
  
  try {
    // Get max order_num
    const orderResult = await pool.query('SELECT MAX(order_num) as max_order FROM lessons');
    const orderNum = (orderResult.rows[0]?.max_order || 0) + 1;
    
    // Prepare grammar with examples as JSON
    const grammarForDb = lesson.grammar.map(g => ({
      pattern: g.pattern,
      explanation: g.explanation,
      examples: g.examples
    }));
    
    // Insert or update lesson
    await pool.query(
      `INSERT INTO lessons (id, date, title, order_num, topics, vocabulary, grammar, practice_phrases)
       VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7::jsonb, $8)
       ON CONFLICT (id) DO UPDATE SET
         date = EXCLUDED.date,
         title = EXCLUDED.title,
         order_num = EXCLUDED.order_num,
         topics = EXCLUDED.topics,
         vocabulary = EXCLUDED.vocabulary,
         grammar = EXCLUDED.grammar,
         practice_phrases = EXCLUDED.practice_phrases,
         updated_at = CURRENT_TIMESTAMP`,
      [
        lesson.id,
        lesson.date,
        lesson.title,
        orderNum,
        ['nakeraba narimasen', 'nakute mo ii', 'shite wa ikemasen', 'kanji review'],
        JSON.stringify(lesson.vocabulary),
        JSON.stringify(grammarForDb),
        JSON.stringify(lesson.practice_phrases)
      ]
    );
    
    console.log('✅ Lesson imported successfully!');
    console.log(`   ID: ${lesson.id}`);
    console.log(`   Title: ${lesson.title}`);
    console.log(`   Date: ${lesson.date}`);
    console.log(`   Vocabulary: ${lesson.vocabulary.length} items`);
    console.log(`   Grammar: ${lesson.grammar.length} patterns`);
    console.log(`   Practice phrases: ${lesson.practice_phrases.length} phrases`);
    
  } catch (error) {
    console.error('❌ Error importing lesson:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

importLesson();
