# GrammarMode: Anti-Confusion Features

**Status:** ✅ **FULLY IMPLEMENTED**

**Priority:** 8 (High - Critical for JLPT success)

**Complexity:** Medium-High
**Impact:** Very High

---

## Problem Statement

GrammarMode previously treated each pattern as an isolated learning target. However, Japanese grammar is full of **similar-looking forms with opposite meanings** that learners consistently confuse:

- **Permission** (〜てもいい) vs **Prohibition** (〜てはいけません) — similar structure, opposite meaning
- **Topic は** vs **Subject が** — both mark "what the sentence is about"
- **I-adj negation** (〜くない) vs **Na-adj negation** (〜ではありません) — different rules, similar context
- **Obligation** (〜なければなりません) vs **Lack of Obligation** (〜なくてもいい) — easy to mix up under pressure
- **Location に** (existence) vs **Location で** (action) — both mark place, different uses

**The Cost of Confusion:**
- Users "know" both patterns individually but choose wrong one in real conversation
- SRS scores don't reflect true mastery (passed in isolation, failed when mixed)
- JLPT tests specifically target these confusions (distraction answers)
- Frustration leads to abandoned study sessions

**Solution:** Build anti-confusion features that force users to **discriminate between similar patterns** during practice, not just memorize each in isolation.

---

## Implementation Status

| Feature | Status | Date | Notes |
|---------|--------|------|-------|
| **Comparison Mode** | ✅ Complete | 2026-03-21 | Side-by-side view, "Compare" button on pattern cards |
| **Confusion Tracking** | ✅ Complete | 2026-03-21 | Database schema, confusion events table, confusion_pairs column |
| **Mixed Review Mode** | ✅ Complete | 2026-03-21 | Shuffled patterns from selected categories |
| **Category Groups** | ✅ Complete | 2026-03-21 | Accordion UI with Particles, Adjectives, Permission/Obligation groups |
| **Confusion Alerts** | ✅ Complete | 2026-03-21 | Real-time warning when user enters wrong pattern form |
| **Confusion Badges** | ✅ Complete | 2026-03-21 | ⚠️ badge on pattern cards with confusion history |
| **Backend API** | ✅ Complete | 2026-03-21 | `/related`, `/confusion`, `/confusion-stats`, `/mixed-review`, `/check-confusion` endpoints |
| **Discrimination Drills** | ✅ Complete | 2026-03-21 | "Choose A or B" drill mode with pattern selection and immediate feedback |
| **Pattern Relationship Graph** | ✅ Complete | 2026-03-21 | Visual network showing pattern connections with mastery status |
| **Exercise Coverage** | ✅ Complete | 2026-03-21 | Added exercises for I-Adjective (4), Na-Adjective (5), and Particle (10) patterns |
| **Auto-Remediation** | 📋 Planned | - | Automatically increase frequency of confused pairs in reviews (Future) |

---

## Features Implemented

### 1. Discrimination Drills ✅

**What it is:** A drill mode where users see a context sentence and must explicitly choose between 2-3 similar pattern options before constructing the sentence.

**How it works:**
1. User sees a scenario (e.g., "Choose the correct pattern for: Permission")
2. User sees 2-3 pattern buttons (A, B, C) with different patterns
3. User clicks the correct pattern
4. Immediate feedback shows:
   - If correct: "Correct pattern!" + explanation, then proceed to construction
   - If wrong: "Wrong pattern!" + explanation showing why the chosen pattern doesn't fit
5. Wrong choices are logged as confusion events

