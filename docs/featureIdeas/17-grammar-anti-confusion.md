# GrammarMode: Anti-Confusion Features

**Status:** ✅ Partially Implemented (Phase 1 Complete)

**Priority:** 8 (High - Critical for JLPT success)

**Complexity:** Medium-High
**Impact:** Very High

---

## Problem Statement

GrammarMode currently treats each pattern as an isolated learning target. However, Japanese grammar is full of **similar-looking forms with opposite meanings** that learners consistently confuse:

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
| **Discrimination Drills** | 🚧 Partial | - | "Practice This" button exists, but no explicit "Choose A or B" drill mode yet |
| **Pattern Relationship Graph** | 📋 Not Started | - | Visual map of pattern connections (hierarchy, opposites) |
| **Auto-Remediation** | 📋 Not Started | - | Automatically increase frequency of confused pairs in reviews |

### What's Missing for Full Implementation

1. **Discrimination Drills** - UI where user sees context and must explicitly choose between 2-3 pattern buttons (not just construction)
2. **Pattern Relationship Graph** - Visual network diagram showing pattern connections
3. **Auto-Remediation** - SRS algorithm modification to prioritize confused pairs
4. **Exercise Coverage** - Some patterns (like adjective forms) lack exercises entirely

---

## User Stories

### Story 1: The Permission/Prohibition Confusion
> *"I keep mixing up 〜てもいい and 〜てはいけません. I know both forms, but when the app asks me to say 'You can't smoke here,' I panic and say 吸ってもいい. I need practice that forces me to choose between them actively."*

**Need:** A mode where I see both patterns side-by-side and must select/construct the correct one based on meaning.

### Story 2: The JLPT Test-Taker
> *"JLPT N5 always has questions like: 'Choose the correct particle: 私___学生です.' I know は and が individually, but the test forces me to pick. I need to practice that exact discrimination."*

**Need:** Multiple-choice style drills that present similar options and require confident selection.

### Story 3: The Self-Aware Learner
> *"I can feel I'm confusing certain patterns, but I don't have data on which ones. The app should track my specific confusion patterns and give me targeted practice."*

**Need:** Confusion tracking that identifies weak pairs and automatically schedules remediation.

### Story 4: The Mixed-Context Speaker
> *"I do fine in GrammarMode drills, but in Chat Mode or real conversation, I freeze up. I need practice that mimics the chaos of real language use where any pattern could appear."*

**Need:** Mixed review mode that throws random patterns together to simulate real conversation pressure.

### Story 5: The Visual Learner
> *"I need to see how patterns relate to each other. A graph showing that 〜てもいい connects to both 〜てはいけません (opposite) and 〜なくてもいい (related obligation concept) would help me organize my mental model."*

**Need:** Visual pattern relationship graph for mental model building.

---

## Feature Specifications

### Feature 1: Similar Forms Comparison Mode

**Goal:** Force active discrimination between easily confused patterns by presenting them together.

#### Mode 1A: Side-by-Side Comparison

**UI Flow:**
```
┌─────────────────────────────────────────────────────────────┐
│ 🔍 Compare & Contrast                                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐    vs    ┌─────────────┐                  │
│  │ 〜てもいい   │          │ 〜てはいけません │              │
│  │             │          │             │                  │
│  │ Formation:  │          │ Formation:  │                  │
│  │ Te-form +   │          │ Te-form +   │                  │
│  │ もいい      │          │ はいけません │                  │
│  │             │          │             │                  │
│  │ Meaning:    │          │ Meaning:    │                  │
│  │ ✅ ALLOWED  │          │ ❌ FORBIDDEN │                  │
│  │             │          │             │                  │
│  │ Example:    │          │ Example:    │                  │
│  │ 食べてもいい  │          │ 食べてはいけません│             │
│  │ (You may eat)│         │ (You must not eat)│            │
│  └─────────────┘          └─────────────┘                  │
│                                                             │
│  💡 Key Difference: もいい ("also good") vs はいけません      │
│     ("topic marker + not allowed")                          │
│                                                             │
│           [Next: Practice Drill →]                         │
└─────────────────────────────────────────────────────────────┘
```

