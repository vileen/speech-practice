# Speech Practice App

Practice Japanese and Italian speaking with AI voice responses.

## Features

- 🎙️ **Record your voice** and get transcriptions
- 🔊 **AI-generated responses** in Japanese/Italian (ElevenLabs TTS)
- 🌍 **Multiple languages**: Japanese + Italian
- 🎭 **Voice selection**: Male/Female for each language
- 📊 **Session history** stored in PostgreSQL
- 🔒 **Password protection**

## Architecture

```
GitHub Pages (Frontend) ←──→ Your Mac (Backend API + PostgreSQL)
         ↑                           ↑
    Static React               Tailscale/ngrok
```

## Setup

### 1. Backend Setup

```bash
cd backend
yarn install

# Create database
createdb speech_practice

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with your actual keys:
# - ELEVENLABS_API_KEY
# - OPENAI_API_KEY (for Whisper STT)
# - ACCESS_PASSWORD (for app login)

# Initialize database
yarn db:init

# Start server
yarn dev
```

Backend runs on `http://localhost:3001`

### 2. Frontend Setup

```bash
cd frontend
yarn install
yarn dev
```

Frontend runs on `http://localhost:5173`

### 3. Deploy to GitHub Pages

```bash
./deploy.sh
```

Then push to GitHub and enable Pages in repository settings.

## Environment Variables

### Backend (.env)

```
PORT=3001
NODE_ENV=development
ELEVENLABS_API_KEY=sk_...
OPENAI_API_KEY=sk-...
DATABASE_URL=postgresql://localhost:5432/speech_practice
ACCESS_PASSWORD=your_password
AUDIO_STORAGE_PATH=./audio_recordings
```

### Frontend (.env.local for development)

```
VITE_API_URL=http://localhost:3001
```

## API Endpoints

- `POST /api/sessions` - Create new practice session
- `POST /api/tts` - Generate text-to-speech
- `POST /api/upload` - Upload user recording
- `GET /api/sessions/:id` - Get session with messages

## ElevenLabs Credits

Estimated usage:
- 30k credits/month ≈ 100-150 conversation turns
- For heavy use (30-60 min daily): 50-100k credits/month recommended

## Development

```bash
# Terminal 1 - Backend
cd backend && yarn dev

# Terminal 2 - Frontend
cd frontend && yarn dev
```

## License

Private project
