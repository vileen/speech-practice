# UI/UX Patterns & Style Guide

Comprehensive design patterns and conventions for the Speech Practice app.

---

## 1. Design System

### Color Palette

#### Primary Colors
| Name | Hex | Usage |
|------|-----|-------|
| Background Primary | `#1a1a2e` | Main app background |
| Background Secondary | `#16213e` | Cards, containers, elevated surfaces |
| Background Dark | `#0f3460` | Inputs, inner sections, borders |
| Background Darker | `#0f1623` | Header gradient start |
| Accent Red | `#e94560` | Primary buttons, active states, highlights |
| Accent Red Hover | `#ff6b6b` | Button hover states |
| Accent Red Dark | `#c73e54` | Button pressed states |

#### Semantic Colors
| Name | Hex | Usage |
|------|-----|-------|
| Success | `#28a745` | Correct answers, success states, due badges |
| Success BG | `rgba(40, 167, 69, 0.2)` | Success backgrounds |
| Warning | `#ffc107` | Discrimination mode, confusion alerts, mixed quiz |
| Warning BG | `rgba(255, 193, 7, 0.15)` | Warning banner backgrounds |
| Error | `#dc3545` | Incorrect answers, errors, "again" rating |
| Info | `#17a2b8` | Info states, "easy" rating |
| Purple | `#667eea` | Mixed review, comparison buttons, graph |
| Purple Alt | `#764ba2` | Purple hover states |
| Teal | `#2dd4bf` | Pattern graph accent |

#### Text Colors
| Name | Hex | Usage |
|------|-----|-------|
| Text Primary | `#ffffff` | Headings, primary text |
| Text Secondary | `#cccccc` | Body text, descriptions |
| Text Muted | `#aaaaaa` | Labels, hints, secondary info |
| Text Disabled | `#888888` | Disabled states, placeholders |
| Text Dark | `#666666` | Subtle text, inactive states |

#### Border Colors
| Name | Hex | Usage |
|------|-----|-------|
| Border Default | `#0f3460` | Card borders, section dividers |
| Border Light | `#333333` | Header borders, subtle dividers |
| Border Hover | `#e94560` | Hover states on cards |
| Border Warning | `#ffc107` | Confusion states |

### Typography

#### Font Stack
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

#### Japanese Text
```css
font-family: 'Noto Sans JP', sans-serif;
```

#### Type Scale
| Element | Size | Weight | Usage |
|---------|------|--------|-------|
| H1 (Page Title) | `2rem` (32px) | 600 | Main page headings |
| H2 (Section) | `1.5rem` (24px) | 600 | Section headings |
| H3 (Card Title) | `1.25rem` (20px) | 600 | Card titles |
| Body | `1rem` (16px) | 400 | Regular text |
| Body Small | `0.875rem` (14px) | 400 | Secondary text, labels |
| Caption | `0.75rem` (12px) | 400/500 | Small labels, badges |
| Tiny | `0.7rem` (11px) | 400 | Intervals, metadata |

### Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `space-xs` | `4px` | Tight gaps, inline spacing |
| `space-sm` | `8px` | Small gaps, icon margins |
| `space-md` | `12px` | Button padding, card gaps |
| `space-lg` | `16px` | Section padding, card padding |
| `space-xl` | `20px` | Container padding, large gaps |
| `space-2xl` | `24px` | Large section padding |
| `space-3xl` | `30px` | Major section spacing |
| `space-4xl` | `40px` | Hero spacing, large containers |

### Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `radius-sm` | `4px` | Small badges, tags |
| `radius-md` | `6px` | Buttons, pills, small cards |
| `radius-lg` | `8px` | Cards, inputs, containers |
| `radius-xl` | `10px` | Large buttons, modals |
| `radius-2xl` | `12px` | Large cards, banners |
| `radius-3xl` | `16px` | Major containers, setup cards |
| `radius-4xl` | `20px` | Quiz cards, large modals |
| `radius-full` | `50%` | Circular elements, avatars |

### Shadows

