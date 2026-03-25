# Feature Idea 20: Speaking Drills Mode

## Overview

Structured speaking practice beyond free conversation, including shadowing, response drills, and conversation templates.

**Status:** ✅ **IMPLEMENTED** (2026-03-25)  
**Priority:** Medium  
**Complexity:** Medium  
**Impact:** High

---

## Problem Statement

Learners need:
- Structured speaking practice without pressure of free conversation
- Pronunciation feedback and comparison
- Practice with common real-world scenarios
- Time-limited response practice for fluency

Current chat mode is too open-ended - structured drills help build confidence.

---

## Solution

### Three Sub-Modes

#### 1. Shadowing Mode
- Listen to native audio
- Record yourself repeating
- Get pronunciation score comparison
- Practice intonation and rhythm

#### 2. Response Drills
- Cue card style prompts
- Time-limited responses (10-30 seconds)
- Record and review
- Build spontaneous speaking ability

#### 3. Conversation Templates
- Common scenario scripts
- Turn-based practice
- Suggested responses visible
- Practice restaurant, shopping, greetings, etc.

---

## Implementation

### Database Schema

```sql
CREATE TABLE conversation_templates (
  id SERIAL PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  scenario VARCHAR(50),
  difficulty VARCHAR(5),
  turns JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE shadowing_exercises (
  id SERIAL PRIMARY KEY,
  title VARCHAR(100),
  audio_url VARCHAR(500),
  japanese_text TEXT,
  level VARCHAR(5),
  duration_seconds INTEGER
);

CREATE TABLE response_drills (
  id SERIAL PRIMARY KEY,
  cue_text TEXT NOT NULL,
  suggested_response TEXT,
  time_limit_seconds INTEGER DEFAULT 15,
  difficulty VARCHAR(5),
  category VARCHAR(50)
);
```

### Sample Data

**Conversation Templates (3):**
- Ordering at a Restaurant
- Shopping for Clothes  
- Self Introduction

**Response Drills (5):**
- Greeting scenarios
- Asking for directions
- Making requests
- Expressing opinions
- Describing experiences

### API Endpoints

```typescript
// GET /api/speaking/templates - list conversation templates
// GET /api/speaking/templates/:id - get specific template
// GET /api/speaking/shadowing - list shadowing exercises
// GET /api/speaking/response-drills - list response drills
// POST /api/speaking/evaluate-response - basic evaluation
```

### Component Structure

```
SpeakingMode/
├── SpeakingMode.tsx      # Main component with tabs
├── SpeakingMode.css      # Styling
└── index.ts              # Exports
```

---

## User Flow

### Shadowing
1. Select exercise from list
2. Listen to native audio
3. Click record and repeat
4. Get pronunciation score
5. Compare and retry

### Response Drills
1. Select drill category
2. Read cue card prompt
3. Timer starts automatically
4. Record response within time limit
5. Review and retry

### Conversation Templates
1. Select scenario (restaurant, etc.)
2. Review full dialogue
3. Practice one role
4. See suggested responses
5. Practice both roles

---

## Integration

Reuses existing components:
- `VoiceRecorder` for audio capture
- `usePronunciationCheck` for scoring
- Existing TTS for template audio

---

## Files Created

- `backend/src/routes/speaking.ts` - API routes
- `backend/data/speaking_schema.sql` - Database schema
- `backend/data/speaking_sample_data.sql` - Sample templates/drills
- `frontend/src/components/SpeakingMode/SpeakingMode.tsx` - Component
- `frontend/src/components/SpeakingMode/SpeakingMode.css` - Styles

---

## Future Enhancements

- [ ] Waveform visualization for shadowing
- [ ] AI response evaluation (content completeness)
- [ ] 10+ conversation templates
- [ ] Role-play with AI partner
- [ ] Pronunciation specific feedback (pitch accent)
- [ ] Shadowing speed adjustment (0.5x, 0.75x, 1x)

---

*Implemented: 2026-03-25*  
*Part of: Phase 4 - Speaking Drills*
