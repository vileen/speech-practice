-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL PRIMARY KEY,
  language VARCHAR(10) NOT NULL, -- 'japanese' or 'italian'
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