**UI Flow:**
```
┌─────────────────────────────────────────────────────────────┐
│ Scenario:                                                   │
│ "Choose the correct pattern for: Permission"                │
│                                                             │
│ ┌────────────────────────┐  ┌────────────────────────┐     │
│ │   A) 食べてもいい      │  │   B) 食べてはいけません │     │
│ │      ✅ Permission     │  │      ❌ Prohibition    │     │
│ │      (May eat)         │  │      (Must not eat)    │     │
│ └────────────────────────┘  └────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

**Technical:**
- New endpoint: `GET /api/grammar/patterns/:id/discrimination`
- Returns exercise with `type: 'discrimination'` and `options` array
- Options include correct pattern + 1-2 distractors from related patterns
- Wrong selections log to `grammar_confusion_events` table

**Files:**
- `~/Projects/speech-practice/frontend/src/components/GrammarMode/GrammarMode.tsx` (DiscriminationDrill component)
- `~/Projects/speech-practice/frontend/src/components/GrammarMode/GrammarMode.css` (discrimination styles)
- `~/Projects/speech-practice/backend/src/routes/grammar.ts` (discrimination endpoint)

---

### 2. Pattern Relationship Graph ✅

**What it is:** A visual network diagram showing how patterns connect to each other - opposites, similarities, and related concepts - with user mastery status overlaid.

**Visual Elements:**
- **Nodes:** Pattern circles with pattern name
  - 🟢 Green = mastered (>80% accuracy)
  - 🟡 Orange = learning (in progress)
  - 🔴 Red = confused (high error rate)
  - ⚪ Gray = not practiced
- **Connections:**
  - 🔴 Red line = Opposite meanings (Permission ↔ Prohibition)
  - 🟡 Yellow line = Similar forms (both use te-form)
  - 🔵 Blue line = Related concepts

**Interactive Features:**
- Click node → Navigate to pattern practice
- Click connection → Open comparison view for that pair
- Filter by: All, Confused only, Mastered only
- Tooltip on hover shows accuracy percentage

**UI:**
```
┌─────────────────────────────────────────────────────────────┐
│ 🕸️ Pattern Relationship Graph          [Filter: All ▼]     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                    [〜てもいい] 🔵                           │
│                   /    ↑    \                               │
│              🔴opposite  │    🔵related                     │
│                 /        │      \                           │
│    [〜てはいけません] 🔴 ←┼→ [〜なくてもいい] 🔵            │
│         ↑                │         ↑                        │
│    both use       common parent:    negation                │
│    te-form           〜てform       pattern                 │
│                                                             │
│  Selected: 〜てもいい (Permission)                          │
│  Accuracy: 85% | Status: Learning 🟡                        │
│  [Practice This]  [Practice Confusion Pair]                 │
└─────────────────────────────────────────────────────────────┘
```

**Technical:**
- SVG-based visualization with force-directed positioning
- Predefined connections in `PREDEFINED_CONNECTIONS` array
- Mastery status calculated from `user_grammar_progress` data
- Responsive design with mobile support

**Files:**
- `~/Projects/speech-practice/frontend/src/components/GrammarMode/PatternGraph.tsx` (new component)
- `~/Projects/speech-practice/frontend/src/components/GrammarMode/PatternGraph.css` (styles)
- `~/Projects/speech-practice/frontend/src/components/GrammarMode/GrammarMode.tsx` (integration)

---

### 3. Exercise Coverage ✅

**Added exercises for:**

#### I-Adjective Forms (4 patterns, 9 exercises)
| Pattern | Exercises |
|---------|-----------|
| Present Affirmative (19) | construction, fill_blank, discrimination |
| Present Negative (20) | construction, fill_blank, error_correction, discrimination |
| Past Affirmative (21) | construction, fill_blank, transformation |
| Past Negative (22) | construction, fill_blank, transformation |

#### Na-Adjective Forms (5 patterns, 13 exercises)
| Pattern | Exercises |
|---------|-----------|
| Present Affirmative (23) | construction, fill_blank, error_correction |
| Present Negative (24) | construction, fill_blank, error_correction |
| Past Affirmative (25) | construction, fill_blank, transformation |
| Past Negative (26) | construction, fill_blank, transformation |
| Before Nouns (27) | construction (×2), fill_blank, error_correction |

#### Particle Patterns (10 patterns, 21 exercises)
| Pattern | Exercises |
|---------|-----------|
| は topic marker (9) | construction, fill_blank, discrimination |
| が subject marker (10) | construction (×2), fill_blank, discrimination |
| を object marker (11) | construction (×2), fill_blank, error_correction |
| に location/time (12) | construction (×3), fill_blank |
| で location/method (13) | construction (×2), discrimination |
| へ direction (14) | construction (×2), fill_blank |
| と and/with (15) | construction (×2), discrimination |
| から from/since (16) | construction (×2), fill_blank |
| まで until/to (17) | construction (×2), transformation |
| の possession (18) | construction (×3), fill_blank |

**Total:** 43 new exercises added

**Migration:**
- File: `~/Projects/speech-practice/backend/src/db/migrations/003_add_grammar_exercises.sql`

---

## UI/UX Screenshots

### Main Screen with New Features
```
┌─────────────────────────────────────────────────────────────┐
│ 📚 Grammar Drills                              あ | 15 due   │
├─────────────────────────────────────────────────────────────┤
│ 🔥 15 patterns ready for review                             │
│    Permission (5), Particles (4), I-Adjectives (3)...       │
│    [Practice Selected] [Practice All]                       │
├─────────────────────────────────────────────────────────────┤
│ 🎯 Mixed Review Mode                                        │
│    Practice shuffled patterns from selected categories      │
│                             [Start Mixed Review]            │
├─────────────────────────────────────────────────────────────┤
│ 🎭 Discrimination Drills                                    │
│    Choose between similar patterns in context               │
│                             [Start Discrimination Drill]    │
├─────────────────────────────────────────────────────────────┤
│ 🕸️ Pattern Relationship Graph                               │
│    Visual map showing pattern connections                   │
│                             [View Graph]                    │
├─────────────────────────────────────────────────────────────┤
│ 📁 Quick Select Groups ▼                                    │
│                                                             │
│ Categories: [Select All] [Deselect All]                     │
│ ☑ Particles  ☑ Permission  ☑ I-Adjectives ...              │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │
│ │ 〜てもいい   │ │ 〜てはいけ   │ │ 写真を撮って  │            │
│ │  Permission │ │  Prohibition│ │  Permission │            │
│ │      N5     │ │      N5     │ │      N5     │            │
│ │  ⚠️ [Compare]│ │  ⚠️ [Compare]│ │     [Compare]│            │
│ └─────────────┘ └─────────────┘ └─────────────┘            │
└─────────────────────────────────────────────────────────────┘
```

### Discrimination Drill Screen
```
┌─────────────────────────────────────────────────────────────┐
│ ← Back                    🎭 Discrimination Drill    3/10   │
├─────────────────────────────────────────────────────────────┤
│ 🎭 Discrimination Drill                                     │
├─────────────────────────────────────────────────────────────┤
│ Scenario:                                                   │
│ "You want to ask if eating is allowed"                      │
│                                                             │
│ 💡 Choose the PERMISSION pattern                            │
├─────────────────────────────────────────────────────────────┤
│ Choose the correct pattern:                                 │
│                                                             │
│ ┌─────────────────────────────────────────────────────┐    │
│ │  A) 食べてもいいです                                 │    │
│ │     ✅ Permission (May eat)                          │    │
│ └─────────────────────────────────────────────────────┘    │
│                                                             │
│ ┌─────────────────────────────────────────────────────┐    │
│ │  B) 食べてはいけません                               │    │
│ │     ❌ Prohibition (Must not eat)                    │    │
│ └─────────────────────────────────────────────────────┘    │
│                                                             │
│ [If wrong selection:]                                       │
│ ┌─────────────────────────────────────────────────────┐    │
│ │ ❌ Wrong pattern!                                   │    │
│ │                                                     │    │
│ │ "てはいけません" is PROHIBITION - it forbids         │    │
│ │ something. You chose the pattern that means          │    │
│ │ "You must not eat" which is the opposite!            │    │
│ │                                                     │    │
│ │ [Compare Patterns →]                                │    │
│ └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### Pattern Graph Screen
```
┌─────────────────────────────────────────────────────────────┐
│ ← Back                           🕸️ Pattern Relationship Map │
├─────────────────────────────────────────────────────────────┤
│ [All Patterns] [Confused Only] [Mastered Only]              │
│                                                             │
│ ─── opposite  ─ ─ related  ● mastered 🟡 learning 🔴 confused│
│                                                             │
│                  ┌──────────┐                               │
│                  │〜てもいい │ ←── 🔵 85% mastered           │
│                  │   🟡     │                               │
│                  └────┬─────┘                               │
│              🔴───────┼───────🔵                            │
│          opposite     │    related                          │
│                       │                                     │
│      ┌────────────────┼────────────┐                        │
│      │〜てはいけません│            │〜なくてもいい            │
│      │      🔴        │            │      🟢                  │
│      │  45% confused  │            │  90% mastered            │
│      └────────────────┘            └──────────┘             │
│                                                             │
│ Selected: 〜てもいい (Permission)                           │
│ Status: Learning 🟡 | Accuracy: 85%                         │
│ Most confused with: 〜てはいけません (40% error rate)       │
│ [Practice This Pattern]  [Practice Confusion Pair]          │
└─────────────────────────────────────────────────────────────┘
```

