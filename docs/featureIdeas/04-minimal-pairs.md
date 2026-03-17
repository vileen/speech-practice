# Minimal Pairs Drills (Error-Based)

**Status:** ⏳ Planned

**Priority:** 13

**Complexity:** High
**Impact:** Medium

---

## How It Works

**Trigger:** When Whisper returns specific errors:
- "shi" instead of "chi"
- "tsu" instead of "su"
- "fu" instead of "hu"

**Action:** Generate focused drill with minimal pairs:
- さしすせそ vs たちつてと
- ふ vs ひ

**Goal:** Targeted practice on problematic sounds.

---

## Minimal Pairs Library

| Confusion | Pair | Practice Words |
|-----------|------|----------------|
| shi/chi | さしすせそ vs たちつてと | さか/ちか, すし/つし |
| tsu/su | す vs つ | すし/つし, すぐ/つぐ |
| fu/hu | ふ vs ひ | ふゆ/ひゆ, ふる/ひる |
| r/l | らりるれろ | (for English speakers) |
| n/ng | ん endings | ほん/ほんぐ |

---

## Implementation

```typescript
// Detect error patterns from Whisper transcription
function detectErrorPatterns(spoken: string, target: string): ErrorPattern[] {
  // Compare phonetically and identify confusions
}

// Generate drill for specific confusion
function generateMinimalPairDrill(pattern: ErrorPattern): Drill {
  return {
    pairs: getMinimalPairs(pattern),
    instructions: "Listen and repeat, focus on the difference",
    feedback: "Your recording shows confusion with X sound"
  };
}
```

---

*Created: 2026-02-28*