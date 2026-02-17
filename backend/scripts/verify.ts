#!/usr/bin/env node
import { pool } from '../src/db/pool.js';

async function verify() {
  const res = await pool.query('SELECT grammar FROM lessons WHERE id = $1', ['2025-10-01']);
  const grammar = res.rows[0]?.grammar || [];

  for (const g of grammar) {
    if (g.explanation?.includes('possession') || g.explanation?.includes('connects')) {
      console.log('Pattern:', g.pattern);
      console.log('Explanation:', g.explanation?.substring(0, 150));
      console.log('---');
    }
  }
  await pool.end();
}

verify();
