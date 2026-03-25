-- Verb Conjugations for All 34 Verbs
-- Generated for Phase 1 Grammar Setup

-- ============================================
-- GODAN (GROUP 1) VERBS
-- ============================================

-- 書く (to write) - Godan
UPDATE verbs SET 
  masu_form = '書きます',
  te_form = '書いて',
  nai_form = '書かない',
  ta_form = '書いた',
  conditional_form = '書けば',
  potential_form = '書ける',
  passive_form = '書かれる'
WHERE dictionary_form = '書く';

-- 読む (to read) - Godan
UPDATE verbs SET 
  masu_form = '読みます',
  te_form = '読んで',
  nai_form = '読まない',
  ta_form = '読んだ',
  conditional_form = '読めば',
  potential_form = '読める',
  passive_form = '読まれる'
WHERE dictionary_form = '読む';

-- 話す (to speak) - Godan
UPDATE verbs SET 
  masu_form = '話します',
  te_form = '話して',
  nai_form = '話さない',
  ta_form = '話した',
  conditional_form = '話せば',
  potential_form = '話せる',
  passive_form = '話される'
WHERE dictionary_form = '話す';

-- 聞く (to listen) - Godan
UPDATE verbs SET 
  masu_form = '聞きます',
  te_form = '聞いて',
  nai_form = '聞かない',
  ta_form = '聞いた',
  conditional_form = '聞けば',
  potential_form = '聞ける',
  passive_form = '聞かれる'
WHERE dictionary_form = '聞く';

-- 行く (to go) - Godan (exception: 行って not 行いて)
UPDATE verbs SET 
  masu_form = '行きます',
  te_form = '行って',
  nai_form = '行かない',
  ta_form = '行った',
  conditional_form = '行けば',
  potential_form = '行ける',
  passive_form = '行かれる'
WHERE dictionary_form = '行く';

-- 帰る (to return home) - Godan
UPDATE verbs SET 
  masu_form = '帰ります',
  te_form = '帰って',
  nai_form = '帰らない',
  ta_form = '帰った',
  conditional_form = '帰れば',
  potential_form = '帰れる',
  passive_form = '帰られる'
WHERE dictionary_form = '帰る';

-- 入る (to enter) - Godan
UPDATE verbs SET 
  masu_form = '入ります',
  te_form = '入って',
  nai_form = '入らない',
  ta_form = '入った',
  conditional_form = '入れば',
  potential_form = '入れる',
  passive_form = '入られる'
WHERE dictionary_form = '入る';

-- 買う (to buy) - Godan
UPDATE verbs SET 
  masu_form = '買います',
  te_form = '買って',
  nai_form = '買わない',
  ta_form = '買った',
  conditional_form = '買えば',
  potential_form = '買える',
  passive_form = '買われる'
WHERE dictionary_form = '買う';

-- 待つ (to wait) - Godan
UPDATE verbs SET 
  masu_form = '待ちます',
  te_form = '待って',
  nai_form = '待たない',
  ta_form = '待った',
  conditional_form = '待てば',
  potential_form = '待てる',
  passive_form = '待たれる'
WHERE dictionary_form = '待つ';

-- 死ぬ (to die) - Godan
UPDATE verbs SET 
  masu_form = '死にます',
  te_form = '死んで',
  nai_form = '死なない',
  ta_form = '死んだ',
  conditional_form = '死ねば',
  potential_form = '死ねる',
  passive_form = '死なれる'
WHERE dictionary_form = '死ぬ';

-- 遊ぶ (to play) - Godan
UPDATE verbs SET 
  masu_form = '遊びます',
  te_form = '遊んで',
  nai_form = '遊ばない',
  ta_form = '遊んだ',
  conditional_form = '遊べば',
  potential_form = '遊べる',
  passive_form = '遊ばれる'
WHERE dictionary_form = '遊ぶ';

