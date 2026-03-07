import pg from 'pg';
const pool = new pg.Pool({ connectionString: 'postgresql://localhost:5432/speech_practice' });

function generateFuriganaFromReading(jp, reading) {
  if (!reading || !jp) return null;
  if (!/[\u4e00-\u9faf]/.test(jp)) return null;
  
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
  
  return '<ruby>' + kanjiPart + '<rt>' + reading + '</rt></ruby>' + okurigana;
}

async function test() {
  const result = await pool.query('SELECT vocabulary FROM lessons WHERE id = $1', ['2026-02-19']);
  const vocab = result.rows[0]?.vocabulary || [];

  console.log('Vocabulary with generated furigana:\n');
  for (const v of vocab) {
    const generated = generateFuriganaFromReading(v.jp, v.reading);
    console.log(v.jp + ' -> ' + generated);
  }

  await pool.end();
}

test();
