#!/usr/bin/env node
import { pool } from '../src/db/pool.js';

async function checkRemainingIssues() {
  console.log('🔍 Checking for remaining issues...\n');
  
  const result = await pool.query('SELECT id, title, vocabulary, grammar FROM lessons');
  let issuesFound = 0;
  
  for (const row of result.rows) {
    const vocab = row.vocabulary || [];
    const grammar = row.grammar || [];
    
    // Check vocabulary for Polish text
    for (const v of vocab) {
      const jp = v.jp || '';
      const reading = v.reading || '';
      const en = v.en || '';
      
      // Check for header entries that should be removed
      if (['Znak', 'Czytanie', 'Słówka', 'Przykłady', 'Grupa', 'Wzór', 'Typ', 'Japoński', 'Examples:', 'Pattern:', 'Group:'].includes(jp)) {
        console.log(`${row.id} VOCAB HEADER: "${jp}"`);
        issuesFound++;
      }
      
      // Check for Polish text in reading field
      if (/[ąćęłńóśźż]/.test(reading)) {
        console.log(`${row.id} VOCAB READING PL: "${reading.substring(0, 50)}..."`);
        issuesFound++;
      }
      
      // Check for Polish text in en field
      if (/[ąćęłńóśźż]/.test(en)) {
        console.log(`${row.id} VOCAB EN PL: "${en.substring(0, 50)}..."`);
        issuesFound++;
      }
    }
    
    // Check grammar for Polish text
    for (const g of grammar) {
      const exp = g.explanation || '';
      if (/[ąćęłńóśźż]/.test(exp)) {
        console.log(`${row.id} GRAMMAR PL: "${exp.substring(0, 80)}..."`);
        issuesFound++;
      }
    }
  }
  
  if (issuesFound === 0) {
    console.log('✅ No Polish text found! All clean!');
  } else {
    console.log(`\n⚠️ Found ${issuesFound} issues`);
  }
  
  await pool.end();
}

checkRemainingIssues();
