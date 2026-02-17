#!/usr/bin/env node
import { pool } from '../src/db/pool.js';

async function debug() {
  const res = await pool.query('SELECT vocabulary FROM lessons WHERE id = $1', ['2025-10-06']);
  const vocab = res.rows[0]?.vocabulary || [];
  
  for (const v of vocab) {
    if (v.en?.includes('Hatachi')) {
      console.log('EN:', JSON.stringify(v.en));
      console.log('Reading:', JSON.stringify(v.reading));
    }
  }
  
  await pool.end();
}

debug();
