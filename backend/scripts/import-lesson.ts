import { pool } from '../src/db/pool.js';

const dateArg = process.argv[2];

if (!dateArg) {
  console.error('Usage: npx tsx scripts/import-lesson.ts YYYY-MM-DD');
  process.exit(1);
}

const lesson = (await import(`../src/data/lessons/${dateArg}.json`, {
  assert: { type: 'json' }
})).default;

async function importLesson() {
  console.log(`Importing lesson ${lesson.id}...\n`);

  try {
    const orderResult = await pool.query('SELECT MAX(order_num) as max_order FROM lessons');
    const orderNum = (orderResult.rows[0]?.max_order || 0) + 1;

    const grammarForDb = lesson.grammar.map((g: any) => ({
      pattern: g.pattern,
      explanation: g.explanation,
      examples: g.examples
    }));

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
        lesson.topics,
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
