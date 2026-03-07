import { pool } from '../src/db/pool.js';

async function finalAudit() {
  const result = await pool.query(
    'SELECT id, title, vocabulary, grammar, practice_phrases FROM lessons ORDER BY id'
  );
  
  console.log('=== FINAL COMPREHENSIVE AUDIT ===\n');
  
  let passed = 0;
  let failed = 0;
  const failures = [];
  
  for (const row of result.rows) {
    const title = row.title.toLowerCase();
    const grammar = row.grammar || [];
    const practice = row.practice_phrases || [];
    
    // Check 1: Has grammar
    const hasGrammar = grammar.length > 0;
    
    // Check 2: Has practice
    const hasPractice = practice.length > 0;
    
    // Check 3: Grammar matches title (basic check)
    let grammarMatches = true;
    const grammarPatterns = grammar.map((g: any) => g.pattern?.toLowerCase() || '');
    
    // If title suggests advanced topic but grammar is only basic particles
    const advancedTopics = ['comparison', 'te-form', 'adjective', 'verb', 'appearance', 'weather', 'location', 'frequency', 'existence', 'particle'];
    const isAdvancedLesson = advancedTopics.some(t => title.includes(t));
    const hasOnlyBasicParticles = grammar.every((g: any) => 
      ['〜は', '〜が', '〜を', 'は', 'が', 'を'].includes(g.pattern)
    );
    
    if (isAdvancedLesson && hasOnlyBasicParticles && grammar.length <= 2) {
      grammarMatches = false;
    }
    
    const status = hasGrammar && hasPractice && grammarMatches ? '✅' : '❌';
    
    if (hasGrammar && hasPractice && grammarMatches) {
      passed++;
    } else {
      failed++;
      failures.push({
        id: row.id,
        title: row.title,
        issues: [
          !hasGrammar && 'no grammar',
          !hasPractice && 'no practice',
          !grammarMatches && 'wrong grammar'
        ].filter(Boolean)
      });
    }
    
    console.log(`${status} ${row.id}: ${row.title.substring(0, 50)}`);
    console.log(`   G:${grammar.length} P:${practice.length} ${grammar.slice(0, 2).map((g: any) => g.pattern).join(', ')}`);
  }
  
  console.log('\n========================================');
  console.log(`PASSED: ${passed}/${result.rows.length} (${Math.round(passed/result.rows.length*100)}%)`);
  console.log(`FAILED: ${failed}/${result.rows.length}`);
  console.log('========================================');
  
  if (failures.length > 0) {
    console.log('\nFailed lessons:');
    for (const f of failures) {
      console.log(`  • ${f.id}: ${f.issues.join(', ')}`);
    }
  } else {
    console.log('\n✅ ALL LESSONS HAVE APPROPRIATE CONTENT!');
  }
  
  await pool.end();
}

finalAudit();
