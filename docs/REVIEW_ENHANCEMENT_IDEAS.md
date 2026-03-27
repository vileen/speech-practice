# Review Mode Enhancement Ideas

High-level overview of planned and implemented features. Each feature has a dedicated file in [docs/featureIdeas/](./featureIdeas/) with full details.

---

## Priority / Implementation Order

| Priority | Feature | Status | Complexity | Impact | Link |
|----------|---------|--------|------------|--------|------|
| 1 | [Memory Mode](./featureIdeas/01-memory-mode.md) | ✅ Complete | Medium | High | [Details](./featureIdeas/01-memory-mode.md) |
| 2 | [Spaced Repetition](./featureIdeas/03-spaced-repetition.md) | ✅ Complete | Medium | High | [Details](./featureIdeas/03-spaced-repetition.md) |
| 3 | [Vocabulary Table](./featureIdeas/09-vocabulary-table.md) | ✅ Complete | High | Critical | [Details](./featureIdeas/09-vocabulary-table.md) |
| 4 | [Backend Modularization](./featureIdeas/12-backend-modularization.md) | ✅ Complete | High | Critical | [Details](./featureIdeas/12-backend-modularization.md) |
| 5 | [Frontend Refactoring](./featureIdeas/13-frontend-refactoring.md) | ✅ Complete | Medium | High | [Details](./featureIdeas/13-frontend-refactoring.md) |
| 6 | [Vocabulary Badges](./featureIdeas/14-vocabulary-badges.md) | ✅ Complete | Low | Medium | [Details](./featureIdeas/14-vocabulary-badges.md) |
| **7** | [**Interleaved Practice**](./featureIdeas/06-interleaved-practice.md) | ⏳ **Next** | Medium | High | [Details](./featureIdeas/06-interleaved-practice.md) |
| 8 | [Shadowing Enhancement](./featureIdeas/08-shadowing-mode.md) | ✅ Complete | Medium | High | [Details](./featureIdeas/08-shadowing-mode.md) |
| 9 | [Grammar Drills](./featureIdeas/07-grammar-drills.md) | ✅ Complete | Medium | High | [Details](./featureIdeas/07-grammar-drills.md) |
| 10 | [Progressive Reveal](./featureIdeas/02-progressive-reveal.md) | ⏳ Planned | Medium | Medium | [Details](./featureIdeas/02-progressive-reveal.md) |
| 11 | [Sentence Building](./featureIdeas/05-sentence-building.md) | ⏳ Planned | High | High | [Details](./featureIdeas/05-sentence-building.md) |
| 12 | [JLPT N3 Roadmap](./featureIdeas/10-jlpt-roadmap.md) | 📋 Documented | Medium | High | [Details](./featureIdeas/10-jlpt-roadmap.md) |
| 13 | [Minimal Pairs](./featureIdeas/04-minimal-pairs.md) | ⏳ Planned | High | Medium | [Details](./featureIdeas/04-minimal-pairs.md) |
| 14 | [Pomodoro Tracker](./featureIdeas/11-pomodoro-tracker.md) | ⏳ Planned | Medium | Medium | [Details](./featureIdeas/11-pomodoro-tracker.md) |
| 15 | [Infrastructure & Security](./featureIdeas/15-infrastructure-security.md) | ✅ Complete | High | Critical | [Details](./featureIdeas/15-infrastructure-security.md) |
| 16 | [Kanji Practice Mode](./featureIdeas/16-kanji-practice-mode.md) | ✅ Complete | Medium | High | [Details](./featureIdeas/16-kanji-practice-mode.md) |
| 17 | [Grammar Anti-Confusion](./featureIdeas/17-grammar-anti-confusion.md) | ✅ Complete | Medium-High | Very High | [Details](./featureIdeas/17-grammar-anti-confusion.md) |
| **18** | [**Verb Mastery System**](./featureIdeas/18-verb-mastery.md) | ✅ **Complete** | Medium | High | [Details](./featureIdeas/18-verb-mastery.md) |
| **19** | [**Reading Comprehension**](./featureIdeas/19-reading-comprehension.md) | ✅ **Complete** | Medium | High | [Details](./featureIdeas/19-reading-comprehension.md) |
| **20** | [**Progress Dashboard**](./featureIdeas/20-progress-dashboard.md) | ✅ **Complete** | Medium | High | [Details](./featureIdeas/20-progress-dashboard.md) |
| **21** | [**Kanji Writing Practice**](./featureIdeas/21-kanji-writing.md) | 📋 **Missing** | Medium | Very High | Handwriting recognition for kanji |
| **22** | [**Speech Recognition Feedback**](./featureIdeas/22-speech-feedback.md) | 📋 **Missing** | High | Very High | AI pronunciation assessment |
| **23** | [**Listening Comprehension**](./featureIdeas/23-listening-comprehension.md) | 📋 **Missing** | Medium | High | Audio-only comprehension quizzes |

