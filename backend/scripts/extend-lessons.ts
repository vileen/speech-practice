import { pool } from '../src/db/pool.js';

// Extended vocabulary for comparison lessons
const EXTENDED_VOCAB: Record<string, any[]> = {
  '2026-02-11': [  // Comparisons, Preferences, and Days of the Week
    { jp: '月曜日', reading: 'げつようび', romaji: 'getsuyoubi', en: 'Monday', type: 'noun' },
    { jp: '火曜日', reading: 'かようび', romaji: 'kayoubi', en: 'Tuesday', type: 'noun' },
    { jp: '水曜日', reading: 'すいようび', romaji: 'suiyoubi', en: 'Wednesday', type: 'noun' },
    { jp: '木曜日', reading: 'もくようび', romaji: 'mokuyoubi', en: 'Thursday', type: 'noun' },
    { jp: '金曜日', reading: 'きんようび', romaji: 'kinyoubi', en: 'Friday', type: 'noun' },
    { jp: '土曜日', reading: 'どようび', romaji: 'doyoubi', en: 'Saturday', type: 'noun' },
    { jp: '日曜日', reading: 'にちようび', romaji: 'nichiyoubi', en: 'Sunday', type: 'noun' },
    { jp: '週末', reading: 'しゅうまつ', romaji: 'shuumatsu', en: 'weekend', type: 'noun' },
    { jp: '平日', reading: 'へいじつ', romaji: 'heijitsu', en: 'weekday', type: 'noun' },
    { jp: '春', reading: 'はる', romaji: 'haru', en: 'spring', type: 'noun' },
    { jp: '夏', reading: 'なつ', romaji: 'natsu', en: 'summer', type: 'noun' },
    { jp: '秋', reading: 'あき', romaji: 'aki', en: 'autumn/fall', type: 'noun' },
    { jp: '冬', reading: 'ふゆ', romaji: 'fuyu', en: 'winter', type: 'noun' },
    { jp: '季節', reading: 'きせつ', romaji: 'kisetsu', en: 'season', type: 'noun' },
    { jp: '赤', reading: 'あか', romaji: 'aka', en: 'red', type: 'noun' },
    { jp: '青', reading: 'あお', romaji: 'ao', en: 'blue', type: 'noun' },
    { jp: '白', reading: 'しろ', romaji: 'shiro', en: 'white', type: 'noun' },
    { jp: '黒', reading: 'くろ', romaji: 'kuro', en: 'black', type: 'noun' },
    { jp: '肉', reading: 'にく', romaji: 'niku', en: 'meat', type: 'noun' },
    { jp: '魚', reading: 'さかな', romaji: 'sakana', en: 'fish', type: 'noun' },
    { jp: '果物', reading: 'くだもの', romaji: 'kudamono', en: 'fruit', type: 'noun' },
    { jp: '野菜', reading: 'やさい', romaji: 'yasai', en: 'vegetable', type: 'noun' },
    { jp: '〜の方が〜', reading: '〜のほうが〜', romaji: '~no hou ga~', en: '~is more~ than', type: 'grammar' }
  ]
};

// Romaji for grammar patterns
const GRAMMAR_ROMAJI: Record<string, string> = {
  '〜の中で〜が一番〜': '~no naka de ~ga ichiban~',
  '〜より〜の方が〜': '~yori ~no hou ga~',
  '〜の方が〜': '~no hou ga~',
  '〜が一番〜です': '~ga ichiban~ desu',
  '〜と〜と、どちらが〜ですか': '~to ~to, dochira ga~ desu ka',
  'お勧めは何ですか': 'osusume wa nan desu ka',
  '〜て': '~te',
  '〜て、〜': '~te, ~',
  '〜てください': '~te kudasai',
  '〜てもいいです': '~te mo ii desu',
  '〜てもいいですか': '~te mo ii desu ka',
  '〜てはいけません': '~te wa ikemasen',
  'い-adjectives': 'i-adjectives',
  'な-adjectives': 'na-adjectives',
  '〜です (polite)': '~desu (polite)',
  '〜が好きです': '~ga suki desu',
  '〜が嫌いです': '~ga kirai desu',
  'どちらが好きですか': 'dochira ga suki desu ka',
  'あります (inanimate existence)': 'arimasu (inanimate)',
  'います (animate existence)': 'imasu (animate)',
  '〜に (location marker)': '~ni (location)',
  '〜の上に': '~no ue ni',
  '〜の下に': '~no shita ni',
  '〜の中に': '~no naka ni',
  '〜の隣に': '~no tonari ni',
  '〜の近くに': '~no chikaku ni',
  '〜ています (ongoing state)': '~te imasu (ongoing)',
  '〜ています (resultant state)': '~te imasu (resultant)',
  '〜を着ています': '~o kite imasu',
  '〜てあります (deliberate state)': '~te arimasu (deliberate)',
  '〜ておきます (preparation)': '~te okimasu (preparation)',
  '〜そうです (appearance/hearsay)': '~sou desu (appearance)',
  '〜が〜 (physical features)': '~ga~ (physical)',
  '天気': 'tenki',
  '〜人': '~jin/nin',
  'Ru-verbs (Group II)': 'Ru-verbs (Group II)',
  'U-verbs (Group I)': 'U-verbs (Group I)',
  'カタカナ': 'katakana',
  '〜を〜ます': '~o ~masu',
  'を (object marker)': 'o (object marker)',
  'Plain form (dictionary form)': 'Plain form',
  '〜から (because)': '~kara (because)',
  '〜けど (but/however)': '~kedo (but)',
  'いつも (always)': 'itsumo (always)',
  'よく (often)': 'yoku (often)',
  'たまに (occasionally)': 'tamani (occasionally)',
  'あまり〜ません (not much)': 'amari~masen (not much)',
  '〜ませんか (suggestion)': '~masen ka (suggestion)'
};

async function extendLessons() {
  console.log('Extending lessons with additional vocabulary and romaji...\n');
  
  // Add extended vocabulary
  for (const [lessonId, vocab] of Object.entries(EXTENDED_VOCAB)) {
    console.log(`Updating vocabulary for ${lessonId}...`);
    
    await pool.query(
      'UPDATE lessons SET vocabulary = $1::jsonb WHERE id = $2',
      [JSON.stringify(vocab), lessonId]
    );
    console.log(`  ✅ Added ${vocab.length} vocabulary items`);
  }
  
  // Add romaji to all grammar patterns
  console.log('\nAdding romaji to grammar patterns...');
  const lessons = await pool.query('SELECT id, grammar FROM lessons');
  
  for (const row of lessons.rows) {
    const grammar = row.grammar || [];
    let updated = false;
    
    const updatedGrammar = grammar.map((g: any) => {
      if (!g.romaji && GRAMMAR_ROMAJI[g.pattern]) {
        updated = true;
        return { ...g, romaji: GRAMMAR_ROMAJI[g.pattern] };
      }
      return g;
    });
    
    if (updated) {
      await pool.query(
        'UPDATE lessons SET grammar = $1::jsonb WHERE id = $2',
        [JSON.stringify(updatedGrammar), row.id]
      );
      console.log(`  ✅ ${row.id}: Added romaji`);
    }
  }
  
  console.log('\n✅ All extensions complete');
  await pool.end();
}

extendLessons().catch(err => {
  console.error('Failed:', err);
  process.exit(1);
});
