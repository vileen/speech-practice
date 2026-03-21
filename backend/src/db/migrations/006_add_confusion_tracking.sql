-- Migration: Add confusion tracking for grammar patterns
-- Created: 2026-03-21

-- Add confusion_pairs column to user_grammar_progress
ALTER TABLE user_grammar_progress ADD COLUMN IF NOT EXISTS confusion_pairs JSONB DEFAULT '[]';

-- Add related_patterns column to grammar_patterns
ALTER TABLE grammar_patterns ADD COLUMN IF NOT EXISTS related_patterns INTEGER[] DEFAULT '{}';

-- Create confusion events table
CREATE TABLE IF NOT EXISTS grammar_confusion_events (
  id SERIAL PRIMARY KEY,
  pattern_id INTEGER REFERENCES grammar_patterns(id) ON DELETE CASCADE,
  confused_with_pattern_id INTEGER REFERENCES grammar_patterns(id) ON DELETE CASCADE,
  user_sentence TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_confusion_events_pattern ON grammar_confusion_events(pattern_id);
CREATE INDEX IF NOT EXISTS idx_confusion_events_confused_with ON grammar_confusion_events(confused_with_pattern_id);
CREATE INDEX IF NOT EXISTS idx_confusion_events_created ON grammar_confusion_events(created_at);
