# Review Mode Enhancement Ideas

> Ideas for improving the material review process after lessons.
> Passive reading of grammar/vocabulary is ineffective - active recall is key.

---

## 1. Hide Mode (Memory Recall) ✅ IMPLEMENTED

**Status:** ✅ Complete - See Memory Mode feature

**Problem:** Current "Repeat After Me" shows the Japanese text immediately, working only short-term memory.

**Solution:** Hide the Japanese phrase initially. Workflow:
- Show only: 🇬🇧 "I want to eat sushi"
- User attempts from memory → speaks Japanese
- Recording + reveal correct answer → comparison
- Self-assessment: ✅ Knew it / ❌ Didn't know (for SRS algorithm)

**Implementation:** New "Memory Mode" section separate from Repeat After Me. Uses FSRS algorithm for scheduling.

---

## 2. Progressive Reveal (Hint Cascade)

**Inspired by:** Wordle-style gradual disclosure

**Steps:**
1. Show only translation + phrase length (___ ___ ___)
2. + First syllable (す___ ___)
3. + Syllable count hint (すし___ ___)
4. Full phrase revealed (寿司を食べたいです)

**Scoring:** Each hint reduces the score, but prevents frustration from blank page.

---

## 3. Spaced Repetition + Weak Points Tracking ✅ IMPLEMENTED (Partial)

**Status:** ✅ FSRS Algorithm implemented in Memory Mode (localStorage, 30-day sessions)

**Track in database for each phrase:**
- `ease_factor` (SM-2/FSRS algorithm) ✅
- `interval` (next review date) ✅
- `error_patterns` (e.g., often confuses "shi" with "chi") ⏳ TODO

**Behavior:** Phrases with lower ease_factor appear more frequently in random pool. ✅

**Implementation:**
- `frontend/src/lib/fsrs.ts` - FSRS-4.5 algorithm
- `frontend/src/hooks/useMemoryProgress.ts` - localStorage persistence
- 30-day session lifetime

**TODO:**
- [ ] Move from localStorage to PostgreSQL
- [ ] Add error pattern tracking
- [ ] Add interleaved practice (mix lessons)

**Tables needed:**
```sql
user_phrase_progress (
  user_id,
  phrase_id,
  ease_factor,
  interval_days,
  next_review_at,
  error_patterns JSONB
)
```

---

## 4. Minimal Pairs Drills (Error-Based)

**Trigger:** When Whisper returns specific errors:
- "shi" instead of "chi"
- "tsu" instead of "su"
- "fu" instead of "hu"

**Action:** Generate focused drill with minimal pairs:
- さしすせそ vs たちつてと
- ふ vs ひ

**Goal:** Targeted practice on problematic sounds.

---

## 5. Sentence Building (Voice Lego)

**Instead of:** Repeating whole phrase

**Approach:** Building from parts:
- Show: 寿司 + を + 食べたい + です (as "building blocks")
- User speaks complete sentence in correct order
- Forces understanding of structure, not just parroting

**Difficulty levels:**
- Level 1: 2-3 blocks
- Level 2: 4-5 blocks
- Level 3: Full sentence with particles hidden

---

## 6. Interleaved Practice Mode

**Problem:** Blocked practice (one lesson at a time) is less effective than mixed review.

**Solution:** Daily review session mixing phrases from multiple lessons:
- 5 phrases from Lesson 1
- 3 from Lesson 5
- 2 from Lesson 12

**Benefit:** Research shows interleaved learning > blocked learning for retention.

---

## 7. Grammar Pattern Drills

**Focus:** Specific grammar patterns, not just vocabulary.

**Flow:**
1. Prompt: "Use 〜てもいいです to ask permission to take a photo"
2. User constructs sentence by voice
3. AI feedback: correct / almost / wrong + explanation

**Patterns to cover:**
- 〜てもいいです (permission)
- 〜てはいけません (prohibition)
- 〜たいです (desire)
- 〜ませんか (invitation)

---

## 8. Shadowing Mode Enhancement

**Current state:** "Repeat After Me" has basic shadowing (listen → repeat).

**Potential improvements:**

### A. Overlapping Shadowing
- Audio plays continuously
- User speaks simultaneously with native speaker (overlap)
- Forces rhythm and intonation matching in real-time

