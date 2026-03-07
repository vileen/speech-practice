import { pool } from '../src/db/pool.js';

// Final batch of empty practice lessons
const EMPTY_LESSONS = [
  {
    id: '2025-10-20',
    title: 'Katakana: Introduction, a-i-u-e-o, ka-ki-ku-ke-ko',
    practice: [
      { jp: 'アメリカ人です', en: 'I am American' },
      { jp: 'イギリス人ですか？', en: 'Are you British?' },
      { jp: 'オーストラリア出身です', en: 'I am from Australia' }
    ]
  },
  {
    id: '2025-11-03',
    title: 'Katakana: ra-wa, Dictionary Form, Existence Verbs',
    practice: [
      { jp: 'これは本です', en: 'This is a book' },
      { jp: 'そこに猫がいます', en: 'There is a cat there' },
      { jp: 'ここに本があります', en: 'There is a book here' }
    ]
  },
  {
    id: '2025-11-12',
    title: 'Particles, Plain Form, Readings',
    practice: [
      { jp: '私は学生です', en: 'I am a student (polite)' },
      { jp: '私は学生だ', en: 'I am a student (plain)' },
      { jp: 'これは何ですか？', en: 'What is this?' }
    ]
  },
  {
    id: '2025-12-01',
    title: 'Frequency Adverbs and Suggestions',
    practice: [
      { jp: 'いつも朝ご飯を食べます', en: 'I always eat breakfast' },
      { jp: 'よく映画を見ます', en: 'I often watch movies' },
      { jp: 'たまに外食します', en: 'I occasionally eat out' },
      { jp: '一緒に映画を見ませんか？', en: 'Shall we watch a movie together?' }
    ]
  },
  {
    id: '2025-12-10',
    title: 'Location Words and Positional Phrases',
    practice: [
      { jp: '駅の近くにあります', en: 'It is near the station' },
      { jp: '机の上に本があります', en: 'There is a book on the desk' },
      { jp: '学校の前で待ちます', en: 'I will wait in front of the school' },
      { jp: '銀行の隣にあります', en: 'It is next to the bank' }
    ]
  },
  {
    id: '2025-12-23',
    title: 'TE-form: Describing Appearance and Clothing',
    practice: [
      { jp: '赤いセーターを着ています', en: 'I am wearing a red sweater' },
      { jp: '眼鏡をかけています', en: 'I am wearing glasses' },
      { jp: '長い髪をしています', en: 'I have long hair' }
    ]
  },
  {
    id: '2026-01-28',
    title: 'TE-form Review and State Descriptions',
    practice: [
      { jp: 'ドアが開いています', en: 'The door is open' },
      { jp: 'テレビがついています', en: 'The TV is on' },
      { jp: '電気が消えています', en: 'The light is off' }
    ]
  },
  {
    id: '2026-02-02',
    title: 'Clothing, Colors and Kanji Numbers',
    practice: [
      { jp: '黒い靴をはいています', en: 'I am wearing black shoes' },
      { jp: '白いシャツを着ています', en: 'I am wearing a white shirt' },
      { jp: '青いズボンをはいています', en: 'I am wearing blue pants' }
    ]
  },
  {
    id: '2026-02-04',
    title: 'Days of the Month, Counters and Body Parts',
    practice: [
      { jp: '一月一日です', en: 'It is January 1st' },
      { jp: '頭が痛いです', en: 'I have a headache' },
      { jp: '手が小さいです', en: 'My hands are small' }
    ]
  },
  {
    id: '2026-02-09',
    title: 'Describing Appearance, Weather, and Kanji 人',
    practice: [
      { jp: '今日は晴れです', en: 'Today is sunny' },
      { jp: '明日は雨です', en: 'Tomorrow is rainy' },
      { jp: '背が高いです', en: 'I am tall' }
    ]
  },
  {
    id: '2026-02-11',
    title: 'Comparisons, Preferences, and Days of the Week',
    practice: [
      { jp: '月曜日が一番好きです', en: 'I like Monday the most' },
      { jp: '猫より犬の方が好きです', en: 'I like dogs more than cats' },
      { jp: '週末の中で、土曜日が一番好きです', en: 'Among weekends, I like Saturday the most' }
    ]
  }
];

async function applyFixes() {
  console.log('Fixing final empty practice lessons...\n');
  
  for (const lesson of EMPTY_LESSONS) {
    console.log(`Fixing: ${lesson.id} - ${lesson.title.substring(0, 40)}`);
    
    const result = await pool.query(
      `UPDATE lessons 
       SET practice_phrases = $1::jsonb 
       WHERE id = $2 
       RETURNING id`,
      [JSON.stringify(lesson.practice), lesson.id]
    );
    
    if (result.rowCount && result.rowCount > 0) {
      console.log(`  ✅ Added ${lesson.practice.length} practice phrases`);
    } else {
      console.log(`  ⚠️ Not found`);
    }
  }
  
  console.log('\n✅ All empty practice lessons fixed');
  await pool.end();
}

applyFixes().catch(err => {
  console.error('Fix failed:', err);
  process.exit(1);
});
