import { pool } from '../src/db/pool.js';

// All missing furigana from the scan
const fixes: Array<[string, string]> = [
  // 撮 - to take photo
  ['写真', '<ruby>写真<rt>しゃしん</rt></ruby>'],
  ['撮って', '<ruby>撮<rt>と</rt></ruby>って'],
  ['撮', '<ruby>撮<rt>と</rt></ruby>'],
  
  // Lesson 2026-02-23 specific
  ['パソコン', 'パソコン'],
  ['エアコン', 'エアコン'],
  ['リモート', 'リモート'],
  ['ドライヤー', 'ドライヤー'],
  ['モフモフ', 'モフモフ'],
  
  // Common words from the scan
  ['円', '<ruby>円<rt>えん</rt></ruby>'],
  ['歳', '<ruby>歳<rt>さい</rt></ruby>'],
  ['日本', '<ruby>日本<rt>にほん</rt></ruby>'],
  ['人', '<ruby>人<rt>じん</rt></ruby>'],
  ['日本人', '<ruby>日本人<rt>にほんじん</rt></ruby>'],
  ['何', '<ruby>何<rt>なに</rt></ruby>'],
  ['誰', '<ruby>誰<rt>だれ</rt></ruby>'],
  ['本', '<ruby>本<rt>ほん</rt></ruby>'],
  ['高い', '<ruby>高<rt>たか</rt></ruby>い'],
  ['安い', '<ruby>安<rt>やす</rt></ruby>い'],
  ['寿司', '<ruby>寿司<rt>すし</rt></ruby>'],
  ['花', '<ruby>花<rt>はな</rt></ruby>'],
  ['子供', '<ruby>子供<rt>こども</rt></ruby>'],
  ['部屋', '<ruby>部屋<rt>へや</rt></ruby>'],
  ['元気', '<ruby>元気<rt>げんき</rt></ruby>'],
  ['静か', '<ruby>静<rt>しず</rt></ruby>か'],
  ['飲む', 'のむ'], // incorrect kanji, use hiragana
  ['見る', '<ruby>見<rt>み</rt></ruby>る'],
  ['見ます', '<ruby>見<rt>み</rt></ruby>ます'],
  ['映画', '<ruby>映画<rt>えいが</rt></ruby>'],
  ['音楽', '<ruby>音楽<rt>おんがく</rt></ruby>'],
  ['聞く', '<ruby>聞<rt>き</rt></ruby>く'],
  ['日本語', '<ruby>日本語<rt>にほんご</rt></ruby>'],
  ['勉強', '<ruby>勉強<rt>べんきょう</rt></ruby>'],
  ['日本料理', '<ruby>日本料理<rt>にほんりょうり</rt></ruby>'],
  ['雨', '<ruby>雨<rt>あめ</rt></ruby>'],
  ['早起', 'はやおき'],
  ['嫌い', '<ruby>嫌<rt>きら</rt></ruby>い'],
  ['犬', '<ruby>犬<rt>いぬ</rt></ruby>'],
  ['猫', '<ruby>猫<rt>ねこ</rt></ruby>'],
  ['好き', '<ruby>好<rt>す</rt></ruby>き'],
  ['食べる', '<ruby>食<rt>た</rt></ruby>べる'],
  ['食べます', '<ruby>食<rt>た</rt></ruby>べます'],
  ['高', '<ruby>高<rt>たか</rt></ruby>'],
  ['静', '<ruby>静<rt>しず</rt></ruby>'],
  ['腹', '<ruby>腹<rt>はら</rt></ruby>'],
  ['空く', '<ruby>空<rt>あ</rt></ruby>く'],
  ['寒い', '<ruby>寒<rt>さむ</rt></ruby>い'],
  ['着る', '<ruby>着<rt>き</rt></ruby>る'],
  ['買う', '<ruby>買<rt>か</rt></ruby>う'],
  ['私', '<ruby>私<rt>わたし</rt></ruby>'],
  ['学生', '<ruby>学生<rt>がくせい</rt></ruby>'],
  ['朝ご飯', '<ruby>朝<rt>あさ</rt></ruby>ご<ruby>飯<rt>はん</rt></ruby>'],
  ['電車', '<ruby>電車<rt>でんしゃ</rt></ruby>'],
  ['行く', '<ruby>行<rt>い</rt></ruby>く'],
  ['読む', '<ruby>読<rt>よ</rt></ruby>む'],
  ['寝る', '<ruby>寝<rt>ね</rt></ruby>る'],
  ['買い物', '<ruby>買<rt>か</rt></ruby>い<ruby>物<rt>もの</rt></ruby>'],
  ['家', '<ruby>家<rt>いえ</rt></ruby>'],
  ['帰る', '<ruby>帰<rt>かえ</rt></ruby>る'],
  ['映画', '<ruby>映画<rt>えいが</rt></ruby>'],
  ['食事', '<ruby>食事<rt>しょくじ</rt></ruby>'],
  ['教える', '<ruby>教<rt>おし</rt></ruby>える'],
  ['待つ', '<ruby>待<rt>ま</rt></ruby>つ'],
  ['廊下', '<ruby>廊下<rt>ろうか</rt></ruby>'],
  ['走る', '<ruby>走<rt>はし</rt></ruby>る'],
  ['赤い', '<ruby>赤<rt>あか</rt></ruby>い'],
  ['セーター', 'セーター'],
  ['着る', '<ruby>着<rt>き</rt></ruby>る'],
  ['眼鏡', '<ruby>眼鏡<rt>めがね</rt></ruby>'],
  ['かける', 'かける'],
  ['窓', '<ruby>窓<rt>まど</rt></ruby>'],
  ['開く', '<ruby>開<rt>あ</rt></ruby>く'],
  ['電気', '<ruby>電気<rt>でんき</rt></ruby>'],
  ['つく', 'つく'],
  ['黒板', '<ruby>黒板<rt>こくばん</rt></ruby>'],
  ['字', '<ruby>字<rt>じ</rt></ruby>'],
  ['書く', '<ruby>書<rt>か</rt></ruby>く'],
  ['事前', '<ruby>事前<rt>じぜん</rt></ruby>'],
  ['予約', '<ruby>予約<rt>よやく</rt></ruby>'],
  ['黒い', '<ruby>黒<rt>くろ</rt></ruby>い'],
  ['靴', '<ruby>靴<rt>くつ</rt></ruby>'],
  ['はく', 'はく'],
  ['白い', '<ruby>白<rt>しろ</rt></ruby>い'],
  ['シャツ', 'シャツ'],
  ['青い', '<ruby>青<rt>あお</rt></ruby>い'],
  ['ズボン', 'ズボン'],
  ['一月', '<ruby>一月<rt>いちがつ</rt></ruby>'],
  ['一日', '<ruby>一日<rt>ついたち</rt></ruby>'],
  ['頭', '<ruby>頭<rt>あたま</rt></ruby>'],
  ['痛い', '<ruby>痛<rt>いた</rt></ruby>い'],
  ['手', '<ruby>手<rt>て</rt></ruby>'],
  ['小さい', '<ruby>小<rt>ちい</rt></ruby>さい'],
  ['元気', '<ruby>元気<rt>げんき</rt></ruby>'],
  ['降る', '<ruby>降<rt>ふ</rt></ruby>る'],
  ['背', '<ruby>背<rt>せ</rt></ruby>'],
  ['高い', '<ruby>高<rt>たか</rt></ruby>い'],
  ['髪', '<ruby>髪<rt>かみ</rt></ruby>'],
  ['長い', '<ruby>長<rt>なが</rt></ruby>い'],
  ['目', '<ruby>目<rt>め</rt></ruby>'],
  ['大きい', '<ruby>大<rt>おお</rt></ruby>きい'],
  ['晴れ', '<ruby>晴<rt>は</rt></ruby>れ'],
  ['今日', '<ruby>今日<rt>きょう</rt></ruby>'],
  ['明日', '<ruby>明日<rt>あした</rt></ruby>'],
  ['雨', '<ruby>雨<rt>あめ</rt></ruby>'],
  ['曇り', '<ruby>曇<rt>くも</rt></ruby>り'],
  ['会社員', '<ruby>会社員<rt>かいしゃいん</rt></ruby>'],
];

async function fix() {
  for (const [text, html] of fixes) {
    await pool.query(
      `INSERT INTO furigana_cache (original_text, furigana_html) 
       VALUES ($1, $2)
       ON CONFLICT (original_text) DO UPDATE SET furigana_html = EXCLUDED.furigana_html`,
      [text, html]
    );
  }
  
  console.log(`✅ Added ${fixes.length} furigana entries`);
  await pool.end();
}

fix();
