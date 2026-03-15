# Sentence Building (Voice Lego)

**Status:** ⏳ Planned

**Priority:** 11

**Complexity:** High
**Impact:** High

---

## Concept

**Instead of:** Repeating whole phrase

**Approach:** Building from parts:
- Show: 寿司 + を + 食べたい + です (as "building blocks")
- User speaks complete sentence in correct order
- Forces understanding of structure, not just parroting

---

## Difficulty Levels

| Level | Blocks | Example |
|-------|--------|---------|
| Level 1 | 2-3 blocks | 寿司 + を食べたい |
| Level 2 | 4-5 blocks | 寿司 + を + 食べたい + です |
| Level 3 | Full sentence with particles hidden | 寿司___食べたい___ (fill particles) |

---

## UI Design

```
┌─────────────────────────────────────────┐
│ 🧱 Sentence Builder                     │
├─────────────────────────────────────────┤
│ Build: "I want to eat sushi"            │
│                                         │
│ [寿司] [を] [食べたい] [です]            │
│   (1)   (2)    (3)      (4)             │
│                                         │
│ [🎤 Speak Answer]                       │
│                                         │
│ Your answer: 寿司を食べたいです ✅       │
└─────────────────────────────────────────┘
```

---

## Why This Works

- **Structural awareness:** Users understand how parts fit together
- **Particle practice:** Focus on tricky parts like を, が, に
- **Active construction:** More engaging than repetition
- **Scaffolded difficulty:** Start simple, build complexity

---

*Created: 2026-02-28*