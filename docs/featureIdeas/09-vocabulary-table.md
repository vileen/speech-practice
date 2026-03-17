# Database Refactor: Vocabulary Table

**Status:** ✅ COMPLETED

**Priority:** 3

---

## Problem

Previously vocabulary was embedded in lessons as text/vocabulary fields. No way to track word frequency across lessons or identify unique words per lesson.

---

## Solution

Separate vocabulary table with lesson references.

---

## Schema Changes

```sql
-- Vocabulary table (normalized)
vocabulary (
  id SERIAL PRIMARY KEY,
  japanese TEXT NOT NULL,        -- 寿司
  romaji TEXT,                   -- sushi
  english TEXT,                  -- sushi
  word_type VARCHAR(20),         -- noun, verb, adjective, particle, etc.
  jlpt_level INTEGER,            -- JLPT level if known
  frequency_rank INTEGER         -- overall frequency in language
);

-- Lesson-Vocabulary junction (many-to-many)
lesson_vocabulary (
  id SERIAL PRIMARY KEY,
  lesson_id INTEGER REFERENCES lessons(id),
  vocabulary_id INTEGER REFERENCES vocabulary(id),
  context_sentence TEXT,         -- how it appears in this lesson
  sentence_position INTEGER,     -- which sentence in lesson
  UNIQUE(lesson_id, vocabulary_id)
);
```

---

## Features Enabled

### A. Cross-Lesson Word Tracking

- Words appearing in multiple lessons get marked:
  - "寿司 appears in: Lesson 1, Lesson 5, Lesson 12"
- UI shows "Previously learned in Lesson X" badge

### B. Memory Mode: Unique Words Only

**New feature:** Study only words that first appeared in selected lesson(s).

```sql
-- Get words that FIRST appeared in Lesson 5
SELECT v.*, lv.context_sentence
FROM vocabulary v
JOIN lesson_vocabulary lv ON v.id = lv.vocabulary_id
WHERE lv.lesson_id = 5
AND v.id NOT IN (
  SELECT vocabulary_id 
  FROM lesson_vocabulary 
  WHERE lesson_id < 5  -- appeared in earlier lessons
);
```

**Use case:** User wants to review Lesson 5 but only words they haven't seen before.

### C. Vocabulary Progress Tracking

Track learning progress per word (not just per phrase):

```sql
user_vocabulary_progress (
  user_id INTEGER,
  vocabulary_id INTEGER REFERENCES vocabulary(id),
  first_seen_lesson_id INTEGER,
  mastery_level FLOAT,           -- 0.0 to 1.0
  times_encountered INTEGER,
  times_recalled_correctly INTEGER,
  last_reviewed_at TIMESTAMP
);
```

### D. Smart Lesson Recommendations

Suggest lessons based on vocabulary overlap:
- "Lesson 12 shares 15 words with Lesson 5 - good for review"

---

## Migration Strategy

1. **Extract vocabulary** from existing lessons using parsing:
   - Use MeCab/Jieba for Japanese tokenization
   - Extract unique words per lesson
   - Build vocabulary table

2. **Backfill junction table** with lesson references

3. **Update Memory Mode** to support "unique words only" filter

---

*Created: 2026-02-28*