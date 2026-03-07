# Frontend Refactoring Opportunities

> Code review findings for improving maintainability and structure.
> Created: 2026-03-07

## 🔴 Critical Issues

### 1. App.tsx is too large (2068 lines)
**Problem:** Main App component contains 14+ sub-components
**Impact:** Hard to maintain, test, and navigate

**Components to extract:**
- `AudioPlayer` (lines 64-278) → `components/AudioPlayer.tsx`
- `HealthCheckWrapper` (lines 317-362) → `components/HealthCheckWrapper.tsx`
- `Login` (lines 413-439) → `components/Login.tsx`
- `Home` (lines 491-542) → `pages/Home.tsx`
- `ChatSetup` (lines 543-660) → `pages/ChatSetup.tsx`
- `ChatSession` (lines 661-1231) → `pages/ChatSession.tsx`
- `RepeatSetup` (lines 1232-1320) → `pages/RepeatSetup.tsx`
- `LessonList` (lines 1321-1343) → `pages/LessonList.tsx`
- `LessonDetail` (lines 1344-1371) → `pages/LessonDetail.tsx`
- `LessonPracticeSetup` (lines 1372-1504) → `pages/LessonPracticeSetup.tsx`
- `LessonPractice` (lines 1505+) → `pages/LessonPractice.tsx`

**Suggested structure:**
```
src/
├── pages/
│   ├── Home.tsx
│   ├── ChatSetup.tsx
│   ├── ChatSession.tsx
│   ├── RepeatSetup.tsx
│   ├── LessonList.tsx
│   ├── LessonDetail.tsx
│   ├── LessonPractice.tsx
│   └── Login.tsx
├── components/
│   ├── AudioPlayer.tsx
│   └── HealthCheckWrapper.tsx
└── App.tsx (only routing setup)
```

---

## 🟠 High Priority

### 2. Duplicate API_URL declarations
**Files:** 5 locations
- `App.tsx:48`
- `LessonMode.tsx:37`
- `components/RepeatMode.tsx:10`
- `hooks/usePronunciationCheck.ts:3`
- `hooks/useFurigana.ts:10`

**Solution:** Create `src/config/api.ts`
```typescript
export const API_URL = (import.meta.env.VITE_API_URL || 'https://trunk-sticks-connect-currency.trycloudflare.com').replace(/\/$/, '');
export const getPassword = () => localStorage.getItem('speech_practice_password') || '';
```

### 3. Duplicate Type Definitions
**Problem:** `Lesson` interface defined in 3 files
- `App.tsx:23`
- `LessonMode.tsx:5`
- `components/MemoryMode.tsx:7`

**Solution:** Create `src/types/index.ts`
```typescript
export interface Lesson {
  id: string;
  date: string;
  title: string;
  order: number;
  topics: string[];
  vocabCount: number;
  grammarCount: number;
  vocabulary?: VocabularyItem[];
  grammar?: GrammarItem[];
  practice_phrases?: PracticePhrase[];
}

export interface Session {
  id: number;
  language: string;
  voice_gender: string;
  created_at: string;
}
```

### 4. VoiceRecorder.tsx is large (528 lines)
**Check if can be split:**
- Audio visualization logic
- Voice activity detection
- Push-to-talk logic
- Recording management

---

## 🟡 Medium Priority

### 5. Inconsistent file structure
**Problem:** Some components in root, some in `components/`
- `VoiceRecorder.tsx` in root
- `HighlightedText.tsx` in root
- `LessonMode.tsx` in root

**Solution:** Move all components to `src/components/`

### 6. CSS files scattered
**Current:** One CSS per component in same directory
**Alternative:** Consider CSS Modules or Tailwind for better maintainability

### 7. Magic strings
**Example:** `'speech_practice_password'` repeated 10+ times
**Solution:** Constants file
```typescript
// src/constants/storage.ts
export const STORAGE_KEYS = {
  PASSWORD: 'speech_practice_password',
  MEMORY_PROGRESS: 'memory_progress',
  // ...
} as const;
```

---

## 🟢 Low Priority / Nice to have

### 8. Add barrel exports
**Create `src/components/index.ts`:**
```typescript
export { AudioPlayer } from './AudioPlayer';
export { MemoryMode } from './MemoryMode';
export { RepeatMode } from './RepeatMode';
// ...
```

### 9. Custom hooks extraction
**From App.tsx:**
- Authentication logic → `useAuth()`
- API calls → `useApi()`
- Health check → `useHealthCheck()`

### 10. Error boundaries
Add React Error Boundaries for better error handling

---

## 📊 Summary

| Priority | Issue | Effort | Impact |
|----------|-------|--------|--------|
| 🔴 Critical | Extract components from App.tsx | High | Very High |
| 🟠 High | Create shared config (API_URL) | Low | High |
| 🟠 High | Create shared types | Low | High |
| 🟡 Medium | Organize file structure | Medium | Medium |
| 🟢 Low | Add barrel exports | Low | Low |

---

## 🎯 Recommended First Steps

1. **Create `src/config/api.ts`** - 5 min, immediate DRY benefit
2. **Create `src/types/index.ts`** - 10 min, better type safety
3. **Extract `AudioPlayer` component** - 15 min, easy win
4. **Move components to proper folders** - 20 min, better structure
5. **Plan gradual App.tsx decomposition** - ongoing
