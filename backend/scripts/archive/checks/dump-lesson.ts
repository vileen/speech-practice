#!/usr/bin/env node
import { pool } from '../src/db/pool.js';

async function dumpLesson(id) {
  const result = await pool.query('SELECT id, title, vocabulary, grammar FROM lessons WHERE id = $1', [id]);
  const lesson = result.rows[0];
  
  console.log(`\n=== ${lesson.id}: ${lesson.title} ===\n`);
  
  console.log('VOCABULARY:');
  for (const item of lesson.vocabulary || []) {
    console.log(`  ${item.jp} | ${item.reading} | ${item.en} | ${item.type || ''}`);
  }
  
  console.log('\nGRAMMAR:');
  for (const item of lesson.grammar || []) {
    console.log(`  Pattern: ${item.pattern}`);
    console.log(`  Explanation: ${item.explanation?.substring(0, 150)}...`);
  }
  
  await pool.end();
}

dumpLesson(process.argv[2] || '2025-10-01').catch(console.error);
