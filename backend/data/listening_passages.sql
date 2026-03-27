-- Create listening_passages table
CREATE TABLE IF NOT EXISTS listening_passages (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  level VARCHAR(10) NOT NULL, -- N5, N4, N3
  audio_url TEXT NOT NULL,
  transcript TEXT NOT NULL, -- Hidden from user during quiz
  japanese_text TEXT, -- For internal reference
  duration_seconds INTEGER,
  difficulty_speed VARCHAR(20), -- 'slow', 'normal', 'fast'
  topic_category TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create listening_questions table
CREATE TABLE IF NOT EXISTS listening_questions (
  id SERIAL PRIMARY KEY,
  passage_id INTEGER REFERENCES listening_passages(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type VARCHAR(50), -- 'main_idea', 'detail', 'inference'
  options JSONB NOT NULL, -- ["option1", "option2", "option3", "option4"]
  correct_answer INTEGER NOT NULL, -- index of correct option (0-3)
  explanation TEXT
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_listening_passages_level ON listening_passages(level);
CREATE INDEX IF NOT EXISTS idx_listening_questions_passage_id ON listening_questions(passage_id);
