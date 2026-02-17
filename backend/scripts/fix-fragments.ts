#!/usr/bin/env node
import { pool } from '../src/db/pool.js';

async function fixFragments() {
  console.log('🧩 Fixing translation fragments...\n');
  
  const result = await pool.query('SELECT id, vocabulary, grammar FROM lessons');
  
  for (const row of result.rows) {
    let needsUpdate = false;
    let vocab = row.vocabulary || [];
    let grammar = row.grammar || [];
    
    // Fix broken partial translations
    vocab = vocab.map((v: any) => {
      const newV = { ...v };
      
      ['reading', 'en'].forEach((field) => {
        if (v[field]) {
          let fixed = v[field]
            // Fix broken words
            .replace(/niewhichch/g, 'some')
            .replace(/whichch/g, 'which')
            .replace(/itchypan/g, 'Japan')
            .replace(/ońców/g, 'characters')
            .replace(/zonków/g, 'characters')
            .replace(/zoncz/g, 'meaning')
            .replace(/zonc/g, 'meaning')
            .replace(/zon/g, 'character')
            .replace(/at\/nearj/g, 'pleas')
            .replace(/at\/near/g, 'example')
            .replace(/at\/ne/g, 'exam')
            .replace(/Góron/g, 'Top')
            .replace(/odczepioon/g, 'detached')
            .replace(/wanon/g, 'bath')
            .replace(/rousOKu/g, 'candle')
            .replace(/z ba/g, 'from behind')
            .replace(/at\/nearszł/g, 'future')
            .replace(/at\/nearkład/g, 'example')
            .replace(/toonri/g, 'next to')
            .replace(/at\/nearjemny/g, 'pleasant')
            .replace(/kour/g, 'ice')
            .replace(/ży/g, 'live')
            .replace(/ludziach/g, 'people')
            .replace(/zwierzętach/g, 'animals')
            .replace(/thing\/objectach/g, 'things')
            .replace(/koło ciebie/g, 'near you')
            .replace(/Mała wersitchy/g, 'Small version')
            .replace(/góry on dół/g, 'top to bottom')
            .replace(/at\/neartupem/g, 'with emphasis')
            .replace(/ogrodzenie/g, 'fence')
            .replace(/dOKąd/g, 'where to')
            .replace(/wybieramy/g, 'we choose')
            .replace(/previousą/g, 'previous')
            .replace(/kuoni/g, 'kunai')
            .replace(/niesmaczny/g, 'not tasty')
            .replace(/drogi/g, 'expensive')
            .replace(/podstawowych/g, 'basic')
            .replace(/Contains/g, 'contains')
            .replace(/Same sounds co/g, 'same sounds as')
            .replace(/hiragaon/g, 'hiragana')
            .replace(/on dół/g, 'down')
            .replace(/dole/g, 'bottom')
            .replace(/ozoncz/g, 'means')
            .replace(/on-ni/g, 'na-ni')
            .replace(/Japaneseon/g, 'Japanese')
            .replace(/minuteses/g, 'minutes')
            .replace(/cut, slice/g, 'cut/slice');
          
          if (fixed !== v[field]) {
            (newV as any)[field] = fixed;
            needsUpdate = true;
          }
        }
      });
      
      return newV;
    });
    
    // Fix grammar
    grammar = grammar.map((g: any) => {
      const newG = { ...g };
      
      if (g.explanation) {
        let fixed = g.explanation
          .replace(/niewhichch/g, 'some')
          .replace(/whichch/g, 'which')
          .replace(/itchypan/g, 'Japan')
          .replace(/ońców/g, 'characters')
          .replace(/zonków/g, 'characters')
          .replace(/zoncz/g, 'meaning')
          .replace(/zonc/g, 'meaning')
          .replace(/zon/g, 'character')
          .replace(/at\/nearj/g, 'pleas')
          .replace(/at\/near/g, 'example')
          .replace(/Góron/g, 'Top')
          .replace(/odczepioon/g, 'detached')
          .replace(/wanon/g, 'bath')
          .replace(/rousOKu/g, 'candle')
          .replace(/z ba/g, 'from behind')
          .replace(/at\/nearszł/g, 'future')
          .replace(/at\/nearkład/g, 'example')
          .replace(/toonri/g, 'next to')
          .replace(/at\/nearjemny/g, 'pleasant')
          .replace(/kour/g, 'ice')
          .replace(/ży/g, 'live')
          .replace(/ludziach/g, 'people')
          .replace(/zwierzętach/g, 'animals')
          .replace(/thing\/objectach/g, 'things')
          .replace(/koło ciebie/g, 'near you')
          .replace(/Mała wersitchy/g, 'Small version')
          .replace(/góry on dół/g, 'top to bottom')
          .replace(/at\/neartupem/g, 'with emphasis')
          .replace(/ogrodzenie/g, 'fence')
          .replace(/dOKąd/g, 'where to')
          .replace(/wybieramy/g, 'we choose')
          .replace(/previousą/g, 'previous')
          .replace(/kuoni/g, 'kunai')
          .replace(/niesmaczny/g, 'not tasty')
          .replace(/drogi/g, 'expensive')
          .replace(/podstawowych/g, 'basic')
          .replace(/hiragaon/g, 'hiragana')
          .replace(/on dół/g, 'down')
          .replace(/dole/g, 'bottom')
          .replace(/ozoncz/g, 'means')
          .replace(/on-ni/g, 'na-ni')
          .replace(/Japaneseon/g, 'Japanese')
          .replace(/minuteses/g, 'minutes')
          .replace(/at\/nearonleżność/g, 'possession')
          .replace(/particle wa\/ga \(topic\/subject\)/g, 'particle wa/ga (topic/subject)');
        
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
            .replace(/niewhichch/g, 'some')
            .replace(/itchypan/g, 'Japan')
            .replace(/ońców/g, 'characters')
            .replace(/zonków/g, 'characters')
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
  
  console.log('\n🎉 Fragment fix complete!');
  await pool.end();
}

fixFragments();
