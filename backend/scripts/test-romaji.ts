import { generateRomaji } from '../src/services/romaji.js';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: 'postgresql://localhost:5432/speech_practice' });

async function test() {
  const result = await pool.query('SELECT practice_phrases FROM lessons WHERE date = $1', ['2026-03-30']);
  const phrases = result.rows[0].practice_phrases;
  
  for (let i = 0; i < phrases.length; i++) {
    const p = phrases[i];
    try {
      const romaji = await generateRomaji(p.jp);
      console.log(`✅ ${i}: ${p.jp} -> ${romaji.slice(0, 30)}...`);
    } catch (err: any) {
      console.log(`❌ ${i}: ${p.jp} -> ERROR: ${err.message}`);
    }
  }
  await pool.end();
}

test();
