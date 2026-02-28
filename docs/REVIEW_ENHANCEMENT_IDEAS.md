# Review Mode Enhancement Ideas

> Ideas for improving the material review process after lessons.
> Passive reading of grammar/vocabulary is ineffective - active recall is key.

---

## 1. Hide Mode (Memory Recall)

**Problem:** Current "Repeat After Me" shows the Japanese text immediately, working only short-term memory.

**Solution:** Hide the Japanese phrase initially. Workflow:
- Show only: 🇬🇧 "I want to eat sushi"
- User attempts from memory → speaks Japanese
- Recording + reveal correct answer → comparison
- Self-assessment: ✅ Knew it / ❌ Didn't know (for SRS algorithm)

**Implementation:** Add toggle "Hide Japanese" in RepeatMode settings.

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

**Track in database for each phrase:**
- `ease_factor` (SM-2/FSRS algorithm)
- `interval` (next review date)
- `error_patterns` (e.g., often confuses "shi" with "chi")

**Behavior:** Phrases with lower ease_factor appear more frequently in random pool.

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

## Priority / Implementation Order

| Priority | Feature | Complexity | Impact |
|----------|---------|------------|--------|
| 1 | Hide Mode | Low | High |
| 2 | SRS Tracking | Medium | High |
| 3 | Shadowing Enhancement | Medium | High |
| 4 | Progressive Reveal | Medium | Medium |
| 5 | Error-Based Drills | High | Medium |
| 6 | Sentence Building | High | High |
| 7 | Interleaved Practice | Medium | High |
| 8 | Grammar Drills | Medium | High |

---

*Created: 2026-02-28*
*Status: Under consideration*