```css
/* Card hover shadow */
box-shadow: 0 4px 20px rgba(233, 69, 96, 0.2);

/* Button hover shadow */
box-shadow: 0 4px 15px rgba(233, 69, 96, 0.3);

/* Modal shadow */
box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);

/* Card default (subtle) */
box-shadow: 0 8px 25px rgba(233, 69, 96, 0.2);
```

---

## 2. Component Structure Template

### Standard Mode Component Structure

```tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../Header/index.js';
import { API_URL } from '../../config/api.js';
import './ComponentMode.css';

// Types
interface ComponentData {
  id: number;
  // ... specific fields
}

type Mode = 'menu' | 'study' | 'quiz' | 'review';

export const ComponentMode: React.FC = () => {
  const navigate = useNavigate();
  const password = localStorage.getItem('speech_practice_password') || '';
  
  // State
  const [mode, setMode] = useState<Mode>('menu');
  const [data, setData] = useState<ComponentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentItem, setCurrentItem] = useState<ComponentData | null>(null);
  
  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' && mode === 'study') {
        e.preventDefault();
        handleAction();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode]);
  
  const loadData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/endpoint`, {
        headers: { 'X-Password': password }
      });
      if (response.ok) {
        const data = await response.json();
        setData(data.items);
      }
    } catch (err) {
      console.error('Failed to load:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Render modes
  if (mode === 'menu') {
    return (
      <div className="component-mode">
        <Header
          title="Mode Title"
          icon="🎯"
          onBack={() => navigate('/')}
        />
        {/* Menu content */}
      </div>
    );
  }
  
  if (mode === 'study' && currentItem) {
    return (
      <div className="component-mode">
        <Header
          title="Study Mode"
          icon="📚"
          onBack={() => setMode('menu')}
        />
        {/* Study content */}
      </div>
    );
  }
  
  return null;
};

export default ComponentMode;
```

### Header Usage Pattern

```tsx
// Simple header with back button
<Header
  title="Grammar Drills"
  icon="📚"
  onBack={() => navigate('/')}
/>

// Header with subtitle and actions
<Header
  title="Kanji Practice"
  icon="🈁"
  subtitle="Kodansha Kanji Learner's Course"
  onBack={handleBack}
  actions={
    <>
      <div className="stats">
        <span>{count} items</span>
      </div>
      <button className="furigana-toggle">あ</button>
    </>
  }
/>
```

### Container/Wrapper Pattern

```tsx
// Root level - mode wrapper
<div className="mode-name">
  <Header ... />
  
  {/* Main content area */}
  <div className="mode-container">
    {/* Content goes here */}
  </div>
</div>
```

### CSS Container Pattern

```css
.mode-name {
  min-height: 100vh;
  background: #1a1a2e;
  color: #fff;
}

.mode-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}
```

---

## 3. Button Patterns

### Primary Button (Red Accent)

```css
.btn-primary {
  background: #e94560;
  color: white;
  border: none;
  padding: 12px 32px;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
}

.btn-primary:hover:not(:disabled) {
  background: #ff6b6b;
  transform: translateY(-1px);
}

.btn-primary:disabled {
  background: #333;
  color: #666;
  cursor: not-allowed;
}
```

### Secondary/Outline Button

```css
.btn-secondary {
  background: transparent;
  border: 1px solid #0f3460;
  color: #e94560;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: #0f3460;
  color: #fff;
}
```

### Back Button

```css
.back-btn {
  background: transparent;
  border: 1px solid #444;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  color: #ccc;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: #666;
  color: #fff;
}
```

### Icon/Toggle Button (Furigana)

```css
.furigana-toggle {
  background: #16213e;
  border: 1px solid #0f3460;
  color: #e94560;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
  min-width: 36px;
}