**Comparison Elements:**
- Formation rules side-by-side
- Example sentences with English translations
- Visual markers (✅ vs ❌, color coding)
- "Key Difference" explanation highlighting the critical distinction

#### Mode 1B: Active Discrimination Drill

**Flow:**
1. Show scenario: "You want to ask if eating is allowed"
2. Present both pattern options:
   ```
   A) 食べてもいいですか     B) 食べてはいけませんか
   ```
3. User speaks the correct choice
4. AI verifies and explains:
   - If correct: "✅ Right! 〜てもいい asks for permission"
   - If wrong: "❌ That's prohibition. You asked 'Is eating forbidden?'"

**Scoring:**
| Outcome | Points | Follow-up |
|---------|--------|-----------|
| Correct first try | 100% | Next pair |
| Wrong choice | 0% | Show comparison again, explain difference |
| Hesitation (3+ sec) | 50% | Extra practice on this pair |

#### Mode 1C: Transformation Challenge

**Goal:** Practice converting between related patterns (builds deep understanding).

**Example:**
```
Convert: 写真を撮ってもいいですか (Permission)
To:     Prohibition form

Answer: 写真を撮ってはいけません

💡 Tip: Change もいい (also OK) → はいけません (topic + not allowed)
```

**Transformation Types:**
- Permission ↔ Prohibition
- Obligation ↔ Lack of Obligation
- Polite ↔ Casual
- Affirmative ↔ Negative
- Present ↔ Past

---

### Feature 2: Confusion Tracking

**Goal:** Identify, track, and remediate specific pattern confusions for each user.

#### Data Model

```typescript
interface ConfusionPair {
  patternA: string;           // "〜てもいい"
  patternB: string;           // "〜てはいけません"
  confusionType: 'opposite' | 'similar_form' | 'similar_meaning';
  totalEncounters: number;    // Times user saw both together
  confusionCount: number;     // Times user mixed them up
  confusionRate: number;      // confusionCount / totalEncounters
  lastConfusedAt: Date;
  remediationStatus: 'none' | 'in_progress' | 'resolved';
}

interface UserConfusionProfile {
  userId: string;
  weakPairs: ConfusionPair[];
  strongestConfusion: ConfusionPair;  // Highest confusion rate
  recentlyResolved: ConfusionPair[];  // Pairs that improved
  recommendedFocus: string[];         // Pattern IDs needing work
}
```

#### Confusion Detection

**Automatic Detection Triggers:**
1. **Direct confusion:** User constructs sentence with wrong pattern
   ```
   Prompt: "Say you MAY enter"
   User:   "入ってはいけません" (prohibition, not permission)
   → Log confusion: 〜てもいい vs 〜てはいけません
   ```

2. **Hesitation pattern:** User takes >5 seconds when pattern appears
   ```
   → Flag for potential confusion with similar pattern
   ```

3. **SRS anomaly:** User gets pattern right in isolation but wrong in Chat Mode
   ```
   → Context-switch confusion detected
   ```

