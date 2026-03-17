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

*Last updated: 2026-03-10*
