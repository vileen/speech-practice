#!/usr/bin/env node
import { pool } from '../src/db/pool.js';

async function fix2025_10_29() {
  console.log('Fixing 2025-10-29: Adjectives, Combining, Questions about Preferences...');
  
  const fixedLesson = {
    id: '2025-10-29',
    date: '2025-10-29',
    title: 'Adjectives: Combining with Nouns, Questions about Preferences',
    order: 8,
    topics: ['i-adjectives with nouns', 'na-adjectives with nouns', 'particles wa/ga', 'asking preferences', 'demonstratives'],
    
    vocabulary: [
      // Adjective + Noun patterns
      { jp: '[い-adjective] + [noun]', reading: '-', en: 'direct connection (no particle)', tags: ['grammar-pattern'] },
      { jp: 'かわいい猫', reading: 'kawaii neko', en: 'cute cat (i-adj + noun)', tags: ['example'] },
      { jp: '[な-adjective] + な + [noun]', reading: '-', en: 'na-adjective needs な before noun', tags: ['grammar-pattern'] },
      { jp: '綺麗な花', reading: 'kirei na hana', en: 'beautiful flower (na-adj + na + noun)', tags: ['example'] },
      { jp: '元気な人', reading: 'genki na hito', en: 'energetic person', tags: ['example'] },
      
      // Particles review
      { jp: 'は', reading: 'wa', en: 'topic marker', tags: ['particle'] },
      { jp: 'が', reading: 'ga', en: 'subject marker (emotions, abilities, likes)', tags: ['particle'] },
      { jp: 'の', reading: 'no', en: 'possession', tags: ['particle'] },
      { jp: 'を', reading: 'wo/o', en: 'direct object marker', tags: ['particle'] },
      { jp: 'に', reading: 'ni', en: 'place/time marker (to, at)', tags: ['particle'] },
      { jp: 'へ', reading: 'e', en: 'direction marker (to)', tags: ['particle'] },
      { jp: 'から', reading: 'kara', en: 'from', tags: ['particle'] },
      { jp: 'まで', reading: 'made', en: 'until, to', tags: ['particle'] },
      { jp: 'と', reading: 'to', en: 'together with, and', tags: ['particle'] },
      
      // Question words
      { jp: 'どっち', reading: 'docchi', en: 'which one (casual, between two)', tags: ['question'] },
      { jp: 'どちら', reading: 'dochira', en: 'which one (polite, between two)', tags: ['question'] },
      { jp: 'どんな', reading: 'donna', en: 'what kind of', tags: ['question'] },
      
      // Useful words
      { jp: 'でも', reading: 'demo', en: 'but, however', tags: ['conjunction'] },
      { jp: 'ずっと', reading: 'zutto', en: 'always, constantly, much (more)', tags: ['adverb'] },
      { jp: 'そば', reading: 'soba', en: 'next to, near, beside', tags: ['noun'] },
      
      // Existence verbs
      { jp: 'います', reading: 'imasu', en: 'to exist (people, animals)', tags: ['verb'] },
      { jp: 'あります', reading: 'arimasu', en: 'to exist (objects, plants)', tags: ['verb'] },
      
      // Demonstratives - place
      { jp: 'ここ', reading: 'koko', en: 'here (near speaker)', tags: ['demonstrative'] },
      { jp: 'そこ', reading: 'soko', en: 'there (near listener)', tags: ['demonstrative'] },
      { jp: 'あそこ', reading: 'asoko', en: 'over there (far from both)', tags: ['demonstrative'] },
      { jp: 'どこ', reading: 'doko', en: 'where', tags: ['question'] },
      
      // More adjectives
      { jp: '大丈夫', reading: 'daijoubu', en: 'okay, alright, safe', tags: ['na-adjective'] },
      { jp: '残念', reading: 'zannen', en: 'regrettable, unfortunate', tags: ['na-adjective'] },
      { jp: '汚い', reading: 'kitanai', en: 'dirty', tags: ['i-adjective'] },
      { jp: '難しい', reading: 'muzukashii', en: 'difficult', tags: ['i-adjective'] },
      { jp: '簡単', reading: 'kantan', en: 'simple, easy', tags: ['na-adjective'] },
      { jp: '大変', reading: 'taihen', en: 'difficult, tiring, serious', tags: ['na-adjective'] },
      { jp: 'つまらない', reading: 'tsumaranai', en: 'boring', tags: ['i-adjective'] },
      { jp: '辛い', reading: 'karai', en: 'spicy, hot (taste)', tags: ['i-adjective'] },
      { jp: '甘い', reading: 'amai', en: 'sweet (taste)', tags: ['i-adjective'] },
      { jp: '温かい', reading: 'atatakai', en: 'warm (touch)', tags: ['i-adjective'] },
      { jp: '涼しい', reading: 'suzushii', en: 'cool, refreshing', tags: ['i-adjective'] },
      { jp: '寒い', reading: 'samui', en: 'cold (weather)', tags: ['i-adjective'] },
      { jp: '暑い', reading: 'atsui', en: 'hot (weather)', tags: ['i-adjective'] },
      { jp: '熱い', reading: 'atsui', en: 'hot (touch)', tags: ['i-adjective'] },
      { jp: '冷たい', reading: 'tsumetai', en: 'cold (touch)', tags: ['i-adjective'] },
      { jp: '痛い', reading: 'itai', en: 'painful, hurts', tags: ['i-adjective'] },
      { jp: '怖い', reading: 'kowai', en: 'scary, afraid', tags: ['i-adjective'] },
      { jp: '可哀想', reading: 'kawaisou', en: 'poor thing, pitiful', tags: ['na-adjective'] },
    ],
    
    grammar: [
      {
        pattern: 'I-adjective + Noun',
        explanation: `I-adjectives connect directly to nouns without any particle:

Structure: [i-adjective] + [noun]

Examples:
- 高い + 山 → 高い山 (takai yama - tall mountain)
- 新しい + 本 → 新しい本 (atarashii hon - new book)
- 可愛い + 猫 → 可愛い猫 (kawaii neko - cute cat)
- 難しい + 問題 → 難しい問題 (muzukashii mondai - difficult problem)`,
        examples: [
          { jp: '高い山', en: 'tall mountain' },
          { jp: '新しい車', en: 'new car' },
          { jp: '可愛い猫', en: 'cute cat' },
          { jp: '難しい日本語', en: 'difficult Japanese' },
        ]
      },
      {
        pattern: 'Na-adjective + Noun',
        explanation: `Na-adjectives need な before the noun:

Structure: [na-adjective] + な + [noun]

Examples:
- 綺麗 + な + 花 → 綺麗な花 (kirei na hana - beautiful flower)
- 元気 + な + 人 → 元気な人 (genki na hito - energetic person)
- 静か + な + 町 → 静かな町 (shizuka na machi - quiet town)

Don't forget the な! Without it, the sentence is ungrammatical.`,
        examples: [
          { jp: '綺麗な花', en: 'beautiful flower' },
          { jp: '元気な人', en: 'energetic person' },
          { jp: '静かな町', en: 'quiet town' },
          { jp: '有名な人', en: 'famous person' },
        ]
      },
      {
        pattern: 'Particle Review: wa vs ga',
        explanation: `は (wa) - Topic marker:
- Marks what the sentence is about
- Known information
- Contrasts with other things

が (ga) - Subject marker:
- Marks grammatical subject
- New information
- Used with emotions, abilities, likes/dislikes

Example:
- 私は寿司が好きです (Watashi wa sushi ga suki desu)
  - "As for me, sushi is liked"
  - は marks topic (me)
  - が marks subject of feeling (sushi)`,
        examples: [
          { jp: '私は学生です。', en: 'I am a student. (topic)' },
          { jp: '私が学生です。', en: 'I am the student. (subject, emphasis)' },
          { jp: '日本語が好きです。', en: 'I like Japanese. (ga with emotion)' },
          { jp: '日本語は難しいです。', en: 'Japanese is difficult. (wa for topic)' },
        ]
      },
      {
        pattern: 'Asking "What kind of...?" (どんな)',
        explanation: `Use どんな to ask about the type/quality of something:

Structure: どんな + [noun]

Examples:
- どんな本？ (donna hon? - what kind of book?)
- どんな人？ (donna hito? - what kind of person?)
- どんな料理？ (donna ryouri? - what kind of food?)

Can be used with both i-adjectives and na-adjectives in response:
- 面白い本です (omoshiroi hon desu - an interesting book)
- 簡単な料理です (kantan na ryouri desu - simple food)`,
        examples: [
          { jp: 'どんな本が好きですか？', en: 'What kind of books do you like?' },
          { jp: 'どんな人ですか？', en: 'What kind of person is he/she?' },
          { jp: 'どんな映画が好きですか？', en: 'What kind of movies do you like?' },
          { jp: '面白い本です。', en: '(They are) interesting books.' },
        ]
      },
      {
        pattern: 'Demonstratives: Place (ここ/そこ/あそこ/どこ)',
        explanation: `Place demonstratives follow the ko-so-a-do pattern:

ここ (koko) - here (near speaker)
そこ (soko) - there (near listener)
あそこ (asoko) - over there (far from both)
どこ (doko) - where

These work exactly like これ/それ/あれ/どれ but for places instead of things.`,
        examples: [
          { jp: 'ここは学校です。', en: 'Here is the school.' },
          { jp: 'そこはどこですか？', en: 'Where is that (place)?' },
          { jp: 'あそこに行きます。', en: 'I go over there.' },
          { jp: '郵便局はどこですか？', en: 'Where is the post office?' },
        ]
      },
      {
        pattern: 'Existence: います vs あります',
        explanation: `Two verbs for "to exist":

います (imasu) - for animate things (people, animals)
あります (arimasu) - for inanimate things (objects, plants)

Structure: [thing] が [place] に います/あります

Examples:
- 猫がいます (neko ga imasu - there is a cat)
- 本があります (hon ga arimasu - there is a book)
- 公園に子供がいます (kouen ni kodomo ga imasu - there are children in the park)`,
        examples: [
          { jp: '犬がいます。', en: 'There is a dog.' },
          { jp: '本があります。', en: 'There is a book.' },
          { jp: '机の上に猫がいます。', en: 'There is a cat on the desk.' },
          { jp: '教室に学生がいます。', en: 'There are students in the classroom.' },
        ]
      },
    ],
    
    practice_phrases: [
      'どんな音楽が好きですか？',
      '静かな町が好きです。',
      '郵便局はどこですか？',
      'ここに本があります。',
      '元気な人が好きです。',
    ]
  };
  
  await pool.query(
    `UPDATE lessons 
     SET title = $1, topics = $2, vocabulary = $3, grammar = $4, practice_phrases = $5, updated_at = CURRENT_TIMESTAMP
     WHERE id = $6`,
    [
      fixedLesson.title,
      fixedLesson.topics,
      JSON.stringify(fixedLesson.vocabulary),
      JSON.stringify(fixedLesson.grammar),
      fixedLesson.practice_phrases,
      fixedLesson.id
    ]
  );
  
  console.log('✅ 2025-10-29 fixed');
  console.log(`- Vocabulary: ${fixedLesson.vocabulary.length} items`);
  console.log(`- Grammar points: ${fixedLesson.grammar.length}`);
  console.log(`- Practice phrases: ${fixedLesson.practice_phrases.length}`);
}

fix2025_10_29().then(() => process.exit(0)).catch(console.error);