#### Confusion Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│ 🧠 Your Confusion Profile                                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ⚠️  Needs Work (3 pairs)                                   │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                             │
│  1. てもいい vs てはいけません                               │
│     Confusion rate: 40% (4/10 times)                        │
│     🔴 High risk - Schedule comparison drill                │
│                                                             │
│  2. は vs が                                                │
│     Confusion rate: 25% (3/12 times)                        │
│     🟡 Moderate - Continue mixed practice                   │
│                                                             │
│  3. なければなりません vs なくてもいい                       │
│     Confusion rate: 20% (2/10 times)                        │
│     🟡 Moderate - Watch for improvement                     │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  ✅ Recently Improved                                       │
│  • くない vs ではありません (was 35%, now 5%)               │
│                                                             │
│  [Start Focus Session on Weak Pairs]                       │
└─────────────────────────────────────────────────────────────┘
```

#### Automatic Remediation

**When confusion rate >30% for any pair:**
1. Auto-schedule comparison mode session (next 24h)
2. Add pair to "Daily Warm-up" (2-3 quick drills before main session)
3. Reduce interval for both patterns (review more frequently)
4. Flag for mixed practice priority

**When confusion rate <10% for 5 consecutive encounters:**
1. Mark as "resolved"
2. Move to "maintenance mode" (review monthly)
3. Celebrate with user: "🎉 You've mastered Permission vs Prohibition!"

---

### Feature 3: Mixed Review Mode

**Goal:** Simulate real conversation pressure by mixing all learned patterns randomly.

#### The Problem with Isolated Practice

Current GrammarMode: "Today you're practicing Permission patterns"
→ User enters "Permission mindset," doesn't practice choosing the right pattern

Real conversation: "Any pattern could be needed at any moment"
→ User must recognize context and select appropriate pattern

#### Mixed Review Implementation

**Algorithm:**
```typescript
function generateMixedSession(patterns: Pattern[]): Exercise[] {
  // 1. Get all patterns user has learned (SRS stage ≥ 2)
  const learnedPatterns = patterns.filter(p => p.srsStage >= 2);
  
  // 2. Weight by weakness (confusion pairs get more reps)
  const weightedPatterns = learnedPatterns.map(p => ({
    pattern: p,
    weight: calculateWeaknessWeight(p) // Higher for confused patterns
  }));
  
  // 3. Ensure confusion pairs appear together
  const exercises = [];
  for (const pair of userConfusionProfile.weakPairs) {
    exercises.push(createComparisonExercise(pair));
  }
  
  // 4. Fill remaining with random pattern exercises
  const remainingSlots = 20 - exercises.length;
  exercises.push(...selectRandom(weightedPatterns, remainingSlots));
  
  // 5. Shuffle so user can't predict pattern type
  return shuffle(exercises);
}
```

#### Session Flow Example

```
Mixed Review Session (20 exercises)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Card 1/20: Permission
"Ask if you may take photos"
→ 写真を撮ってもいいですか ✅

Card 2/20: Subject Marker  
"I am a student" (emphasize "I")
→ 私が学生です ✅

Card 3/20: COMPARISON DRILL ⚡
"You may NOT enter" (Choose: てもいい / てはいけません)
→ 入ってはいけません ✅

Card 4/20: Desire
"I want to eat sushi"
→ 寿司を食べたいです ✅

Card 5/20: COMPARISON DRILL ⚡
"Is smoking allowed?" (は vs が)
→ タバコは吸ってもいいですか ✅

