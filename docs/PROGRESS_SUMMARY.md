# Development Progress Summary

### Documentation & Priority Updates (2026-03-10)

#### 1. Review Enhancement Ideas - Major Expansion
- **Grammar Pattern Drills** (Section 7): Expanded from 15 lines to 295+ lines
  - 8 detailed subsections (Recognition, Construction, Transformation, etc.)
  - Implementation architecture with components and API endpoints
  - Database schema for grammar progress tracking
  - 4-week implementation timeline
  
- **Interleaved Practice Mode** (Section 6): Expanded to 380+ lines
  - Core mixing algorithm with no-streak rule
  - 4 session types (Daily Review, Cram Mode, Weak Points, Pattern Mastery)
  - Smart scheduling with FSRS + jitter
  - Research-backed design (Rohrer 2010: +43% retention)

- **Priority Reordering** based on ROI analysis:
  - Grammar Drills: #12 → #9 (higher priority)
  - Error-Based Drills: #10 → #13 (lower priority - high complexity)
  - Daily Tracker: #14 (last - motivational, not core)
  - Interleaved Practice marked as #7 (next to implement)

#### 2. Memory Mode UI Enhancement
- Added lesson number badges (#N) before lesson titles
- CSS styling for number badges with accent colors
- Updated tests to handle new DOM structure

#### 3. Data Cleanup
- Removed lesson JSONs from repository (now only in PostgreSQL)
- Added `.gitignore` to prevent future JSON commits
- Fixed lesson ID format (removed `lesson-` prefix)

---

## Recently Completed (March 2026)

### Backend Refactoring

#### 1. Modular Architecture
- **Status:** ✅ Phase 1 & 2 Complete
- **Changes:**
  - Split monolithic `server.ts` (686 lines → 55 lines)
  - Created modular route structure in `src/routes/`
  - Added middleware layer (`auth.ts`, `error-handler.ts`)
  - Created typed configuration (`src/config/index.ts`)
  - Archived 74 one-time scripts to `scripts/archive/`

#### 2. Service Layer Restructuring
- **ElevenLabs Service:** Split into dedicated module
  - `src/services/elevenlabs/types.ts`
  - `src/services/elevenlabs/voices.ts`
  - Voice mapping for Normal/Anime styles
- **Furigana Service:** Improved caching and lookup
  - Persistent cache with file storage
  - Retry logic for rate limiting (429)
  - Partial match support for okurigana handling

#### 3. Database Schema Updates
- **Vocabulary Tracking:** Added junction tables
  - `vocabulary` table (normalized from JSONB)
  - `lesson_vocabulary` many-to-many relationship
  - Indexes for performance
- **SSL Fix:** Disabled SSL for local PostgreSQL

### Frontend Improvements

#### 1. Component Architecture
- **App.tsx Refactoring:** ~1813 lines → ~210 lines (-88%)
- **Page Components:** Extracted to `src/pages/`
  - Login, Home, LessonList, LessonDetail
  - ChatSetup, ChatSession
  - RepeatSetup, LessonPractice
  - MemoryModeWrapper
- **CSS Modularization:** Split into 7 files
  - base.css, login.css, home.css, chat.css
  - lesson.css, repeat.css, components.css

#### 2. Lesson Mode Enhancements
- **Lesson Numbering:** Added "Lesson #N" badges
- **Vocabulary Review Badges:** 
  - "↻ N" badge for words appearing in other lessons
  - Hover tooltip with lesson links
  - Cross-lesson vocabulary tracking
- **Layout Fixes:**
  - Fixed hint min-height (1.5rem) to prevent layout shift
  - Proper header/main/footer structure

#### 3. Memory Mode
- **FSRS Algorithm:** Implemented FSRS-4.5 for spaced repetition
- **Progress Tracking:** localStorage persistence (30-day sessions)
- **Weak Points:** Basic tracking for review scheduling

### Security & Infrastructure

#### 1. Security Cleanup
- **Git History:** Rewrote with git-filter-repo
  - Removed API keys from all commits
  - Removed personal paths and usernames
  - Force pushed cleaned history
- **Dependencies:** Removed node_modules from git tracking
- **Environment:** All secrets in .env (not committed)

#### 2. Service Infrastructure
- **PM2 Setup:** Process management with auto-restart
- **Cloudflare Tunnels:** 
  - speech-practice: port 3001
  - solana-playground: port 3002
- **Logging:** Error and application logs for debugging
- **Status Dashboard:** File-based log reading

#### 3. Removed Features
- **Italian Language:** Complete removal
  - Frontend: Home, ChatSetup, LessonPractice
  - Backend: Voice configs, types, routes
  - Simplified UI - Japanese only

### Documentation Updates

#### 1. Architecture Docs
- **ARCHITECTURE.md:** ASCII tree diagrams
- **PORTS.md:** Service port documentation
- **SCRIPTS_SECURITY_AUDIT.md:** Security review

#### 2. Learning Path
- **JAPANESE_LEARNING_PATH.md:** 
  - 4-phase roadmap (N5→N4→N3 Bridge→N3)
  - Realistic timelines (6 months/phase)
  - ~540h total to N3

#### 3. Enhancement Ideas
- Added Pomodoro Daily Tracker (feature #11)
- Updated priority table with status

### Known Issues

#### Furigana for Complex Grammar
- **Problem:** `シャワーを浴びなければなりません` returns 404
- **Root Cause:** Okurigana extraction includes grammar patterns
- **Status:** Partial fix implemented, needs refinement

### Next Steps
1. Complete furigana fix for grammar-heavy phrases
2. Move Memory Mode from localStorage to PostgreSQL
3. Implement interleaved practice mode
4. Add error pattern tracking for minimal pairs

---

## Roadmap: Solid Foundation for Japanese Learning

**Current State (March 2026):**
- ✅ Counters: Comprehensive (94 patterns, 90 exercises)
- ⚠️ Core Grammar: Thin (4-5 patterns per category)
- ✅ Infrastructure: SRS, Audio, Furigana, Pattern Graph
- ⚠️ Content Gaps: Verbs, Reading, Speaking drills

### Phase 1: Core Grammar Expansion (Priority: HIGH)
**Goal:** Bring all grammar categories to Counters-level depth

| Category | Current | Target | Status |
|----------|---------|--------|--------|
| TE-form | 0 | 20 patterns | 🔴 Missing |
| Permission/Prohibition | 4 each | 15 each | 🟡 Thin |
| Obligation | 4 | 15 | 🟡 Thin |
| I/Na Adjectives | 4 each | 12 each | 🟡 Thin |
| Particles | 20 | 30 | 🟡 Partial |
| Verb Conjugation | 0 | 25 patterns | 🔴 Missing |

**Deliverables:**
- SQL files for pattern/exercise data
- Discrimination drills for similar forms
- Pattern graph relationships
- **Timeline:** 2-3 weeks

### Phase 2: Verb Mastery System (Priority: HIGH)
**Goal:** Systematic verb conjugation practice

**Components:**
1. **Verb Database** (~100 common verbs)
   - Group I/II/III classification
   - Transitive/intransitive pairs
   - JLPT level tagging

2. **Conjugation Modes:**
   - Dictionary → Masu form
   - Dictionary → Te-form
   - Dictionary → Nai-form
   - Dictionary → Ta-form
   - Dictionary → Conditional
   - Dictionary → Potential
   - Dictionary → Passive/Causative

3. **Practice Types:**
   - Recognition (which form is this?)
   - Construction (conjugate to X)
   - Transformation (change from A to B)
   - Error correction (spot the wrong conjugation)

**Deliverables:**
- `verbs` table with full metadata
- `verb_conjugations` reference table
- Conjugation engine (backend rule-based)
- Dedicated VerbMode component
- **Timeline:** 3-4 weeks

### Phase 3: Reading Comprehension (Priority: MEDIUM)
**Goal:** Graded reading with comprehension checks

**Components:**
1. **Reading Passages Table**
   - Level: N5 → N3
   - Length: 100-500 characters
   - Topic categories (daily life, work, culture)
   - Furigana toggle

2. **Question Types:**
   - Main idea
   - Detail extraction
   - Inference
   - Vocabulary in context
   - Grammar pattern identification

3. **Integration:**
   - Link unknown words to SRS
   - Highlight grammar patterns from learned set
   - Track reading speed (characters/minute)

**Deliverables:**
- 20 graded passages (5 N5, 8 N4, 7 N3)
- Reading mode UI with side-by-side questions
- Progress tracking per level
- **Timeline:** 2-3 weeks

### Phase 4: Speaking Drills (Priority: MEDIUM)
**Goal:** Structured speaking beyond free conversation

**Components:**
1. **Shadowing Mode**
   - Native audio playback
   - Record → Compare waveform
   - Pronunciation scoring (basic)

2. **Response Drills**
   - Cue card style prompts
   - Time-limited responses (10-30s)
   - AI evaluation of completeness

3. **Conversation Templates**
   - Common scenarios (restaurant, shopping, etc.)
   - Turn-based practice
   - Suggested responses for guidance

**Deliverables:**
- Shadowing interface with audio recording
- Response drill engine
- 10 conversation templates
- **Timeline:** 3-4 weeks

### Phase 5: Kanji Expansion (Priority: LOW)
**Goal:** Support up to N3 level (~650 kanji)

**Components:**
1. **Kanji Database Expansion**
   - Current: 102
   - Target: 650 (N5: 80, N4: 170, N3: 400)

2. **Kanji Mode Enhancements:**
   - Radical-based learning
   - Stroke order animations
   - Similar kanji discrimination
   - Kanji → Vocabulary connections

3. **Reading Integration:**
   - Hover kanji for meaning/reading
   - Click to add to SRS queue

**Deliverables:**
- Kanji import scripts
- Enhanced KanjiMode UI
- Radical reference table
- **Timeline:** 4-6 weeks (ongoing)

### Phase 6: Polish & Integration (Priority: MEDIUM)
**Goal:** Seamless experience across modes

**Components:**
1. **Unified SRS:**
   - Grammar + Kanji + Vocabulary in one queue
   - Cross-category scheduling

2. **Progress Dashboard:**
   - Visual progress by JLPT level
   - Weak points identification
   - Study streak tracking

3. **Interleaved Practice:**
   - Daily review mixing all categories
   - Adaptive difficulty based on performance

4. **Mobile Optimization:**
   - Responsive design pass
   - Touch-friendly Pattern Graph
   - Offline mode for reviews

**Deliverables:**
- Unified review mode
- Progress dashboard component
- Mobile CSS overhaul
- **Timeline:** 3-4 weeks

---

## Implementation Priority

**Immediate (Do First):**
1. TE-form patterns (foundation for many grammar points)
2. Basic verb conjugation (dictionary → masu/te/nai)

**Next:**
3. Expand core grammar categories
4. Reading passages (N5 level first)

**Later:**
5. Speaking drills
6. Kanji expansion
7. Polish/integration

**Estimated Total:** 4-6 months to solid N3 foundation

---

*Last updated: 2026-03-23*
