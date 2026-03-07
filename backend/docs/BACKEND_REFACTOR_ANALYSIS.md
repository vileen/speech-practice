# Backend Refactoring Analysis

## Current Structure Overview

```
backend/
├── src/
│   ├── server.ts              # 686 lines - Main Express server with all routes
│   ├── db/
│   │   ├── pool.ts            # 13 lines - PostgreSQL pool configuration
│   │   └── init.ts            # 34 lines - Database initialization script
│   └── services/
│       ├── chat.ts            # 75 lines - OpenAI chat integration
│       ├── elevenlabs.ts      # 638 lines - TTS and furigana service (LARGEST)
│       ├── lessons.ts         # 337 lines - Lesson management
│       ├── openai-tts.ts      # 73 lines - Legacy OpenAI TTS (unused?)
│       ├── romaji.ts          # 224 lines - Romaji generation
│       └── whisper.ts         # 63 lines - Audio transcription
├── scripts/                   # 76 scripts (mostly one-time fixes)
├── dist/                      # Compiled output
└── package.json
```

---

## Problems Identified

### 1. **Monolithic Server (`server.ts` - 686 lines)**

**Issues:**
- All routes defined in one file
- Business logic mixed with HTTP handling
- No separation between routes, controllers, and services
- Hard to test individual endpoints
- No route organization by domain

**Current route count:** ~15+ routes mixed together

### 2. **God Object Service (`elevenlabs.ts` - 638 lines)**

**Issues:**
- TTS generation, furigana caching, romaji conversion all in one file
- File-based cache implementation mixed with API calls
- Multiple responsibilities violating Single Responsibility Principle
- Contains both sync and async versions of same functions

**Functions in this file:**
- `generateSpeech()` - TTS generation
- `addFurigana()` / `addFuriganaSync()` - Furigana processing
- `saveFuriganaCache()` / `loadFuriganaCache()` - Cache management
- `toHiraganaForTTS()` / `japaneseToRomaji()` - Text processing
- `stripFurigana()` - HTML processing

### 3. **Script Chaos (76 scripts in `/scripts`)**

**Issues:**
- No organization - all scripts in one folder
- Many one-time/fix scripts that should be removed or archived
- No naming convention
- Some scripts in `scripts/one-time/` but most aren't

**Script categories found:**
- Data fixes (`fix-*.ts`) - ~30 files
- Validation/auditing (`*audit*.ts`, `check-*.ts`) - ~15 files
- Lesson insertion/updates - ~10 files
- Testing scripts - ~5 files
- Database maintenance - ~10 files

### 4. **Missing Architectural Layers**

**Missing:**
- No controllers layer (route handlers are in server.ts)
- No middleware organization (only `checkPassword` in server.ts)
- No validation layer (Joi/Zod)
- No error handling middleware
- No request logging
- No rate limiting

### 5. **Database Issues**

**Issues:**
- SQL queries inline in route handlers
- No query builder or ORM
- No migrations system (just `init.ts`)
- No connection pooling configuration tuning
- Schema in `.sql` file, not versioned

### 6. **Configuration Management**

**Issues:**
- `dotenv` loaded multiple times (in multiple files)
- No config validation on startup
- Environment variables accessed directly throughout codebase
- No typed configuration object

---

## Refactoring Recommendations

### Phase 1: Project Structure (High Priority)

```
backend/
├── src/
│   ├── config/               # Configuration management
│   │   ├── index.ts          # Centralized config with validation
│   │   └── database.ts       # DB config
│   │
│   ├── routes/               # Route definitions only
│   │   ├── index.ts          # Route aggregator
│   │   ├── sessions.ts       # /api/sessions/*
│   │   ├── lessons.ts        # /api/lessons/*
│   │   ├── tts.ts            # /api/tts
│   │   ├── chat.ts           # /api/chat
│   │   ├── repeat.ts         # /api/repeat-after-me
│   │   ├── upload.ts         # /api/upload
│   │   └── health.ts         # /api/health
│   │
│   ├── controllers/          # Request/response handling
│   │   ├── sessions.ts
│   │   ├── lessons.ts
│   │   ├── tts.ts
│   │   ├── chat.ts
│   │   └── repeat.ts
│   │
│   ├── services/             # Business logic (refactored)
│   │   ├── elevenlabs/
│   │   │   ├── index.ts      # Main TTS service
│   │   │   ├── voices.ts     # Voice configuration
│   │   │   └── types.ts      # Type definitions
│   │   ├── furigana/
│   │   │   ├── index.ts      # Furigana processing
│   │   │   ├── cache.ts      # Cache management
│   │   │   └── jisho.ts      # Jisho API integration
│   │   ├── chat.ts           # Keep or split further
│   │   ├── whisper.ts        # Transcription
│   │   └── romaji.ts         # Romaji generation
│   │
│   ├── middleware/           # Express middleware
│   │   ├── auth.ts           # Password checking
│   │   ├── error-handler.ts  # Global error handling
│   │   ├── logger.ts         # Request logging
│   │   └── validation.ts     # Input validation
│   │
│   ├── db/                   # Database layer
│   │   ├── pool.ts           # Connection pool
│   │   ├── migrations/       # Versioned migrations
│   │   └── repositories/     # Data access layer (optional)
│   │
│   ├── utils/                # Shared utilities
│   │   ├── text-processing.ts
│   │   └── audio.ts
│   │
│   ├── types/                # Shared TypeScript types
│   │   └── index.ts
│   │
│   └── server.ts             # Slimmed down to ~100 lines
│
├── scripts/                  # Organized scripts
│   ├── maintenance/          # DB maintenance scripts
│   ├── migrations/           # Data migrations
│   └── one-time/             # Already exists - keep archived
│
└── tests/                    # Test files
    ├── unit/
    ├── integration/
    └── fixtures/
```

