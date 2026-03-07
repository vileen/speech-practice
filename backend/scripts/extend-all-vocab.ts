import { pool } from '../src/db/pool.js';

// Extended vocabulary for ALL lessons
const ALL_EXTENDED_VOCAB: Record<string, any[]> = {
  // INTRODUCTION LESSONS
  '2025-10-01': [
    { jp: '私', reading: 'わたし', romaji: 'watashi', en: 'I/me', type: 'pronoun' },
    { jp: 'あなた', reading: 'あなた', romaji: 'anata', en: 'you', type: 'pronoun' },
    { jp: '名前', reading: 'なまえ', romaji: 'namae', en: 'name', type: 'noun' },
    { jp: '先生', reading: 'せんせい', romaji: 'sensei', en: 'teacher', type: 'noun' },
    { jp: '学生', reading: 'がくせい', romaji: 'gakusei', en: 'student', type: 'noun' },
    { jp: '本', reading: 'ほん', romaji: 'hon', en: 'book', type: 'noun' },
    { jp: 'ペン', reading: 'ぺん', romaji: 'pen', en: 'pen', type: 'noun' },
    { jp: '学校', reading: 'がっこう', romaji: 'gakkou', en: 'school', type: 'noun' },
    { jp: '会社', reading: 'かいしゃ', romaji: 'kaisha', en: 'company', type: 'noun' }
  ],
  
  '2025-10-06': [
    { jp: '一', reading: 'いち', romaji: 'ichi', en: 'one', type: 'number' },
    { jp: '二', reading: 'に', romaji: 'ni', en: 'two', type: 'number' },
    { jp: '三', reading: 'さん', romaji: 'san', en: 'three', type: 'number' },
    { jp: '四', reading: 'よん', romaji: 'yon', en: 'four', type: 'number' },
    { jp: '五', reading: 'ご', romaji: 'go', en: 'five', type: 'number' },
    { jp: '六', reading: 'ろく', romaji: 'roku', en: 'six', type: 'number' },
    { jp: '七', reading: 'なな', romaji: 'nana', en: 'seven', type: 'number' },
    { jp: '八', reading: 'はち', romaji: 'hachi', en: 'eight', type: 'number' },
    { jp: '九', reading: 'きゅう', romaji: 'kyuu', en: 'nine', type: 'number' },
    { jp: '十', reading: 'じゅう', romaji: 'juu', en: 'ten', type: 'number' },
    { jp: '百', reading: 'ひゃく', romaji: 'hyaku', en: 'hundred', type: 'number' },
    { jp: '千', reading: 'せん', romaji: 'sen', en: 'thousand', type: 'number' },
    { jp: '万', reading: 'まん', romaji: 'man', en: 'ten thousand', type: 'number' },
    { jp: '円', reading: 'えん', romaji: 'en', en: 'yen', type: 'currency' },
    { jp: '歳', reading: 'さい', romaji: 'sai', en: 'years old', type: 'counter' },
    { jp: '才', reading: 'さい', romaji: 'sai', en: 'years old', type: 'counter' },
    { jp: '何', reading: 'なん', romaji: 'nan', en: 'what', type: 'question' },
    { jp: 'アメリカ', reading: 'あめりか', romaji: 'amerika', en: 'America/USA', type: 'country' },
    { jp: 'イギリス', reading: 'いぎりす', romaji: 'igirisu', en: 'UK/Britain', type: 'country' },
    { jp: '日本', reading: 'にほん', romaji: 'nihon', en: 'Japan', type: 'country' },
    { jp: '人', reading: 'じん', romaji: 'jin', en: 'person/nationality', type: 'suffix' }
  ],
  
  '2025-10-08': [
    { jp: 'これ', reading: 'これ', romaji: 'kore', en: 'this (thing)', type: 'pronoun' },
    { jp: 'それ', reading: 'それ', romaji: 'sore', en: 'that (thing)', type: 'pronoun' },
    { jp: 'あれ', reading: 'あれ', romaji: 'are', en: 'that over there', type: 'pronoun' },
    { jp: 'この', reading: 'この', romaji: 'kono', en: 'this ~', type: 'determiner' },
    { jp: 'その', reading: 'その', romaji: 'sono', en: 'that ~', type: 'determiner' },
    { jp: 'あの', reading: 'あの', romaji: 'ano', en: 'that ~ over there', type: 'determiner' },
    { jp: '誰', reading: 'だれ', romaji: 'dare', en: 'who', type: 'question' },
    { jp: '何', reading: 'なに', romaji: 'nani', en: 'what', type: 'question' },
    { jp: 'どこ', reading: 'どこ', romaji: 'doko', en: 'where', type: 'question' },
    { jp: '電話', reading: 'でんわ', romaji: 'denwa', en: 'telephone', type: 'noun' },
    { jp: '傘', reading: 'かさ', romaji: 'kasa', en: 'umbrella', type: 'noun' },
    { jp: '靴', reading: 'くつ', romaji: 'kutsu', en: 'shoes', type: 'noun' },
    { jp: '紙', reading: 'かみ', romaji: 'kami', en: 'paper', type: 'noun' },
    { jp: '鍵', reading: 'かぎ', romaji: 'kagi', en: 'key', type: 'noun' }
  ],
  
  // More lessons to come...
};

async function extendAllVocab() {
  console.log('Extending vocabulary for all lessons...\n');
  
  let extended = 0;
  
  for (const [lessonId, vocab] of Object.entries(ALL_EXTENDED_VOCAB)) {
    // Get current vocab
    const current = await pool.query('SELECT vocabulary FROM lessons WHERE id = $1', [lessonId]);
    const currentVocab = current.rows[0]?.vocabulary || [];
    
    // Merge, avoiding duplicates by jp
    const existingJp = new Set(currentVocab.map((v: any) => v.jp));
    const newItems = vocab.filter((v: any) => !existingJp.has(v.jp));
    const merged = [...currentVocab, ...newItems];
    
    await pool.query(
      'UPDATE lessons SET vocabulary = $1::jsonb WHERE id = $2',
      [JSON.stringify(merged), lessonId]
    );
    
    console.log(`✅ ${lessonId}: ${currentVocab.length} → ${merged.length} (${newItems.length} new)`);
    extended++;
  }
  
  console.log(`\n✅ Extended ${extended} lessons`);
  await pool.end();
}

extendAllVocab().catch(console.error);
