import { pool } from './db/pool.js';
import { addFurigana } from './services/elevenlabs.js';

// Extract all kanji from text
function extractKanji(text: string): string[] {
  const kanjiRegex = /[\u4e00-\u9faf]+/g;
  const matches = text.match(kanjiRegex) || [];
  return [...new Set(matches)];
}

// Extract words with kanji (including okurigana)
function extractWordsWithKanji(text: string): string[] {
  // Match kanji followed by optional hiragana
  const wordRegex = /[\u4e00-\u9faf]+[\u3040-\u309f]*/g;
  const matches = text.match(wordRegex) || [];
  return [...new Set(matches)];
}

async function detectMissingFurigana() {
  console.log('🔍 Scanning all lessons for missing furigana...\n');
  
  // Get all lessons
  const lessonsResult = await pool.query('SELECT id, title, vocabulary, grammar, practice_phrases FROM lessons');
  const lessons = lessonsResult.rows;
  
  const allKanji = new Set<string>();
  const allWords = new Set<string>();
  const missingKanji = new Set<string>();
  const missingWords = new Set<string>();
  
  // Extract all kanji and words from all lessons
  for (const lesson of lessons) {
    // Vocabulary
    for (const vocab of (lesson.vocabulary || [])) {
      const kanji = extractKanji(vocab.jp);
      kanji.forEach(k => allKanji.add(k));
      
      const words = extractWordsWithKanji(vocab.jp);
      words.forEach(w => allWords.add(w));
    }
    
    // Grammar examples
    for (const grammar of (lesson.grammar || [])) {
      for (const ex of (grammar.examples || [])) {
        const kanji = extractKanji(ex.jp);
        kanji.forEach(k => allKanji.add(k));
        
        const words = extractWordsWithKanji(ex.jp);
        words.forEach(w => allWords.add(w));
      }
    }
    
    // Practice phrases
    for (const phrase of (lesson.practice_phrases || [])) {
      const kanji = extractKanji(phrase);
      kanji.forEach(k => allKanji.add(k));
      
      const words = extractWordsWithKanji(phrase);
      words.forEach(w => allWords.add(w));
    }
  }
  
  console.log(`Found ${allKanji.size} unique kanji and ${allWords.size} unique words with kanji`);
  
  // Check which ones are missing from cache
  const cacheResult = await pool.query('SELECT original_text FROM furigana_cache');
  const cachedTexts = new Set(cacheResult.rows.map(r => r.original_text));
  
  for (const kanji of allKanji) {
    if (!cachedTexts.has(kanji)) {
      missingKanji.add(kanji);
    }
  }
  
  for (const word of allWords) {
    if (!cachedTexts.has(word)) {
      missingWords.add(word);
    }
  }
  
  console.log(`\n❌ Missing ${missingKanji.size} kanji:`);
  console.log([...missingKanji].join(', '));
  
  console.log(`\n❌ Missing ${missingWords.size} words with okurigana:`);
  console.log([...missingWords].join(', '));
  
  // Try to generate furigana for missing items
  console.log('\n🔄 Generating furigana for missing items...\n');
  
  let generated = 0;
  let failed = 0;
  
  // First generate for full words (better for okurigana handling)
  for (const word of missingWords) {
    try {
      const furigana = await addFurigana(word);
      if (furigana.includes('<ruby>')) {
        console.log(`✅ ${word} → ${furigana}`);
        generated++;
      } else {
        console.log(`⚠️  ${word} - no furigana generated`);
        failed++;
      }
    } catch (e) {
      console.log(`❌ ${word} - error: ${e}`);
      failed++;
    }
    // Small delay to not overwhelm the API
    await new Promise(r => setTimeout(r, 100));
  }
  
  // Then for individual kanji not covered by words
  for (const kanji of missingKanji) {
    if (!cachedTexts.has(kanji)) {
      try {
        const furigana = await addFurigana(kanji);
        if (furigana.includes('<ruby>')) {
          console.log(`✅ ${kanji} → ${furigana}`);
          generated++;
        } else {
          console.log(`⚠️  ${kanji} - no furigana generated`);
          failed++;
        }
      } catch (e) {
        console.log(`❌ ${kanji} - error: ${e}`);
        failed++;
      }
      await new Promise(r => setTimeout(r, 100));
    }
  }
  
  console.log(`\n📊 Summary: ${generated} generated, ${failed} failed`);
  
  process.exit(0);
}

detectMissingFurigana().catch(e => {
  console.error(e);
  process.exit(1);
});
