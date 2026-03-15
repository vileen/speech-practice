# Spaced Repetition + Weak Points Tracking

**Status:** ✅ IMPLEMENTED (Partial)

**Priority:** 2

---

## What's Implemented ✅

**FSRS Algorithm implemented in Memory Mode:**
- localStorage persistence
- 30-day session lifetime
- Self-assessment ratings (Again/Hard/Good/Easy)
- Optimal scheduling based on memory decay curves

**Track in database for each phrase:**
- ✅ `ease_factor` (SM-2/FSRS algorithm)
- ✅ `interval` (next review date)
- ⏳ `error_patterns` (e.g., often confuses "shi" with "chi") - TODO

**Behavior:** Phrases with lower ease_factor appear more frequently in random pool.

**Implementation:**
- `frontend/src/lib/fsrs.ts` - FSRS-4.5 algorithm
- `frontend/src/hooks/useMemoryProgress.ts` - localStorage persistence

---

## Still TODO

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

*Created: 2026-02-28*