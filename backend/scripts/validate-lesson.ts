import { readFileSync } from 'fs';
import { join } from 'path';

// List of valid/standardized tags
const VALID_TAGS = new Set([
  // Hiragana/Katakana
  'hiragana', 'katakana', 'a-i-u-e-o', 'ka-ki-ku-ke-ko', 'sa-shi-su-se-so',
  'ta-chi-tsu-te-to', 'na-ni-nu-ne-no', 'ha-hi-fu-he-ho', 'ma-mi-mu-me-mo',
  'ya-yu-yo', 'ra-ri-ru-re-ro', 'wa-wo-n', 'dakuon', 'handakuon',
  // Grammar
  'grammar', 'particles', 'wa-ga', 'wo-ni-de', 'to-ya', 'kara-made',
  'mo-dake-shika', 'ne-yo', 'plain-form', 'masu-form', 'dictionary-form',
  'te-form', 'ta-form', 'nai-form', 'negative-form', 'past-tense',
  // Verbs
  'verbs', 'verb-group-1', 'verb-group-2', 'verb-group-3', 'iru-eru',
  'u-verbs', 'ru-verbs', 'irregular-verbs', 'transitive-intransitive',
  // Adjectives
  'adjectives', 'i-adjectives', 'na-adjectives', 'past-adjectives',
  'negative-adjectives',
  // Expressions
  'expressions', 'greetings', 'requests', 'permission', 'prohibition',
  'obligation', 'ability', 'desire', 'comparison', 'superlatives',
  // Vocabulary
  'vocabulary', 'numbers', 'counters', 'time', 'days', 'months',
  'family', 'food', 'drinks', 'places', 'transportation', 'shopping',
  'restaurant', 'hotel', 'directions', 'body-parts', 'clothing',
  'colors', 'weather', 'emotions', 'occupations',
  // Kanji
  'kanji', 'kanji-numbers', 'kanji-people', 'kanji-places', 'kanji-time',
  'kanji-nature', 'kanji-actions',
  // Levels
  'beginner', 'elementary', 'intermediate', 'advanced',
  // Special
  'review', 'test', 'reading', 'listening', 'speaking', 'writing',
  'culture', 'onomatopoeia', 'gairaigo'
]);

interface ValidationError {
  type: 'ERROR' | 'WARNING';
  message: string;
  path: string;
}

function validateLesson(lessonId: string): ValidationError[] {
  const errors: ValidationError[] = [];
  
  try {
    const jsonPath = join(process.cwd(), 'src/data/lessons', `${lessonId}.json`);
    const data = JSON.parse(readFileSync(jsonPath, 'utf-8'));
    
    // Check 1: Practice phrases have EN translations
    if (data.practice_phrases && Array.isArray(data.practice_phrases)) {
      const emptyEn = data.practice_phrases.filter((p: any, idx: number) => {
        if (!p.en || p.en.trim() === '') {
          errors.push({
            type: 'ERROR',
            message: `Practice phrase #${idx + 1} is missing English translation: "${p.jp}"`,
            path: `practice_phrases[${idx}].en`
          });
          return true;
        }
        return false;
      });
      
      if (emptyEn.length > 0) {
        console.error(`\n❌ Found ${emptyEn.length} phrase(s) without English translation!`);
      }
    }
    
    // Check 2: Tags format
    if (data.topics && Array.isArray(data.topics)) {
      data.topics.forEach((tag: string, idx: number) => {
        // Check format (lowercase, hyphenated)
        if (tag !== tag.toLowerCase()) {
          errors.push({
            type: 'WARNING',
            message: `Tag "${tag}" should be lowercase: "${tag.toLowerCase()}"`,
            path: `topics[${idx}]`
          });
        }
        
        if (tag.includes(' ')) {
          errors.push({
            type: 'WARNING',
            message: `Tag "${tag}" contains space, should use hyphen: "${tag.replace(/\s+/g, '-').toLowerCase()}"`,
            path: `topics[${idx}]`
          });
        }
        
        // Check if tag is in standard list
        if (!VALID_TAGS.has(tag.toLowerCase())) {
          errors.push({
            type: 'WARNING',
            message: `Tag "${tag}" is not in standard list. Consider using existing tag or consult before adding new one.`,
            path: `topics[${idx}]`
          });
        }
      });
    }
    
    // Check 3: Required fields
    if (!data.id) {
      errors.push({ type: 'ERROR', message: 'Missing required field: id', path: 'id' });
    }
    if (!data.date) {
      errors.push({ type: 'ERROR', message: 'Missing required field: date', path: 'date' });
    }
    if (!data.title) {
      errors.push({ type: 'ERROR', message: 'Missing required field: title', path: 'title' });
    }
    if (!data.topics || data.topics.length === 0) {
      errors.push({ type: 'WARNING', message: 'No tags/topics specified', path: 'topics' });
    }
    
  } catch (error: any) {
    errors.push({
      type: 'ERROR',
      message: `Failed to read/parse lesson file: ${error.message}`,
      path: 'file'
    });
  }
  
  return errors;
}

// Main
const lessonId = process.argv[2];
if (!lessonId) {
  console.error('Usage: npx tsx scripts/validate-lesson.ts YYYY-MM-DD');
  process.exit(1);
}

console.log(`\n🔍 Validating lesson ${lessonId}...\n`);

const errors = validateLesson(lessonId);

const fatalErrors = errors.filter(e => e.type === 'ERROR');
const warnings = errors.filter(e => e.type === 'WARNING');

if (fatalErrors.length > 0) {
  console.error(`❌ ${fatalErrors.length} ERRORS (must fix before import):`);
  fatalErrors.forEach(e => console.error(`   - ${e.message}`));
}

if (warnings.length > 0) {
  console.warn(`\n⚠️  ${warnings.length} WARNINGS:`);
  warnings.forEach(e => console.warn(`   - ${e.message}`));
}

if (errors.length === 0) {
  console.log('✅ Lesson validation passed!');
  process.exit(0);
} else {
  console.log(`\n📋 See CHECKLIST-ANALIZA-LEKCJI.md for format requirements`);
  process.exit(fatalErrors.length > 0 ? 1 : 0);
}
