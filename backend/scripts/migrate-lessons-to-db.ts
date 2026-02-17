#!/usr/bin/env node
/**
 * Migrate lessons from JSON files to PostgreSQL
 * Run: npx tsx scripts/migrate-lessons-to-db.ts
 */

import { readFile } from 'fs/promises';
import { join } from 'path';
import { upsertLesson } from '../src/services/lessons.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const LESSONS_DIR = join(__dirname, '../src/data/lessons');

async function migrateLessons() {
  console.log('🚀 Starting migration...\n');
  
  // Load index to get list of lessons
  const indexPath = join(LESSONS_DIR, 'index.json');
  const indexData = JSON.parse(await readFile(indexPath, 'utf-8'));
  
  console.log(`Found ${indexData.count} lessons to migrate\n`);
  
  let success = 0;
  let failed = 0;
  
  for (const lessonInfo of indexData.lessons) {
    try {
      const lessonPath = join(LESSONS_DIR, `${lessonInfo.id}.json`);
      const lessonData = JSON.parse(await readFile(lessonPath, 'utf-8'));
      
      // Transform to match our interface
      const lesson = {
        id: lessonData.id,
        date: lessonData.date,
        title: lessonData.title,
        order: lessonData.order,
        topics: lessonData.topics || [],
        vocabulary: lessonData.vocabulary || [],
        grammar: lessonData.grammar || [],
        practice_phrases: lessonData.practice_phrases || []
      };
      
      await upsertLesson(lesson);
      console.log(`✅ Migrated: ${lesson.id} - ${lesson.title}`);
      success++;
    } catch (error) {
      console.error(`❌ Failed: ${lessonInfo.id}`, (error as Error).message);
      failed++;
    }
  }
  
  console.log(`\n📊 Migration complete:`);
  console.log(`   Success: ${success}`);
  console.log(`   Failed: ${failed}`);
  console.log(`   Total: ${indexData.count}`);
  
  if (failed === 0) {
    console.log('\n🎉 All lessons migrated successfully!');
    console.log('You can now:');
    console.log('  - Add new lessons without restarting backend');
    console.log('  - Edit lessons on the fly');
    console.log('  - Delete lessons via API');
  }
}

migrateLessons().catch(error => {
  console.error('Migration failed:', error);
  process.exit(1);
});