[Continue... random order, no predictability]
```

#### Difficulty Levels

| Level | Description | Pattern Mix |
|-------|-------------|-------------|
| **Beginner** | Same-category mixing only | Permission + Prohibition + Lack of Obligation |
| **Intermediate** | Related concepts mixed | All N5 grammar patterns |
| **Advanced** | Everything mixed + time pressure | All learned patterns, 10s per question |
| **JLPT Sim** | Test conditions | Random mix, multiple choice, scored |

---

### Feature 4: Pattern Relationship Graph

**Goal:** Visualize how patterns connect to build mental model of grammar system.

#### Visual Graph Design

```
┌─────────────────────────────────────────────────────────────┐
│ 🕸️ Pattern Relationship Map                                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                    [〜てもいい]                               │
│                   /    ↑    \                               │
│              opposite  │    related                         │
│                 /      │      \                             │
│    [〜てはいけません] ──┼── [〜なくてもいい]                    │
│         ↑              │         ↑                          │
│    both use    common parent:    negation                   │
│    te-form        〜てform      pattern                     │
│                                                             │
│    [〜なければなりません] ←────── opposite ──────→ [〜なくてもいい] │
│         ↑                                          ↑        │
│    obligation                                no obligation  │
│    (must do)                                  (don't have to)│
│                                                             │
│  Legend:                                                    │
│  ─── opposite meaning    ─ ─ related concept               │
│  →→→ shared structure    ⚡ frequent confusion              │
│                                                             │
│  [Explore: Permission/Prohibition Cluster]                 │
│  [Explore: Obligation Cluster]                             │
│  [Explore: All Connections]                                │
└─────────────────────────────────────────────────────────────┘
```

#### Graph Features

**Node Types:**
- 🔵 Pattern node (clickable, links to practice)
- 🟡 Category cluster (groups related patterns)
- 🔴 Confusion hotspot (pairs with high user confusion)
- 🟢 Mastered pattern (user has >90% accuracy)

**Edge Types:**
- **Solid line:** Opposite meanings (Permission ↔ Prohibition)
- **Dashed line:** Related concepts (both use te-form)
- **Dotted line:** Shared structure (both end in 〜いです)
- **Red edge:** User confusion detected
- **Green edge:** User has mastered distinction

#### Interactive Features

1. **Click pattern → Start focused practice**
2. **Click edge → See comparison drill for that pair**
3. **Filter by:** JLPT level, category, mastery status
4. **Time-lapse view:** Show how user's graph changes over time

#### Mental Model Building

The graph helps users see:
- "These 3 patterns are actually the same structure with different endings"
- "These 2 patterns are opposites - if I confuse them, the meaning flips"
- "I've mastered this cluster but that cluster needs work"

---

## Technical Implementation Notes

### Component Architecture

```
frontend/src/components/GrammarMode/
├── AntiConfusion/
│   ├── ComparisonMode.tsx          # Side-by-side pattern comparison
│   ├── DiscriminationDrill.tsx     # Choose between patterns
│   ├── TransformationChallenge.tsx # Convert pattern A → pattern B
│   ├── ConfusionDashboard.tsx      # User confusion profile
│   ├── MixedReviewMode.tsx         # Random pattern practice
│   └── PatternGraph.tsx            # Visual relationship map
├── hooks/
│   ├── useConfusionTracking.ts     # Track pattern confusions
│   ├── usePatternRelationships.ts  # Pattern graph data
│   └── useMixedReview.ts           # Mixed session generation
└── services/
    ├── confusionDetector.ts        # Detect confusion from user input
    └── relationshipBuilder.ts      # Build pattern relationship graph
```

### State Management

```typescript
// Confusion tracking state
interface ConfusionState {
  profile: UserConfusionProfile;
  isLoading: boolean;
  
  // Actions
  recordConfusion: (pair: PatternPair) => void;
  recordSuccess: (pair: PatternPair) => void;
  markResolved: (pair: PatternPair) => void;
  getRecommendedFocus: () => Pattern[];
}

// Mixed review state
interface MixedReviewState {
  queue: Exercise[];
  currentIndex: number;
  sessionStats: {
    correct: number;
    incorrect: number;
    confusionTriggers: number;
  };
  
  // Actions
  generateSession: (config: SessionConfig) => void;
  submitAnswer: (answer: Answer) => void;
  skipExercise: () => void;
}
```

### Key Algorithms

#### Confusion Detection Algorithm
```typescript
function detectConfusion(
  prompt: ExercisePrompt,
  userAnswer: string,
  expectedPattern: Pattern
): ConfusionResult | null {
  // 1. Check if answer matches a different pattern
  for (const pattern of allPatterns) {
    if (pattern.id === expectedPattern.id) continue;
    
    if (matchesPattern(userAnswer, pattern)) {
      return {
        type: 'wrong_pattern',
        usedPattern: pattern,
        expectedPattern: expectedPattern,
        confidence: calculateMatchConfidence(userAnswer, pattern)
      };
    }
  }
  
  // 2. Check for hesitation (time-based)
  if (responseTime > HESITATION_THRESHOLD) {
    return {
      type: 'hesitation',
      possibleConfusion: findSimilarPatterns(expectedPattern)
    };
  }
  
  return null;
}
```

#### Mixed Review Queue Generation
```typescript
function generateMixedQueue(
  userPatterns: Pattern[],
  confusionProfile: UserConfusionProfile,
  sessionLength: number = 20
): Exercise[] {
  const queue: Exercise[] = [];
  
  // 1. Prioritize weak confusion pairs (40% of session)
  const weakPairs = confusionProfile.weakPairs
    .filter(p => p.confusionRate > 0.2)
    .slice(0, Math.floor(sessionLength * 0.4));
  
  for (const pair of weakPairs) {
    queue.push(createComparisonExercise(pair));
  }
  
  // 2. Add individual pattern practice (40% of session)
  const individualSlots = Math.floor(sessionLength * 0.4);
  const weightedPatterns = applyConfusionWeights(userPatterns, confusionProfile);
  queue.push(...selectWeightedRandom(weightedPatterns, individualSlots));
  
  // 3. Add random review (20% of session)
  const randomSlots = sessionLength - queue.length;
  queue.push(...selectRandom(userPatterns, randomSlots));
  
  // 4. Shuffle to prevent pattern recognition
  return fisherYatesShuffle(queue);
}
```

---

## Database Changes Needed

### New Tables

```sql
-- Track confusion pairs (predefined relationships between patterns)
CREATE TABLE pattern_confusion_pairs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern_a_id UUID NOT NULL REFERENCES grammar_patterns(id),
  pattern_b_id UUID NOT NULL REFERENCES grammar_patterns(id),
  relationship_type VARCHAR(50) NOT NULL, -- 'opposite', 'similar_form', 'similar_meaning'
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(pattern_a_id, pattern_b_id)
);

