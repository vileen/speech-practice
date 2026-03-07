import { pool } from '../src/db/pool.js';

async function verifyLesson(lessonId: string) {
  const result = await pool.query(
    'SELECT id, title, vocabulary, grammar, practice_phrases FROM lessons WHERE id = $1',
    [lessonId]
  );
  
  if (result.rows.length === 0) {
    console.log(`❌ Lesson ${lessonId} not found`);
    await pool.end();
    return;
  }
  
  const lesson = result.rows[0];
  console.log(`\n🔍 VERIFYING: ${lesson.id} - ${lesson.title}\n`);
  
  let passed = true;
  
  // Check 1: Has grammar
  if (!lesson.grammar || lesson.grammar.length === 0) {
    console.log('❌ FAIL: No grammar patterns');
    passed = false;
  } else {
    console.log(`✅ Grammar: ${lesson.grammar.length} patterns`);
    for (const g of lesson.grammar.slice(0, 3)) {
      console.log(`   • ${g.pattern}`);
    }
  }
  
  // Check 2: Has practice phrases
  if (!lesson.practice_phrases || lesson.practice_phrases.length === 0) {
    console.log('❌ FAIL: No practice phrases');
    passed = false;
  } else {
    console.log(`✅ Practice: ${lesson.practice_phrases.length} phrases`);
    for (const p of lesson.practice_phrases.slice(0, 3)) {
      console.log(`   • ${p.jp.substring(0, 40)}...`);
    }
  }
  
  // Check 3: Grammar relevance (basic check)
  const title = lesson.title.toLowerCase();
  const grammarPatterns = lesson.grammar?.map((g: any) => g.pattern.toLowerCase()) || [];
  
  if (title.includes('comparison') && !grammarPatterns.some((p: string) => p.includes('方') || p.includes('中') || p.includes('より'))) {
    console.log('⚠️ WARNING: Comparison lesson but no comparison grammar found');
    passed = false;
  }
  
  if (title.includes('te-form') && !grammarPatterns.some((p: string) => p.includes('て'))) {
    console.log('⚠️ WARNING: TE-form lesson but no TE-form grammar found');
    passed = false;
  }
  
  console.log(`\n${passed ? '✅ VERIFICATION PASSED' : '❌ VERIFICATION FAILED'}`);
  
  await pool.end();
}

const lessonId = process.argv[2];
if (!lessonId) {
  console.log('Usage: npx tsx scripts/verify-lesson.ts <lesson-id>');
  process.exit(1);
}

verifyLesson(lessonId).catch(err => {
  console.error('Verify failed:', err);
  process.exit(1);
});