.furigana-toggle:hover {
  background: #e94560;
  color: #fff;
  border-color: #e94560;
}
```

### Filter Action Buttons

```css
.filter-btn {
  background: transparent;
  border: 1px solid #0f3460;
  color: #e94560;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-btn:hover {
  background: #e94560;
  color: #fff;
  border-color: #e94560;
}
```

### Rating Buttons (FSRS)

```css
.rating-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.75rem 0.5rem;
  border: 1px solid #333;
  border-radius: 8px;
  background: #16213e;
  color: #ccc;
  cursor: pointer;
  transition: all 0.2s;
}

.rating-btn.again { border-color: #e94560; color: #ff6b7a; }
.rating-btn.hard { border-color: #f39c12; color: #f5b041; }
.rating-btn.good { border-color: #27ae60; color: #52d681; }
.rating-btn.easy { border-color: #3498db; color: #5dade2; }

.rating-btn:hover {
  border-color: #555;
}

.rating-key {
  font-size: 0.75rem;
  opacity: 0.7;
}

.rating-label {
  font-size: 0.875rem;
  font-weight: 500;
  margin-top: 0.25rem;
}

.rating-interval {
  font-size: 0.7rem;
  opacity: 0.6;
  margin-top: 0.25rem;
}
```

---

## 4. Card Patterns

### Pattern Card (Grammar)

```css
.pattern-card {
  background: #16213e;
  border: 1px solid #0f3460;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.pattern-card:hover {
  border-color: #e94560;
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(233, 69, 96, 0.2);
}

.pattern-card.has-confusion {
  border-color: #ffc107;
  background: rgba(255, 193, 7, 0.05);
}
```

### Group Card (Counters)

```css
.group-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s;
}

.group-card:hover {
  transform: translateY(-3px);
  border-color: #e94560;
  box-shadow: 0 8px 25px rgba(233, 69, 96, 0.2);
}
```

### Stats Card

```css
.stat-card {
  background: #16213e;
  border: 1px solid #333;
  border-radius: 8px;
  padding: 1rem;
  min-width: 80px;
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: 600;
  color: #e94560;
}

.stat-label {
  display: block;
  font-size: 0.875rem;
  color: #888;
  margin-top: 0.25rem;
}
```

### Stat Box (Memory Mode)

```css
.stat-box {
  background: #0f3460;
  padding: 20px;
  border-radius: 12px;
  text-align: center;
}

.stat-box.due {
  background: rgba(40, 167, 69, 0.2);
  border: 1px solid #28a745;
}

.stat-box.new {
  background: rgba(255, 193, 7, 0.2);
  border: 1px solid #ffc107;
}

.stat-box.review {
  background: rgba(23, 162, 184, 0.2);
  border: 1px solid #17a2b8;
}
```

### Exercise Card

```css
.exercise-prompt {
  background: #16213e;
  border: 1px solid #0f3460;
  border-radius: 12px;
  padding: 24px;
  max-width: 800px;
  margin: 0 auto;
}
```

### Quiz Card

```css
.quiz-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 40px;
  text-align: center;
}
```

---

## 5. Layout Patterns

### App Structure

```tsx
// App.tsx wrapper
<div className="app">
  <main>
    {/* Route content */}
  </main>
</div>
```

### Main Container (base.css)

```css
.app {
  width: 100%;
  max-width: 100%;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app > main {
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  flex: 1;
}
```

### Header Layout

```css
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, #0f1623 0%, #1a1f2e 100%);
  border-bottom: 1px solid #333;
  position: sticky;
  top: 0;
  z-index: 100;
  width: 100%;
  box-sizing: border-box;
}

.header-left { flex: 0 0 auto; display: flex; align-items: center; gap: 0.75rem; }
.header-center { flex: 1 1 auto; text-align: center; padding: 0 1rem; }
.header-right { flex: 0 0 auto; display: flex; align-items: center; gap: 0.75rem; }
```

### Grid Layouts

```css
/* Pattern Grid */
.patterns-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

/* Groups Grid */
.groups-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
}

/* Responsive: 2 columns on mobile */
@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

### Flex Layouts

```css
/* Centered content */
.centered-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 1rem;
}

/* Header actions */
.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Review banner */
.review-banner {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}
```

---

## 6. API Patterns

### IMPORTANT: Use API Interceptor for All API Calls

The app uses a centralized API interceptor (`src/lib/api-interceptor.ts`) that automatically adds the `X-Password` header to all API requests. **Do NOT manually add the password header** - use the interceptor instead.

```tsx
// ✅ CORRECT - Uses interceptor automatically
import { API_URL } from '../../config/api.js';

const loadData = async () => {
  try {
    const response = await fetch(`${API_URL}/api/endpoint`);
    // Interceptor automatically adds X-Password header
    if (response.ok) {
      const data = await response.json();
      return data;
    }
  } catch (err) {
    console.error('Failed to load:', err);
  }
};

// ✅ CORRECT - POST with interceptor
const submitData = async (payload: any) => {
  try {
    const response = await fetch(`${API_URL}/api/endpoint`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // X-Password is added automatically by interceptor
      },
      body: JSON.stringify(payload)
    });
    if (response.ok) {
      const data = await response.json();
      return data;
    }
  } catch (err) {
    console.error('Failed to submit:', err);
  }
};
```

### How the Interceptor Works

The interceptor is initialized in `App.tsx` and patches the global `fetch` function to:
1. Detect API calls (URLs containing `/api` or matching the API_URL)
2. Automatically inject the `X-Password` header from localStorage
3. Preserve any existing headers

```tsx
// src/lib/api-interceptor.ts
export function installApiInterceptor() {
  const originalFetch = window.fetch;
  
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = input.toString();
    
    // Only intercept API calls
    if (isApiUrl(url)) {
      const password = localStorage.getItem('speech_practice_password') || '';
      
      init = init || {};
      init.headers = {
        ...init.headers,
        'X-Password': password
      };
    }
    
    return originalFetch(input, init);
  };
}
```

### Legacy: Manual Password Header (Not Recommended)

Only use this pattern if the interceptor is not available:

```tsx
// ❌ NOT RECOMMENDED - Only if interceptor fails
const password = localStorage.getItem('speech_practice_password') || '';

const response = await fetch(`${API_URL}/api/endpoint`, {
  headers: { 'X-Password': password }
});
```

### Troubleshooting Interceptor Issues

If API calls return 401 Unauthorized:
1. Check that the interceptor is installed in App.tsx
2. Verify password exists in localStorage
3. Check browser console for interceptor debug logs
4. Ensure API_URL is correctly configured

### Loading State Pattern

```tsx
const [loading, setLoading] = useState(true);

const loadData = async () => {
  setLoading(true);
  try {
    // ... fetch
  } finally {
    setLoading(false);
  }
};

// Render
{loading ? (
  <div className="loading">Loading...</div>
) : (
  <div className="content">{/* content */}</div>
)}
```

### Processing State Pattern

```tsx
const [state, setState] = useState<'loading' | 'input' | 'processing' | 'feedback'>('loading');

const handleSubmit = async () => {
  setState('processing');
  try {
    // ... submit
    setState('feedback');
  } catch (err) {
    setState('input');
  }
};

// Render
{state === 'processing' && <div className="processing">Checking...</div>}
```

### Response Types

```tsx
// Pattern response
interface PatternResponse {
  patterns: GrammarPattern[];
}

// Exercise response
interface ExerciseResponse {
  exercise: {
    id: number;
    type: string;
    prompt: string;
    context: string;
    correct_answer: string;
    hints: any[];
    difficulty: number;
  };
}

// Progress response
interface ProgressResponse {
  progress: {
    streak: number;
    interval_days: number;
    ease_factor: number;
  };
}
```

---

## 7. File Organization

### Component Folder Structure

```
src/
├── components/
│   ├── ComponentName/
│   │   ├── ComponentName.tsx      # Main component
│   │   ├── ComponentName.css      # Component styles
│   │   ├── SubComponent.tsx       # Sub-components (if any)
│   │   └── index.ts               # Re-export
│   └── SharedComponent/
│       ├── SharedComponent.tsx
│       ├── SharedComponent.css
│       └── index.ts
```

### Index.ts Pattern

```ts
// components/ComponentName/index.ts
export { ComponentName } from './ComponentName.js';
export type { ComponentData } from './ComponentName.js';
```

### CSS File Organization

```css
/* 1. Component wrapper styles */
.component-mode {
  min-height: 100vh;
  background: #1a1a2e;
  color: #fff;
}

/* 2. Header styles */
.component-header { ... }

/* 3. Container/content styles */
.component-container { ... }

/* 4. Card/item styles */
.item-card { ... }

/* 5. Interactive element styles */
.item-button { ... }

/* 6. State modifiers */
.item-card.selected { ... }
.item-card:hover { ... }

/* 7. Animation keyframes */
@keyframes fadeIn { ... }

/* 8. Responsive styles */
@media (max-width: 768px) { ... }
```

### Route Organization

```tsx
// App.tsx
<Routes>
  {/* Main */}
  <Route path="/" element={<Home />} />
  
  {/* Practice Modes */}
  <Route path="/grammar" element={<GrammarMode />} />
  <Route path="/counters" element={<CountersMode />} />
  <Route path="/memory" element={<MemoryModeWrapper />} />
  <Route path="/kanji" element={<KanjiPracticePage />} />
  <Route path="/verbs" element={<VerbMode />} />
  <Route path="/reading" element={<ReadingMode />} />
  <Route path="/speaking" element={<SpeakingMode />} />
  
  {/* Lesson Flow */}
  <Route path="/lessons" element={<LessonList />} />
  <Route path="/lessons/:id" element={<LessonDetail />} />
  <Route path="/lessons/:id/setup" element={<LessonPracticeSetup />} />
  <Route path="/lessons/:id/practice" element={<LessonPractice />} />
  
  {/* Chat Flow */}
  <Route path="/chat/setup" element={<ChatSetup />} />
  <Route path="/chat" element={<ChatSession />} />
  
  {/* Other */}
  <Route path="/progress" element={<ProgressDashboard />} />
  <Route path="*" element={<Navigate to="/" replace />} />
</Routes>
```

---

## 8. Animation Patterns

### Fade In

```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.element {
  animation: fadeIn 0.3s ease;
}
```

### Slide In

```css
@keyframes slideIn {
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
}

.element {
  animation: slideIn 0.3s ease;
}
```

### Pulse (Badges)

```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

.mixed-mode-badge {
  animation: pulse 2s infinite;
}
```

### Shake (Alert)

```css
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.confusion-alert {
  animation: shake 0.5s ease;
}
```

### Spinner

```css
@keyframes spin {
  to { transform: rotate(360deg); }
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e5e7eb;
  border-top-color: #4f46e5;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
```

---

## 9. Form Patterns

### Input Style

```css
.answer-input {
  width: 100%;
  padding: 14px 18px;
  font-size: 18px;
  border: 1px solid #0f3460;
  border-radius: 8px;
  margin-bottom: 16px;
  box-sizing: border-box;
  background: #1a1a2e;
  color: #fff;
  font-family: 'Noto Sans JP', sans-serif;
}

.answer-input:focus {
  outline: none;
  border-color: #e94560;
  box-shadow: 0 0 0 2px rgba(233, 69, 96, 0.2);
}

.answer-input::placeholder {
  color: #666;
}
```

### Checkbox Style

```css
.category-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px 12px;
  background: #1a1a2e;
  border-radius: 8px;
  border: 1px solid transparent;
  transition: all 0.2s;
}

.category-checkbox:hover {
  border-color: #0f3460;
}

.category-checkbox input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: #e94560;
  cursor: pointer;
}
```

---

## 10. Checklist for New Features

### Component Structure
- [ ] Uses shared Header component with proper props
- [ ] Wrapped in `app > main` container structure
- [ ] Has consistent mode switching (menu/study/quiz/review)
- [ ] Uses TypeScript interfaces for data types

### Styling
- [ ] CSS follows BEM-like naming (`.mode-name`, `.mode-element`)
- [ ] Uses color variables from design system
- [ ] Max-width 800-1000px for content areas
- [ ] Proper spacing using standard scale (8px, 12px, 16px, 20px, 24px)
- [ ] Border radius 8px, 12px, or 16px consistently
- [ ] Hover transitions 0.2s ease

### Buttons
- [ ] Primary actions use `.btn-primary` (red accent)
- [ ] Secondary actions use `.btn-secondary` or `.back-btn`
- [ ] Disabled states handled properly
- [ ] Hover effects with transform/scale or color change

### Cards
- [ ] Cards use `#16213e` background
- [ ] Border uses `#0f3460`
- [ ] Hover state with border color change to `#e94560`
- [ ] Box shadow on hover for elevation

### States
- [ ] Loading state with spinner or text
- [ ] Processing state during API calls
- [ ] Error states handled gracefully
- [ ] Empty states with helpful messages
- [ ] Success/completion states

### API Integration
- [ ] Uses `API_URL` from config
- [ ] Includes `X-Password` header
- [ ] Password retrieved from localStorage
- [ ] Error handling with try/catch
- [ ] Console.error for debugging

### Accessibility
- [ ] Focus states on interactive elements
- [ ] Keyboard shortcuts where appropriate
- [ ] Aria labels on icon buttons
- [ ] Sufficient color contrast

### Performance
- [ ] Memoized components where needed (React.memo)
- [ ] useCallback for event handlers
- [ ] useEffect cleanup functions
- [ ] Lazy loading for large components (if needed)

### File Structure
- [ ] Component in `components/ComponentName/ComponentName.tsx`
- [ ] Styles in `components/ComponentName/ComponentName.css`
- [ ] Index file for clean exports
- [ ] Added to App.tsx routes

---

## 11. Common Utilities

### Format Interval (FSRS)

```tsx
const formatInterval = (days: number): string => {
  if (days < 1 / 24) {
    const minutes = Math.round(days * 24 * 60);
    if (minutes < 1) return '< 1m';
    return `${minutes}m`;
  }
  if (days < 1) {
    const hours = Math.round(days * 24);
    return `${hours}h`;
  }
  if (days === 1) return '1d';
  if (days < 30) return `${Math.round(days)}d`;
  if (days < 365) return `${Math.round(days / 30)}mo`;
  return `${Math.round(days / 365)}y`;
};
```

### Password Getter

```tsx
const password = localStorage.getItem('speech_practice_password') || '';
```

### Shuffle Array

```tsx
const shuffled = [...array].sort(() => Math.random() - 0.5);
```

### LocalStorage Persistence Pattern

```tsx
const STORAGE_KEY = 'component_setting';

// Load on mount
useEffect(() => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      setValue(JSON.parse(saved));
    } catch (e) {
      console.error('Failed to parse saved value:', e);
    }
  }
}, []);

// Save on change
useEffect(() => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}, [value]);
```

---

## 12. Naming Conventions

### CSS Classes
- Component wrapper: `.mode-name` (e.g., `.grammar-mode`, `.counters-mode`)
- Elements: `.mode-element` (e.g., `.grammar-header`, `.counters-card`)
- Modifiers: `.element-state` (e.g., `.card.selected`, `.btn.disabled`)
- Actions: `.action-btn` (e.g., `.back-btn`, `.submit-btn`)

### TypeScript
- Interfaces: `PascalCase` (e.g., `GrammarPattern`, `CounterGroup`)
- Types: `PascalCase` with suffix (e.g., `ExerciseState`, `ReviewMode`)
- Enums: `PascalCase` for type, `UPPER_SNAKE` for values
- Props interfaces: `ComponentNameProps`

### Files
- Components: `PascalCase.tsx` (e.g., `GrammarMode.tsx`)
- Styles: `PascalCase.css` (matches component)
- Utilities: `camelCase.ts` (e.g., `api.ts`, `fsrs.ts`)
- Constants: `UPPER_SNAKE` or `camelCase`

---

*Last updated: March 2026*
