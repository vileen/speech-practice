CREATE TABLE IF NOT EXISTS reading_passages (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  level VARCHAR(5) CHECK (level IN ('N5', 'N4', 'N3')),
  topic VARCHAR(50),
  character_count INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reading_questions (
  id SERIAL PRIMARY KEY,
  passage_id INTEGER REFERENCES reading_passages(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer INTEGER NOT NULL,
  explanation TEXT,
  question_type VARCHAR(20) CHECK (question_type IN ('main_idea', 'detail', 'inference', 'vocabulary', 'grammar'))
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_reading_passages_level ON reading_passages(level);
CREATE INDEX IF NOT EXISTS idx_reading_questions_passage_id ON reading_questions(passage_id);