-- Track user-specific confusion data
CREATE TABLE user_pattern_confusions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  pair_id UUID NOT NULL REFERENCES pattern_confusion_pairs(id),
  total_encounters INTEGER DEFAULT 0,
  confusion_count INTEGER DEFAULT 0,
  last_confused_at TIMESTAMP,
  last_encounter_at TIMESTAMP,
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, pair_id)
);

-- Track individual confusion events for analytics
CREATE TABLE confusion_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  pair_id UUID NOT NULL REFERENCES pattern_confusion_pairs(id),
  exercise_type VARCHAR(50) NOT NULL,
  prompt TEXT NOT NULL,
  user_answer TEXT NOT NULL,
  expected_answer TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Track pattern relationships for graph visualization
CREATE TABLE pattern_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_pattern_id UUID NOT NULL REFERENCES grammar_patterns(id),
  target_pattern_id UUID NOT NULL REFERENCES grammar_patterns(id),
  relationship_type VARCHAR(50) NOT NULL, -- 'opposite', 'similar_structure', 'shared_component'
  strength FLOAT DEFAULT 1.0, -- 0.0 to 1.0
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(source_pattern_id, target_pattern_id, relationship_type)
);

-- Mixed review session tracking
CREATE TABLE mixed_review_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  started_at TIMESTAMP NOT NULL,
  completed_at TIMESTAMP,
  total_exercises INTEGER NOT NULL,
  correct_count INTEGER DEFAULT 0,
  confusion_triggers INTEGER DEFAULT 0,
  patterns_included UUID[] NOT NULL,
  difficulty_level VARCHAR(20) NOT NULL
);
```

### Schema Updates to Existing Tables

```sql
-- Add confusion tracking to grammar progress
ALTER TABLE user_grammar_progress ADD COLUMN IF NOT EXISTS 
  confusion_pairs JSONB DEFAULT '[]'; -- Array of {pair_id, confusion_count}

