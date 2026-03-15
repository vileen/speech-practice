# Progressive Reveal (Hint Cascade)

**Status:** ⏳ Planned

**Priority:** 10

**Inspired by:** Wordle-style gradual disclosure

---

## How It Works

**Steps:**
1. Show only translation + phrase length (___ ___ ___)
2. + First syllable (す___ ___)
3. + Syllable count hint (すし___ ___)
4. Full phrase revealed (寿司を食べたいです)

**Scoring:** Each hint reduces the score, but prevents frustration from blank page.

---

## User Flow

```
┌─────────────────────────────────────────┐
│ Progressive Reveal                      │
├─────────────────────────────────────────┤
│ 🇬🇧 "I want to eat sushi"                │
│                                         │
│ Japanese: ___ ___ ___ ___ ___          │
│                                         │
│ [Show First Syllable]                   │
│ Hints used: 0                           │
└─────────────────────────────────────────┘
```

After hints:
```
│ Japanese: す ___ ___ ___ ___           │
│                                         │
│ [Show More]        Score: 100% → 80%   │
```

---

## Why This Helps

- **Scaffolded learning:** Provides support without giving full answer
- **Prevents blank page anxiety:** Users aren't stuck when they forget
- **Gamified scoring:** Incentivizes solving with fewer hints
- **Active engagement:** Users must still construct the phrase mentally

---

*Created: 2026-02-28*