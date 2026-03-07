#!/usr/bin/env node
import { pool } from '../src/db/pool.js';
const r = await pool.query('SELECT id, title FROM lessons WHERE id >= $1 ORDER BY id', ['2025-11-03']);
console.log('Recent lessons:');
for (const row of r.rows) console.log(' ', row.id, '-', row.title);
await pool.end();
