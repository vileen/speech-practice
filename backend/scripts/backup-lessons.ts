import { pool } from '../src/db/pool.js';
import fs from 'fs';
import path from 'path';

async function backupLessons() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const backupFile = path.join('backups', `lessons-${timestamp}.jsonl`);
  
  console.log('Creating backup...');
  
  const result = await pool.query('SELECT * FROM lessons ORDER BY id');
  const writeStream = fs.createWriteStream(backupFile);
  
  for (const row of result.rows) {
    writeStream.write(JSON.stringify(row) + '\n');
  }
  
  writeStream.end();
  await new Promise((resolve, reject) => {
    writeStream.on('finish', resolve);
    writeStream.on('error', reject);
  });
  
  console.log(`✅ Backup created: ${backupFile}`);
  console.log(`   Lessons backed up: ${result.rows.length}`);
  
  await pool.end();
}

backupLessons().catch(err => {
  console.error('Backup failed:', err);
  process.exit(1);
});
