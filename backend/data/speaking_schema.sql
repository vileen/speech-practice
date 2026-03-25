CREATE TABLE IF NOT EXISTS conversation_templates (
  id SERIAL PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  scenario VARCHAR(50),
  difficulty VARCHAR(5),
  turns JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS shadowing_exercises (
  id SERIAL PRIMARY KEY,
  title VARCHAR(100),
  audio_url VARCHAR(500),
  japanese_text TEXT,
  level VARCHAR(5),
  duration_seconds INTEGER
);

CREATE TABLE IF NOT EXISTS response_drills (
  id SERIAL PRIMARY KEY,
  cue_text TEXT NOT NULL,
  suggested_response TEXT,
  time_limit_seconds INTEGER DEFAULT 15,
  difficulty VARCHAR(5),
  category VARCHAR(50)
);
