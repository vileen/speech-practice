# Feature #22: Speech Recognition Feedback

**Status:** ✅ Complete  
**Complexity:** High  
**Impact:** Very High  
**Completed:** 2026-03-27

## Overview

AI-powered pronunciation assessment that records user speech, transcribes it using OpenAI Whisper API, and compares it against the target Japanese phrase to provide detailed feedback on pronunciation accuracy.

## Why This Matters

Without pronunciation feedback, users practice speaking but have no way to know if they're pronouncing correctly. This feature closes the feedback loop and prevents reinforcing incorrect pronunciation habits.

## Implementation

### Backend

**Service:** `backend/src/services/speechAssessment.ts`

Key functions:
- `transcribeAudio(audioBuffer: Buffer)` - Sends audio to OpenAI Whisper API
- `comparePronunciation(actual, expected, expectedRomaji)` - Levenshtein distance comparison
- Japanese text normalization (handles kana variations, punctuation)
- Error detection (omissions, insertions, substitutions)

**Routes:** `backend/src/routes/speech.ts`

- `POST /api/speech/assess` - Full pronunciation assessment
- `POST /api/speech/transcribe` - Transcription only
- `GET /api/speech/assessments/:userId` - User assessment history
- `GET /api/speech/assessments/:userId/stats` - Pronunciation statistics

**Database:**

```sql
CREATE TABLE speech_assessments (
  id SERIAL PRIMARY KEY,
  user_id TEXT,
  target_phrase TEXT NOT NULL,
  user_transcript TEXT NOT NULL,
  accuracy_score INTEGER,
  feedback JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Frontend

**Hook:** `frontend/src/hooks/useSpeechAssessment.ts`

- `assessPronunciation(audioBlob, targetText)` - API integration
- Loading states and error handling

**Component:** `frontend/src/components/SpeechFeedback/SpeechFeedback.tsx`

Features:
- Visual score display with color coding:
  - 90-100: Excellent (green)
  - 70-89: Good (blue)
  - 50-69: Fair (yellow)
  - <50: Needs work (red)
- Transcription comparison (what user said vs expected)
- Error highlighting with specific details
- Audio playback of user's recording
- Tips and suggestions for improvement
- Retry and Continue buttons

**Integration:**
- Integrated into `SpeakingMode.tsx` shadowing exercises
- Automatically assesses pronunciation after recording
- Shows detailed feedback inline

## API Usage

**Requires:** `OPENAI_API_KEY` environment variable

**Whisper API:**
- Model: `whisper-1`
- Language: `ja` (Japanese)
- Response format: JSON

## Technical Challenges

1. **Japanese Text Normalization:**
   - Handle kana variations (hiragana vs katakana for same sound)
   - Strip punctuation for fair comparison
   - Handle particles that may be optional

2. **Audio Format:**
   - Browser records WebM/Opus
   - Whisper accepts various formats
   - Direct upload without conversion

3. **Scoring Algorithm:**
   - Levenshtein distance for character-level comparison
   - Normalize score to 0-100 scale
   - Weight errors by severity

## Future Enhancements

- [ ] Pitch accent detection
- [ ] Rhythm and intonation scoring
- [ ] Phoneme-level feedback
- [ ] Progress tracking over time
- [ ] Difficult sound identification

## Files

```
backend/src/services/speechAssessment.ts
backend/src/routes/speech.ts
frontend/src/hooks/useSpeechAssessment.ts
frontend/src/components/SpeechFeedback/
  ├── SpeechFeedback.tsx
  └── SpeechFeedback.css
```

## Testing

- Backend: 109 tests passing
- Frontend: 400 tests passing
- Build: ✅ Successful

## Related

- Feature #8: Shadowing Mode (uses this for feedback)
- Feature #20: Speaking Drills (integration point)
