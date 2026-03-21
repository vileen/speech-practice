# Review Mode Enhancement Ideas

High-level overview of planned and implemented features. Each feature has a dedicated file in [docs/featureIdeas/](./featureIdeas/) with full details.

---

## Priority / Implementation Order

| Priority | Feature | Status | Complexity | Impact | Link |
|----------|---------|--------|------------|--------|------|
| 1 | [Memory Mode](./featureIdeas/01-memory-mode.md) | ✅ Complete | Medium | High | [Details](./featureIdeas/01-memory-mode.md) |
| 2 | [Spaced Repetition](./featureIdeas/03-spaced-repetition.md) | ✅ Core done | Medium | High | [Details](./featureIdeas/03-spaced-repetition.md) |
| 3 | [Vocabulary Table](./featureIdeas/09-vocabulary-table.md) | ✅ Complete | High | Critical | [Details](./featureIdeas/09-vocabulary-table.md) |
| 4 | [Backend Modularization](./featureIdeas/12-backend-modularization.md) | ✅ Complete | High | Critical | [Details](./featureIdeas/12-backend-modularization.md) |
| 5 | [Frontend Refactoring](./featureIdeas/13-frontend-refactoring.md) | ✅ Complete | Medium | High | [Details](./featureIdeas/13-frontend-refactoring.md) |
| 6 | [Vocabulary Badges](./featureIdeas/14-vocabulary-badges.md) | ✅ Complete | Low | Medium | [Details](./featureIdeas/14-vocabulary-badges.md) |
| **7** | [**Interleaved Practice**](./featureIdeas/06-interleaved-practice.md) | ⏳ **Next** | Medium | High | [Details](./featureIdeas/06-interleaved-practice.md) |
| 8 | [Shadowing Enhancement](./featureIdeas/08-shadowing-mode.md) | ⏳ Planned | Medium | High | [Details](./featureIdeas/08-shadowing-mode.md) |
| 9 | [Grammar Drills](./featureIdeas/07-grammar-drills.md) | 🚧 In Progress | Medium | High | [Details](./featureIdeas/07-grammar-drills.md) |
| 10 | [Progressive Reveal](./featureIdeas/02-progressive-reveal.md) | ⏳ Planned | Medium | Medium | [Details](./featureIdeas/02-progressive-reveal.md) |
| 11 | [Sentence Building](./featureIdeas/05-sentence-building.md) | ⏳ Planned | High | High | [Details](./featureIdeas/05-sentence-building.md) |
| 12 | [JLPT N3 Roadmap](./featureIdeas/10-jlpt-roadmap.md) | 📋 Documented | Medium | High | [Details](./featureIdeas/10-jlpt-roadmap.md) |
| 13 | [Minimal Pairs](./featureIdeas/04-minimal-pairs.md) | ⏳ Planned | High | Medium | [Details](./featureIdeas/04-minimal-pairs.md) |
| 14 | [Pomodoro Tracker](./featureIdeas/11-pomodoro-tracker.md) | ⏳ Planned | Medium | Medium | [Details](./featureIdeas/11-pomodoro-tracker.md) |
| 15 | [Infrastructure & Security](./featureIdeas/15-infrastructure-security.md) | ✅ Complete | High | Critical | [Details](./featureIdeas/15-infrastructure-security.md) |
| 16 | [**Kanji Practice Mode**](./featureIdeas/16-kanji-practice-mode.md) | ✅ **Complete** | Medium | High | [Details](./featureIdeas/16-kanji-practice-mode.md) |
| **17** | [**Grammar Anti-Confusion**](./featureIdeas/17-grammar-anti-confusion.md) | ✅ **Complete** | Medium-High | Very High | [Details](./featureIdeas/17-grammar-anti-confusion.md) |

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

## Philosophy

> Ideas for improving the material review process after lessons.
> Passive reading of grammar/vocabulary is ineffective - active recall is key.

See [docs/featureIdeas/README.md](./featureIdeas/README.md) for detailed index.

---

*Created: 2026-02-28*  
*Last updated: 2026-03-20*