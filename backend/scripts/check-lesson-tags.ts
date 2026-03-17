import { pool } from '../src/db/pool.js';

interface LessonTags {
  id: string;
  title: string;
  topics: string[];
}

async function analyzeLessonTags() {
  try {
    const result = await pool.query(
      'SELECT id, title, topics FROM lessons ORDER BY date DESC'
    );
    
    const lessons: LessonTags[] = result.rows;
    
    console.log(`\n📊 Analyzing ${lessons.length} lessons...\n`);
    
    // Count lessons without tags
    const withoutTags = lessons.filter(l => !l.topics || l.topics.length === 0);
    console.log(`❌ Lessons WITHOUT tags: ${withoutTags.length}`);
    withoutTags.forEach(l => console.log(`   - ${l.id}: ${l.title}`));
    
    // Collect all unique tags
    const allTags = new Set<string>();
    const tagCounts: Record<string, number> = {};
    
    lessons.forEach(l => {
      if (l.topics && Array.isArray(l.topics)) {
        l.topics.forEach(tag => {
          if (tag) {
            allTags.add(tag);
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          }
        });
      }
    });
    
    console.log(`\n🏷️  Unique tags found: ${allTags.size}`);
    console.log('\nTag usage:');
    Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([tag, count]) => {
        console.log(`   ${tag}: ${count} lessons`);
      });
    
    // Check for inconsistent formats
    console.log('\n🔍 Checking for inconsistent tag formats...');
    const variations: Record<string, string[]> = {};
    
    allTags.forEach(tag => {
      const normalized = tag.toLowerCase().trim();
      if (!variations[normalized]) {
        variations[normalized] = [];
      }
      variations[normalized].push(tag);
    });
    
    const inconsistencies = Object.entries(variations)
      .filter(([_, variants]) => variants.length > 1);
    
    if (inconsistencies.length > 0) {
      console.log('\n⚠️  Inconsistent tag formats found:');
      inconsistencies.forEach(([normalized, variants]) => {
        console.log(`   "${normalized}" has variants: ${variants.join(', ')}`);
      });
    } else {
      console.log('   ✅ All tags are consistent');
    }
    
    // Show sample of lessons with tags
    console.log('\n📚 Sample lessons with tags:');
    lessons
      .filter(l => l.topics && l.topics.length > 0)
      .slice(0, 5)
      .forEach(l => {
        console.log(`   ${l.id}: ${l.title}`);
        console.log(`      Tags: [${l.topics.join(', ')}]`);
      });
    
    return { lessons, withoutTags: withoutTags.map(l => l.id), allTags: Array.from(allTags) };
    
  } catch (error) {
    console.error('Error:', error);
    return null;
  } finally {
    await pool.end();
  }
}

analyzeLessonTags();
