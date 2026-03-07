import { getLesson } from './src/services/lessons.js';

async function test() {
  const lesson = await getLesson('2026-02-19', true);
  console.log('Vocabulary:');
  for (const v of lesson?.vocabulary || []) {
    console.log(`  ${v.jp} | reading: ${v.reading} | furigana: ${v.furigana}`);
  }
}

test().catch(console.error);
