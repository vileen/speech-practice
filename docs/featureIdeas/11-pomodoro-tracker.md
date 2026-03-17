# Daily Practice Tracker with Pomodoro

**Status:** ⏳ Planned

**Priority:** 14

---

## Problem

Users lose motivation without tracking progress and structured focus time.

---

## Solution

Built-in daily practice tracking with Pomodoro timer integration.

---

## Features

### A. Daily Streak Tracking

- Track consecutive days of practice
- Minimum requirement: 15 min to count as "practiced today"
- Visual calendar heatmap (GitHub-style)
- Current streak + longest streak display

### B. Pomodoro Timer

- 25-minute focused practice sessions
- 5-minute break between sessions
- Long break (15 min) after 4 sessions
- Auto-start next Pomodoro option
- Session count tracking

### C. Practice Goals

- Daily: 40 minutes (1-2 Pomodoros)
- Weekly: 5 days minimum
- Monthly targets with progress visualization

### D. Stats Dashboard

- Total practice time (daily/weekly/monthly)
- Mode breakdown: Chat vs Repeat vs Memory vs Lessons
- Best time of day for practice
- Weak point improvement tracking

---

## UI Implementation

```
┌─────────────────────────────────┐
│ 🔥 12 day streak    ⏱️ 2/3 today │
├─────────────────────────────────┤
│  [Start 25min Pomodoro]         │
│                                 │
│  Today: 40 min / 40 min goal ✓  │
│  [████████████░░░░░░] 75%       │
│                                 │
│  This week: 5/7 days ✓          │
│  ████░░░                         │
└─────────────────────────────────┘
```

---

## Technical Notes

- Store data in localStorage (privacy-first)
- Sync with backend when available
- Export data option (JSON/CSV)
- Notification: "Time for practice!" (optional)

---

## Priority

Medium - Nice to have for motivation, but core learning features come first.

---

*Created: 2026-02-28*