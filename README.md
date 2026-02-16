# Speech Practice App

Japanese/Italian language learning app with AI conversation, speech recognition, and lesson-based practice.

## Features

- 🎙️ **Speech-to-Text** (Whisper API)
- 🔊 **Text-to-Speech** (ElevenLabs)
- 📚 **Lesson Mode** — practice specific lessons
- 🎯 **Repeat After Me** — pronunciation training
- 💬 **AI Conversation** — practice speaking naturally

## Architecture

```
Frontend (React) → Backend (Node/Express) → APIs (OpenAI, ElevenLabs)
     ↓                    ↓
  GitHub Pages      Your Mac Mini (Tailscale)
                         OR
                    Cloudflare Tunnel (public)
```

## Quick Start (Development)

### Backend
```bash
cd backend
cp .env.example .env.local
# Fill in your API keys
yarn install
yarn dev
```

### Frontend
```bash
cd frontend
yarn install
yarn dev
```

## Deployment

### Frontend → GitHub Pages
Automatic via GitHub Actions on every push to `main`.

### Backend Options

#### Option A: Local + Cloudflare Tunnel (Recommended for personal use)
1. Install cloudflared: `brew install cloudflare/cloudflare/cloudflared`
2. Login: `cloudflared tunnel login`
3. Create tunnel: `cloudflared tunnel create speech-practice`
4. Route traffic: `cloudflared tunnel route dns speech-practice your-domain.example.com`
5. Run: `cloudflared tunnel run speech-practice`

#### Option B: Render.com (Free)
1. Push repo to GitHub
2. Connect Render to repo
3. Set environment variables in Render dashboard
4. Deploy

## Environment Variables

### Backend (.env.local)
```
PORT=3001
DATABASE_URL=postgresql://...
ELEVENLABS_API_KEY=your_key
OPENAI_API_KEY=your_key
ACCESS_PASSWORD=your_password
```

### Frontend (.env)
```
VITE_API_URL=https://your-backend-url.com
```

## Security Notes

- Never commit `.env.local` or `.env` files
- Backend requires `X-Password` header for all requests
- API keys are server-side only

## License

MIT
