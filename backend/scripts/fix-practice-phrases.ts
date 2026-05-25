import { fileURLToPath } from 'url';
import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pool = new Pool({ connectionString: 'postgresql://localhost:5432/speech_practice' });

const LESSONS_TO_FIX = [
  '2026-03-30', '2026-04-01', '2026-04-08', '2026-04-13',
  '2026-04-15', '2026-04-20', '2026-04-27', '2026-05-01'
];

const lessonsDir = path.join(__dirname, '../src/data/lessons');

async function fixLesson(date: string): Promise<{ date: string; status: string; phrasesFixed: number; error?: string }> {
  try {
    const filePath = path.join(lessonsDir, `${date}.json`);
    const raw = fs.readFileSync(filePath, 'utf-8');
    const lesson = JSON.parse(raw);

    const phrases = lesson.practice_phrases;
    if (!Array.isArray(phrases) || phrases.length === 0) {
      return { date, status: 'SKIPPED', phrasesFixed: 0, error: 'No practice_phrases in JSON' };
    }

    // Validate structure
    const first = phrases[0];
    if (typeof first === 'string') {
      return { date, status: 'ERROR', phrasesFixed: 0, error: 'JSON still has string phrases — need to fix source first' };
    }
    if (!first.jp || !first.en || !first.romaji) {
      return { date, status: 'ERROR', phrasesFixed: 0, error: 'Missing jp/en/romaji fields in JSON' };
    }

    const jsonString = JSON.stringify(phrases);
    const result = await pool.query(
      'UPDATE lessons SET practice_phrases = $1::jsonb WHERE date = $2',
      [jsonString, date]
    );

    if (result.rowCount === 0) {
      return { date, status: 'NOT_FOUND', phrasesFixed: 0 };
    }

    return { date, status: 'OK', phrasesFixed: phrases.length };
  } catch (err: any) {
    return { date, status: 'ERROR', phrasesFixed: 0, error: err.message };
  }
}

async function main() {
  console.log('Fixing practice_phrases in database...\n');
  const results = [];
  for (const date of LESSONS_TO_FIX) {
    const result = await fixLesson(date);
    results.push(result);
    const icon = result.status === 'OK' ? '✅' : result.status === 'SKIPPED' ? '⏭️' : '❌';
    console.log(`${icon} ${date}: ${result.status} (${result.phrasesFixed} phrases)`);
    if (result.error) console.log(`   → ${result.error}`);
  }

  console.log('\n--- Summary ---');
  const ok = results.filter(r => r.status === 'OK').length;
  const errors = results.filter(r => r.status === 'ERROR').length;
  const skipped = results.filter(r => r.status === 'SKIPPED').length;
  console.log(`OK: ${ok}, Errors: ${errors}, Skipped: ${skipped}`);

  await pool.end();
}

main();
