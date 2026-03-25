# Feature Idea 19: Reading Comprehension Mode

## Overview

Graded reading passages with comprehension questions for building Japanese reading skills from N5 to N3 level.

**Status:** ✅ **IMPLEMENTED** (2026-03-25)  
**Priority:** Medium  
**Complexity:** Medium  
**Impact:** High

---

## Problem Statement

Learners need:
- Graded reading material appropriate to their level
- Comprehension checks to ensure understanding
- Exposure to grammar patterns in context
- Reading speed improvement tracking

Existing lesson content is conversational - dedicated reading practice is needed.

---

## Solution

### Core Components

1. **Reading Passages Database**
   - Level: N5 → N3
   - Length: 100-500 characters
   - Topics: daily life, work, culture, travel
   - Furigana toggle support

2. **Question System**
   - Multiple choice questions per passage
   - Question types:
     - Main idea comprehension
     - Detail extraction
     - Inference
     - Vocabulary in context
     - Grammar pattern identification
   - Immediate feedback with explanations

3. **Progress Tracking**
   - Reading speed (characters/minute)
   - Comprehension accuracy per level
   - Passages completed

---

## Implementation

### Database Schema

```sql
CREATE TABLE reading_passages (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  level VARCHAR(5) CHECK (level IN ('N5', 'N4', 'N3')),
  topic VARCHAR(50),
  character_count INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reading_questions (
  id SERIAL PRIMARY KEY,
  passage_id INTEGER REFERENCES reading_passages(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer INTEGER NOT NULL,
  explanation TEXT,
  question_type VARCHAR(20)
);
```

### Sample Data

3 sample passages included:
- N5: "My Daily Routine" (daily life)
- N4: "A Trip to Kyoto" (travel)
- N3: "Working from Home" (work/culture)

### API Endpoints

```typescript
// GET /api/reading/passages?level=N5 - list passages
// GET /api/reading/passages/:id - get passage with questions
// POST /api/reading/submit - submit answers, return score
```

### Component Structure

```
ReadingMode/
├── ReadingMode.tsx      # Main component
├── ReadingMode.css      # Styling
└── index.ts             # Exports
```

---

## User Flow

1. Select JLPT level filter (N5/N4/N3/All)
2. Choose a passage from list
3. Read passage with optional furigana
4. Answer comprehension questions
5. Submit and see results
6. Review explanations for wrong answers
7. Track reading speed and accuracy

---

## UI Features

- **Passage List View**: Title, level badge, topic, character count
- **Reading View**: 
  - Large Japanese text display
  - Furigana toggle button
  - Start timer on begin reading
- **Question View**:
  - Side-by-side or below passage
  - Multiple choice with radio buttons
  - Submit button
- **Results View**:
  - Score display
  - Correct/incorrect indicators
  - Explanation for each question

---

## Files Created

- `backend/src/routes/reading.ts` - API routes
- `backend/data/reading_schema.sql` - Database schema
- `backend/data/reading_sample_data.sql` - Sample passages
- `frontend/src/components/ReadingMode/ReadingMode.tsx` - Component
- `frontend/src/components/ReadingMode/ReadingMode.css` - Styles

---

## Future Enhancements

- [ ] Expand to 20 passages (5 N5, 8 N4, 7 N3)
- [ ] Add grammar pattern highlighting
- [ ] Link unknown words to SRS
- [ ] Reading speed leaderboards
- [ ] Difficult vocabulary extraction
- [ ] Audio narration for passages

---

*Implemented: 2026-03-25*  
*Part of: Phase 3 - Reading Comprehension*
