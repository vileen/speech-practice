# Kanji Practice Mode

## Overview

Dedicated practice mode for learning Japanese kanji using the **Kodansha Kanji Learner's Course (KLC)** methodology. Integrates with the existing Memory Mode architecture while providing kanji-specific features like stroke order visualization, mnemonics, and reading practice.

**Status:** ✅ Complete (implemented 2026-03-16)

---

## Problem Statement

Learning kanji through passive exposure in lessons is ineffective for long-term retention. Learners need:
- Active recall practice (see kanji → remember meaning)
- Spaced repetition to prevent forgetting
- Mnemonics to aid memory formation
- Context from actual lessons (not generic examples)

---

## Solution

Kanji Practice Mode provides a dedicated SRS-based learning interface for kanji, following the KLC method:

1. **Recognition Practice**: See kanji → recall meaning (KLC method)
2. **KLC Mnemonics**: Display mnemonics from Kodansha Kanji Learner's Course
3. **Lesson Context**: Show examples from actual lessons (e.g., 火山 from L29)
4. **Spaced Repetition**: FSRS algorithm for optimal review intervals

---

## Implementation

### Database Schema

```sql
-- kanji table (new)
CREATE TABLE kanji (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character VARCHAR(10) NOT NULL UNIQUE,
  meanings TEXT[] NOT NULL,
  readings JSONB NOT NULL, -- [{type: 'kun'|'on', reading: string}]
  lesson_id VARCHAR(20),
  mnemonic TEXT,
  stroke_count INTEGER,
  jlpt_level VARCHAR(10),
  tags TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `KanjiPracticeMode` | `components/KanjiPracticeMode/` | Main practice UI |
| `useKanjiProgress` | `hooks/useKanjiProgress.ts` | SRS state management |
| Kanji API | `routes/kanji.ts` | Backend endpoint |

### Key Features

#### 1. Recognition Mode (KLC Method)
```
[Front Card]          [Back Card - Space to reveal]
┌──────────┐         ┌─────────────────────────┐
│          │         │ Meanings: [MOUNTAIN]    │
│    山    │  →      │ Readings: やま / サン   │
│          │         │                         │
│ Recall...│         │ Mnemonic:               │
└──────────┘         │ "Three towering peaks" │
                     │                         │
                     │ Examples:               │
                     │ • 火山 (kazan) 🌋       │
                     └─────────────────────────┘
```

#### 2. Rating System (FSRS)
- **Again** (1) - Forgot, review in <1 minute
- **Hard** (2) - Difficult, shorter interval
- **Good** (3) - Correct, standard interval
- **Easy** (4) - Easy, longer interval

#### 3. Keyboard Shortcuts
- `Space` - Reveal answer / Rate "Again"
- `2` - Rate "Hard"
- `3` - Rate "Good"
- `4` - Rate "Easy"

#### 4. Lesson Filtering
Filter kanji by lesson ID:
- `2026-02-02` - Numbers & Colors (25 kanji)
- `2026-02-09` - Person kanji 人 (1 kanji)
- `2026-02-11` - Days of week (3 kanji)
- `2026-03-04` - Nakereba (4 kanji)
- etc.

---

## Technical Details

### State Management
- Uses same FSRS algorithm as Memory Mode
- LocalStorage persistence for offline practice
- PostgreSQL for kanji database

### API Endpoints
```
GET /api/kanji              - List all kanji
GET /api/kanji?lessonId=X   - Filter by lesson
GET /api/kanji/:id          - Get specific kanji
```

### Integration Points
- Reuses `fsrs.ts` for spaced repetition
- Reuses card flip animation from Memory Mode
- Uses existing TTS for readings (future)

---

## Data Population

Kanji data is populated from:
1. **The Kodansha Kanji Learner's Course** - Mnemonics and meanings
2. **Lesson transcriptions** - Examples used in context
3. **Manual additions** - New kanji as lessons progress

Current kanji count: **38 kanji** from 6 lessons

---

## UI/UX Design

### Color Scheme
- **Primary**: Green gradient (#27ae60 → #1e8449) - matches "learning/growth"
- **Again**: Red (#e94560)
- **Hard**: Orange (#f39c12)
- **Good**: Green (#27ae60)
- **Easy**: Blue (#3498db)

### Responsive Layout
- Grid layout for buttons on home page
- Full-width cards on mobile
- 4-column rating buttons (2x2 on mobile)

---

## Future Enhancements

### Phase 2 (Planned)
- [ ] Stroke order animation
- [ ] Drawing/writing practice
- [ ] Audio pronunciation for readings
- [ ] Kanji composition breakdown (radicals)

### Phase 3 (Ideas)
- [ ] JLPT level filtering
- [ ] Kanji similarity warnings (防 vs 仿)
- [ ] Cross-reference with vocabulary
- [ ] Kanji frequency analysis

---

## Files Changed

```
frontend/src/
  components/
    KanjiPracticeMode/
      KanjiPracticeMode.tsx    (new)
      KanjiPracticeMode.css    (new)
      index.ts                 (new)
  hooks/
    useKanjiProgress.ts        (new)
  pages/
    KanjiPracticePage.tsx      (new)
  App.tsx                      (add route /kanji)
  pages/Home.tsx               (add button)
  styles/home.css              (grid layout for buttons)

backend/src/
  routes/
    kanji.ts                   (new)
    index.ts                   (mount router)
```

---

## Testing

- ✅ All 188 existing tests pass
- ✅ TypeScript compilation successful
- ✅ Build verification (frontend + backend)

---

## Related

- [Memory Mode](./01-memory-mode.md) - Shared FSRS implementation
- [Spaced Repetition](./03-spaced-repetition.md) - Algorithm details
- [Vocabulary Table](./09-vocabulary-table.md) - Database schema patterns

---

*Implemented: 2026-03-16*