---

## Quick Navigation

### Learning Features
- [01 - Memory Mode](./featureIdeas/01-memory-mode.md) - Hide Japanese, active recall with SRS
- [02 - Progressive Reveal](./featureIdeas/02-progressive-reveal.md) - Hint cascade (Wordle-style)
- [03 - Spaced Repetition](./featureIdeas/03-spaced-repetition.md) - FSRS algorithm, weak points tracking
- [04 - Minimal Pairs](./featureIdeas/04-minimal-pairs.md) - Error-based pronunciation drills
- [05 - Sentence Building](./featureIdeas/05-sentence-building.md) - Voice Lego pattern practice
- [06 - Interleaved Practice](./featureIdeas/06-interleaved-practice.md) - Mixed lesson review (43% better retention)
- [07 - Grammar Drills](./featureIdeas/07-grammar-drills.md) - Pattern recognition & construction
- [08 - Shadowing Mode](./featureIdeas/08-shadowing-mode.md) - Overlapping/delayed shadowing
- [16 - Kanji Practice Mode](./featureIdeas/16-kanji-practice-mode.md) - KLC-based kanji learning with SRS
- [17 - Grammar Anti-Confusion](./featureIdeas/17-grammar-anti-confusion.md) - Prevent confusing similar grammar forms
- [21 - Kanji Writing Practice](./featureIdeas/21-kanji-writing.md) - Handwriting recognition & stroke order
- [22 - Speech Recognition Feedback](./featureIdeas/22-speech-feedback.md) - AI pronunciation scoring
- [23 - Listening Comprehension](./featureIdeas/23-listening-comprehension.md) - Audio-only comprehension checks

### Data & Progress
- [09 - Vocabulary Table](./featureIdeas/09-vocabulary-table.md) - Normalized DB schema
- [10 - JLPT N3 Roadmap](./featureIdeas/10-jlpt-roadmap.md) - 24-month learning path
- [11 - Pomodoro Tracker](./featureIdeas/11-pomodoro-tracker.md) - Daily streaks & focus timer
- [14 - Vocabulary Badges](./featureIdeas/14-vocabulary-badges.md) - Cross-lesson word tracking

### Technical
- [12 - Backend Modularization](./featureIdeas/12-backend-modularization.md) - Route restructuring
- [13 - Frontend Refactoring](./featureIdeas/13-frontend-refactoring.md) - Component extraction
- [15 - Infrastructure & Security](./featureIdeas/15-infrastructure-security.md) - Git cleanup, PM2

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
| **Listening** | ✅ Complete | Audio player, lessons, shadowing |
| **Speaking** | 🟡 Partial | Recording works, but NO pronunciation feedback |
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

2. **Speech Recognition Feedback (#22)** - Pronunciation Assessment
   - Record user's speech
   - Compare with native audio (ASR + phonetic comparison)
   - Score: pitch accent, rhythm, intonation
   - Error highlighting
   - **Impact:** Users currently don't know if they pronounce correctly
   - **Complexity:** High (requires ASR: Whisper API or Google Speech-to-Text)

3. **Listening Comprehension (#23)** - Audio-Only Quizzes
   - Listen to audio (no transcript visible)
   - Answer comprehension questions
   - Gradual difficulty (slow → natural speed)
   - **Impact:** Current listening has visual support - need pure audio comprehension
   - **Complexity:** Medium (reuse reading comprehension infrastructure)

**Why These Matter:**
> Without writing practice: You can read but can't write from memory (weak retention)
> Without speech feedback: You practice speaking but reinforce wrong pronunciation
> Without pure listening: You rely on visual cues, struggle in real conversations

**Deliverables:** WritingMode, SpeechAssessment API, ListeningMode

**Timeline:** 6-8 weeks (can parallelize)

---

## Philosophy

> Ideas for improving the material review process after lessons.
> Passive reading of grammar/vocabulary is ineffective - active recall is key.

See [docs/featureIdeas/README.md](./featureIdeas/README.md) for detailed index.

---

*Created: 2026-02-28*  
*Last updated: 2026-03-27*

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
- ❌ **Speaking feedback** - Record but no assessment (reinforces errors)
- ❌ **Pure listening** - Always has visual support (real-world gap)

**Recommendation:** Phase 7 features are NOT optional enhancements. They're required for a complete learning platform. Prioritize #21 (writing) and #22 (speech feedback) before adding more content.
