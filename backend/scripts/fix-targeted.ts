#!/usr/bin/env node
import { pool } from '../src/db/pool.js';

async function targetedFix() {
  console.log('🎯 Targeted fix for remaining issues...\n');
  
  const result = await pool.query('SELECT id, vocabulary, grammar FROM lessons');
  
  for (const row of result.rows) {
    let needsUpdate = false;
    let vocab = row.vocabulary || [];
    let grammar = row.grammar || [];
    
    // Fix vocabulary
    vocab = vocab.map((v: any) => {
      const newV = { ...v };
      if (v.en) {
        let fixed = v.en
          // Fix broken translations
          .replace(/at\/nearkładowe/g, 'Example Vocabulary')
          .replace(/onpoje/g, 'drinks')
          .replace(/słodki ziemniak\/batat/g, 'sweet potato')
          .replace(/smażone mięso/g, 'grilled meat')
          .replace(/swędzący/g, 'itchy')
          .replace(/śnieg/g, 'snow')
          .replace(/zima/g, 'winter')
          .replace(/alterontywa do i/g, 'alternative to ii')
          .replace(/pływać/g, 'swim')
          .replace(/wołać, onzywać/g, 'call, name')
          .replace(/dream\/dream/g, 'dream')
          .replace(/hot water/g, 'hot water')
          .replace(/reservation/g, 'reservation')
          .replace(/middle of night/g, 'middle of night')
          .replace(/rest/g, 'rest')
          .replace(/parents/g, 'parents')
          .replace(/call, name/g, 'call, name');
        
        if (fixed !== v.en) {
          newV.en = fixed;
          needsUpdate = true;
        }
      }
      return newV;
    });
    
    // Fix grammar
    grammar = grammar.map((g: any) => {
      const newG = { ...g };
      if (g.explanation) {
        let fixed = g.explanation
          .replace(/Przeciwieństwa/g, 'Opposites')
          .replace(/Dziękuję/g, 'Thank you')
          .replace(/na-adjectivei/g, 'na-adjectives')
          .replace(/i-adjectivei/g, 'i-adjectives')
          .replace(/Partykuła/g, 'Particle')
          .replace(/przynależność/g, 'possession')
          .replace(/temat/g, 'topic')
          .replace(/podmiot/g, 'subject');
        
        if (fixed !== g.explanation) {
          newG.explanation = fixed;
          needsUpdate = true;
        }
      }
      
      // Fix grammar examples
      if (g.examples && Array.isArray(g.examples)) {
        const newExamples = g.examples.map((ex: any) => ({
          jp: ex.jp,
          en: (ex.en || '')
            .replace(/Dziękuję/g, 'Thank you')
            .replace(/Przepraszam/g, 'Sorry')
            .replace(/na-adjectivei/g, 'na-adjectives')
        }));
        if (JSON.stringify(newExamples) !== JSON.stringify(g.examples)) {
          newG.examples = newExamples;
          needsUpdate = true;
        }
      }
      
      return newG;
    });
    
    if (needsUpdate) {
      await pool.query(
        'UPDATE lessons SET vocabulary = $1, grammar = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
        [JSON.stringify(vocab), JSON.stringify(grammar), row.id]
      );
      console.log(`✅ Fixed: ${row.id}`);
    }
  }
  
  console.log('\n🎉 Targeted fix complete!');
  await pool.end();
}

targetedFix();