-- Add mixed review stats
ALTER TABLE user_grammar_progress ADD COLUMN IF NOT EXISTS 
  mixed_review_accuracy FLOAT DEFAULT 0;

-- Add last mixed review date
ALTER TABLE user_grammar_progress ADD COLUMN IF NOT EXISTS 
  last_mixed_review_at TIMESTAMP;
```

### Indexes for Performance

```sql
-- Quick lookup of user's confusion data
CREATE INDEX idx_user_confusions_user_pair ON user_pattern_confusions(user_id, pair_id);

-- Find most confused patterns
CREATE INDEX idx_confusion_events_user_time ON confusion_events(user_id, created_at DESC);

-- Pattern relationship lookups
CREATE INDEX idx_pattern_relationships_source ON pattern_relationships(source_pattern_id);
```

---

## UI/UX Mockups (Text Descriptions)

### Screen 1: Anti-Confusion Hub (Entry Point)

```
┌─────────────────────────────────────────────────────────────┐
│ 🎯 GrammarMode: Anti-Confusion                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Master similar grammar patterns and stop mixing them up!   │
│                                                             │
│  ┌─────────────────────┐  ┌─────────────────────┐          │
│  │ 🔍 Compare &        │  │ ⚡ Mixed Review      │          │
│  │    Contrast         │  │    Mode              │          │
│  │                     │  │                     │          │
│  │ Side-by-side        │  │ Random pattern mix  │          │
│  │ pattern comparison  │  │ - simulates real    │          │
│  │                     │  │   conversation      │          │
│  │ Best for: Learning  │  │                     │          │
│  │ differences         │  │ Best for: Building  │          │
│  └─────────────────────┘  │ fluency             │          │
│                           └─────────────────────┘          │
│  ┌─────────────────────┐  ┌─────────────────────┐          │
│  │ 🧠 Your Confusion   │  │ 🕸️ Pattern Map      │          │
│  │    Profile          │  │                     │          │
│  │                     │  │ Visual grammar      │          │
│  │ See which patterns  │  │ relationship graph  │          │
│  │ you confuse most    │  │                     │          │
│  │                     │  │ Best for: Seeing    │          │
│  │ 3 pairs need work → │  │ the big picture     │          │
│  └─────────────────────┘  └─────────────────────┘          │
│                                                             │
│  ⚠️ Focus Recommended: てもいい vs てはいけません            │
│     [Start 5-Minute Focus Drill]                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Screen 2: Comparison Mode (Side-by-Side)