-- 泳ぐ (to swim) - Godan
UPDATE verbs SET 
  masu_form = '泳ぎます',
  te_form = '泳いで',
  nai_form = '泳がない',
  ta_form = '泳いだ',
  conditional_form = '泳げば',
  potential_form = '泳げる',
  passive_form = '泳がれる'
WHERE dictionary_form = '泳ぐ';

-- 知る (to know) - Godan
UPDATE verbs SET 
  masu_form = '知ります',
  te_form = '知って',
  nai_form = '知らない',
  ta_form = '知った',
  conditional_form = '知れば',
  potential_form = '知れる',
  passive_form = '知られる'
WHERE dictionary_form = '知る';

-- 作る (to make) - Godan
UPDATE verbs SET 
  masu_form = '作ります',
  te_form = '作って',
  nai_form = '作らない',
  ta_form = '作った',
  conditional_form = '作れば',
  potential_form = '作れる',
  passive_form = '作られる'
WHERE dictionary_form = '作る';

-- 取る (to take) - Godan
UPDATE verbs SET 
  masu_form = '取ります',
  te_form = '取って',
  nai_form = '取らない',
  ta_form = '取った',
  conditional_form = '取れば',
  potential_form = '取れる',
  passive_form = '取られる'
WHERE dictionary_form = '取る';

-- 働く (to work) - Godan
UPDATE verbs SET 
  masu_form = '働きます',
  te_form = '働いて',
  nai_form = '働かない',
  ta_form = '働いた',
  conditional_form = '働けば',
  potential_form = '働ける',
  passive_form = '働かれる'
WHERE dictionary_form = '働く';

-- 歌う (to sing) - Godan
UPDATE verbs SET 
  masu_form = '歌います',
  te_form = '歌って',
  nai_form = '歌わない',
  ta_form = '歌った',
  conditional_form = '歌えば',
  potential_form = '歌える',
  passive_form = '歌われる'
WHERE dictionary_form = '歌う';

-- 立つ (to stand) - Godan
UPDATE verbs SET 
  masu_form = '立ちます',
  te_form = '立って',
  nai_form = '立たない',
  ta_form = '立った',
  conditional_form = '立てば',
  potential_form = '立てる',
  passive_form = '立たれる'
WHERE dictionary_form = '立つ';

-- 使う (to use) - Godan
UPDATE verbs SET 
  masu_form = '使います',
  te_form = '使って',
  nai_form = '使わない',
  ta_form = '使った',
  conditional_form = '使えば',
  potential_form = '使える',
  passive_form = '使われる'
WHERE dictionary_form = '使う';

-- ============================================
-- ICHIDAN (GROUP 2) VERBS
-- ============================================

-- 食べる (to eat) - Ichidan
UPDATE verbs SET 
  masu_form = '食べます',
  te_form = '食べて',
  nai_form = '食べない',
  ta_form = '食べた',
  conditional_form = '食べれば',
  potential_form = '食べられる',
  passive_form = '食べられる'
WHERE dictionary_form = '食べる';

-- 見る (to see/watch) - Ichidan
UPDATE verbs SET 
  masu_form = '見ます',
  te_form = '見て',
  nai_form = '見ない',
  ta_form = '見た',
  conditional_form = '見れば',
  potential_form = '見られる',
  passive_form = '見られる'
WHERE dictionary_form = '見る';

-- 寝る (to sleep) - Ichidan
UPDATE verbs SET 
  masu_form = '寝ます',
  te_form = '寝て',
  nai_form = '寝ない',
  ta_form = '寝た',
  conditional_form = '寝れば',
  potential_form = '寝られる',
  passive_form = '寝られる'
WHERE dictionary_form = '寝る';

-- 起きる (to wake up) - Ichidan
UPDATE verbs SET 
  masu_form = '起きます',
  te_form = '起きて',
  nai_form = '起きない',
  ta_form = '起きた',
  conditional_form = '起きれば',
  potential_form = '起きられる',
  passive_form = '起きられる'
