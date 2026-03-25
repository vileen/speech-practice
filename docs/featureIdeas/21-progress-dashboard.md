# Feature Idea 21: Progress Dashboard

## Overview

Central dashboard for tracking learning progress across all modes, visualizing stats, and identifying weak points for targeted practice.

**Status:** ✅ **IMPLEMENTED** (2026-03-25)  
**Priority:** Medium  
**Complexity:** Medium  
**Impact:** High

---

## Problem Statement

Learners need:
- Visibility into overall progress
- Identification of weak areas needing attention
- Motivation through streaks and achievements
- Understanding of JLPT level readiness

Without a dashboard, progress is scattered across different modes.

---

## Solution

### Dashboard Sections

#### 1. Overview Cards (Top Row)
- **Study Time**: This week / All time
- **Current Streak**: Days in a row studying
- **Grammar Patterns**: Mastered / Total / Accuracy
- **Kanji Learned**: Current count / N3 target
- **Lessons Completed**: Total finished

#### 2. JLPT Level Progress
- Visual progress bars per level (N5, N4, N3)
- Based on:
  - Grammar patterns known
  - Kanji recognized
  - Vocabulary mastered
- Estimated completion percentage

#### 3. Weak Points Section
- Grammar categories with lowest accuracy
- Specific patterns frequently confused
- Quick "Practice These" links
- Priority ordering for review

#### 4. Activity Chart
- Last 7 days activity visualization
- Sessions per day
- Study time per day
- Streak maintenance view

#### 5. Category Breakdown
- Grammar accuracy by category
- Most practiced categories
- Time spent per mode

---

## Implementation

### API Endpoints

```typescript
// GET /api/progress/overview - summary stats
// GET /api/progress/by-level - JLPT progress breakdown
// GET /api/progress/weak-points - lowest accuracy items
// GET /api/progress/activity - last 7 days activity
```

### Data Sources

- `user_grammar_progress` - pattern accuracy
- `user_kanji_progress` - kanji mastery
- `grammar_attempts` - detailed attempt history
- `lessons` - completed lessons
- `sessions` - study sessions

### Component Structure

```
ProgressDashboard/
├── ProgressDashboard.tsx      # Main component
└── ProgressDashboard.css      # Styling (inline in component)
```

---

## Stats Calculated

### Grammar Stats
```typescript
const grammarStats = {
  totalPatterns: number,
  masteredPatterns: number,  // accuracy >= 80%
  averageAccuracy: number,
  byCategory: {
    category: string,
    accuracy: number,
    attempts: number
  }[]
};
```

### Weak Points
```typescript
const weakPoints = {
  categories: [
    { name: string, accuracy: number }
  ],
  confusedPairs: [
    { patternName: string, confusedWithName: string, count: number }
  ]
};
```

### Activity Data
```typescript
const activityData = {
  last7Days: [
    { date: string, sessions: number, minutes: number }
  ],
  currentStreak: number,
  longestStreak: number
};
```

---

## UI Design

### Layout
```
┌─────────────────────────────────────┐
│  Progress Dashboard                 │
├─────────┬─────────┬─────────┬───────┤
│ Study   │ Streak  │ Grammar │ Kanji │  <- Overview Cards
│ Time    │ 12 days │ 85%     │ 102   │
├─────────┴─────────┴─────────┴───────┤
│  JLPT Progress                      │
│  N5 ████████░░ 80%                  │
│  N4 ██████░░░░ 60%                  │
│  N3 ███░░░░░░░ 30%                  │
├─────────────────────────────────────┤
│  Weak Points          │  Activity   │
│  • Particles: 65%     │  [Chart]    │
│  • Te-form: 70%       │  Last 7 days│
│  Practice These →     │             │
└─────────────────────────────────────┘
```

---

## Files Created

- `backend/src/routes/progress.ts` - API routes with stats queries
- `frontend/src/components/ProgressDashboard/ProgressDashboard.tsx` - Component

---

## Future Enhancements

- [ ] Time-based progress graphs (monthly/yearly)
- [ ] Skill radar chart (reading/speaking/grammar/kanji)
- [ ] Achievement badges
- [ ] Study goal setting
- [ ] Comparison with friends (opt-in)
- [ ] Estimated JLPT exam readiness date
- [ ] Recommended study plan based on weak points

---

*Implemented: 2026-03-25*  
*Part of: Phase 6 - Polish & Integration*
