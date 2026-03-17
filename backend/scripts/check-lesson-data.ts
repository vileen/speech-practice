import { pool } from '../src/db/pool.js';

async function checkLessonData(lessonId: string) {
  try {
    const result = await pool.query(
      'SELECT practice_phrases FROM lessons WHERE id = $1',
      [lessonId]
    );
    
    if (result.rows.length === 0) {
      console.log(`Lesson ${lessonId} not found`);
      return;
    }
    
    const phrases = result.rows[0].practice_phrases || [];
    console.log(`\nLesson ${lessonId} - Practice Phrases:`);
    console.log(`Total: ${phrases.length}`);
    console.log('\nFirst 5 phrases:');
    phrases.slice(0, 5).forEach((p: any, i: number) => {
      console.log(`${i + 1}. JP: ${p.jp}`);
      console.log(`   EN: ${p.en || '(EMPTY)'}`);
      console.log(`   Romaji: ${p.romaji}`);
      console.log('');
    });
    
    // Check how many have empty en
    const emptyEn = phrases.filter((p: any) => !p.en || p.en === '').length;
    console.log(`Phrases with empty 'en': ${emptyEn}/${phrases.length}`);
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

const lessonId = process.argv[2] || '2026-03-16';
checkLessonData(lessonId);
