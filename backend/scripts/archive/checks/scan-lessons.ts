#!/usr/bin/env node
import { pool } from '../src/db/pool.js';

const issues = [];

function checkText(text, context, lessonId) {
  const problems = [];
  
  // Check for Polish words
  const polishWords = ['krotka', 'dwie', 'lewa', 'prawa', 'czycheape', 'gfrom', 'whatm', 'this', 'after', 'forml', 'meesiac', 'tfrom', 'nabout', 'whatmple', 'menut', 'zabawny', 'Zadnore', 'afterwiaz', 'whatntinue', 'wszystk', 'uzywa', 'fireragnore', 'whatmbining', 'Owrite', 'room/objecty', 'adjectiveoin', 'afterbeforenia', 'fireragaon', 'nigiyaka', 'lively/bustling', 'aloneui', 'mejikai', 'long', 'ononfun', 'Hashifun', 'Roppun', 'Sanpun', 'Nifun', 'Ipun', 'Gozen', 'gfromziny', 'menutherei', 'Pelne', 'zimą', 'miesiąc', 'rok', 'dzień', 'tydzień', 'godzina', 'minuta', 'sekunda'];
  
  for (const word of polishWords) {
    if (text.toLowerCase().includes(word.toLowerCase())) {
      problems.push(`Polish/garbled word: "${word}"`);
    }
  }
  
  // Check for table artifacts
  if (text.includes('---|') || text.includes('|------|') || text.includes('|----------|')) {
    problems.push('Table markdown artifacts');
  }
  
  // Check for random fragments
  const fragments = ['character', 'characteroi', 'Imafterrtant', 'rat', 'afterthisbne', 'tabout', 'kindbout', 'Never in wordsch', 'what kindbout', 'He/She is characteriem'];
  for (const frag of fragments) {
    if (text.includes(frag)) {
      problems.push(`Fragment: "${frag}"`);
    }
  }
  
  if (problems.length > 0) {
    issues.push({
      lessonId,
      context,
      text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
      problems
    });
  }
}

async function scanLessons() {
  const result = await pool.query('SELECT id, title, vocabulary, grammar FROM lessons ORDER BY id');
  
  console.log(`Scanning ${result.rows.length} lessons...\n`);
  
  for (const row of result.rows) {
    // Check vocabulary
    if (row.vocabulary) {
      for (const item of row.vocabulary) {
        if (item.jp) checkText(item.jp, `vocab.jp`, row.id);
        if (item.reading) checkText(item.reading, `vocab.reading`, row.id);
        if (item.en) checkText(item.en, `vocab.en`, row.id);
        if (item.type) checkText(item.type, `vocab.type`, row.id);
      }
    }
    
    // Check grammar
    if (row.grammar) {
      for (const item of row.grammar) {
        if (item.pattern) checkText(item.pattern, `grammar.pattern`, row.id);
        if (item.explanation) checkText(item.explanation, `grammar.explanation`, row.id);
        if (item.examples) {
          for (const ex of item.examples) {
            if (ex.jp) checkText(ex.jp, `grammar.example.jp`, row.id);
            if (ex.en) checkText(ex.en, `grammar.example.en`, row.id);
          }
        }
      }
    }
  }
  
  // Report
  if (issues.length === 0) {
    console.log('✅ All lessons look clean!');
  } else {
    console.log(`Found ${issues.length} issues:\n`);
    
    // Group by lesson
    const byLesson = {};
    for (const issue of issues) {
      if (!byLesson[issue.lessonId]) byLesson[issue.lessonId] = [];
      byLesson[issue.lessonId].push(issue);
    }
    
    for (const [lessonId, lessonIssues] of Object.entries(byLesson)) {
      console.log(`\n📚 Lesson ${lessonId} (${lessonIssues.length} issues):`);
      for (const issue of lessonIssues.slice(0, 5)) {
        console.log(`  [${issue.context}] ${issue.problems.join(', ')}`);
        console.log(`    → "${issue.text}"`);
      }
      if (lessonIssues.length > 5) {
        console.log(`  ... and ${lessonIssues.length - 5} more issues`);
      }
    }
  }
  
  await pool.end();
}

scanLessons().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
