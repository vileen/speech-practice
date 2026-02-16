-- Migration: Add lesson context columns to sessions table
ALTER TABLE sessions 
ADD COLUMN IF NOT EXISTS lesson_id VARCHAR(20),
ADD COLUMN IF NOT EXISTS lesson_context TEXT;
