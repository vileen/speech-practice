#!/usr/bin/env node
import { pool } from '../src/db/pool.js';

async function fixTitles() {
  const translations: Record<string, string> = {
    'Liczby': 'Numbers',
    'Wiek': 'Age',
    'wprowadzenie': 'Introduction',
    'czas': 'Time',
    'rodzina': 'Family',
    'czasowniki': 'Verbs',
    'przeczenia': 'Negations',
    'przymiotniki': 'Adjectives',
    'łączenie': 'Combining',
    'pytania': 'Questions',
    'preferencje': 'Preferences',
    'wiersz': 'Row',
    'udźwięcznienia': 'Voiced sounds',
    'dialogi': 'Dialogues',
    'Adjectivei': 'Adjectives',
    'forma mas': 'masu form'
  };
  
  const result = await pool.query('SELECT id, title FROM lessons');
  for (const row of result.rows) {
    let newTitle = row.title;
    for (const [pl, en] of Object.entries(translations)) {
      newTitle = newTitle.replace(new RegExp(pl, 'gi'), en);
    }
    if (newTitle !== row.title) {
      await pool.query('UPDATE lessons SET title = $1 WHERE id = $2', [newTitle, row.id]);
      console.log(`${row.title} → ${newTitle}`);
    }
  }
  console.log('✅ Titles fixed!');
  await pool.end();
}

fixTitles();
