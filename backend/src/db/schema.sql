-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL PRIMARY KEY,
  language VARCHAR(10) NOT NULL, -- 'japanese'
  voice_gender VARCHAR(10) NOT NULL, -- 'male' or 'female'
  lesson_id VARCHAR(20), -- Associated lesson ID
  lesson_context TEXT, -- System prompt for lesson mode
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  session_id INTEGER REFERENCES sessions(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL, -- 'user' or 'assistant'
  content TEXT NOT NULL,
  audio_path VARCHAR(500),
  transcription TEXT,
  translation TEXT, -- English translation
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User recordings table
CREATE TABLE IF NOT EXISTS user_recordings (
  id SERIAL PRIMARY KEY,
  session_id INTEGER REFERENCES sessions(id) ON DELETE CASCADE,
  audio_path VARCHAR(500) NOT NULL,
  transcription TEXT,
  target_language VARCHAR(10) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Lessons table
CREATE TABLE IF NOT EXISTS lessons (
  id VARCHAR(20) PRIMARY KEY,
  date DATE NOT NULL,
  title TEXT NOT NULL,
  order_num INTEGER NOT NULL,
  topics TEXT[] DEFAULT '{}',
  vocabulary JSONB DEFAULT '[]',
  grammar JSONB DEFAULT '[]',
  practice_phrases TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for ordering
CREATE INDEX IF NOT EXISTS idx_lessons_order ON lessons(order_num DESC);

-- Furigana cache table - stores pre-computed furigana to avoid repeated API calls
CREATE TABLE IF NOT EXISTS furigana_cache (
  id SERIAL PRIMARY KEY,
  original_text TEXT NOT NULL UNIQUE,
  furigana_html TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for quick lookup
CREATE INDEX IF NOT EXISTS idx_furigana_original ON furigana_cache(original_text);

-- Speech assessments table - stores pronunciation assessment results
CREATE TABLE IF NOT EXISTS speech_assessments (
  id SERIAL PRIMARY KEY,
  user_id TEXT,
  target_phrase TEXT NOT NULL,
  user_transcript TEXT NOT NULL,
  accuracy_score INTEGER,
  feedback JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for speech assessments
CREATE INDEX IF NOT EXISTS idx_speech_assessments_user ON speech_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_speech_assessments_created ON speech_assessments(created_at DESC);

-- Grammar patterns library
CREATE TABLE IF NOT EXISTS grammar_patterns (
  id SERIAL PRIMARY KEY,
  pattern TEXT NOT NULL,           -- "〜てもいいです"
  category TEXT NOT NULL,          -- "Permission"
  jlpt_level TEXT,                 -- "N5", "N4", etc.
  formation_rules JSONB,           -- [{"step": 1, "rule": "Te-form + もいい"}]
  examples JSONB,                  -- [{"jp": "...", "en": "...", "romaji": "..."}]
  common_mistakes JSONB,           -- [{"mistake": "...", "explanation": "..."}]
  related_patterns INTEGER[],      -- IDs of related patterns
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Grammar exercises for each pattern
CREATE TABLE IF NOT EXISTS grammar_exercises (
  id SERIAL PRIMARY KEY,
  pattern_id INTEGER REFERENCES grammar_patterns(id) ON DELETE CASCADE,
  type TEXT NOT NULL,              -- 'construction', 'transformation', 'error_correction', 'fill_blank'
  prompt TEXT NOT NULL,            -- Exercise prompt
  context TEXT,                    -- Additional context
  correct_answer TEXT,             -- Expected answer
  hints JSONB,                     -- Progressive hints
  difficulty INTEGER DEFAULT 1,    -- 1-3 scale
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User progress per pattern
CREATE TABLE IF NOT EXISTS user_grammar_progress (
  id SERIAL PRIMARY KEY,
  pattern_id INTEGER REFERENCES grammar_patterns(id) ON DELETE CASCADE,
  ease_factor FLOAT DEFAULT 2.5,
  interval_days INTEGER DEFAULT 1,
  next_review_at TIMESTAMP,
  total_attempts INTEGER DEFAULT 0,
  correct_attempts INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  error_patterns JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(pattern_id)
);

-- Grammar attempt history
CREATE TABLE IF NOT EXISTS grammar_attempts (
  id SERIAL PRIMARY KEY,
  pattern_id INTEGER REFERENCES grammar_patterns(id) ON DELETE CASCADE,
  exercise_id INTEGER REFERENCES grammar_exercises(id) ON DELETE SET NULL,
  user_sentence TEXT,              -- What user said
  result TEXT NOT NULL,            -- 'correct', 'partial', 'wrong'
  error_type TEXT,                 -- Type of error if any
  ai_feedback TEXT,                -- AI-generated feedback
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_grammar_patterns_category ON grammar_patterns(category);
CREATE INDEX IF NOT EXISTS idx_grammar_patterns_jlpt ON grammar_patterns(jlpt_level);
CREATE INDEX IF NOT EXISTS idx_grammar_progress_review ON user_grammar_progress(next_review_at);
CREATE INDEX IF NOT EXISTS idx_grammar_exercises_pattern ON grammar_exercises(pattern_id);
