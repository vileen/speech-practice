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

---

## 10. Structured Learning Path (JLPT N3 Roadmap)

**Problem:** Users don't know how to effectively use app features to reach specific proficiency goals. No guidance on daily routine or feature combinations.

**Solution:** Implement structured learning paths with clear daily schedules and measurable milestones.

### Phase-Based Progression

> **Reality Check:** N5 typically requires ~150 hours of study. At 40 min/day, that's ~6 months, not 3. The timelines below are realistic estimates based on consistent daily practice.

---

**Phase 1: Foundation (Months 1-6) - N5 Level**
- Target: 800 vocabulary words + hiragana/katakana
- Study time: ~150 hours (40 min/day × 6 months)
- Daily routine: 15 min Memory Mode + 20 min Chat + 15 min Repeat After Me
- Chat topics: Self-introduction, weather, schedule, food, numbers
- Milestones: 
  - Month 2: Read hiragana/katakana fluently
  - Month 4: Hold 5-minute basic conversation
  - Month 6: Pass N5 practice test, understand simple audio

**Phase 2: Expansion (Months 7-12) - N4 Level**
- Target: 1,500 vocabulary words (cumulative)
- Study time: ~150 hours additional (40 min/day × 6 months)
- Daily routine: 15 min Memory Mode + 25 min Chat + 15 min Repeat After Me
- Chat topics: Past experiences, future plans, comparisons, shopping
- Milestones:
  - Month 9: Describe past events accurately
  - Month 12: Pass N4 practice test, understand standard-speed audio

**Phase 3: Consolidation (Months 13-18) - N3 Bridge**
- Target: 3,000 vocabulary words (cumulative)
- Study time: ~200 hours additional (45-60 min/day × 6 months)
- Daily routine: 20 min Memory Mode + 30 min Chat + 15 min Repeat After Me
- Chat topics: Opinions, hypotheticals, abstract concepts, work situations
- Milestones:
  - Month 15: Explain "why" and negotiate
  - Month 18: Understand 60% of native conversations, casual anime without subtitles

**Phase 4: Refinement (Months 19-24) - N3 Ready**
- Target: 3,750 vocabulary words (cumulative) - N3 requirement
- Study time: ~200 hours additional (45-60 min/day × 6 months)
- Daily routine: 20 min Memory Mode + 35 min Chat + 15 min Repeat After Me
- Chat topics: Complex scenarios, role-play, debates, business Japanese
- Milestones:
  - Month 21: Handle unexpected questions, express nuanced opinions
  - Month 24: Pass N3 exam, function in Japanese work environment

---

### Time Investment Summary

| Level | Duration | Daily Time | Total Hours | Vocabulary |
|-------|----------|------------|-------------|------------|
| N5 | 6 months | 40 min | ~120 hrs | 800 words |
| N4 | 6 months | 40 min | ~120 hrs | 1,500 words |
| N3 Bridge | 6 months | 45-60 min | ~150 hrs | 3,000 words |
| N3 | 6 months | 45-60 min | ~150 hrs | 3,750 words |
| **Total** | **~24 months** | **40-60 min** | **~540 hrs** | **3,750+ words** |

> **Note:** These are *minimum* estimates for dedicated learners. Most learners take 2-3 years to reach N3. Consistency beats intensity—20 minutes daily for 2 years beats 2 hours daily for 3 months.

### Feature Integration

**Memory Mode (FSRS):**
- N5 word lists (Months 1-3)
- N4 words + N5 review (Months 4-6)
- N3 words + review (Months 7-12)
- Distribution: 10-15 new words/day, 90%+ retention target

**Chat Sessions:**
- Progressive difficulty: Q&A → Storytelling → Debate → Role-play
- Topic progression: Daily life → Past/future → Abstract → Business

**Repeat After Me:**
- Months 1-3: Basic phrases, particle pronunciation
- Months 4-6: Complex sentences, verb conjugations
- Months 7-12: Natural dialogues, N3 listening exercises

### Implementation Ideas

**Progress Dashboard:**
- Visual timeline showing current phase
- Words learned counter with JLPT level breakdown
- Chat duration history and improvement graph
- Streak tracking for daily practice

**Smart Scheduling:**
- Automatic suggestion: "Today: Review N5 words (50 due) + 10 new N4 words"
- Adaptive difficulty based on error rates
- Rest day detection: "You've practiced 6 days, consider a light review day"

**Milestone Celebrations:**
- Notifications: "1000 words achieved! Ready for N4 transition?"
- Phase completion badges
- Estimated N3 exam readiness score

### Outside App Requirements

Document should guide users to add:
- Daily input outside app (podcasts, manga, anime)
- Graded readers at appropriate levels
- Grammar textbooks (Genki, Tobira, Kanzen Master)

### Priority
Medium complexity, high user value. Helps users maximize existing features rather than building new ones.
