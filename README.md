# Speech Practice App

<!-- Deploy -->
[![Frontend Deploy](https://img.shields.io/badge/frontend-github%20pages-success)](https://vileen.github.io/speech-practice/)
[![Backend Status](https://img.shields.io/badge/backend-online-success)](https://speech.vileen.pl/api/health)

<!-- CI/CD -->
[![Tests](https://img.shields.io/github/actions/workflow/status/vileen/speech-practice/tests.yml?branch=main&label=tests)](https://github.com/vileen/speech-practice/actions)

<!-- Coverage -->
[![Frontend Coverage](https://img.shields.io/codecov/c/github/vileen/speech-practice?flag=frontend&label=frontend%20cov)](https://codecov.io/gh/vileen/speech-practice)
[![Backend Coverage](https://img.shields.io/codecov/c/github/vileen/speech-practice?flag=backend&label=backend%20cov)](https://codecov.io/gh/vileen/speech-practice)

Japanese language learning app with AI conversation, speech recognition, SRS-based review, and kanji practice.

## ✨ Features

### 🎙️ Speech & Audio
- **Speech-to-Text** — OpenAI Whisper API for accurate Japanese transcription
- **Text-to-Speech** — ElevenLabs voices for natural pronunciation
- **Audio Playback** — Speed control and repeat functionality

### 📚 Learning Modes
- **Lesson Mode** — Browse lessons with vocabulary, grammar, and practice phrases
  - Tabbed interface: Overview / Vocabulary / Grammar / Practice
  - Automatic furigana generation with caching
  - Vocabulary review badges showing lesson cross-references
  
- **AI Conversation** — Practice speaking naturally with AI tutor
  - Context-aware responses based on lesson content
  - Real-time speech recognition and feedback
  
- **Repeat After Me** — Pronunciation training with feedback
  - Compare your pronunciation with native audio
  - Romaji display for reading assistance
  
- **Memory Mode** — SRS-based vocabulary review
  - FSRS (Free Spaced Repetition Scheduler) algorithm
  - Lesson-filtered card selection
  - Persistent lesson selections across sessions
  - Vocabulary count display on start button
  - Interval preview for each rating (Again/Hard/Good/Easy)
  
- **Kanji Practice** — KLC-based kanji learning
  - Kodansha Kanji Learner's Course (KLC) integration
  - Mnemonics for each kanji
  - RTK-style keywords and stories
  - Progressive difficulty (grades 1-6, remaining)

### 🎯 Smart Features
- **Automatic Furigana** — Cached furigana generation for all Japanese text
- **Weighted Quotes** — Motivational quotes with funny ones appearing 50% more often
- **LocalStorage Persistence** — Lesson selections and settings remembered between sessions
- **Responsive Design** — Mobile-first UI with iPhone optimizations

### 🔒 Security & Quality
- **Password Protection** — All API endpoints require authentication
- **Pre-push Hooks** — Automated testing before every commit
- **Regression Tests** — 24 tests protecting against fixed bugs
- **TypeScript** — Full type safety across frontend and backend

## 🏗️ Architecture

```
Frontend (React + Vite) → Backend (Node/Express) → APIs (OpenAI, ElevenLabs)
     ↓                        ↓
  GitHub Pages          Your Server
                        (Local + Tunnel / Cloud / VPS)
```

## 🚀 Quick Start (Development)

### Prerequisites
- Node.js 18+
- PostgreSQL database
- API keys: OpenAI, ElevenLabs

### Backend
```bash
cd backend
cp .env.example .env.local
# Edit .env.local with your API keys
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 📦 Deployment

### Frontend → GitHub Pages
Automatic via GitHub Actions on every push to `main`.

### Backend Options

#### Option A: Local + Cloudflare Tunnel (Recommended for personal use)
Expose your local backend through a secure public URL:

```bash
# Install cloudflared
# macOS: brew install cloudflare/cloudflare/cloudflared
# Linux: see https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/

# Login
cloudflared tunnel login

# Create and run tunnel
cloudflared tunnel create speech-practice
cloudflared tunnel route dns speech-practice api.yourdomain.com
cloudflared tunnel run speech-practice
```

#### Option B: Render.com / Railway / Fly.io (Free tiers)
1. Push repo to GitHub
2. Connect platform to your repo
3. Set environment variables
4. Deploy

#### Option C: Self-hosted VPS
1. Deploy to any VPS (DigitalOcean, AWS, etc.)
2. Set up reverse proxy (nginx/Caddy) with SSL
3. Configure environment variables

## 🔧 Environment Variables

### Backend (.env.local)
```
PORT=3001
DATABASE_URL=postgresql://user:pass@localhost:5432/speech_practice
ELEVENLABS_API_KEY=your_key
OPENAI_API_KEY=your_key
ACCESS_PASSWORD=secure_password_here
```

### Frontend (.env / GitHub Secret)
```
VITE_API_URL=https://your-backend-url.com
```

## 🧪 Testing

### Run Tests
```bash
# Frontend
cd frontend
npm test

# Backend
cd backend
npm test

# Both (pre-push hook)
npm test  # Runs automatically before git push
```

### Regression Tests
Located in `frontend/src/test/regression/` — these protect against previously fixed bugs. See `REGRESSION_TEST_POLICY.md` for guidelines.

## 📝 Database

### Schema Setup
```bash
cd backend
psql "$DATABASE_URL" -f src/db/schema.sql
```

### Adding New Lessons
```bash
cd backend
npx tsx scripts/import-lesson.ts YYYY-MM-DD
```

### Checking Lesson Data
```bash
cd backend
npx tsx scripts/check-lesson-data.ts YYYY-MM-DD
```

## 📚 Documentation

- `docs/ARCHITECTURE-DOCS.md` — System architecture and data flow
- `docs/REVIEW_ENHANCEMENT_IDEAS.md` — Planned features and enhancements
- `docs/PROGRESS_SUMMARY.md` — Recent changes and development log
- `frontend/src/test/regression/README.md` — Regression test policy
- `CONTRIBUTING.md` — Guidelines for contributors

## 🔐 Security Notes

- Never commit `.env.local` or `.env` files
- Backend requires `X-Password` header for all API requests
- API keys are server-side only
- Use strong password for `ACCESS_PASSWORD`

## 📄 License

MIT
