# Interleaved Practice Mode

**Status:** ⏳ Planned - Ready for implementation

**Priority:** 7 (Next to implement)

**Complexity:** Medium
**Impact:** High

---

## Problem

Current Memory Mode reviews phrases from selected lessons but presents them in blocks (all from Lesson 5, then all from Lesson 12). Research shows **interleaved practice (mixed topics) produces 43% better long-term retention** than blocked practice.

---

## Solution

**"Interleaved Mode"** — intelligent mixing of phrases from multiple lessons based on:
- SRS due dates (prioritize overdue items)
- Lesson age (older = higher priority for review)
- Difficulty level (mix easy/hard for optimal challenge)
- Pattern variety (alternate grammar patterns)

---

## Core Algorithm

### Input
User selects lessons to include (e.g., Lessons 1, 5, 8, 12)

### Mixing Strategy

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
    // Max 2 consecutive cards from same lesson
  };
}
```

### Mixing Rules

| Rule | Description |
|------|-------------|
| No same-lesson streak | Max 2 consecutive cards from same lesson |
| Overdue priority | Cards 3+ days overdue appear first |
| Age weighting | Lesson 1 cards appear 2x more often than Lesson 12 |
| Difficulty blend | Mix easy (ease > 2.5) and hard (ease < 2.0) cards |

---

## Session Types

### A. Daily Review (Recommended)
```
Duration: 15-20 minutes
Cards: 20-30 mixed from all learned lessons
Algorithm:
  - 40% from lessons 1-10 (foundation review)
  - 40% from lessons 11-20 (recent material)
  - 20% from current lesson (new material)
```

### B. Cram Mode (Before Test)
```
Duration: 30-45 minutes
Cards: 50+ from selected range
Algorithm:
  - Equal distribution across all selected lessons
  - Prioritize cards with lowest ease factors
  - Include previously "Again" rated cards
```

### C. Weak Points Focus
```
Duration: 10-15 minutes
Cards: 15-20 specifically challenging items
Algorithm:
  - Only cards with ease < 2.0
  - Cards marked "Again" 2+ times
  - Mix from all lessons (no lesson bias)
```

### D. Pattern Mastery
```
Duration: Flexible
Cards: All cards using specific grammar pattern
Algorithm:
  - Group by pattern (〜てもいい, 〜たい, etc.)
  - Mix across lessons using same pattern
  - Compare/contrast similar patterns
```

---

## Smart Scheduling

### Spaced Repetition with Interleaving

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

### Daily Queue Generation

1. Get all cards due today (from all lessons)
2. Add "early review" cards (scheduled for tomorrow ±1 day)
3. Cap at 30 cards max
4. Apply interleaving distribution
5. Save queue to session state

---

## Progress Tracking

### Interleaving-Specific Metrics

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

### Visual Dashboard

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

## UI/UX Design

### Interleaved Mode Setup

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

### During Session

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

### Post-Session Summary

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

## Technical Implementation

### New Components

```
frontend/src/components/InterleavedMode/
├── InterleavedSetup.tsx         # Lesson selection & session config
├── InterleavedSession.tsx       # Main practice session
├── InterleavedCard.tsx          # Card display with source indicator
├── ProgressBar.tsx              # Session progress with lesson colors
├── InterleavedStats.tsx         # Post-session analytics
└── useInterleavedQueue.ts       # Queue generation & management
```

### Algorithm Service

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

### API Endpoints

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

### Database Additions

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

## Research-Backed Design

### Why Interleaving Works

| Study | Finding | Application |
|-------|---------|-------------|
| Rohrer (2010) | 43% better retention | Core algorithm |
| Taylor (2013) | Context switching improves discrimination | Mix similar patterns |
| Sana (2017) | Interleaving > blocking even when harder | Don't simplify for comfort |

### Key Principles Applied

1. **Discriminative Contrast:** Mixing 〜てもいい and 〜てはいけません forces active pattern recognition
2. **Contextual Interference:** Slight difficulty increase leads to better long-term learning
3. **Spacing Effect:** Natural gaps between same-lesson reviews enhance retention

---

## Integration with Existing Features

| Feature | Interleaved Integration |
|---------|------------------------|
| **Memory Mode** | Add "Interleaved" toggle to use mixing algorithm |
| **Grammar Mode** | Mix grammar patterns across lessons |
| **SRS Algorithm** | Add jitter to prevent clustering |
| **Progress Stats** | Show interleaved vs blocked accuracy comparison |

---

## Implementation Phases

### Phase 1: Core Algorithm (Week 1)
- [ ] Queue generation with mixing rules
- [ ] No-streak distribution logic
- [ ] Basic session flow

### Phase 2: UI/UX (Week 2)
- [ ] Setup screen with lesson selection
- [ ] Session progress UI
- [ ] Post-session summary

### Phase 3: Smart Features (Week 3)
- [ ] Session type presets (Daily/Cram/Weak)
- [ ] Smart scheduling with jitter
- [ ] Stats dashboard

### Phase 4: Integration (Week 4)
- [ ] Merge with Memory Mode
- [ ] API endpoints
- [ ] Testing & refinement

---

## Success Metrics

### Target Improvements
- 25%+ better long-term retention vs blocked mode
- 90%+ user satisfaction with mixing
- 40% of users choose interleaved as default

### A/B Test
- Group A: Blocked practice (current)
- Group B: Interleaved practice (new)
- Measure: 7-day retention rates

---

*Created: 2026-02-28*