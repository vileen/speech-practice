import { Pool } from 'pg';

const pool = new Pool({ connectionString: 'postgresql://localhost:5432/speech_practice' });

async function test() {
  const result = await pool.query('SELECT practice_phrases FROM lessons WHERE date = $1', ['2026-03-30']);
  const phrases = result.rows[0].practice_phrases;
  console.log('Type:', typeof phrases);
  console.log('Is array:', Array.isArray(phrases));
  console.log('First element type:', typeof phrases[0]);
  console.log('First element:', phrases[0]);
  console.log('All jp fields:', phrases.map((p, i) => ({ i, jp: p?.jp, type: typeof p })));
  await pool.end();
}

test();
