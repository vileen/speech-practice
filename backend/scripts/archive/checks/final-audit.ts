import { pool } from '../src/db/pool.js';

async function finalAudit() {
  const result = await pool.query(
    'SELECT id, title, vocabulary, grammar, practice_phrases FROM lessons ORDER BY id'
  );
  
  const summary = {
    total: result.rows.length,
    withGrammar: 0,
    withPractice: 0,
    emptyPractice: [] as string[],
    genericGrammar: [] as string[]
  };
  
  console.log('=== FINAL AUDIT: All 26 Lessons ===\n');
  
  for (const row of result.rows) {
    const grammarCount = row.grammar?.length || 0;
    const practiceCount = row.practice_phrases?.length || 0;
    
    if (grammarCount > 0) summary.withGrammar++;
    if (practiceCount > 0) summary.withPractice++;
    else summary.emptyPractice.push(`${row.id} (${row.title.substring(0, 40)}...)`);
    
    // Check for generic grammar (only は/が in non-beginner lessons)
    const hasOnlyBasicParticles = grammarCount === 2 && 
      row.grammar?.every((g: any) => 
        g.pattern === '〜は' || g.pattern === '〜が' || g.pattern === 'は' || g.pattern === 'が'
      );
    
    if (hasOnlyBasicParticles && !row.title.toLowerCase().includes('introduction') && !row.title.toLowerCase().includes('review')) {
      summary.genericGrammar.push(`${row.id}: ${row.title.substring(0, 40)}`);
    }
    
    const status = practiceCount === 0 ? '❌' : (hasOnlyBasicParticles ? '⚠️' : '✅');
    console.log(`${status} ${row.id}: ${row.title.substring(0, 50)}`);
    console.log(`   Grammar: ${grammarCount} | Practice: ${practiceCount}`);
  }
  
  console.log('\n========================================');
  console.log('SUMMARY');
  console.log('========================================');
  console.log(`Total lessons: ${summary.total}`);
  console.log(`With grammar: ${summary.withGrammar} (${Math.round(summary.withGrammar/summary.total*100)}%)`);
  console.log(`With practice phrases: ${summary.withPractice} (${Math.round(summary.withPractice/summary.total*100)}%)`);
  
  if (summary.emptyPractice.length > 0) {
    console.log(`\n❌ Still empty practice (${summary.emptyPractice.length}):`);
    for (const id of summary.emptyPractice) {
      console.log(`   - ${id}`);
    }
  }
  
  if (summary.genericGrammar.length > 0) {
    console.log(`\n⚠️ Generic grammar only (${summary.genericGrammar.length}):`);
    for (const id of summary.genericGrammar) {
      console.log(`   - ${id}`);
    }
  }
  
  if (summary.emptyPractice.length === 0 && summary.genericGrammar.length === 0) {
    console.log('\n✅ ALL LESSONS HAVE APPROPRIATE CONTENT!');
  }
  
  await pool.end();
}

finalAudit().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});
