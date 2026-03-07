#!/usr/bin/env node
import { pool } from '../src/db/pool.js';

async function checkVocab() {
  const res = await pool.query('SELECT vocabulary FROM lessons WHERE id = $1', ['2025-10-16']);
  const vocab = res.rows[0].vocabulary;
  
  console.log('=== VOCABULARY ===\n');
  console.log(JSON.stringify(vocab, null, 2));
  
  await pool.end();
}

checkVocab();