### Phase 2: Server.ts Refactoring (High Priority)

**Current:** 686 lines
**Target:** ~100 lines

**Extract to routes:**
```typescript
// src/server.ts - After refactoring
import express from 'express';
import { config } from './config/index.js';
import { errorHandler } from './middleware/error-handler.js';
import { requestLogger } from './middleware/logger.js';
import routes from './routes/index.js';

const app = express();

app.use(express.json());
app.use(cors(config.cors));
app.use(requestLogger);

// Mount all routes
app.use('/api', routes);

// Global error handler
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});
```

### Phase 3: Services Refactoring (Medium Priority)

**elevenlabs.ts (638 lines → ~200 lines):**

```
services/elevenlabs/
├── index.ts          # Main service (~80 lines)
├── client.ts         # API client (~50 lines)
├── voices.ts         # Voice configuration (~30 lines)
└── types.ts          # Type definitions (~20 lines)

services/furigana/
├── index.ts          # Furigana processing
├── cache.ts          # File-based cache
└── jisho.ts          # Jisho API client

services/text/
├── romaji.ts         # Japanese → romaji
├── processors.ts     # Particle detection, etc.
└── utils.ts          # stripFurigana, etc.
```

### Phase 4: Script Organization (Low Priority)

```
scripts/
├── archive/              # Move old one-time scripts here
│   └── one-time/         # Existing folder
├── maintenance/          # Active maintenance scripts
│   ├── backup.ts
│   └── audit.ts
├── migrations/           # Data migrations between versions
│   └── README.md
└── utils/                # Shared script utilities
```

**Archive/delete scripts older than 3 months that are one-time fixes.**

### Phase 5: Testing Setup (Medium Priority)

Add testing infrastructure:
```json
{
  "scripts": {
    "test": "vitest",
    "test:unit": "vitest run src/",
    "test:integration": "vitest run tests/integration/",
    "test:coverage": "vitest run --coverage"
  },
  "devDependencies": {
    "vitest": "^1.0.0",
    "supertest": "^6.3.0",
    "@types/supertest": "^6.0.0"
  }
}
```

---

## Priority Order

1. **High Priority:**
   - Split `server.ts` into routes/controllers
   - Create config management module
   - Add error handling middleware

2. **Medium Priority:**
   - Refactor `elevenlabs.ts` into smaller services
   - Add input validation (Zod)
   - Set up testing infrastructure

3. **Low Priority:**
   - Organize scripts folder
   - Add database migrations system
   - Repository pattern for DB access

---

## Estimated Effort

| Phase | Files Changed | Lines Modified | Estimated Time |
|-------|---------------|----------------|----------------|
| 1. Structure | 10-15 | ~500 | 2-3 hours |
| 2. Server refactor | 8-10 | ~600 | 3-4 hours |
| 3. Services | 5-8 | ~800 | 4-6 hours |
| 4. Scripts | 30+ | ~100 | 1-2 hours |
| 5. Testing | 5-10 | ~300 | 3-4 hours |
| **Total** | **60+** | **~2300** | **13-19 hours** |

---

## Quick Wins (Can do now)

1. **Create `src/routes/index.ts`** and start moving routes one by one
2. **Extract `checkPassword` middleware** to separate file
3. **Create `src/config/index.ts`** with typed config object
4. **Move Levenshtein distance function** from server.ts to utils
5. **Archive old scripts** that are no longer needed

## Risks

- **Breaking changes** - Need thorough testing after each phase
- **API compatibility** - Must maintain same request/response format
- **Time investment** - Large refactoring effort

## Recommendation

**Start with Phase 1 + 2** (routes extraction) as they provide the biggest architectural improvement with manageable effort. Then proceed incrementally.