```
┌─────────────────────────────────────────────────────────────┐
│ ← Back                    🔍 Compare & Contrast    3/10     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Pattern Pair: Permission vs Prohibition                    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                     │   │
│  │   ┌──────────────┐         ┌──────────────┐        │   │
│  │   │  〜てもいい   │   ↔    │ 〜てはいけません│       │   │
│  │   │              │         │              │        │   │
│  │   │   ✅ MAY     │         │   ❌ MUST NOT │        │   │
│  │   │              │         │              │        │   │
│  │   │ 食べてもいい  │         │ 食べてはいけません│     │   │
│  │   │ (May eat)    │         │ (Must not eat)│       │   │
│  │   └──────────────┘         └──────────────┘        │   │
│  │                                                     │   │
│  │   Key Difference:                                   │   │
│  │   もいい = "also OK" (permission)                   │   │
│  │   はいけません = "not allowed" (prohibition)        │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Examples in Context:                                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  ここで写真を撮ってもいいですか。                     │   │
│  │  "May I take photos here?"                          │   │
│  │                                                     │   │
│  │  ここで写真を撮ってはいけません。                     │   │
│  │  "You must not take photos here."                   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│              [Start Practice Drill →]                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Screen 3: Discrimination Drill

```
┌─────────────────────────────────────────────────────────────┐
│ ← Back                    ⚡ Discrimination Drill    2/10   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Scenario:                                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                     │   │
│  │  "You want to ask if smoking is allowed"            │   │
│  │                                                     │   │
│  │  💡 Hint: Use the PERMISSION form                   │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Choose and speak:                                          │
│  ┌────────────────────────┐  ┌────────────────────────┐    │
│  │   A) 吸ってもいい      │  │   B) 吸ってはいけません │    │
│  │                        │  │                        │    │
│  │   [🔊 Listen]          │  │   [🔊 Listen]          │    │
│  │                        │  │                        │    │
│  │   ✅ Permission        │  │   ❌ Prohibition       │    │
│  │      (May smoke)       │  │      (Must not smoke)  │    │
│  └────────────────────────┘  └────────────────────────┘    │
│                                                             │
│  [🎤 Hold to Speak]                                        │
│                                                             │
│  Recognized: "吸ってもいいですか"                          │
│                                                             │
│            [Submit Answer]                                 │
└─────────────────────────────────────────────────────────────┘
```

### Screen 4: Confusion Profile Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│ ← Back                           🧠 Your Confusion Profile  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Overview                                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Total patterns learned: 27                         │   │
│  │  Confusion pairs tracked: 8                         │   │
│  │  Overall accuracy: 84%                              │   │
│  │  Mixed review accuracy: 76%                         │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ⚠️ Active Confusion Risks                                  │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🔴 てもいい vs てはいけません                        │   │
│  │    Confused 4 of 10 times (40%)                     │   │
│  │    Last confused: Today                             │   │
│  │    [→ Focus Drill]  [Mark Resolved]                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🟡 は vs が                                         │   │
│  │    Confused 3 of 12 times (25%)                     │   │
│  │    Last confused: 2 days ago                        │   │
│  │    [→ Focus Drill]  [Mark Resolved]                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🟡 なければなりません vs なくてもいい                │   │
│  │    Confused 2 of 10 times (20%)                     │   │
│  │    Last confused: 5 days ago                        │   │
│  │    [→ Focus Drill]  [Mark Resolved]                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ✅ Recently Mastered                                       │
│  • くない vs ではありません - 95% accuracy                  │
│  • に vs で (location) - 92% accuracy                       │
│                                                             │
│  [Start Focus Session on All Weak Pairs]                   │
└─────────────────────────────────────────────────────────────┘
```

### Screen 5: Mixed Review Session

