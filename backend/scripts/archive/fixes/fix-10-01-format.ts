#!/usr/bin/env node
import { pool } from '../src/db/pool.js';

async function fix2025_10_01() {
  console.log('Fixing 2025-10-01 vocabulary format...');
  
  const vocab = [
    // Row 1: hiragana, Row 2: romaji, Row 3: English
    { jp: '元気です', reading: 'genki desu', en: 'I am well/healthy', tags: ['expression'] },
    { jp: 'ゲーム', reading: 'gēmu', en: 'game', tags: ['katakana-word'] },
    { jp: 'スポーツ', reading: 'supōtsu', en: 'sports', tags: ['katakana-word'] },
    { jp: 'ショッピング', reading: 'shoppingu', en: 'shopping', tags: ['katakana-word'] },
    { jp: 'パーティー', reading: 'pātī', en: 'party', tags: ['katakana-word'] },
    { jp: 'ダンス', reading: 'dansu', en: 'dance', tags: ['katakana-word'] },
    { jp: 'パソコン', reading: 'pasokon', en: 'PC, laptop', tags: ['katakana-word'] },
    { jp: 'ナース', reading: 'nāsu', en: 'nurse', tags: ['katakana-word', 'job'] },
    { jp: '看護師', reading: 'kangoshi', en: 'nurse', tags: ['job'] },
    { jp: 'オフィスレディ', reading: 'ofisu redi', en: 'office lady', tags: ['katakana-word', 'job'] },
    { jp: '社長', reading: 'shachō', en: 'company president', tags: ['job'] },
    { jp: '弁護士', reading: 'bengoshi', en: 'lawyer', tags: ['job'] },
    { jp: '政治家', reading: 'seijika', en: 'politician', tags: ['job'] },
    { jp: '家', reading: 'ie', en: 'house', tags: ['noun'] },
    { jp: 'ペン', reading: 'pen', en: 'pen', tags: ['katakana-word'] },
    { jp: '眼鏡', reading: 'megane', en: 'glasses', tags: ['noun'] },
    { jp: '鞄', reading: 'kaban', en: 'bag', tags: ['noun'] },
    { jp: '変', reading: 'hen', en: 'strange, funny, weird', tags: ['na-adjective'] },
    { jp: '綺麗', reading: 'kirei', en: 'pretty, clean', tags: ['na-adjective'] },
    
    // Particle NO possession examples
    { jp: '私の本', reading: 'watashi no hon', en: 'my book', tags: ['example'] },
    { jp: '田中さんのペン', reading: 'tanaka-san no pen', en: 'Tanaka\'s pen', tags: ['example'] },
    { jp: '日本の車', reading: 'nihon no kuruma', en: 'Japanese car', tags: ['example'] },
    { jp: '学校の先生', reading: 'gakkou no sensei', en: 'school teacher', tags: ['example'] },
  ];
  
  await pool.query(
    'UPDATE lessons SET vocabulary = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
    [JSON.stringify(vocab), '2025-10-01']
  );
  
  console.log('✅ 2025-10-01 vocabulary reformatted');
  console.log(`- ${vocab.length} items`);
}

fix2025_10_01().then(() => process.exit(0)).catch(console.error);
