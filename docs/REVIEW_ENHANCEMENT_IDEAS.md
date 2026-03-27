# Review Mode Enhancement Ideas

High-level overview of planned and implemented features. Each feature has a dedicated file in [docs/featureIdeas/](./featureIdeas/) with full details.

---

## Priority / Implementation Order

| Priority | Feature | Status | Complexity | Impact | Summary |
|----------|---------|--------|------------|--------|------|
| 1 | [Memory Mode](./featureIdeas/01-memory-mode.md) | ✅ Complete | Medium | High | Hide Japanese text, active recall with SRS |
| 2 | [Spaced Repetition](./featureIdeas/03-spaced-repetition.md) | ✅ Complete | Medium | High | FSRS algorithm, weak points tracking |
| 3 | [Vocabulary Table](./featureIdeas/09-vocabulary-table.md) | ✅ Complete | High | Critical | Normalized DB schema for vocabulary |
| 4 | [Backend Modularization](./featureIdeas/12-backend-modularization.md) | ✅ Complete | High | Critical | Route restructuring, modular architecture |
| 5 | [Frontend Refactoring](./featureIdeas/13-frontend-refactoring.md) | ✅ Complete | Medium | High | Component extraction, code organization |
| 6 | [Vocabulary Badges](./featureIdeas/14-vocabulary-badges.md) | ✅ Complete | Low | Medium | Cross-lesson word tracking with ↻ badges |
| **7** | [**Interleaved Practice**](./featureIdeas/06-interleaved-practice.md) | ⏳ **Next** | Medium | High | Mixed lesson review (+43% retention) |
| 8 | [Shadowing Enhancement](./featureIdeas/08-shadowing-mode.md) | ✅ Complete | Medium | High | Overlapping/delayed audio shadowing |
| 9 | [Grammar Drills](./featureIdeas/07-grammar-drills.md) | ✅ Complete | Medium | High | Pattern recognition & construction exercises |
| 10 | [Progressive Reveal](./featureIdeas/02-progressive-reveal.md) | ⏳ Planned | Medium | Medium | Hint cascade (Wordle-style) |
| 11 | [Sentence Building](./featureIdeas/05-sentence-building.md) | ⏳ Planned | High | High | Voice Lego pattern practice |
| 12 | [JLPT N3 Roadmap](./featureIdeas/10-jlpt-roadmap.md) | 📋 Documented | Medium | High | 24-month learning path to N3 |
| 13 | [Minimal Pairs](./featureIdeas/04-minimal-pairs.md) | ⏳ Planned | High | Medium | Error-based pronunciation drills |
| 14 | [Pomodoro Tracker](./featureIdeas/11-pomodoro-tracker.md) | ⏳ Planned | Medium | Medium | Daily streaks & focus timer |
| 15 | [Infrastructure & Security](./featureIdeas/15-infrastructure-security.md) | ✅ Complete | High | Critical | Git cleanup, PM2, environment security |
| 16 | [Kanji Practice Mode](./featureIdeas/16-kanji-practice-mode.md) | ✅ Complete | Medium | High | KLC-based kanji learning with SRS |
| 17 | [Grammar Anti-Confusion](./featureIdeas/17-grammar-anti-confusion.md) | ✅ Complete | Medium-High | Very High | Distinguish similar grammar patterns |
| **18** | [**Verb Mastery System**](./featureIdeas/18-verb-mastery.md) | ✅ **Complete** | Medium | High | 34 verbs, 7 conjugation forms each |
| **19** | [**Reading Comprehension**](./featureIdeas/19-reading-comprehension.md) | ✅ **Complete** | Medium | High | Graded passages N5→N3 with questions |
| **20** | [**Progress Dashboard**](./featureIdeas/20-progress-dashboard.md) | ✅ **Complete** | Medium | High | Stats, weak points, activity tracking |
| **21** | [**Kanji Writing Practice**](./featureIdeas/21-kanji-writing.md) | 📋 **Missing** | Medium | Very High | Handwriting recognition & stroke order |
| **22** | [**Speech Recognition Feedback**](./featureIdeas/22-speech-feedback.md) | ✅ **Complete** | High | Very High | AI pronunciation assessment with Whisper |
| **23** | [**Listening Comprehension**](./featureIdeas/23-listening-comprehension.md) | ✅ **Complete** | Medium | High | Audio-only comprehension quizzes |

---

## Quick Navigation

