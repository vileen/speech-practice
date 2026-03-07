import { pool } from '../src/db/pool.js';

// Test the generateFuriganaFromReading function
function generateFuriganaFromReading(jp: string, reading: string | null | undefined): string | null {
  if (!reading || !jp) return null;
  
  const kanjiRegex = /[\u4e00-\u9faf]/;
  if (!kanjiRegex.test(jp)) return null;
  
  let kanjiEnd = 0;
  for (let i = 0; i < jp.length; i++) {
    const char = jp[i];
    if (/[\u4e00-\u9faf]/.test(char)) {
      kanjiEnd = i + 1;
    } else if (/[ぁ-ん]/.test(char)) {
      break;
    }
  }
  
  const kanjiPart = jp.substring(0, kanjiEnd);
  const okurigana = jp.substring(kanjiEnd);
  
  if (kanjiPart.length === 0) return null;
  
  return `<ruby>${kanjiPart}<rt>${reading}</rt></ruby>${okurigana}`;
}

async function test() {
  const testCases = [
    { jp: '好き', reading: 'す' },
    { jp: '美味しい', reading: 'おい' },
    { jp: '高い', reading: 'たか' },
    { jp: '安い', reading: 'やす' },
    { jp: '中', reading: 'なか' },
    { jp: '一番', reading: 'いちばん' }
  ];
  
  console.log('Testing furigana generation:\n');
  for (const tc of testCases) {
    const result = generateFuriganaFromReading(tc.jp, tc.reading);
    console.log(`${tc.jp} (${tc.reading})`);
    console.log(`  -> ${result}`);
    console.log('');
  }
  
  await pool.end();
}

test();