---

## Technical Implementation

### Component Architecture
```
frontend/src/components/GrammarMode/
├── GrammarMode.tsx              # Updated with discrimination drill
├── GrammarMode.css              # Updated with discrimination styles
├── PatternGraph.tsx             # NEW: Visual relationship graph
├── PatternGraph.css             # NEW: Graph styles
└── index.ts                     # Export updates
```

### Backend API Changes
```
backend/src/routes/grammar.ts
├── GET /patterns/:id/discrimination  # NEW: Get discrimination exercise
├── GET /patterns/:id/related         # Existing: Get related patterns
├── POST /confusion                   # Existing: Log confusion
├── GET /confusion-stats              # Existing: Get confusion stats
├── POST /check-confusion             # Existing: Check for confusion
└── GET /mixed-review                 # Existing: Mixed review patterns
```

### Database Schema
```sql
-- Existing tables used:
- grammar_patterns (with related_patterns column)
- grammar_exercises (added discrimination type)
- grammar_confusion_events
- user_grammar_progress (with confusion_pairs)

-- Migration added:
- 43 new exercises for I/Na-adjectives and Particles
- Related pattern relationships updated
```

---

## Usage Guide

### For Users

**To practice discrimination:**
1. Select categories on the main screen
2. Click "🎭 Start Discrimination Drill"
3. Read the scenario
4. Click the correct pattern button (A, B, or C)
5. Read the feedback - if wrong, compare the patterns
6. After correct selection, construct the full sentence

