import { pool } from '../src/db/pool.js';

const fixes = [
  // 使う - to use
  ['使って', '<ruby>使<rt>つか</rt></ruby>って'],
  ['使う', '<ruby>使<rt>つか</rt></ruby>う'],
  ['使います', '<ruby>使<rt>つか</rt></ruby>います'],
  
  // 行く - to go (irregular te-form)
  ['行って', '<ruby>行<rt>い</rt></ruby>って'],
  ['行く', '<ruby>行<rt>い</rt></ruby>く'],
  
  // 来る - to come
  ['来て', '<ruby>来<rt>き</rt></ruby>て'],
  ['来る', '<ruby>来<rt>く</rt></ruby>る'],
  
  // する - to do
  ['して', 'して'],
  ['する', 'する'],
  
  // 帰る - to return
  ['帰って', '<ruby>帰<rt>かえ</rt></ruby>って'],
  ['帰る', '<ruby>帰<rt>かえ</rt></ruby>る'],
  
  // 入る - to enter
  ['入って', '<ruby>入<rt>はい</rt></ruby>って'],
  ['入る', '<ruby>入<rt>はい</rt></ruby>る'],
  
  // 出る - to exit
  ['出て', '<ruby>出<rt>で</rt></ruby>て'],
  ['出る', '<ruby>出<rt>で</rt></ruby>る'],
  
  // 買う - to buy
  ['買って', '<ruby>買<rt>か</rt></ruby>って'],
  ['買う', '<ruby>買<rt>か</rt></ruby>う'],
  
  // 待つ - to wait
  ['待って', '<ruby>待<rt>ま</rt></ruby>って'],
  ['待つ', '<ruby>待<rt>ま</rt></ruby>つ'],
  
  // 死ぬ - to die
  ['死んで', '<ruby>死<rt>し</rt></ruby>んで'],
  ['死ぬ', '<ruby>死<rt>し</rt></ruby>ぬ'],
  
  // 読む - to read
  ['読んで', '<ruby>読<rt>よ</rt></ruby>んで'],
  ['読む', '<ruby>読<rt>よ</rt></ruby>む'],
  
  // 遊ぶ - to play
  ['遊んで', '<ruby>遊<rt>あそ</rt></ruby>んで'],
  ['遊ぶ', '<ruby>遊<rt>あそ</rt></ruby>ぶ'],
  
  // 泳ぐ - to swim
  ['泳いで', '<ruby>泳<rt>およ</rt></ruby>いで'],
  ['泳ぐ', '<ruby>泳<rt>およ</rt></ruby>ぐ'],
  
  // 話す - to speak
  ['話して', '<ruby>話<rt>はな</rt></ruby>して'],
  ['話す', '<ruby>話<rt>はな</rt></ruby>す'],
  
  // 書く - to write
  ['書いて', '<ruby>書<rt>か</rt></ruby>いて'],
  ['書く', '<ruby>書<rt>か</rt></ruby>く'],
  
  // 聞く - to listen
  ['聞いて', '<ruby>聞<rt>き</rt></ruby>いて'],
  ['聞く', '<ruby>聞<rt>き</rt></ruby>く'],
  
  // 教える - to teach
  ['教えて', '<ruby>教<rt>おし</rt></ruby>えて'],
  ['教える', '<ruby>教<rt>おし</rt></ruby>える'],
  
  // 借りる - to borrow
  ['借りて', '<ruby>借<rt>か</rt></ruby>りて'],
  ['借りる', '<ruby>借<rt>か</rt></ruby>りる'],
  
  // 貸す - to lend
  ['貸して', '<ruby>貸<rt>か</rt></ruby>して'],
  ['貸す', '<ruby>貸<rt>か</rt></ruby>す'],
  
  // 開ける - to open
  ['開けて', '<ruby>開<rt>あ</rt></ruby>けて'],
  ['開ける', '<ruby>開<rt>あ</rt></ruby>ける'],
  
  // 閉める - to close
  ['閉めて', '<ruby>閉<rt>し</rt></ruby>めて'],
  ['閉める', '<ruby>閉<rt>し</rt></ruby>める'],
  
  // 食べる - to eat
  ['食べて', '<ruby>食<rt>た</rt></ruby>べて'],
  ['食べる', '<ruby>食<rt>た</rt></ruby>べる'],
  
  // 見る - to see
  ['見て', '<ruby>見<rt>み</rt></ruby>て'],
  ['見る', '<ruby>見<rt>み</rt></ruby>る'],
  
  // 起きる - to wake up
  ['起きて', '<ruby>起<rt>お</rt></ruby>きて'],
  ['起きる', '<ruby>起<rt>お</rt></ruby>きる'],
  
  // 寝る - to sleep
  ['寝て', '<ruby>寝<rt>ね</rt></ruby>て'],
  ['寝る', '<ruby>寝<rt>ね</rt></ruby>る'],
  
  // 分かる - to understand
  ['分かって', '<ruby>分<rt>わ</rt></ruby>かって'],
  ['分かる', '<ruby>分<rt>わ</rt></ruby>かる'],
  
  // 知る - to know
  ['知って', '<ruby>知<rt>し</rt></ruby>って'],
  ['知る', '<ruby>知<rt>し</rt></ruby>る'],
  
  // 思う - to think
  ['思って', '<ruby>思<rt>おも</rt></ruby>って'],
  ['思う', '<ruby>思<rt>おも</rt></ruby>う'],
  
  // 言う - to say
  ['言って', '<ruby>言<rt>い</rt></ruby>って'],
  ['言う', '<ruby>言<rt>い</rt></ruby>う'],
  
  // 手伝う - to help
  ['手伝って', '<ruby>手伝<rt>てつだ</rt></ruby>って'],
  ['手伝う', '<ruby>手伝<rt>てつだ</rt></ruby>う'],
  
  // 取る - to take
  ['取って', '<ruby>取<rt>と</rt></ruby>って'],
  ['取る', '<ruby>取<rt>と</rt></ruby>る'],
  
  // 撮る - to take photo
  ['撮って', '<ruby>撮<rt>と</rt></ruby>って'],
  ['撮る', '<ruby>撮<rt>と</rt></ruby>る'],
  
  // 洗う - to wash
  ['洗って', '<ruby>洗<rt>あら</rt></ruby>って'],
  ['洗う', '<ruby>洗<rt>あら</rt></ruby>う'],
  
  // 掃除する - to clean
  ['掃除して', '<ruby>掃除<rt>そうじ</rt></ruby>して'],
  ['掃除する', '<ruby>掃除<rt>そうじ</rt></ruby>する'],
  
  // 勉強する - to study
  ['勉強して', '<ruby>勉強<rt>べんきょう</rt></ruby>して'],
  ['勉強する', '<ruby>勉強<rt>べんきょう</rt></ruby>する'],
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
  
  console.log(`✅ Added ${fixes.length} verb forms to furigana cache`);
  await pool.end();
}

fix();
