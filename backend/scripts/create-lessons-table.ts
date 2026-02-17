#!/usr/bin/env node
/**
 * Create lessons table in PostgreSQL
 * Run: npx tsx scripts/create-lessons-table.ts
 */

import { pool } from '../src/db/pool.js';

async function createTable() {
  console.log('Creating lessons table...\n');
  
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS lessons (
        id VARCHAR(20) PRIMARY KEY,
        date DATE NOT NULL,
        title TEXT NOT NULL,
        order_num INTEGER NOT NULL,
        topics TEXT[] DEFAULT '{}',
        vocabulary JSONB DEFAULT '[]',
        grammar JSONB DEFAULT '[]',
        practice_phrases TEXT[] DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_lessons_order ON lessons(order_num DESC)
    `);
    
    console.log('✅ Lessons table created successfully');
    
    // Verify
    const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'lessons'
    `);
    
    console.log('\nTable structure:');
    result.rows.forEach(row => {
      console.log(`  ${row.column_name}: ${row.data_type}`);
    });
    
  } catch (error) {
    console.error('❌ Failed to create table:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

createTable();