WHERE dictionary_form = '起きる';

-- 借りる (to borrow) - Ichidan
UPDATE verbs SET 
  masu_form = '借ります',
  te_form = '借りて',
  nai_form = '借りない',
  ta_form = '借りた',
  conditional_form = '借りれば',
  potential_form = '借りられる',
  passive_form = '借りられる'
WHERE dictionary_form = '借りる';

-- 教える (to teach) - Ichidan
UPDATE verbs SET 
  masu_form = '教えます',
  te_form = '教えて',
  nai_form = '教えない',
  ta_form = '教えた',
  conditional_form = '教えれば',
  potential_form = '教えられる',
  passive_form = '教えられる'
WHERE dictionary_form = '教える';

-- 覚える (to remember) - Ichidan
UPDATE verbs SET 
  masu_form = '覚えます',
  te_form = '覚えて',
  nai_form = '覚えない',
  ta_form = '覚えた',
  conditional_form = '覚えれば',
  potential_form = '覚えられる',
  passive_form = '覚えられる'
WHERE dictionary_form = '覚える';

-- 閉める (to close) - Ichidan
UPDATE verbs SET 
  masu_form = '閉めます',
  te_form = '閉めて',
  nai_form = '閉めない',
  ta_form = '閉めた',
  conditional_form = '閉めれば',
  potential_form = '閉められる',
  passive_form = '閉められる'
WHERE dictionary_form = '閉める';

-- 着る (to wear upper body) - Ichidan
UPDATE verbs SET 
  masu_form = '着ます',
  te_form = '着て',
  nai_form = '着ない',
  ta_form = '着た',
  conditional_form = '着れば',
  potential_form = '着られる',
  passive_form = '着られる'
WHERE dictionary_form = '着る';

-- 始める (to begin) - Ichidan
UPDATE verbs SET 
  masu_form = '始めます',
  te_form = '始めて',
  nai_form = '始めない',
  ta_form = '始めた',
  conditional_form = '始めれば',
  potential_form = '始められる',
  passive_form = '始められる'
WHERE dictionary_form = '始める';

-- 出る (to exit) - Ichidan
UPDATE verbs SET 
  masu_form = '出ます',
  te_form = '出て',
  nai_form = '出ない',
  ta_form = '出た',
  conditional_form = '出れば',
  potential_form = '出られる',
  passive_form = '出られる'
WHERE dictionary_form = '出る';

-- ============================================
-- IRREGULAR (GROUP 3) VERBS
-- ============================================

-- 来る (to come) - Irregular
UPDATE verbs SET 
  masu_form = '来ます',
  te_form = '来て',
  nai_form = '来ない',
  ta_form = '来た',
  conditional_form = '来れば',
  potential_form = '来られる',
  passive_form = '来られる'
WHERE dictionary_form = '来る';

-- する (to do) - Irregular
UPDATE verbs SET 
  masu_form = 'します',
  te_form = 'して',
  nai_form = 'しない',
  ta_form = 'した',
  conditional_form = 'すれば',
  potential_form = 'できる',
  passive_form = 'される'
WHERE dictionary_form = 'する';

-- 勉強する (to study) - Irregular (suru compound)
UPDATE verbs SET 
  masu_form = '勉強します',
  te_form = '勉強して',
  nai_form = '勉強しない',
  ta_form = '勉強した',
  conditional_form = '勉強すれば',
  potential_form = '勉強できる',
  passive_form = '勉強される'
WHERE dictionary_form = '勉強する';

-- 電話する (to call by phone) - Irregular (suru compound)
UPDATE verbs SET 
  masu_form = '電話します',
  te_form = '電話して',
  nai_form = '電話しない',
  ta_form = '電話した',
  conditional_form = '電話すれば',
  potential_form = '電話できる',
  passive_form = '電話される'
WHERE dictionary_form = '電話する';
