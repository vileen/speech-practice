import { pool } from '../src/db/pool.js';

// Standard tag categories
const STANDARD_TAGS = {
  // Hiragana/Katakana lessons
  hiragana: ['hiragana', 'katakana', 'a-i-u-e-o', 'ka-ki-ku-ke-ko', 'sa-shi-su-se-so', 
             'ta-chi-tsu-te-to', 'na-ni-nu-ne-no', 'ha-hi-fu-he-ho', 'ma-mi-mu-me-mo',
             'ya-yu-yo', 'ra-ri-ru-re-ro', 'wa-wo-n', 'dakuon', 'handakuon'],
  
  // Grammar topics
  grammar: ['grammar', 'particles', 'wa-ga', 'wo-ni-de', 'to-ya', 'kara-made',
            'mo-dake-shika', 'ne-yo', 'plain-form', 'masu-form', 'dictionary-form',
            'te-form', 'ta-form', 'nai-form', 'negative-form', 'past-tense'],
  
  // Verbs
  verbs: ['verbs', 'verb-group-1', 'verb-group-2', 'verb-group-3', 'iru-eru',
          'u-verbs', 'ru-verbs', 'irregular-verbs', 'transitive-intransitive'],
  
  // Adjectives
  adjectives: ['adjectives', 'i-adjectives', 'na-adjectives', 'past-adjectives',
               'negative-adjectives'],
  
  // Expressions
  expressions: ['expressions', 'greetings', 'requests', 'permission', 'prohibition',
                'obligation', 'ability', 'desire', 'comparison', 'superlatives'],
  
  // Vocabulary topics
  vocabulary: ['vocabulary', 'numbers', 'counters', 'time', 'days', 'months',
               'family', 'food', 'drinks', 'places', 'transportation', 'shopping',
               'restaurant', 'hotel', 'directions', 'body-parts', 'clothing',
               'colors', 'weather', 'emotions', 'occupations'],
  
  // Kanji
  kanji: ['kanji', 'kanji-numbers', 'kanji-people', 'kanji-places', 'kanji-time',
          'kanji-nature', 'kanji-actions'],
  
  // Levels
  levels: ['beginner', 'elementary', 'intermediate', 'advanced'],
  
  // Special
  special: ['review', 'test', 'reading', 'listening', 'speaking', 'writing',
            'culture', 'onomatopoeia', 'gairaigo']
};

// Tag mapping for standardization
const TAG_MAPPINGS: Record<string, string> = {
  // Case fixes
  'Preferences': 'preferences',
  'Katakana': 'katakana',
  'TE-form': 'te-form',
  'Loan Words': 'loan-words',
  'Gairaigo': 'gairaigo',
  'Kanji days of the week': 'kanji-time',
  'Question words': 'question-words',
  'Asking Permission': 'asking-permission',
  'Comparisons within groups': 'comparisons',
  'Superlatives': 'superlatives',
  'Asking Preferences': 'asking-preferences',
  'Demonstratives': 'demonstratives',
  'Everyday expressions': 'everyday-expressions',
  'Clothing review': 'clothing-review',
  'Weather expressions': 'weather-expressions',
  'Dialogue reading': 'dialogue-reading',
  'Particles review': 'particles-review',
  'Numbers review': 'numbers-review',
  'Masu form': 'masu-form',
  
  // Grammar fixes
  'mashita': 'past-tense',
  'ta-form': 'past-tense',
  'adjectives past': 'past-adjectives',
  'nakereba narimasen': 'obligation',
  'nakereba': 'obligation',
  'nakeraba narimasen': 'obligation',
  'nakute mo ii': 'permission',
  'nakute mo ii desu': 'permission',
  'dont have to': 'permission',
  'shite wa ikemasen': 'prohibition',
  'must-do': 'obligation',
  'dont have to': 'permission',
  
  // Fix broken tags
  'kanji numbers (1-10:': 'kanji-numbers',
  '000+):': null, // remove
  '** describing appearance (height/weight):': 'describing-appearance',
  '** continuous forms (te+imasu):': 'continuous-forms',
  'comparisons': 'comparison',
  'restaurant scenarios': 'restaurant',
  'giving reasons': 'giving-reasons',
  'counters for people': 'counters',
  'kanji 人 and compounds': 'kanji-people',
  'existence-verbs': 'existence-verbs',
  'existence verbs': 'existence-verbs',
  'plain form': 'plain-form',
  
  // Katakana standardization
  'katakana T-row': 'katakana',
  'katakana R-row': 'katakana',
  'katakana W-row': 'katakana',
  'katakana S-row': 'katakana',
  'katakana M-row': 'katakana',
  'katakana Y-row': 'katakana',
  'katakana N-row': 'katakana',
  'katakana H-row': 'katakana',
  'katakana basics': 'katakana',
  'katakana words': 'katakana',
  
  // Hiragana standardization
  'hiragana R-row': 'hiragana',
  'hiragana W-row': 'hiragana',
  'hiragana N': 'hiragana',
  'a-i-u-e-o': 'hiragana',
  'ka-ki-ku-ke-ko': 'hiragana',
  'dakuon': 'hiragana',
  
  // Misc
  'Setsubun': 'culture',
  'onomatopoeia': 'onomatopoeia',
  'kanji review': 'kanji-review',
  'intermediate': 'intermediate',
  'internet': 'internet',
  'hotel': 'hotel',
  'days-of-week': 'days-of-week',
  'time expressions': 'time-expressions',
};