```
┌─────────────────────────────────────────────────────────────┐
│ ← Exit              ⚡ Mixed Review           Card 7/20     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Progress: ━━━━━━━━━━━━░░░░░░░░░░ 35%                       │
│                                                             │
│  Pattern Type: 🔀 RANDOM (Obligation)                       │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                     │   │
│  │  "You MUST finish homework"                         │   │
│  │                                                     │   │
│  │  💡 Hint: Use なければなりません                      │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [🎤 Hold to Speak]                                        │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  Session Stats:                                             │
│  ✅ Correct: 6  |  ❌ Wrong: 0  |  ⚡ Mixed: 1              │
│                                                             │
│  Recent cards:                                              │
│  • Card 6: Desire ✅                                        │
│  • Card 5: COMPARISON ✅ (Permission vs Prohibition)       │
│  • Card 4: Experience ✅                                    │
│  • Card 3: Ability ✅                                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Screen 6: Pattern Relationship Graph

```
┌─────────────────────────────────────────────────────────────┐
│ ← Back                           🕸️ Pattern Relationship Map │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Filter: [All Patterns ▼]  [Show Confusions Only ☐]        │
│                                                             │
│  Legend: ─── opposite  ─ ─ related  →→ shared structure    │
│                                                             │
│                    ┌──────────┐                             │
│                    │ 〜てもいい │ ←───┐  🔵 Learned          │
│                    │   (🔵)    │     │                      │
│                    └────┬─────┘     │  🔴 Confusion risk    │
│                   ┌─────┼─────┐     │  ⚪ Not learned       │
│                   │     │     │     │                      │
│              ─────┘     │     └─────┤                      │
│              opposite   │    related│                      │
│                   │     │     │     │                      │
│              ┌────┴────┐│┌────┴────┐│                      │
│              │〜てはいけ│←┘〜なくても││                      │
│              │ません(🔴)│  いい(🔵) ││                      │
│              └────┬────┘└─────────┘│                      │
│                   │                 │                      │
│                   │    ┌────────────┘                      │
│                   │    │                                   │
│                   │┌───┴──────────┐                        │
│                   └┤〜なければなり│                        │
│                    │  ません(🔵)   │                        │
│                    └──────────────┘                        │
│                                                             │
│  Selected: 〜てもいい                                       │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  • Meaning: Permission (may do)                             │
│  • Your accuracy: 85%                                       │
│  • Most confused with: 〜てはいけません (40% error rate)     │
│                                                             │
│  [Practice This Pattern]  [Practice Confusion Pair]        │
└─────────────────────────────────────────────────────────────┘
```

---

## Priority & Timeline

### Phase 1: Foundation (Week 1-2)
**Priority: CRITICAL**

| Feature | Effort | Description |
|---------|--------|-------------|
| Confusion Pair Database | 2 days | Define all confusion relationships in database |
| Comparison Mode UI | 3 days | Side-by-side pattern comparison screen |
| Basic Discrimination Drill | 3 days | Choose between two patterns |

**Deliverable:** Users can compare patterns side-by-side and practice choosing between two options.

### Phase 2: Tracking & Intelligence (Week 3-4)
**Priority: HIGH**

| Feature | Effort | Description |
|---------|--------|-------------|
| Confusion Detection | 3 days | Detect when user uses wrong pattern |
| Confusion Dashboard | 2 days | UI to view confusion profile |
| Automatic Remediation | 3 days | Auto-schedule practice for weak pairs |

**Deliverable:** System tracks user confusions and recommends targeted practice.

### Phase 3: Mixed Review (Week 5-6)
**Priority: HIGH**

| Feature | Effort | Description |
|---------|--------|-------------|
| Mixed Queue Algorithm | 3 days | Generate randomized pattern sessions |
| Mixed Review UI | 2 days | Session interface with random patterns |
| Difficulty Levels | 2 days | Beginner/Intermediate/Advanced/JLPT modes |

**Deliverable:** Users can practice patterns in random order simulating real use.

### Phase 4: Visualization (Week 7-8)
**Priority: MEDIUM**

| Feature | Effort | Description |
|---------|--------|-------------|
| Pattern Relationship Graph | 4 days | Visual graph of pattern connections |
| Interactive Graph Features | 2 days | Click to practice, filter, time-lapse |
| Graph Data Population | 2 days | Define all pattern relationships |

**Deliverable:** Visual map showing how patterns connect and user's mastery status.

### Total Timeline: 8 weeks

### Recommended Implementation Order

1. **Start with Comparison Mode** - Immediate user value, teaches discrimination
2. **Add Confusion Tracking** - Critical data for personalization
3. **Build Mixed Review** - Most impactful for fluency
4. **Finish with Pattern Graph** - Nice-to-have visualization

### Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Confusion reduction | 50% decrease in pair confusion rate | Track before/after for top 5 pairs |
| Mixed review accuracy | >80% accuracy in mixed sessions | Compare to isolated session accuracy |
| User engagement | 60% of users try anti-confusion features | Feature adoption rate |
| JLPT readiness | 90% accuracy on JLPT-style distractors | Simulated test questions |
| User satisfaction | >4.5/5 rating for GrammarMode | In-app feedback survey |

---

## Related Documents

- [Grammar Pattern Drills](./07-grammar-drills.md) - Base GrammarMode implementation
- [Interleaved Practice](./06-interleaved-practice.md) - Queue mixing algorithms
- [Spaced Repetition](./03-spaced-repetition.md) - FSRS integration

---

*Created: 2026-03-20*
