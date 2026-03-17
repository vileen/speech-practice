# Grammar Pattern Drills

**Status:** 🚧 In Progress

**Priority:** 9

**Complexity:** Medium
**Impact:** High

---

## What's Working ✅ (March 2026)

- ✅ Pattern library with categories and JLPT levels
- ✅ Pattern selection screen with category filter
- ✅ SRS-based review system (due patterns, streak tracking)
- ✅ Exercise mode: Fill-in-the-blank with text input
- ✅ Answer validation and feedback (correct/incorrect)
- ✅ Progress tracking per pattern (ease factor, interval, streak)
- ✅ Navigation: Back buttons on both screens
- ✅ UI styling consistent with app theme

## Still Needed ⏳

- ⏳ Pattern recognition mode (identify pattern in sentence)
- ⏳ Sentence construction with voice input (currently text only)
- ⏳ Pattern transformation drills (permission ↔ prohibition, etc.)
- ⏳ Error correction mode
- ⏳ Pattern chaining (combine multiple patterns)
- ⏳ Audio playback for pattern examples

---

## Problem Statement

Current app focuses on vocabulary repetition (Repeat Mode, Memory Mode) but lacks structured grammar practice. Users can memorize phrases but don't actively practice constructing sentences with specific grammar patterns.

**Solution:** Dedicated "Grammar Mode" for active construction and repetition of grammar patterns with AI-powered feedback.

---

## Mode 1: Pattern Recognition

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

## Mode 2: Sentence Construction

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

## Mode 3: Pattern Transformation Drills

**Goal:** Practice converting between related patterns.

### Exercise Types

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

## Mode 4: Contextual Fill-in-the-Blank

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

## Mode 5: Error Correction

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

## Mode 6: Progressive Pattern Chaining

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

## Grammar SRS (Spaced Repetition)

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

## Grammar Patterns Library

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

## Implementation Architecture

### New Components

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

### New API Endpoints

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

### Database Schema

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

## Integration with Existing Features

| Existing Feature | Grammar Integration |
|------------------|---------------------|
| **Memory Mode** | Add grammar cards alongside vocabulary |
| **Chat Sessions** | AI tutors can target specific patterns |
| **Lesson Mode** | Extract patterns from lesson grammar section |
| **Progress Tracking** | Combined vocabulary + grammar stats |

---

## Priority: HIGH

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

## Answer Verification System

**Status:** ✅ IMPLEMENTED (March 2026)

**Problem:** Original implementation only removed punctuation - too strict. "Not quite" for missing just a period.

**Solution:** Smart verification with multiple layers:

### Current Implementation

1. **Levenshtein distance** ≤ 3 characters allowed
2. **Kanji strict** - must match exactly (meaning-critical)
3. **Kana lenient** - small differences accepted (は↔が, です↔だ, etc.)
4. **85% similarity threshold** - using edit distance calculation

### Accepted Examples

| User Answer | Correct | Result | Why |
|-------------|---------|--------|-----|
| `写真を撮ってもいいですか` | `写真を撮ってもいいですか。` | ✅ | Punctuation only |
| `写真を撮ってもいいですが` | `写真を撮ってもいいですか` | ✅ | か↔が (1 char) |
| `今日はいい天気ですね` | `今日はいい天気です` | ✅ | Similarity ≥ 85% |

### Rejected Examples

| User Answer | Correct | Result | Why |
|-------------|---------|--------|-----|
| `しゃしんをとってもいいですか` | `写真を撮ってもいいですか` | ❌ | Kanji changed (reading vs meaning) |
| `写真を食べてもいいですか` | `写真を撮ってもいいですか` | ❌ | Different kanji (撮↔食) |
| `昨日はいい天気です` | `今日はいい天気です` | ❌ | Kanji mismatch (今↔昨) |

---

## Future: Semantic Verification

**Status:** 📋 DOCUMENTED - Not implemented

**Concept:** Use OpenAI embeddings for semantic similarity comparison:
- Convert both user answer and correct answer to embeddings
- Compare cosine similarity
- Accept if meaning is equivalent, even if words differ

### Use Cases

| User Answer | Correct | Traditional | Semantic |
|-------------|---------|-------------|----------|
| `写真を撮っていい？` | `写真を撮ってもいいですか` | ❌ Too short | ✅ Same meaning |
| `写真撮っていいですか` | `写真を撮ってもいいですか` | ❌ Missing を | ✅ Same meaning |
| `お写真を撮らせていただけますか` | `写真を撮ってもいいですか` | ❌ Different words | ✅ Same meaning (polite) |
| `写真を撮ってもいいでしょうか` | `写真を撮ってもいいですか` | ❌ Different ending | ✅ Same meaning |

### Implementation Notes

- **Cost:** ~$0.0001 per comparison (text-embedding-3-small)
- **Latency:** +50-100ms per check
- **Offline fallback:** Keep current Levenshtein method as fallback

### Recommendation

Keep current Levenshtein + Kanji/Kana method as default (fast, offline).
Add semantic verification as optional "Lenient Mode" toggle for advanced learners.

---

*Created: 2026-02-28*