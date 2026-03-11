-- Kanji table for tracking kanji learning progress
CREATE TABLE IF NOT EXISTS kanji (
  id SERIAL PRIMARY KEY,
  character VARCHAR(10) NOT NULL UNIQUE,     -- The kanji character (e.g., "山")
  readings JSONB NOT NULL,                   -- [{"type": "on", "reading": "san"}, {"type": "kun", "reading": "yama"}]
  meanings TEXT[] NOT NULL,                  -- ["mountain", "hill"]
  jlpt_level VARCHAR(5),                     -- "N5", "N4", etc.
  stroke_count INTEGER,                      -- Number of strokes
  radicals TEXT[],                           -- Component radicals
  examples JSONB,                            -- Example words: [{"word": "火山", "reading": "かざん", "meaning": "volcano"}]
  lesson_id VARCHAR(20),                     -- Which lesson introduced this kanji
  tags TEXT[],                               -- ["nature", "common", "verb"]
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User progress tracking for kanji
CREATE TABLE IF NOT EXISTS user_kanji_progress (
  id SERIAL PRIMARY KEY,
  kanji_id INTEGER REFERENCES kanji(id) ON DELETE CASCADE,
  ease_factor FLOAT DEFAULT 2.5,
  interval_days INTEGER DEFAULT 1,
  next_review_at TIMESTAMP,
  total_attempts INTEGER DEFAULT 0,
  correct_attempts INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(kanji_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_kanji_jlpt ON kanji(jlpt_level);
CREATE INDEX IF NOT EXISTS idx_kanji_lesson ON kanji(lesson_id);
CREATE INDEX IF NOT EXISTS idx_kanji_progress_review ON user_kanji_progress(next_review_at);
