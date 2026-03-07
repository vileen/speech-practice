#!/usr/bin/env node
import { pool } from '../src/db/pool.js';

async function fix2025_11_12() {
  console.log('Fixing 2025-11-12: Particles, Plain Form, Readings...');
  
  const fixedLesson = {
    id: '2025-11-12',
    date: '2025-11-12',
    title: 'Particles, Plain Form, Readings',
    order: 11,
    topics: ['particles review', 'plain form', 'dialogue reading', 'everyday expressions'],
    
    vocabulary: [
      // Verb forms summary
      { jp: 'Ru-verbs (-iru/-eru)', reading: '-', en: 'Drop -masu, add -ru (tabemasu → taberu)', tags: ['grammar'] },
      { jp: 'U-verbs (-u)', reading: '-', en: 'Change last syllable to u (nomimasu → nomu)', tags: ['grammar'] },
      { jp: 'Irregular', reading: '-', en: 'shimasu → suru, kimasu → kuru', tags: ['grammar'] },
      
      // Greetings and expressions
      { jp: 'お元気ですか？', reading: 'ogenki desu ka', en: 'How are you?', tags: ['expression'] },
      { jp: '元気です', reading: 'genki desu', en: 'I am fine/well', tags: ['expression'] },
      { jp: '気をつけてください', reading: 'ki wo tsukete kudasai', en: 'Please take care/Be careful', tags: ['expression'] },
      { jp: '大丈夫ですか？', reading: 'daijoubu desu ka', en: 'Is everything okay?/Are you alright?', tags: ['expression'] },
      { jp: '大丈夫です', reading: 'daijoubu desu', en: 'Everything is okay/I am alright', tags: ['expression'] },
      { jp: '残念です', reading: 'zannen desu', en: 'That is unfortunate/What a pity', tags: ['expression'] },
      { jp: '本当ですか？', reading: 'hontou desu ka', en: 'Really?/Is that true?', tags: ['expression'] },
      { jp: 'わかりました', reading: 'wakarimashita', en: 'I understand/I got it', tags: ['expression'] },
      
      // Conjunctions and adverbs
      { jp: 'でも', reading: 'demo', en: 'but, however', tags: ['conjunction'] },
      { jp: 'あと', reading: 'ato', en: 'later, after, remaining', tags: ['adverb'] },
      { jp: '一緒に', reading: 'issho ni', en: 'together', tags: ['adverb'] },
      
      // Useful verbs
      { jp: '持っていく', reading: 'motte iku', en: 'to take (something) with', tags: ['verb', 'u-verb'] },
      { jp: '疲れる', reading: 'tsukareru', en: 'to get tired', tags: ['verb', 'ru-verb'] },
      { jp: '気をつける', reading: 'ki wo tsukeru', en: 'to be careful', tags: ['verb', 'ru-verb'] },
      { jp: '帰る', reading: 'kaeru', en: 'to return, go home', tags: ['verb', 'u-verb'] },
      { jp: '会う', reading: 'au', en: 'to meet', tags: ['verb', 'u-verb'] },
      { jp: '出る', reading: 'deru', en: 'to exit, leave', tags: ['verb', 'ru-verb'] },
      { jp: '遊ぶ', reading: 'asobu', en: 'to play', tags: ['verb', 'u-verb'] },
      { jp: '学ぶ', reading: 'manabu', en: 'to study, learn', tags: ['verb', 'u-verb'] },
      
      // House related
      { jp: 'うち', reading: 'uchi', en: 'home, my place (incl. family)', tags: ['noun'] },
      { jp: 'いえ', reading: 'ie', en: 'house (building)', tags: ['noun'] },
      { jp: '家', reading: 'ie/uchi', en: 'house, home', tags: ['kanji'] },
      { jp: '残念', reading: 'zannen', en: 'regrettable, unfortunate', tags: ['na-adjective'] },
      
      // Particles summary
      { jp: 'は', reading: 'wa', en: 'topic marker', tags: ['particle'] },
      { jp: 'が', reading: 'ga', en: 'subject marker', tags: ['particle'] },
      { jp: 'の', reading: 'no', en: 'possession', tags: ['particle'] },
      { jp: 'を', reading: 'wo/o', en: 'direct object', tags: ['particle'] },
      { jp: 'に', reading: 'ni', en: 'time/place/target', tags: ['particle'] },
      { jp: 'へ', reading: 'e', en: 'direction', tags: ['particle'] },
      { jp: 'で', reading: 'de', en: 'place of action, by means of', tags: ['particle'] },
      { jp: 'と', reading: 'to', en: 'together with, and', tags: ['particle'] },
      { jp: 'から', reading: 'kara', en: 'from, because', tags: ['particle'] },
      { jp: 'まで', reading: 'made', en: 'until, to', tags: ['particle'] },
      { jp: 'も', reading: 'mo', en: 'also, too', tags: ['particle'] },
      
      // Time expressions
      { jp: '今日', reading: 'kyou', en: 'today', tags: ['time'] },
      { jp: '明日', reading: 'ashita', en: 'tomorrow', tags: ['time'] },
      { jp: '昨日', reading: 'kinou', en: 'yesterday', tags: ['time'] },
      { jp: '今', reading: 'ima', en: 'now', tags: ['time'] },
      { jp: '後で', reading: 'ato de', en: 'later', tags: ['time'] },
      
      // Weather
      { jp: '天気', reading: 'tenki', en: 'weather', tags: ['noun'] },
      { jp: '雨', reading: 'ame', en: 'rain', tags: ['noun'] },
      { jp: '雪', reading: 'yuki', en: 'snow', tags: ['noun'] },
    ],
    
    grammar: [
      {
        pattern: 'Everyday Expressions',
        explanation: `Common conversational phrases:

お元気ですか？(Ogenki desu ka?) - How are you?
元気です (Genki desu) - I am well

大丈夫ですか？(Daijoubu desu ka?) - Are you okay?
大丈夫です (Daijoubu desu) - I am okay

気をつけてください (Ki wo tsukete kudasai) - Please take care

残念です (Zannen desu) - That's unfortunate

本当ですか？(Hontou desu ka?) - Really?

わかりました (Wakarimashita) - I understand`,
        examples: [
          { jp: 'お元気ですか？', en: 'How are you?' },
          { jp: '元気です。', en: 'I am well.' },
          { jp: '気をつけてください。', en: 'Please take care.' },
          { jp: '残念です。', en: 'That is unfortunate.' },
        ]
      },
      {
        pattern: 'Particle で (de) - Place of Action',
        explanation: `Use で to indicate where an action takes place:

Structure: [place] で [action]

Examples:
- 喫茶店で飲みます (kissaten de nomimasu) - drink at a cafe
- 学校で勉強します (gakkou de benkyou shimasu) - study at school
- 家で寝ます (uchi de nemasu) - sleep at home

Difference from に:
- に = destination/target (going TO somewhere)
- で = location of action (doing something AT somewhere)`,
        examples: [
          { jp: '喫茶店でコーヒーを飲みます。', en: 'I drink coffee at a cafe.' },
          { jp: '学校で日本語を勉強します。', en: 'I study Japanese at school.' },
          { jp: 'うちでテレビを見ます。', en: 'I watch TV at home.' },
          { jp: '図書館で本を読みます。', en: 'I read books at the library.' },
        ]
      },
      {
        pattern: 'Particle も (mo) - Also/Too',
        explanation: `Use も to mean "also" or "too":

Structure: Replace は/が/を with も

Examples:
- 私も (watashi mo) - me too
- 田中さんも (Tanaka-san mo) - Tanaka too
- 寿司も (sushi mo) - sushi too

Note: も replaces the particle, it doesn't add to it!`,
        examples: [
          { jp: '私も学生です。', en: 'I am also a student.' },
          { jp: '田中さんも行きます。', en: 'Tanaka is also going.' },
          { jp: '寿司も好きです。', en: 'I also like sushi.' },
          { jp: 'コーヒーも飲みます。', en: 'I also drink coffee.' },
        ]
      },
      {
        pattern: 'Plain Form Review',
        explanation: `The plain/casual form is used with friends and family:

Ru-verbs: Drop ます, add る
- 食べます → 食べる
- 見ます → 見る

U-verbs: Change masu-ending to u-ending
- 飲みます → 飲む
- 行きます → 行く
- 話します → 話す

Irregular:
- します → する
- 来ます → 来る

Use plain form with close friends, family, or in casual situations!`,
        examples: [
          { jp: '寿司を食べる。', en: 'I eat sushi. (casual)' },
          { jp: '映画を見る。', en: 'I watch movies. (casual)' },
          { jp: '水を飲む。', en: 'I drink water. (casual)' },
          { jp: '日本語を話す。', en: 'I speak Japanese. (casual)' },
        ]
      },
      {
        pattern: 'Sample Dialogue',
        explanation: `A simple conversation:

A: おはようございます。田中先生。
B: おはよう。マヤちゃん。お元気ですか？
A: はい、元気です。
B: 今日はいい天気ですね。
A: はい。でも午後は雨が降るかもしれません。

Translation:
A: Good morning, Tanaka-sensei.
B: Good morning, Maya. How are you?
A: Yes, I am well.
B: The weather is nice today.
A: Yes. But it might rain this afternoon.`,
        examples: [
          { jp: 'おはようございます。', en: 'Good morning.' },
          { jp: 'お元気ですか？', en: 'How are you?' },
          { jp: '元気です。', en: 'I am well.' },
          { jp: 'いい天気ですね。', en: 'Nice weather, isn\'t it?' },
        ]
      },
    ],
    
    practice_phrases: [
      'お元気ですか？',
      '元気です。',
      '気をつけてください。',
      '喫茶店でコーヒーを飲みます。',
      '私も行きます。',
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
  
  console.log('✅ 2025-11-12 fixed');
  console.log(`- Vocabulary: ${fixedLesson.vocabulary.length} items`);
  console.log(`- Grammar points: ${fixedLesson.grammar.length}`);
  console.log(`- Practice phrases: ${fixedLesson.practice_phrases.length}`);
}

fix2025_11_12().then(() => process.exit(0)).catch(console.error);
