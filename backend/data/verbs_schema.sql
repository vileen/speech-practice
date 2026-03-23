-- Verb Mastery System Schema
-- Phase 2 of Japanese Learning Roadmap

-- Main verbs table
CREATE TABLE IF NOT EXISTS verbs (
  id SERIAL PRIMARY KEY,
  dictionary_form VARCHAR(50) NOT NULL,           -- 食べる, 書く, 来る
  reading VARCHAR(50) NOT NULL,                   -- たべる, かく, くる
  meaning TEXT NOT NULL,                          -- English meaning
  verb_group SMALLINT NOT NULL CHECK (verb_group IN (1, 2, 3)), -- Ichi/II/III
  jlpt_level VARCHAR(5) CHECK (jlpt_level IN ('N5', 'N4', 'N3', 'N2', 'N1')),
  
  -- Transitivity
  transitivity VARCHAR(20) CHECK (transitivity IN ('transitive', 'intransitive', 'both')),
  
  -- Related verb pairs (transitive/intransitive)
  pair_verb_id INTEGER REFERENCES verbs(id),
  
  -- Metadata
  is_common BOOLEAN DEFAULT true,
  is_irregular BOOLEAN DEFAULT false,
  
  -- Conjugation stem (for regular verbs)
  stem VARCHAR(50),
  
  -- Full forms for irregular verbs (Group III)
  masu_form VARCHAR(50),
  te_form VARCHAR(50),
  nai_form VARCHAR(50),
  ta_form VARCHAR(50),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Conjugation practice sessions
CREATE TABLE IF NOT EXISTS verb_practice_sessions (
  id SERIAL PRIMARY KEY,
  verb_id INTEGER NOT NULL REFERENCES verbs(id) ON DELETE CASCADE,
  conjugation_type VARCHAR(30) NOT NULL,          -- masu, te, nai, ta, conditional, potential, etc.
  session_date DATE DEFAULT CURRENT_DATE,
  attempts INTEGER DEFAULT 0,
  correct INTEGER DEFAULT 0,
  
  -- SRS fields
  ease_factor DECIMAL(3,2) DEFAULT 2.5,
  interval_days INTEGER DEFAULT 1,
  next_review_at TIMESTAMP,
  streak INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_verbs_group ON verbs(verb_group);
CREATE INDEX IF NOT EXISTS idx_verbs_jlpt ON verbs(jlpt_level);
CREATE INDEX IF NOT EXISTS idx_verbs_common ON verbs(is_common) WHERE is_common = true;
CREATE INDEX IF NOT EXISTS idx_verb_practice_next_review ON verb_practice_sessions(next_review_at);

-- Insert common N5/N4 verbs
INSERT INTO verbs (dictionary_form, reading, meaning, verb_group, jlpt_level, transitivity, stem, is_common) VALUES
-- Group II (Ichidan) - 食べる type
('食べる', 'たべる', 'to eat', 2, 'N5', 'transitive', '食べ', true),
('見る', 'みる', 'to see/watch', 2, 'N5', 'transitive', '見', true),
('寝る', 'ねる', 'to sleep', 2, 'N5', 'intransitive', '寝', true),
('起きる', 'おきる', 'to wake up', 2, 'N5', 'intransitive', '起き', true),
('借りる', 'かりる', 'to borrow', 2, 'N5', 'transitive', '借り', true),
('教える', 'おしえる', 'to teach', 2, 'N5', 'transitive', '教え', true),
('覚える', 'おぼえる', 'to remember', 2, 'N5', 'transitive', '覚え', true),
('閉める', 'しめる', 'to close', 2, 'N5', 'transitive', '閉め', true),
('着る', 'きる', 'to wear (upper body)', 2, 'N5', 'transitive', '着', true),
('始める', 'はじめる', 'to begin', 2, 'N5', 'transitive', '始め', true),

-- Group I (Godan) - 書く type
('書く', 'かく', 'to write', 1, 'N5', 'transitive', '書', true),
('読む', 'よむ', 'to read', 1, 'N5', 'transitive', '読', true),
('話す', 'はなす', 'to speak', 1, 'N5', 'transitive', '話', true),
('聞く', 'きく', 'to listen', 1, 'N5', 'transitive', '聞', true),
('行く', 'いく', 'to go', 1, 'N5', 'intransitive', '行', true),
('帰る', 'かえる', 'to return home', 1, 'N5', 'intransitive', '帰', true),
('入る', 'はいる', 'to enter', 1, 'N5', 'intransitive', '入', true),
('出る', 'でる', 'to exit', 2, 'N5', 'intransitive', '出', true),
('買う', 'かう', 'to buy', 1, 'N5', 'transitive', '買', true),
('待つ', 'まつ', 'to wait', 1, 'N5', 'intransitive', '待', true),
('死ぬ', 'しぬ', 'to die', 1, 'N5', 'intransitive', '死', true),
('遊ぶ', 'あそぶ', 'to play', 1, 'N5', 'intransitive', '遊', true),
('泳ぐ', 'およぐ', 'to swim', 1, 'N5', 'intransitive', '泳', true),
('知る', 'しる', 'to know', 1, 'N5', 'transitive', '知', true),
('作る', 'つくる', 'to make', 1, 'N5', 'transitive', '作', true),
('取る', 'とる', 'to take', 1, 'N5', 'transitive', '取', true),
('働く', 'はたらく', 'to work', 1, 'N5', 'intransitive', '働', true),
('歌う', 'うたう', 'to sing', 1, 'N5', 'transitive', '歌', true),
('立つ', 'たつ', 'to stand', 1, 'N5', 'intransitive', '立', true),
('使う', 'つかう', 'to use', 1, 'N5', 'transitive', '使', true),

-- Group III (Irregular) - 来る, する
('来る', 'くる', 'to come', 3, 'N5', 'intransitive', null, true),
('する', 'する', 'to do', 3, 'N5', 'transitive', null, true),
('勉強する', 'べんきょうする', 'to study', 3, 'N5', 'transitive', null, true),
('電話する', 'でんわする', 'to call (phone)', 3, 'N5', 'transitive', null, true);

-- Update irregular verb forms
UPDATE verbs SET 
  masu_form = CASE dictionary_form
    WHEN '来る' THEN '来ます'
    WHEN 'する' THEN 'します'
    WHEN '勉強する' THEN '勉強します'
    WHEN '電話する' THEN '電話します'
  END,
  te_form = CASE dictionary_form
    WHEN '来る' THEN '来て'
    WHEN 'する' THEN 'して'
    WHEN '勉強する' THEN '勉強して'
    WHEN '電話する' THEN '電話して'
  END,
  nai_form = CASE dictionary_form
    WHEN '来る' THEN '来ない'
    WHEN 'する' THEN 'しない'
    WHEN '勉強する' THEN '勉強しない'
    WHEN '電話する' THEN '電話しない'
  END,
  ta_form = CASE dictionary_form
    WHEN '来る' THEN '来た'
    WHEN 'する' THEN 'した'
    WHEN '勉強する' THEN '勉強した'
    WHEN '電話する' THEN '電話した'
  END
WHERE verb_group = 3;
