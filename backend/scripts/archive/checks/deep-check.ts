#!/usr/bin/env node
import { pool } from '../src/db/pool.js';

async function deepCheck() {
  const res = await pool.query('SELECT grammar FROM lessons WHERE id = $1', ['2025-10-16']);
  const grammar = res.rows[0].grammar;
  
  console.log('=== FULL GRAMMAR DUMP ===\n');
  console.log(JSON.stringify(grammar, null, 2));
  
  await pool.end();
}

deepCheck();
