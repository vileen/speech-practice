#!/usr/bin/env node
import { pool } from '../src/db/pool.js';

async function fix2025_10_01() {
  console.log('Fixing 2025-10-01 properly...');
  const r = await pool.query('SELECT vocabulary FROM lessons WHERE id = $1', ['2025-10-01']);
  const vocab = r.rows[0].vocabulary.map(item => {
    if (item.jp === 'afterlitician') {
      return { ...item, jp: 'politician', en: 'politician (job)' };
    }
    return item;
  });
  
  await pool.query(
    'UPDATE lessons SET vocabulary = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
    [JSON.stringify(vocab), '2025-10-01']
  );
  console.log('✅ 2025-10-01 fixed');
}

fix2025_10_01().then(() => process.exit(0)).catch(console.error);
