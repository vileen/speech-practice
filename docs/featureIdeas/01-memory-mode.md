# Memory Mode (Hide Mode + SRS)

**Status:** ✅ COMPLETED

**Original Name:** Hide Mode

**Problem:** Current "Repeat After Me" shows the Japanese text immediately, working only short-term memory.

**Solution:** Hide the Japanese phrase initially. Workflow:
- Show only: 🇬🇧 "I want to eat sushi"
- User attempts from memory → speaks Japanese
- Recording + reveal correct answer → comparison
- Self-assessment: ✅ Knew it / ❌ Didn't know (for SRS algorithm)

**Implementation:** New "Memory Mode" section separate from Repeat After Me. Uses FSRS algorithm for scheduling.

---

## Implementation Details

**Location:** New tab "🧠 Memory Mode" on home screen

**Files:**
- `frontend/src/components/MemoryMode.tsx`
- `frontend/src/components/MemoryMode.css`
- `frontend/src/hooks/useMemoryProgress.ts`
- `frontend/src/lib/fsrs.ts`

**Features:**
- Hide Japanese / show English only (active recall)
- Self-assessment: Again/Hard/Good/Easy
- FSRS-4.5 algorithm for optimal scheduling
- 30-day session lifetime
- localStorage persistence
- Lesson selection (import cards from specific lessons)
- Progress stats (total/due/new/in-review)

---

*Created: 2026-02-28*