import { pool } from '../src/db/pool.js';

async function detailedGrammarAudit() {
  const result = await pool.query(
    'SELECT id, title, vocabulary, grammar, practice_phrases FROM lessons ORDER BY id'
  );
  
  console.log('=== DETAILED GRAMMAR AUDIT ===\n');
  console.log('Checking for lessons with ONLY basic particles (は/が/を/に)');
  console.log('when the title suggests more advanced content...\n');
  
  const problematicLessons = [];
  
  for (const row of result.rows) {
    const title = row.title.toLowerCase();
    const grammar = row.grammar || [];
    
    // Skip if no grammar
    if (grammar.length === 0) continue;
    
    // Check if grammar is ONLY basic particles
    const basicPatterns = ['〜は', '〜が', '〜を', '〜に', 'は', 'が', 'を', 'に', 'wa', 'ga', 'wo', 'ni'];
    const hasOnlyBasicParticles = grammar.every((g: any) => 
      basicPatterns.some(bp => g.pattern?.includes(bp))
    );
    
    // Check if title suggests advanced content
    const suggestsAdvanced = 
      title.includes('appearance') ||
      title.includes('weather') ||
      title.includes('clothing') ||
      title.includes('comparison') ||
      title.includes('te-form') ||
      title.includes('adjective') ||
      title.includes('location') ||
      title.includes('frequency') ||
      title.includes('verb') ||
      title.includes('particle') ||
      title.includes('dictionary') ||
      title.includes('existence');
    
    if (hasOnlyBasicParticles && suggestsAdvanced) {
      problematicLessons.push({
        id: row.id,
        title: row.title,
        grammarPatterns: grammar.map((g: any) => g.pattern),
        grammarCount: grammar.length
      });
    }
  }
  
  if (problematicLessons.length === 0) {
    console.log('✅ No problematic lessons found!');
  } else {
    console.log(`❌ Found ${problematicLessons.length} lessons with mismatched grammar:\n`);
    for (const lesson of problematicLessons) {
      console.log(`Lesson: ${lesson.id} - ${lesson.title}`);
      console.log(`  Grammar patterns: ${lesson.grammarPatterns.join(', ')}`);
      console.log('');
    }
  }
  
  await pool.end();
}

detailedGrammarAudit().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});