### B. Shadowing with Delay
- Native speaker: 寿司を食べたいです
- [500ms delay]
- User repeats while audio is still fresh in memory
- Gradually increase delay (1s → 2s → 3s) as skill improves

### C. Partial Shadowing
- Mute certain words/syllables in the audio
- User must fill in the gaps
- Progresses from muting 10% → 50% → 90% of phrase

### D. Shadowing Score
- Compare user's audio with native speaker:
  - Rhythm/pacing match
  - Intonation contour similarity
  - Pause placement
- Visual feedback: waveform overlay comparison

---

## 9. Database Refactor: Vocabulary Table ⏳ PLANNED

**Problem:** Currently vocabulary is embedded in lessons as text/vocabulary fields. No way to track word frequency across lessons or identify unique words per lesson.

**Solution:** Separate vocabulary table with lesson references.

### Schema Changes

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

### Features Enabled

#### A. Cross-Lesson Word Tracking
- Words appearing in multiple lessons get marked:
  - "寿司 appears in: Lesson 1, Lesson 5, Lesson 12"
- UI shows "Previously learned in Lesson X" badge

#### B. Memory Mode: Unique Words Only
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

#### C. Vocabulary Progress Tracking
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

#### D. Smart Lesson Recommendations
Suggest lessons based on vocabulary overlap:
- "Lesson 12 shares 15 words with Lesson 5 - good for review"

### Migration Strategy

1. **Extract vocabulary** from existing lessons using parsing:
   - Use MeCab/Jieba for Japanese tokenization
   - Extract unique words per lesson
   - Build vocabulary table

2. **Backfill junction table** with lesson references

3. **Update Memory Mode** to support "unique words only" filter

---

## Priority / Implementation Order

| Priority | Feature | Status | Complexity | Impact |
|----------|---------|--------|------------|--------|
| 1 | ~~Hide Mode~~ → **Memory Mode** | ✅ Complete | Medium | High |
| 2 | SRS Tracking | ✅ Core algorithm done | Medium | High |
| 3 | **Database Refactor** | ⏳ Next priority | High | Critical |
| 4 | Interleaved Practice | ⏳ Planned | Medium | High |
| 5 | Shadowing Enhancement | ⏳ Planned | Medium | High |
| 6 | Progressive Reveal | ⏳ Planned | Medium | Medium |
| 7 | Error-Based Drills | ⏳ Planned | High | Medium |
| 8 | Sentence Building | ⏳ Planned | High | High |
| 9 | Grammar Drills | ⏳ Planned | Medium | High |

## Completed Features

### ✅ Memory Mode (Hide Mode + SRS)
- **Location:** New tab "🧠 Memory Mode" on home screen
- **Files:**
  - `frontend/src/components/MemoryMode.tsx`
  - `frontend/src/components/MemoryMode.css`
  - `frontend/src/hooks/useMemoryProgress.ts`
  - `frontend/src/lib/fsrs.ts`
- **Features:**
  - Hide Japanese / show English only (active recall)
  - Self-assessment: Again/Hard/Good/Easy
  - FSRS-4.5 algorithm for optimal scheduling
  - 30-day session lifetime
  - localStorage persistence
  - Lesson selection (import cards from specific lessons)
  - Progress stats (total/due/new/in-review)

---

*Created: 2026-02-28*
*Status: Under consideration*

---

**Problem:** Currently vocabulary is embedded in lessons as text/vocabulary fields. No way to track word frequency across lessons or identify unique words per lesson.

**Solution:** Separate vocabulary table with lesson references.

### Schema Changes

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

### Features Enabled

#### A. Cross-Lesson Word Tracking
- Words appearing in multiple lessons get marked:
  - "寿司 appears in: Lesson 1, Lesson 5, Lesson 12"
- UI shows "Previously learned in Lesson X" badge

#### B. Memory Mode: Unique Words Only
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

#### C. Vocabulary Progress Tracking
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

#### D. Smart Lesson Recommendations
Suggest lessons based on vocabulary overlap:
- "Lesson 12 shares 15 words with Lesson 5 - good for review"

### Migration Strategy

1. **Extract vocabulary** from existing lessons using parsing:
   - Use MeCab/Jieba for Japanese tokenization
   - Extract unique words per lesson
   - Build vocabulary table

2. **Backfill junction table** with lesson references

3. **Update Memory Mode** to support "unique words only" filter

### Priority
Added as Priority #3 - High complexity but critical for vocabulary tracking.
