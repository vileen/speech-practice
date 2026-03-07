#!/usr/bin/env node
import { pool } from '../src/db/pool.js';

async function fix2025_11_05() {
  console.log('Fixing 2025-11-05: Katakana sa-ta, Verb Groups I and II...');
  
  const fixedLesson = {
    id: '2025-11-05',
    date: '2025-11-05',
    title: 'Katakana: sa-ta, Verb Groups I and II',
    order: 10,
    topics: ['katakana S-row', 'katakana T-row', 'verb group 1', 'verb group 2', 'masu form conjugation'],
    
    vocabulary: [
      // Katakana S-row
      { jp: 'サ', reading: 'sa', en: 'sa (katakana)', tags: ['katakana'] },
      { jp: 'サッカー', reading: 'sakkā', en: 'soccer', tags: ['katakana-word'] },
      { jp: 'サイズ', reading: 'saizu', en: 'size', tags: ['katakana-word'] },
      { jp: 'シ', reading: 'shi', en: 'shi (katakana)', tags: ['katakana'] },
      { jp: 'シャツ', reading: 'shatsu', en: 'shirt', tags: ['katakana-word'] },
      { jp: 'シャワー', reading: 'shawā', en: 'shower', tags: ['katakana-word'] },
      { jp: 'ス', reading: 'su', en: 'su (katakana)', tags: ['katakana'] },
      { jp: 'スキー', reading: 'sukī', en: 'ski', tags: ['katakana-word'] },
      { jp: 'スポーツ', reading: 'supōtsu', en: 'sports', tags: ['katakana-word'] },
      { jp: 'セ', reading: 'se', en: 'se (katakana)', tags: ['katakana'] },
      { jp: 'セーター', reading: 'sētā', en: 'sweater', tags: ['katakana-word'] },
      { jp: 'ソ', reading: 'so', en: 'so (katakana)', tags: ['katakana'] },
      { jp: 'ソース', reading: 'sōsu', en: 'sauce', tags: ['katakana-word'] },
      
      // Katakana T-row
      { jp: 'タ', reading: 'ta', en: 'ta (katakana)', tags: ['katakana'] },
      { jp: 'タクシー', reading: 'takushī', en: 'taxi', tags: ['katakana-word'] },
      { jp: 'チ', reading: 'chi', en: 'chi (katakana)', tags: ['katakana'] },
      { jp: 'チキン', reading: 'chikin', en: 'chicken', tags: ['katakana-word'] },
      { jp: 'チーズ', reading: 'chīzu', en: 'cheese', tags: ['katakana-word'] },
      { jp: 'ツ', reading: 'tsu', en: 'tsu (katakana)', tags: ['katakana'] },
      { jp: 'ツアー', reading: 'tsuā', en: 'tour', tags: ['katakana-word'] },
      { jp: 'テ', reading: 'te', en: 'te (katakana)', tags: ['katakana'] },
      { jp: 'テスト', reading: 'tesuto', en: 'test', tags: ['katakana-word'] },
      { jp: 'テレビ', reading: 'terebi', en: 'TV', tags: ['katakana-word'] },
      { jp: 'ト', reading: 'to', en: 'to (katakana)', tags: ['katakana'] },
      { jp: 'トイレ', reading: 'toire', en: 'toilet', tags: ['katakana-word'] },
      
      // Verbs - Group 2 (Ru-verbs)
      { jp: '見る', reading: 'miru', en: 'to see, to watch', tags: ['verb', 'ru-verb'] },
      { jp: '見ます', reading: 'mimasu', en: 'see/watch (polite)', tags: ['verb', 'ru-verb'] },
      { jp: '見ません', reading: 'mimasen', en: 'do not see/watch (polite)', tags: ['verb', 'ru-verb', 'negative'] },
      { jp: '起きる', reading: 'okiru', en: 'to wake up', tags: ['verb', 'ru-verb'] },
      { jp: '起きます', reading: 'okimasu', en: 'wake up (polite)', tags: ['verb', 'ru-verb'] },
      { jp: '起きません', reading: 'okimasen', en: 'do not wake up (polite)', tags: ['verb', 'ru-verb', 'negative'] },
      { jp: '寝る', reading: 'neru', en: 'to sleep', tags: ['verb', 'ru-verb'] },
      { jp: '寝ます', reading: 'nemasu', en: 'sleep (polite)', tags: ['verb', 'ru-verb'] },
      { jp: '寝ません', reading: 'nemasen', en: 'do not sleep (polite)', tags: ['verb', 'ru-verb', 'negative'] },
      
      // Verbs - Group 1 (U-verbs)
      { jp: '飲む', reading: 'nomu', en: 'to drink', tags: ['verb', 'u-verb'] },
      { jp: '飲みます', reading: 'nomimasu', en: 'drink (polite)', tags: ['verb', 'u-verb'] },
      { jp: '飲みません', reading: 'nomimasen', en: 'do not drink (polite)', tags: ['verb', 'u-verb', 'negative'] },
      { jp: '聞く', reading: 'kiku', en: 'to listen, to ask', tags: ['verb', 'u-verb'] },
      { jp: '聞きます', reading: 'kikimasu', en: 'listen/ask (polite)', tags: ['verb', 'u-verb'] },
      { jp: '聞きません', reading: 'kikimasen', en: 'do not listen/ask (polite)', tags: ['verb', 'u-verb', 'negative'] },
      { jp: '読む', reading: 'yomu', en: 'to read', tags: ['verb', 'u-verb'] },
      { jp: '読みます', reading: 'yomimasu', en: 'read (polite)', tags: ['verb', 'u-verb'] },
      { jp: '読みません', reading: 'yomimasen', en: 'do not read (polite)', tags: ['verb', 'u-verb', 'negative'] },
      { jp: '話す', reading: 'hanasu', en: 'to speak, to talk', tags: ['verb', 'u-verb'] },
      { jp: '話します', reading: 'hanashimasu', en: 'speak (polite)', tags: ['verb', 'u-verb'] },
      { jp: '話しません', reading: 'hanashimasen', en: 'do not speak (polite)', tags: ['verb', 'u-verb', 'negative'] },
      { jp: '帰る', reading: 'kaeru', en: 'to return, to go home', tags: ['verb', 'u-verb'] },
      { jp: '帰ります', reading: 'kaerimasu', en: 'return (polite)', tags: ['verb', 'u-verb'] },
      { jp: '帰りません', reading: 'kaerimasen', en: 'do not return (polite)', tags: ['verb', 'u-verb', 'negative'] },
      { jp: '遊ぶ', reading: 'asobu', en: 'to play', tags: ['verb', 'u-verb'] },
      { jp: '遊びます', reading: 'asobimasu', en: 'play (polite)', tags: ['verb', 'u-verb'] },
      { jp: '遊びません', reading: 'asobimasen', en: 'do not play (polite)', tags: ['verb', 'u-verb', 'negative'] },
      { jp: '作る', reading: 'tsukuru', en: 'to make, to create', tags: ['verb', 'u-verb'] },
      { jp: '作ります', reading: 'tsukurimasu', en: 'make (polite)', tags: ['verb', 'u-verb'] },
      { jp: '作りません', reading: 'tsukurimasen', en: 'do not make (polite)', tags: ['verb', 'u-verb', 'negative'] },
      { jp: '乗る', reading: 'noru', en: 'to ride, to board', tags: ['verb', 'u-verb'] },
      { jp: '乗ります', reading: 'norimasu', en: 'ride (polite)', tags: ['verb', 'u-verb'] },
      { jp: '乗りません', reading: 'norimasen', en: 'do not ride (polite)', tags: ['verb', 'u-verb', 'negative'] },
      { jp: '切る', reading: 'kiru', en: 'to cut', tags: ['verb', 'u-verb'] },
      { jp: '切ります', reading: 'kirimasu', en: 'cut (polite)', tags: ['verb', 'u-verb'] },
      { jp: '切りません', reading: 'kirimasen', en: 'do not cut (polite)', tags: ['verb', 'u-verb', 'negative'] },
      
      // Special kiru (wear)
      { jp: '着る', reading: 'kiru', en: 'to wear (clothes above waist)', tags: ['verb', 'ru-verb'] },
      { jp: '着ます', reading: 'kimasu', en: 'wear (polite)', tags: ['verb', 'ru-verb'] },
      
      // Irregular
      { jp: '来る', reading: 'kuru', en: 'to come', tags: ['verb', 'irregular'] },
      { jp: '来ます', reading: 'kimasu', en: 'come (polite)', tags: ['verb', 'irregular'] },
      { jp: '来ません', reading: 'kimasen', en: 'do not come (polite)', tags: ['verb', 'irregular', 'negative'] },
      { jp: 'する', reading: 'suru', en: 'to do', tags: ['verb', 'irregular'] },
      { jp: 'します', reading: 'shimasu', en: 'do (polite)', tags: ['verb', 'irregular'] },
      { jp: 'しません', reading: 'shimasen', en: 'do not do (polite)', tags: ['verb', 'irregular', 'negative'] },
      
      // Sports
      { jp: 'サッカーする', reading: 'sakkā suru', en: 'to play soccer', tags: ['verb', 'suru-verb'] },
      { jp: '料理する', reading: 'ryōri suru', en: 'to cook', tags: ['verb', 'suru-verb'] },
      
      // Weather
      { jp: '降る', reading: 'furu', en: 'to fall (rain, snow)', tags: ['verb', 'u-verb'] },
      { jp: '降ります', reading: 'furimasu', en: 'fall (polite)', tags: ['verb', 'u-verb'] },
      { jp: '降りません', reading: 'furimasen', en: 'do not fall (polite)', tags: ['verb', 'u-verb', 'negative'] },
    ],
    
    grammar: [
      {
        pattern: 'Katakana S-row: sa-shi-su-se-so (サシスセソ)',
        explanation: `The S-row of katakana:

サ - sa: simple angular
シ - shi: three vertical lines (flatter than ツ!)
ス - su: angular hook
セ - se: like hiragana but angular
ソ - so: two strokes (bottom to top!)

Important: シ vs ツ - direction and proportion differ`,
        examples: [
          { jp: 'サッカー', en: 'sakkā (soccer)' },
          { jp: 'シャツ', en: 'shatsu (shirt)' },
          { jp: 'スキー', en: 'sukī (ski)' },
          { jp: 'セーター', en: 'sētā (sweater)' },
          { jp: 'ソース', en: 'sōsu (sauce)' },
        ]
      },
      {
        pattern: 'Katakana T-row: ta-chi-tsu-te-to (タチツテト)',
        explanation: `The T-row of katakana:

タ - ta: angular with intersection
チ - chi: like hiragana but angular
ツ - tsu: three strokes (taller than シ!)
テ - te: two horizontal + vertical
ト - to: vertical with right hook

Important: シ (shi) is flatter, ツ (tsu) is taller`,
        examples: [
          { jp: 'タクシー', en: 'takushī (taxi)' },
          { jp: 'チキン', en: 'chikin (chicken)' },
          { jp: 'チーズ', en: 'chīzu (cheese)' },
          { jp: 'テスト', en: 'tesuto (test)' },
          { jp: 'テレビ', en: 'terebi (TV)' },
          { jp: 'トイレ', en: 'toire (toilet)' },
        ]
      },
      {
        pattern: 'Verb Group 1 (U-verbs / Godan)',
        explanation: `Group 1 verbs (五段動詞 godan dōshi):

End in: u, ku, gu, su, tsu, nu, bu, mu, ru (but not eru/iru)

Dictionary → Masu form:
- Change final -u to -i + ます
- u → imasu
- ku → kimasu
- su → shimasu
- tsu → chimasu
- nu → nimasu
- bu → bimasu
- mu → mimasu
- ru → rimasu

Examples:
- 飲む → 飲みます
- 話す → 話します
- 待つ → 待ちます`,
        examples: [
          { jp: '飲む → 飲みます', en: 'drink' },
          { jp: '話す → 話します', en: 'speak' },
          { jp: '読む → 読みます', en: 'read' },
          { jp: '帰る → 帰ります', en: 'return' },
          { jp: '遊ぶ → 遊びます', en: 'play' },
          { jp: '作る → 作ります', en: 'make' },
        ]
      },
      {
        pattern: 'Verb Group 2 (Ru-verbs / Ichidan)',
        explanation: `Group 2 verbs (一段動詞 ichidan dōshi):

End in: iru or eru (with some exceptions)

Dictionary → Masu form:
- Simply drop る and add ます
- All ru-verbs conjugate the same way

Examples:
- 食べる → 食べます
- 見る → 見ます
- 起きる → 起きます
- 寝る → 寝ます
- 着る → 着ます

Note: Some iru/eru verbs are actually Group 1 (like 帰る, 切る, 入る, 走る, 知る)`,
        examples: [
          { jp: '食べる → 食べます', en: 'eat' },
          { jp: '見る → 見ます', en: 'see' },
          { jp: '起きる → 起きます', en: 'wake up' },
          { jp: '寝る → 寝ます', en: 'sleep' },
          { jp: 'いる → います', en: 'exist (animate)' },
        ]
      },
      {
        pattern: 'Tricky: Two Kiru Verbs',
        explanation: `Two different verbs both pronounced "kiru":

切る (kiru) - Group 1 (U-verb):
- Meaning: to cut
- Conjugation: 切る → 切ります

着る (kiru) - Group 2 (Ru-verb):
- Meaning: to wear (clothes)
- Conjugation: 着る → 着ます

The kanji distinguishes them! Context usually makes meaning clear.`,
        examples: [
          { jp: 'パンを切る', en: 'cut bread' },
          { jp: 'パンを切ります', en: 'cut bread (polite)' },
          { jp: 'シャツを着る', en: 'wear a shirt' },
          { jp: 'シャツを着ます', en: 'wear a shirt (polite)' },
        ]
      },
      {
        pattern: 'Group 3: Irregular Verbs',
        explanation: `Only two truly irregular verbs:

する (suru) - to do:
- する → します → しません
- Used with many nouns (サッカーする, 勉強する)

来る (kuru) - to come:
- 来る → 来ます → 来ません
- Note: Kanji reading changes!

These must be memorized separately as they don't follow any pattern.`,
        examples: [
          { jp: '勉強する → 勉強します', en: 'study' },
          { jp: 'サッカーする → サッカーします', en: 'play soccer' },
          { jp: '来る → 来ます', en: 'come' },
          { jp: '日本に来ます', en: 'come to Japan' },
        ]
      },
    ],
    
    practice_phrases: [
      'シャツを着ます。',
      'パンを切ります。',
      'サッカーをします。',
      'テレビを見ません。',
      '日本に帰ります。',
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
  
  console.log('✅ 2025-11-05 fixed');
  console.log(`- Vocabulary: ${fixedLesson.vocabulary.length} items`);
  console.log(`- Grammar points: ${fixedLesson.grammar.length}`);
  console.log(`- Practice phrases: ${fixedLesson.practice_phrases.length}`);
}

fix2025_11_05().then(() => process.exit(0)).catch(console.error);