function standardizeTags(tags: string[]): string[] {
  const standardized = new Set<string>();
  
  for (const tag of tags) {
    if (!tag) continue;
    
    // Check mapping
    const mapped = TAG_MAPPINGS[tag];
    if (mapped === null) {
      // Skip this tag
      continue;
    }
    if (mapped) {
      standardized.add(mapped);
      continue;
    }
    
    // Default: lowercase, trim, replace spaces with hyphens
    const normalized = tag
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9\-]/g, '');
    
    if (normalized && normalized !== '-') {
      standardized.add(normalized);
    }
  }
  
  return Array.from(standardized).sort();
}

// Auto-generate tags based on lesson title
function generateTagsFromTitle(title: string): string[] {
  const tags: string[] = [];
  const lower = title.toLowerCase();
  
  // Check for topics in title
  if (lower.includes('hiragana')) tags.push('hiragana');
  if (lower.includes('katakana')) tags.push('katakana');
  if (lower.includes('kanji')) tags.push('kanji');
  if (lower.includes('past tense') || lower.includes('past-tense')) tags.push('past-tense');
  if (lower.includes('te-form')) tags.push('te-form');
  if (lower.includes('ta-form')) tags.push('ta-form');
  if (lower.includes('nai-form') || lower.includes('negative')) tags.push('negative-form');
  if (lower.includes('masu')) tags.push('masu-form');
  if (lower.includes('adjective')) tags.push('adjectives');
  if (lower.includes('verb')) tags.push('verbs');
  if (lower.includes('particle')) tags.push('particles');
  if (lower.includes('counter')) tags.push('counters');
  if (lower.includes('numbers')) tags.push('numbers');
  if (lower.includes('review')) tags.push('review');
  if (lower.includes('body')) tags.push('body-parts');
  if (lower.includes('clothing')) tags.push('clothing');
  if (lower.includes('weather')) tags.push('weather');
  if (lower.includes('food')) tags.push('food');
  if (lower.includes('family')) tags.push('family');
  if (lower.includes('time')) tags.push('time');
  if (lower.includes('days')) tags.push('days');
  if (lower.includes('comparison') || lower.includes('comparisons')) tags.push('comparison');
  if (lower.includes('preference')) tags.push('preferences');
  if (lower.includes('obligation')) tags.push('obligation');
  if (lower.includes('permission')) tags.push('permission');
  if (lower.includes('plain form')) tags.push('plain-form');
  if (lower.includes('dictionary form')) tags.push('dictionary-form');
  if (lower.includes('internet')) tags.push('internet');
  if (lower.includes('hotel')) tags.push('hotel');
  if (lower.includes('restaurant')) tags.push('restaurant');
  
  return tags;
}

async function standardizeAllTags() {
  try {
    const result = await pool.query(
      'SELECT id, title, topics FROM lessons ORDER BY date DESC'
    );
    
    console.log(`\n📊 Processing ${result.rows.length} lessons...\n`);
    
    let updated = 0;
    let addedTags = 0;
    
    for (const lesson of result.rows) {
      const currentTags = lesson.topics || [];
      
      // Standardize existing tags
      let newTags = standardizeTags(currentTags);
      
      // Add tags based on title if lesson has no tags
      if (newTags.length === 0) {
        const generatedTags = generateTagsFromTitle(lesson.title);
        newTags = [...new Set([...newTags, ...generatedTags])];
        if (generatedTags.length > 0) {
          console.log(`✨ Generated tags for ${lesson.id}: ${generatedTags.join(', ')}`);
          addedTags++;
        }
      }
      
      // Check if changed
      const currentSorted = [...currentTags].sort().join(',');
      const newSorted = newTags.sort().join(',');
      
      if (currentSorted !== newSorted) {
        await pool.query(
          'UPDATE lessons SET topics = $1::text[] WHERE id = $2',
          [newTags, lesson.id]
        );
        console.log(`✅ ${lesson.id}: [${currentTags.join(', ')}] → [${newTags.join(', ')}]`);
        updated++;
      }
    }
    
    console.log(`\n📈 Summary:`);
    console.log(`   Updated: ${updated} lessons`);
    console.log(`   Generated new tags: ${addedTags} lessons`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

standardizeAllTags();