**To view pattern relationships:**
1. Click "🕸️ View Graph" on the main screen
2. Explore the network:
   - 🔴 Red lines = Opposite meanings
   - 🟡 Yellow lines = Similar forms
   - 🔵 Blue lines = Related concepts
3. Click any node to practice that pattern
4. Click any connection to compare two patterns
5. Use filters to focus on confused or mastered patterns

**To identify your weak points:**
- Patterns with ⚠️ badge have confusion history
- Graph shows red nodes for confused patterns
- Mixed review mode prioritizes weak patterns

---

## Success Metrics

| Metric | Target | How to Track |
|--------|--------|--------------|
| Discrimination accuracy | >75% correct on first try | `grammar_confusion_events` table |
| Confusion rate reduction | 30% decrease over 2 weeks | Compare weekly confusion counts |
| Mixed review accuracy | >70% in mixed sessions | Progress tracking per pattern |
| Feature adoption | >50% try discrimination/graph | Usage analytics (future) |
| User satisfaction | Positive qualitative feedback | User reports |

---

## Future Enhancements

### Phase 2: Auto-Remediation (Planned)
- Automatically schedule confused pairs for extra review
- Increase frequency of discrimination drills for weak pairs
- Daily "warm-up" with confused patterns before main session

### Phase 3: Advanced Analytics
- Per-user confusion heatmaps
- Predictive modeling for likely confusion patterns
- Personalized study paths based on confusion profile

---

## Related Documents

- [Grammar Pattern Drills](./07-grammar-drills.md) - Base GrammarMode implementation
- [Interleaved Practice](./06-interleaved-practice.md) - Queue mixing algorithms
- [Spaced Repetition](./03-spaced-repetition.md) - FSRS integration

---

*Created: 2026-03-20*
*Updated: 2026-03-21 - Marked all Phase 1 features complete*