### Core Learning (4 Skills)
| Skill | Status | Features |
|-------|--------|----------|
| **Listening** | ✅ Complete | Audio lessons, shadowing, comprehension quizzes (#23) |
| **Speaking** | ✅ Complete | AI pronunciation feedback (#22), response drills |
| **Reading** | ✅ Complete | Furigana, graded passages (#19), comprehension checks |
| **Writing** | ❌ Missing | Kanji handwriting practice (#21) - planned |

### Learning Features
- [01 - Memory Mode](./featureIdeas/01-memory-mode.md) — Hide Japanese text, active recall with SRS
- [02 - Progressive Reveal](./featureIdeas/02-progressive-reveal.md) — Hint cascade (Wordle-style)
- [03 - Spaced Repetition](./featureIdeas/03-spaced-repetition.md) — FSRS algorithm, weak points tracking
- [04 - Minimal Pairs](./featureIdeas/04-minimal-pairs.md) — Error-based pronunciation drills
- [05 - Sentence Building](./featureIdeas/05-sentence-building.md) — Voice Lego pattern practice
- [06 - Interleaved Practice](./featureIdeas/06-interleaved-practice.md) — Mixed lesson review (+43% retention)
- [07 - Grammar Drills](./featureIdeas/07-grammar-drills.md) — Pattern recognition & construction exercises
- [08 - Shadowing Mode](./featureIdeas/08-shadowing-mode.md) — Overlapping/delayed audio shadowing
- [16 - Kanji Practice Mode](./featureIdeas/16-kanji-practice-mode.md) — KLC-based kanji learning with SRS
- [17 - Grammar Anti-Confusion](./featureIdeas/17-grammar-anti-confusion.md) — Distinguish similar grammar patterns
- [18 - Verb Mastery](./featureIdeas/18-verb-mastery.md) — 34 verbs, 7 conjugation forms each
- [19 - Reading Comprehension](./featureIdeas/19-reading-comprehension.md) — Graded passages N5→N3 with questions
- [21 - Kanji Writing Practice](./featureIdeas/21-kanji-writing.md) — Handwriting recognition & stroke order
- [22 - Speech Recognition Feedback](./featureIdeas/22-speech-feedback.md) — AI pronunciation assessment with Whisper
- [23 - Listening Comprehension](./featureIdeas/23-listening-comprehension.md) — Audio-only comprehension quizzes

### Data & Progress
- [09 - Vocabulary Table](./featureIdeas/09-vocabulary-table.md) — Normalized DB schema for vocabulary
- [10 - JLPT N3 Roadmap](./featureIdeas/10-jlpt-roadmap.md) — 24-month learning path to N3
- [11 - Pomodoro Tracker](./featureIdeas/11-pomodoro-tracker.md) — Daily streaks & focus timer
- [14 - Vocabulary Badges](./featureIdeas/14-vocabulary-badges.md) — Cross-lesson word tracking with ↻ badges
- [20 - Progress Dashboard](./featureIdeas/20-progress-dashboard.md) — Stats, weak points, activity tracking

### Technical Infrastructure
- [12 - Backend Modularization](./featureIdeas/12-backend-modularization.md) — Route restructuring, modular architecture
- [13 - Frontend Refactoring](./featureIdeas/13-frontend-refactoring.md) — Component extraction, code organization
- [15 - Infrastructure & Security](./featureIdeas/15-infrastructure-security.md) — Git cleanup, PM2, environment security

---

## Roadmap: Solid Foundation for Japanese Learning

6-phase roadmap to build a comprehensive Japanese learning platform beyond conversation practice.

### Phase 1: Grammar Foundation (✅ Complete)
**Goal:** Core grammar patterns with SRS-based drilling
- ✅ Grammar pattern database (275 patterns across 13 categories)
- ✅ Pattern recognition & construction exercises
- ✅ Error tracking & confusion prevention
- ✅ Pattern relationship graph (98 relationships)
- ✅ Counter patterns module (94 patterns)

**Deliverables:** GrammarMode, CountersMode, PatternGraph

### Phase 2: Verb Mastery (✅ Complete)
**Goal:** Complete verb conjugation system
- ✅ Verb database with conjugation metadata (34 verbs)
- ✅ Conjugation engine (rule-based)
- ✅ VerbMode component with 3 practice modes
- ✅ All 7 conjugation forms per verb

**Deliverables:** VerbMode, `/api/verbs`, `verb_conjugations.sql`

### Phase 3: Reading Comprehension (✅ Complete)
**Goal:** Graded reading with comprehension checks
- ✅ Reading passages table (N5 → N3)
- ✅ Question types: main idea, detail, inference
- ✅ Reading speed tracking
- ✅ Sample passages with questions

**Deliverables:** ReadingMode, `/api/reading`, reading schema

### Phase 4: Speaking Drills (✅ Complete)
**Goal:** Structured speaking beyond free conversation
- ✅ Shadowing mode with pronunciation scoring
- ✅ Response drills with time limits
- ✅ Conversation templates (3 scenarios)

**Deliverables:** SpeakingMode, `/api/speaking`, speaking schema

### Phase 5: Kanji Expansion (🚧 In Progress)
**Goal:** Support up to N3 level (~650 kanji)
- Current: 102 kanji
- Target: 650 kanji (N5: 80, N4: 170, N3: 400)
- Radical-based learning (planned)
- Kanji → Vocabulary connections (planned)

**Timeline:** 4-6 weeks (ongoing)

### Phase 6: Polish & Integration (🟡 Partial)
**Goal:** Seamless experience across modes
- ✅ Progress dashboard (stats, weak points, streaks)
- ⏳ Unified SRS (Grammar + Kanji + Vocabulary)
- ⏳ Interleaved practice mixing all categories
- ⏳ Mobile optimization

**Deliverables:** ProgressDashboard ✅, Unified SRS ⏳

**Timeline:** 2-3 weeks remaining

### Phase 7: Missing Critical Foundations (📋 Not Started)
**Goal:** Complete the 4 core skills (currently missing Writing & Speaking Feedback)

| Skill | Status | Gap |
|-------|--------|-----|
| **Listening** | ✅ Complete | Audio player, lessons, shadowing, comprehension quizzes |
| **Speaking** | ✅ Complete | Recording with AI pronunciation feedback |
| **Reading** | ✅ Complete | Furigana, comprehension quizzes |
| **Writing** | ❌ Missing | NO kanji handwriting practice |

**Missing Critical Features:**

1. **Kanji Writing Practice (#21)** - Handwriting Recognition
   - Canvas for drawing kanji
   - Stroke order validation
   - Shape recognition (Canvas API + ML or rule-based)
   - Progress tracking per kanji
   - **Impact:** Writing reinforces visual memory and motor skills - ESSENTIAL for retention
   - **Complexity:** Medium (Canvas API + recognition algorithm)

2. **Speech Recognition Feedback (#22)** - Pronunciation Assessment ✅
   - Record user's speech
   - Compare with native audio (ASR + phonetic comparison)
   - Score: pitch accent, rhythm, intonation
   - Error highlighting
   - **Status:** Implemented with OpenAI Whisper API
   - **Deliverables:** `/api/speech/assess`, `SpeechFeedback` component

3. **Listening Comprehension (#23)** - Audio-Only Quizzes ✅
   - Listen to audio (no transcript visible)
   - Answer comprehension questions
   - Gradual difficulty (slow → natural speed)
   - **Status:** Implemented with 5 sample passages
   - **Deliverables:** `ListeningMode`, `/api/listening` routes

**Why These Matter:**
> Without writing practice: You can read but can't write from memory (weak retention)
> Without speech feedback: You practice speaking but reinforce wrong pronunciation
> Without pure listening: You rely on visual cues, struggle in real conversations

**Deliverables:** WritingMode (remaining)

**Timeline:** 6-8 weeks (can parallelize)

---

## Philosophy

> Ideas for improving the material review process after lessons.
> Passive reading of grammar/vocabulary is ineffective - active recall is key.

See [docs/featureIdeas/README.md](./featureIdeas/README.md) for detailed index.

---

*Created: 2026-02-28*  
*Last updated: 2026-03-27 (Features #22, #23 completed)*

---

## Summary: Are Foundations Solid?

**Yes, with caveats.**

The app provides **strong foundations** for:
- ✅ Grammar acquisition (275 patterns, drills, relationships)
- ✅ Vocabulary learning (SRS, lessons, Anki integration)
- ✅ Reading comprehension (graded passages, questions)
- ✅ Listening exposure (audio lessons, shadowing)
- ✅ Kanji recognition (KLC-based, 102 kanji, expanding)

**But critically missing for "solid" foundations:**
- ❌ **Writing practice** - No kanji handwriting (motor memory gap)
- ✅ **Speaking feedback** - AI pronunciation assessment with Whisper API
- ✅ **Pure listening** - Audio-only comprehension quizzes

**Recommendation:** Phase 7 features are NOT optional enhancements. They're required for a complete learning platform. Prioritize #21 (writing) and #22 (speech feedback) before adding more content.
