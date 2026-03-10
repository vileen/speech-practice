# Review Mode Enhancement Ideas

---

## Priority / Implementation Order

| Priority | Feature | Status | Complexity | Impact | Rationale |
|----------|---------|--------|------------|--------|-----------|
| 1 | [~~Hide Mode~~ → **Memory Mode**](#1-hide-mode-memory-recall--implemented) | ✅ Complete | Medium | High | - |
| 2 | [SRS Tracking](#3-spaced-repetition--weak-points-tracking--implemented-partial) | ✅ Core algorithm done | Medium | High | - |
| 3 | [~~Database Refactor~~](#9-database-refactor-vocabulary-table--completed) | ✅ Complete | High | Critical | - |
| 4 | [~~Backend Modularization~~](#12-backend-modularization--completed) | ✅ Complete | High | Critical | - |
| 5 | [~~Frontend Refactoring~~](#13-frontend-refactoring--completed) | ✅ Complete | Medium | High | - |
| 6 | [~~Vocabulary Review Badges~~](#14-vocabulary-review-badges--completed) | ✅ Complete | Low | Medium | - |
| **7** | [**Interleaved Practice**](#6-interleaved-practice-mode) | ⏳ **Next** | Medium | High | High impact, medium complexity |
| 8 | [Shadowing Enhancement](#8-shadowing-mode-enhancement) | ⏳ Planned | Medium | High | Improves existing Repeat Mode |
| 9 | [**Grammar Drills**](#7-grammar-pattern-drills) | ⏳ Planned | Medium | High | Fills major gap, good ROI |
| 10 | [Progressive Reveal](#2-progressive-reveal-hint-cascade) | ⏳ Planned | Medium | Medium | Nice-to-have UX improvement |
| 11 | [Sentence Building](#5-sentence-building-voice-lego) | ⏳ Planned | High | High | High effort but high value |
| 12 | [JLPT N3 Roadmap](#10-structured-learning-path-jlpt-n3-roadmap) | 📋 Documented | Medium | High | Mostly documentation/integration |
| 13 | [Error-Based Drills](#4-minimal-pairs-drills-error-based) | ⏳ Planned | High | Medium | High complexity, medium impact |
| 14 | [Daily Tracker + Pomodoro](#11-daily-practice-tracker-with-pomodoro-technique--planned) | ⏳ Planned | Medium | Medium | Motivational, not core learning |


---


> Ideas for improving the material review process after lessons.
> Passive reading of grammar/vocabulary is ineffective - active recall is key.

---

## 1. Hide Mode (Memory Recall)

**Status:** ✅ IMPLEMENTED

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

## 3. Spaced Repetition + Weak Points Tracking

**Status:** ✅ IMPLEMENTED (Partial)

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

**Status:** ⏳ Planned - Ready for implementation

**Problem:** Current Memory Mode reviews phrases from selected lessons but presents them in blocks (all from Lesson 5, then all from Lesson 12). Research shows interleaved practice (mixed topics) produces 43% better long-term retention than blocked practice.

**Solution:** "Interleaved Mode" — intelligent mixing of phrases from multiple lessons based on:
- SRS due dates (prioritize overdue items)
- Lesson age (older = higher priority for review)
- Difficulty level (mix easy/hard for optimal challenge)
- Pattern variety (alternate grammar patterns)

---

### 6.1 Core Algorithm

**Input:** User selects lessons to include (e.g., Lessons 1, 5, 8, 12)

**Mixing Strategy:**
```typescript
interface InterleavedSession {
  // Fetch all due cards from selected lessons
  cards: MemoryCard[];
  
  // Sort by: overdue days > lesson age > difficulty
  sortPriority: (card) => {
    const overdue = daysSince(card.nextReview);
    const lessonAge = currentLessonNumber - card.lessonNumber;
    const difficulty = 1 / card.easeFactor; // Lower ease = harder
    return (overdue * 3) + (lessonAge * 2) + difficulty;
  };
  
  // Chunking: Never 3+ from same lesson in a row
  distribute: (sortedCards) => {
    const chunks = [];
    let lastLesson = null;
    let streak = 0;
    
    for (const card of sortedCards) {
      if (card.lessonId === lastLesson) {
        streak++;
        if (streak >= 2) {
          // Find card from different lesson
          const alternate = findNextDifferentLesson(cards, lastLesson);
          chunks.push(alternate);
          streak = 0;
        }
      } else {
        streak = 0;
      }
      chunks.push(card);
      lastLesson = card.lessonId;
    }
    return chunks;
  };
}
```

**Mixing Rules:**
| Rule | Description |
|------|-------------|
| No same-lesson streak | Max 2 consecutive cards from same lesson |
| Overdue priority | Cards 3+ days overdue appear first |
| Age weighting | Lesson 1 cards appear 2x more often than Lesson 12 |
| Difficulty blend | Mix easy (ease > 2.5) and hard (ease < 2.0) cards |

---

### 6.2 Session Types

**A. Daily Review (Recommended)**
```
Duration: 15-20 minutes
Cards: 20-30 mixed from all learned lessons
Algorithm:
  - 40% from lessons 1-10 (foundation review)
  - 40% from lessons 11-20 (recent material)
  - 20% from current lesson (new material)
```

**B. Cram Mode (Before Test)**
```
Duration: 30-45 minutes
Cards: 50+ from selected range
Algorithm:
  - Equal distribution across all selected lessons
  - Prioritize cards with lowest ease factors
  - Include previously "Again" rated cards
```

**C. Weak Points Focus**
```
Duration: 10-15 minutes
Cards: 15-20 specifically challenging items
Algorithm:
  - Only cards with ease < 2.0
  - Cards marked "Again" 2+ times
  - Mix from all lessons (no lesson bias)
```

**D. Pattern Mastery**
```
Duration: Flexible
Cards: All cards using specific grammar pattern
Algorithm:
  - Group by pattern (〜てもいい, 〜たい, etc.)
  - Mix across lessons using same pattern
  - Compare/contrast similar patterns
```

---

### 6.3 Smart Scheduling

**Spaced Repetition with Interleaving:**

```typescript
function calculateNextReview(card, rating) {
  // Standard FSRS update
  const fsrsResult = fsrs.update(card, rating);
  
  // Interleaving adjustment: Add slight randomness
  // to prevent "same time tomorrow" clustering
  const jitterDays = Math.random() * 2 - 1; // -1 to +1 days
  
  return {
    ...fsrsResult,
    nextReview: fsrsResult.nextReview.addDays(jitterDays)
  };
}
```

**Daily Queue Generation:**
```
1. Get all cards due today (from all lessons)
2. Add "early review" cards (scheduled for tomorrow ±1 day)
3. Cap at 30 cards max
4. Apply interleaving distribution
5. Save queue to session state
```

---

### 6.4 Progress Tracking

**Interleaving-Specific Metrics:**

```typescript
interface InterleavedStats {
  // Retention by lesson age
  retentionByAge: {
    recent: number;      // Lessons N-5 to N
    medium: number;      // Lessons N-10 to N-6
    old: number;         // Lessons 1 to N-11
  };
  
  // Context switching performance
  contextSwitchAccuracy: number;  // % correct after lesson switch
  blockedAccuracy: number;        // % correct within same lesson
  
  // Lesson coverage
  lessonsReviewed: string[];      // Which lessons appeared
  coveragePercent: number;        // % of selected lessons reviewed
  
  // Difficulty distribution
  easyCards: number;              // ease > 2.5
  mediumCards: number;            // ease 1.8-2.5
  hardCards: number;              // ease < 1.8
}
```

**Visual Dashboard:**
```
┌─────────────────────────────────────────┐
│ 📊 Interleaved Session Stats            │
├─────────────────────────────────────────┤
│ Retention: 87% (+5% vs blocked mode)   │
│ Context switches: 12                    │
│ Lessons covered: 8/10 selected          │
│                                         │
│ By Age:                                 │
│ 🟢 Recent (5): 92%                      │
│ 🟡 Medium (3): 85%                      │
│ 🔴 Old (2): 80% ← Focus here!          │
└─────────────────────────────────────────┘
```

---

### 6.5 UI/UX Design

**Interleaved Mode Setup:**
```
┌─────────────────────────────────────────┐
│ 🔄 Interleaved Practice                 │
├─────────────────────────────────────────┤
│ Select lessons to mix:                  │
│ ☑️ Lesson 1 (12 cards due)             │
│ ☑️ Lesson 5 (8 cards due)              │
│ ☐ Lesson 8 (0 cards due)               │
│ ☑️ Lesson 12 (5 cards due)             │
│                                         │
│ Session type: [Daily Review ▼]          │
│ • Daily Review (20 cards, ~15 min)     │
│ • Cram Mode (50 cards, ~40 min)        │
│ • Weak Points (15 cards, ~10 min)      │
│                                         │
│ [Start Interleaved Session]             │
│                                         │
│ ℹ️ Mixing: 40% old + 40% recent +      │
│    20% new material                     │
└─────────────────────────────────────────┘
```

**During Session:**
```
┌─────────────────────────────────────────┐
│ Card 12/30                              │
│ ━━━━━━━━━━━━━━━━░░░░░░░░░░ 40%          │
│                                         │
│ 🇬🇧 "I want to eat sushi"                │
│                                         │
│ [Reveal Japanese]                       │
│                                         │
│ Source: Lesson 5 (from 3 days ago)     │
│ Next: Lesson 1 → Lesson 12 → Lesson 5  │
└─────────────────────────────────────────┘
```

**Post-Session Summary:**
```
┌─────────────────────────────────────────┐
│ ✅ Session Complete!                    │
├─────────────────────────────────────────┤
│ Score: 26/30 (87%)                      │
│ Time: 18 minutes                        │
│                                         │
│ Lessons reviewed:                       │
│ • Lesson 1: 10 cards (90% accuracy)    │
│ • Lesson 5: 12 cards (83% accuracy)    │
│ • Lesson 12: 8 cards (88% accuracy)    │
│                                         │
│ 🔥 Streak: 5 days of interleaved       │
│                                         │
│ [Start Next Session] [Review Mistakes]  │
└─────────────────────────────────────────┘
```

---

### 6.6 Technical Implementation

**New Components:**
```
frontend/src/components/InterleavedMode/
├── InterleavedSetup.tsx         # Lesson selection & session config
├── InterleavedSession.tsx       # Main practice session
├── InterleavedCard.tsx          # Card display with source indicator
├── ProgressBar.tsx              # Session progress with lesson colors
├── InterleavedStats.tsx         # Post-session analytics
└── useInterleavedQueue.ts       # Queue generation & management
```

**Algorithm Service:**
```typescript
// services/interleaving.ts
export class InterleavingService {
  // Generate mixed queue from selected lessons
  generateQueue(
    lessons: Lesson[],
    sessionType: SessionType,
    maxCards: number
  ): InterleavedCard[];
  
  // Apply no-streak rule
  distributeCards(cards: Card[]): Card[];
  
  // Calculate interleaving stats
  calculateStats(session: Session): InterleavedStats;
  
  // Recommend optimal mix ratio
  suggestMixRatio(lessonCount: number): MixRatio;
}
```

**API Endpoints:**
```typescript
// Get interleaved queue
POST /api/interleaved/queue
body: {
  lessonIds: string[],
  sessionType: "daily" | "cram" | "weak" | "pattern",
  maxCards?: number
}

// Get interleaving stats
GET /api/interleaved/stats?days=30

// Submit session results
POST /api/interleaved/session
body: {
  cardsReviewed: CardResult[],
  sessionType: string,
  duration: number
}
```

**Database Additions:**
```sql
-- Track interleaved session history
interleaved_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  session_type VARCHAR(20),
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  cards_reviewed INTEGER,
  accuracy FLOAT,
  lessons_included TEXT[]
);

-- Track per-lesson performance in interleaved context
interleaved_lesson_stats (
  user_id INTEGER,
  lesson_id VARCHAR(20),
  interleaved_accuracy FLOAT,    -- Accuracy when mixed
  blocked_accuracy FLOAT,        -- Accuracy when isolated
  context_switches INTEGER,      -- Times switched to/from
  PRIMARY KEY (user_id, lesson_id)
);
```

---

### 6.7 Research-Backed Design

**Why Interleaving Works:**

| Study | Finding | Application |
|-------|---------|-------------|
| Rohrer (2010) | 43% better retention | Core algorithm |
| Taylor (2013) | Context switching improves discrimination | Mix similar patterns |
| Sana (2017) | Interleaving > blocking even when harder | Don't simplify for comfort |

**Key Principles Applied:**
1. **Discriminative Contrast:** Mixing 〜てもいい and 〜てはいけません forces active pattern recognition
2. **Contextual Interference:** Slight difficulty increase leads to better long-term learning
3. **Spacing Effect:** Natural gaps between same-lesson reviews enhance retention

---

### 6.8 Integration with Existing Features

| Feature | Interleaved Integration |
|---------|------------------------|
| **Memory Mode** | Add "Interleaved" toggle to use mixing algorithm |
| **Grammar Mode** | Mix grammar patterns across lessons |
| **SRS Algorithm** | Add jitter to prevent clustering |
| **Progress Stats** | Show interleaved vs blocked accuracy comparison |

---

### 6.9 Implementation Phases

**Phase 1: Core Algorithm (Week 1)**
- [ ] Queue generation with mixing rules
- [ ] No-streak distribution logic
- [ ] Basic session flow

**Phase 2: UI/UX (Week 2)**
- [ ] Setup screen with lesson selection
- [ ] Session progress UI
- [ ] Post-session summary

**Phase 3: Smart Features (Week 3)**
- [ ] Session type presets (Daily/Cram/Weak)
- [ ] Smart scheduling with jitter
- [ ] Stats dashboard

**Phase 4: Integration (Week 4)**
- [ ] Merge with Memory Mode
- [ ] API endpoints
- [ ] Testing & refinement

---

### 6.10 Success Metrics

**Target Improvements:**
- 25%+ better long-term retention vs blocked mode
- 90%+ user satisfaction with mixing
- 40% of users choose interleaved as default

**A/B Test:**
- Group A: Blocked practice (current)
- Group B: Interleaved practice (new)
- Measure: 7-day retention rates

---

## 7. Grammar Pattern Drills

**Status:** ⏳ Planned - Needs detailed specification

**Problem:** Current app focuses on vocabulary repetition (Repeat Mode, Memory Mode) but lacks structured grammar practice. Users can memorize phrases but don't actively practice constructing sentences with specific grammar patterns.

**Solution:** Dedicated "Grammar Mode" for active construction and repetition of grammar patterns with AI-powered feedback.

---

### 7.1 Pattern Recognition Mode

**Goal:** Recognize and identify grammar patterns in context.

**Flow:**
1. Show Japanese sentence with highlighted grammar pattern
2. User speaks the pattern name or explains its function
3. AI verification + explanation

**Example:**
```
Sentence: 写真を撮ってもいいですか。
         [〜てもいい]
User: "Permission pattern - asking if something is allowed"
AI: ✅ Correct! 〜てもいいです means "May I..." / "Is it OK to..."
```

---

### 7.2 Sentence Construction Mode

**Goal:** Actively construct sentences using specific patterns.

**Flow:**
1. Prompt: "Ask for permission to enter using 〜てもいいです"
2. User constructs sentence by voice
3. AI analyzes:
   - ✅ Correct: 入ってもいいですか。
   - ⚠️ Partial: 入ります (wrong form, needs 〜て)
   - ❌ Wrong: 入ってはいけません (prohibition, not permission)

**Scoring:**
| Result | Points | Action |
|--------|--------|--------|
| Perfect | 100% | Next pattern |
| Minor error | 70% | Hint + retry |
| Major error | 30% | Explanation + example |

---

### 7.3 Pattern Transformation Drills

**Goal:** Practice converting between related patterns.

**Exercise types:**

**A. Permission ↔ Prohibition**
```
Given: 食べてもいいです (allowed)
Task: Make it prohibited
Answer: 食べてはいけません
```

**B. Polite ↔ Casual**
```
Given: 行きます (polite)
Task: Casual form  
Answer: 行く
```

**C. Affirmative ↔ Negative**
```
Given: わかります (understand)
Task: Negative form
Answer: わかりません
```

**D. Present ↔ Past**
```
Given: 寒いです (cold - present)
Task: Past tense
Answer: 寒かったです
```

---

### 7.4 Contextual Fill-in-the-Blank

**Goal:** Practice patterns in realistic contexts.

**Format:**
```
Scenario: You're at a restaurant. Ask if smoking is allowed.
Hint: Use 〜てもいいです

Sentence: すみません、タバコを＿＿＿＿＿＿。
          [    ?    ]

User speaks: 吸ってもいいですか
AI: ✅ Perfect! "Excuse me, may I smoke?"
```

---

### 7.5 Error Correction Mode

**Goal:** Identify and fix grammar mistakes.

**Format:**
```
Show incorrect sentence:
"行きてはいけません" ❌

User identifies error:
"Wrong te-form - should be 行って not 行きて"

User speaks correct version:
"行ってはいけません" ✅

AI explains:
"行く is an U-verb (iku), so te-form is 行って (itte), 
not 行きて (ikite). Remember: く→いて for U-verbs!"
```

---

### 7.6 Progressive Pattern Chaining

**Goal:** Build complex sentences by combining patterns.

**Levels:**
- Level 1: Single pattern (〜てもいいです)
- Level 2: Two patterns (〜てもいいです + 〜たいです)
- Level 3: Three+ patterns (〜てもいいです + 〜たい + 〜と思います)

**Example Level 2:**
```
Task: "Say you want to take photos, ask if it's allowed"

Step 1: 写真を撮りたいです (desire)
Step 2: 写真を撮ってもいいですか (permission)
Step 3: Combine: 写真を撮りたいんですが、撮ってもいいですか
```

---

### 7.7 Grammar SRS (Spaced Repetition)

**Goal:** Track grammar pattern mastery like vocabulary.

**Tracking per pattern:**
```typescript
interface GrammarProgress {
  pattern: string;           // "〜てもいいです"
  category: string;          // "Permission"
  jlptLevel: string;         // "N5"
  easeFactor: number;        // FSRS algorithm
  intervalDays: number;      // Next review
  totalAttempts: number;
  correctAttempts: number;
  commonErrors: string[];    // ["wrong te-form", "missing です"]
}
```

**Review scheduling:**
- New pattern: Review after 1 day
- Getting it right: 3 days → 7 days → 14 days → 30 days
- Getting it wrong: Reset to 1 day

---

### 7.8 Grammar Patterns Library

**Organized pattern database:**

| Category | Patterns | JLPT |
|----------|----------|------|
| **Permission/Prohibition** | 〜てもいいです, 〜てはいけません, 〜てはだめです | N5 |
| **Desire** | 〜たいです, 〜たくないです, 〜たがっています | N5 |
| **Ability** | 〜ことができます, 〜られます (potential) | N5/N4 |
| **Experience** | 〜ことがあります | N5 |
| **Obligation** | 〜なければなりません, 〜なくてはいけません | N5 |
| **Lack of obligation** | 〜なくてもいいです | N5 |
| **Invitation** | 〜ませんか, 〜ましょう | N5 |
| **Comparison** | 〜より〜の方が, 〜の中で〜がいちばん | N4 |
| **Cause/Reason** | 〜から, 〜ので, 〜ため | N5/N4 |
| **Giving/Receiving** | 〜てあげる, 〜てくれる, 〜てもらう | N4 |

**Each pattern includes:**
- Formation rules
- Usage examples
- Common mistakes
- Related patterns
- Practice exercises

---

### Implementation Architecture

**New Components:**
```
frontend/src/components/GrammarMode/
├── GrammarMode.tsx              # Main container
├── PatternCard.tsx              # Display pattern with examples
├── ConstructionExercise.tsx     # Build sentences
├── TransformationDrill.tsx      # Convert patterns
├── ErrorCorrection.tsx          # Fix mistakes
├── PatternChain.tsx             # Combine patterns
└── GrammarProgress.tsx          # SRS stats
```

**New API Endpoints:**
```typescript
// Get patterns for user's level
GET /api/grammar/patterns?jlptLevel=N5&category=permission

// Validate sentence construction
POST /api/grammar/validate
body: {
  pattern: "〜てもいいです",
  userSentence: "入ってもいいですか",
  context: "asking permission to enter"
}

// Get next pattern for review (SRS)
GET /api/grammar/next-review

// Submit attempt & update progress
POST /api/grammar/progress
body: {
  patternId: string,
  result: "correct" | "partial" | "wrong",
  userSentence: string,
  errorType?: string
}
```

**Database Schema:**
```sql
-- Grammar patterns library
grammar_patterns (
  id SERIAL PRIMARY KEY,
  pattern TEXT NOT NULL,           -- "〜てもいいです"
  category TEXT NOT NULL,          -- "Permission"
  jlpt_level TEXT,                 -- "N5", "N4", etc.
  formation_rules JSONB,           -- [{"step": 1, "rule": "Te-form + もいい"}]
  examples JSONB,                  -- [{"jp": "...", "en": "..."}]
  common_mistakes JSONB            -- [{"mistake": "...", "explanation": "..."}]
);

-- User progress per pattern
user_grammar_progress (
  user_id INTEGER,
  pattern_id INTEGER,
  ease_factor FLOAT DEFAULT 2.5,
  interval_days INTEGER DEFAULT 1,
  next_review_at TIMESTAMP,
  total_attempts INTEGER DEFAULT 0,
  correct_attempts INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  error_patterns JSONB,            -- Track specific mistakes
  PRIMARY KEY (user_id, pattern_id)
);
```

---

### Integration with Existing Features

| Existing Feature | Grammar Integration |
|------------------|---------------------|
| **Memory Mode** | Add grammar cards alongside vocabulary |
| **Chat Sessions** | AI tutors can target specific patterns |
| **Lesson Mode** | Extract patterns from lesson grammar section |
| **Progress Tracking** | Combined vocabulary + grammar stats |

---

### Priority: HIGH

**Why high priority:**
- Fills major gap in app functionality
- Complements vocabulary practice
- Critical for JLPT preparation
- High user demand based on learning science

**Estimated effort:** 3-4 weeks
- Week 1: Pattern library + database schema
- Week 2: Construction & transformation modes
- Week 3: SRS integration + progress tracking
- Week 4: Polish + testing

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

## 9. Database Refactor: Vocabulary Table

**Status:** ⏳ PLANNED

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

## 11. Daily Practice Tracker with Pomodoro Technique

**Status:** ⏳ PLANNED

**Problem:** Users lose motivation without tracking progress and structured focus time.

**Solution:** Built-in daily practice tracking with Pomodoro timer integration.

### Features

**A. Daily Streak Tracking**
- Track consecutive days of practice
- Minimum requirement: 15 min to count as "practiced today"
- Visual calendar heatmap (GitHub-style)
- Current streak + longest streak display

**B. Pomodoro Timer**
- 25-minute focused practice sessions
- 5-minute break between sessions
- Long break (15 min) after 4 sessions
- Auto-start next Pomodoro option
- Session count tracking

**C. Practice Goals**
- Daily: 40 minutes (1-2 Pomodoros)
- Weekly: 5 days minimum
- Monthly targets with progress visualization

**D. Stats Dashboard**
- Total practice time (daily/weekly/monthly)
- Mode breakdown: Chat vs Repeat vs Memory vs Lessons
- Best time of day for practice
- Weak point improvement tracking

### UI Implementation
```
┌─────────────────────────────────┐
│ 🔥 12 day streak    ⏱️ 2/3 today │
├─────────────────────────────────┤
│  [Start 25min Pomodoro]         │
│                                 │
│  Today: 40 min / 40 min goal ✓  │
│  [████████████░░░░░░] 75%       │
│                                 │
│  This week: 5/7 days ✓          │
│  ████░░░                         │
└─────────────────────────────────┘
```

### Technical Notes
- Store data in localStorage (privacy-first)
- Sync with backend when available
- Export data option (JSON/CSV)
- Notification: "Time for practice!" (optional)

### Priority
Medium - Nice to have for motivation, but core learning features come first.

---

---

## 12. Backend Modularization

**Status:** ✅ COMPLETED

**Status:** ✅ Complete (March 2026)

**Changes:**
- Split monolithic `server.ts` (686 lines → 55 lines)
- Created modular route structure in `src/routes/`
  - health, sessions, tts, chat, furigana, lessons, translate, upload, repeat, logs, vocabulary
- Added middleware layer (auth, error-handler)
- Created typed configuration (`src/config/index.ts`)
- Archived 74 one-time scripts to `scripts/archive/`

**Services Restructured:**
- ElevenLabs: Split into types, voices, index modules
- Furigana: Dedicated service with cache persistence
- Lessons: Modular service structure

---

## 13. Frontend Refactoring

**Status:** ✅ COMPLETED

**Status:** ✅ Complete (March 2026)

**Changes:**
- **App.tsx:** ~1813 lines → ~210 lines (-88% reduction)
- **Component Extraction:**
  - Pages: Login, Home, LessonList, LessonDetail, ChatSetup, ChatSession, RepeatSetup, LessonPractice, MemoryModeWrapper
  - HealthCheckWrapper component
- **CSS Modularization:** Split into 7 files
  - base.css, login.css, home.css, chat.css, lesson.css, repeat.css, components.css
- **Type Safety:** Fixed TypeScript types (Lesson.id from number to string)

---

## 14. Vocabulary Review Badges

**Status:** ✅ COMPLETED

**Status:** ✅ Complete (March 2026)

**Features:**
- "↻ N" badge on vocabulary cards showing word repetition across lessons
- Hover tooltip showing other lessons where word appears
- Clickable links to navigate to those lessons
- API endpoint: `/api/lessons/:id/vocabulary-with-sources`

**UI:**
- Badge positioned on vocabulary card header
- Tooltip with lesson title and date
- Gapless hover experience (no disappearing when moving mouse)

---

## 15. Infrastructure & Security

**Status:** ✅ COMPLETED

**Status:** ✅ Complete (March 2026)

**Security:**
- Git history rewritten with git-filter-repo
- Removed API keys from all commits
- Removed personal paths and usernames
- node_modules removed from git tracking
- All secrets in .env (not committed)

**Infrastructure:**
- PM2 process management with auto-restart
- Cloudflare Tunnels for services
- Logging endpoints for debugging
- Status Dashboard with file-based log reading

**Removed:**
- Italian language support (simplified UI to Japanese only)

