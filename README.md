# Speech Practice App

<!-- Frontend Badges -->
[![Frontend Deploy](https://img.shields.io/badge/frontend-github%20pages-success)](https://vileen.github.io/speech-practice/)
[![Frontend Tests](https://github.com/vileen/speech-practice/workflows/Tests%20%26%20Coverage/badge.svg?branch=main)](https://github.com/vileen/speech-practice/actions)

<!-- Backend Badges -->
[![Backend Status](https://img.shields.io/badge/backend-online-success)](https://speech.vileen.pl/api/health)
[![Frontend Coverage](https://codecov.io/gh/vileen/speech-practice/flag/frontend/graph/badge.svg?label=frontend%20cov)](https://codecov.io/gh/vileen/speech-practice)
[![Backend Coverage](https://codecov.io/gh/vileen/speech-practice/flag/backend/graph/badge.svg?label=backend%20cov)](https://codecov.io/gh/vileen/speech-practice)

Japanese language learning app with AI conversation, speech recognition, and lesson-based practice.

## Features

- 🎙️ **Speech-to-Text** (OpenAI Whisper API)
- 🔊 **Text-to-Speech** (ElevenLabs)
- 📚 **Lesson Mode** — practice specific lessons with AI
- 🎯 **Repeat After Me** — pronunciation training with feedback
- 🧠 **Memory Mode** — SRS-based vocabulary review with FSRS algorithm
- 💬 **AI Conversation** — practice speaking naturally

## Architecture

```
Frontend (React + Vite) → Backend (Node/Express) → APIs (OpenAI, ElevenLabs)
     ↓                        ↓
  GitHub Pages          Your Server
                        (Local + Tunnel / Cloud / VPS)
```

## Quick Start (Development)

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

## Deployment

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

## Environment Variables

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

## Security Notes

- Never commit `.env.local` or `.env` files
- Backend requires `X-Password` header for all API requests
- API keys are server-side only
- Use strong password for `ACCESS_PASSWORD`

## Development Notes

### Database Migrations
```bash
cd backend
psql "$DATABASE_URL" -f src/db/schema.sql
```

### Adding New Lessons
Lessons are stored in PostgreSQL database. To add a new lesson:

1. Create a JSON file with lesson data (vocabulary, grammar, practice_phrases)
2. Run the import script:
   ```bash
   cd backend
   npx tsx scripts/import-lesson.ts YYYY-MM-DD
   ```
3. Verify in database:
   ```bash
   psql "$DATABASE_URL" -c "SELECT id, title FROM lessons WHERE date = 'YYYY-MM-DD';"
   ```

See `docs/ARCHITECTURE-DOCS.md` for detailed data structure.

## Documentation

- `docs/ARCHITECTURE-DOCS.md` — System architecture and data flow
- `docs/REVIEW_ENHANCEMENT_IDEAS.md` — Planned features and enhancements
- `docs/PROGRESS_SUMMARY.md` — Recent changes and development log
- `CONTRIBUTING.md` — Guidelines for contributors

## License

MIT
