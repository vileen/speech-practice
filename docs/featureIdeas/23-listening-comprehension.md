# Feature #23: Listening Comprehension

**Status:** ✅ Complete  
**Complexity:** Medium  
**Impact:** High  
**Completed:** 2026-03-27

## Overview

Audio-only comprehension quizzes where users listen to Japanese audio without seeing the transcript, then answer comprehension questions. This trains pure listening skills without visual support.

## Why This Matters

Current listening practice always has visual support (transcripts, furigana). In real conversations, there's no text to read. This feature bridges the gap between "listening with help" and "listening in the wild."

## Implementation

### Database

**Tables:**

```sql
CREATE TABLE listening_passages (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  level VARCHAR(10) NOT NULL, -- N5, N4, N3
  audio_url TEXT NOT NULL,
  transcript TEXT NOT NULL, -- Hidden during quiz
  japanese_text TEXT, -- For internal reference
  duration_seconds INTEGER,
  difficulty_speed VARCHAR(20), -- 'slow', 'normal', 'fast'
  topic_category TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE listening_questions (
  id SERIAL PRIMARY KEY,
  passage_id INTEGER REFERENCES listening_passages(id),
  question_text TEXT NOT NULL,
  question_type VARCHAR(50), -- 'main_idea', 'detail', 'inference'
  options JSONB NOT NULL, -- ["option1", "option2", "option3", "option4"]
  correct_answer INTEGER NOT NULL, -- index 0-3
  explanation TEXT
);
```

**Sample Data:** 5 passages (3 N5, 2 N4) with 20 total questions covering:
- Shopping scenarios
- Travel situations
- Daily life conversations
- Restaurant ordering

### Backend

**Service:** `backend/src/services/listening.ts`

- `getPassages(level?)` - Fetch passages (NO transcript)
- `getPassageById(id)` - Single passage
- `getQuestionsByPassageId(id)` - Get questions
- `getTranscript(id)` - Reveal after quiz completion
- `submitAnswers(passageId, answers)` - Score answers
- `getStats(userId)` - User listening statistics

**Routes:** `backend/src/routes/listening.ts`

- `GET /api/listening/passages?level=N5` - List passages
- `GET /api/listening/passages/:id` - Single passage
- `GET /api/listening/passages/:id/questions` - Get questions
- `GET /api/listening/passages/:id/transcript` - Get transcript (post-quiz)
- `POST /api/listening/submit` - Submit answers
- `GET /api/listening/stats` - Get statistics

### Frontend

**Hook:** `frontend/src/hooks/useListeningMode.ts`

- `fetchPassages(level)` - Load available passages
- `startQuiz(passageId)` - Begin listening session
- `submitAnswer(questionId, answerIndex)` - Record answer
- `completeQuiz()` - Submit and get score

**Component:** `frontend/src/components/ListeningMode/ListeningMode.tsx`

**Features:**
1. **Passage List View:**
   - Filter by JLPT level (N5, N4, N3)
   - Show title, duration, topic
   - Progress indicators

2. **Audio Player:**
   - Visual audio wave indicator
   - Play/pause controls
   - Replay button (unlimited)
   - Progress bar
   - Speed control: 0.75x, 1x, 1.25x
   - **NO TRANSCRIPT VISIBLE**

3. **Question Interface:**
   - Multiple choice (4 options)
   - Question navigation (previous/next)
   - Flag for review
   - Progress indicator

4. **Results View:**
   - Score display
   - Correct/incorrect review
   - **Transcript reveal button**
   - Explanation for each question
   - Retry passage option

**Styling:** `ListeningMode.css`
- Full responsive design
- Dark theme matching app
- Animated audio visualizer

### Integration

Added to main navigation in `Home.tsx`:
- "Listening" mode alongside Grammar, Reading, Speaking, etc.
- Route: `/listening`

## User Flow

1. Select "Listening" from home screen
2. Choose JLPT level filter
3. Select a passage
4. Listen to audio (can replay unlimited times)
5. Answer 4 comprehension questions
6. Submit and see score
7. Review with transcript revealed
8. Retry or choose new passage

## Question Types

1. **Main Idea:** What is the conversation about?
2. **Detail:** Specific information from the audio
3. **Inference:** What can be inferred from the conversation?

## Speed Levels

- **0.75x:** Slow, clear pronunciation (beginner)
- **1x:** Natural speed (standard)
- **1.25x:** Fast (advanced practice)

## Future Enhancements

- [ ] Audio wave visualization using Web Audio API
- [ ] Difficult passage flagging
- [ ] Listening streak tracking
- [ ] More passages (target: 50+ across all levels)
- [ ] Listening speed drills (progressive speed increase)
- [ ] Shadowing integration (listen then repeat)

## Files

```
backend/src/services/listening.ts
backend/src/routes/listening.ts
backend/data/listening_passages.sql
backend/data/listening_questions.sql
frontend/src/hooks/useListeningMode.ts
frontend/src/components/ListeningMode/
  ├── ListeningMode.tsx
  ├── ListeningMode.css
  ├── ListeningPlayer.tsx
  └── ListeningQuestion.tsx
```

## Testing

- Backend: 109 tests passing
- Frontend: 400 tests passing
- Build: ✅ Successful

## Related

- Feature #3: Spaced Repetition (could integrate listening items)
- Feature #6: Interleaved Practice (mix listening with other modes)
- Feature #19: Reading Comprehension (similar structure, different input)
