# Speech Practice App - Architecture Documentation

## Created: 2026-02-25
## Last updated: 2026-03-07

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER                                     │
└──────────────┬──────────────────────────────────┬───────────────┘
               │                                  │
               ▼                                  ▼
┌──────────────────────────┐      ┌──────────────────────────────┐
│   FRONTEND (GitHub Pages) │      │   BACKEND (Your Machine)     │
│                          │      │                              │
│  URL:                    │      │  Local: localhost:3001       │
│  https://vileen.github.io│◄────►│  Public: Cloudflare Tunnel   │
│  /speech-practice/       │      │  https://trunk-sticks-connect│
│                          │      │  -currency.trycloudflare.com │
└──────────────────────────┘      └──────────────┬───────────────┘
                                                  │
                                                  ▼
                                    ┌──────────────────────────┐
                                    │   POSTGRESQL DATABASE    │
                                    │                          │
                                    │  Host: localhost:5432    │
                                    │  Name: speech_practice   │
                                    │  Tables: lessons,        │
                                    │  sessions, messages,     │
                                    │  furigana_cache          │
└───────────────────────────────────┴──────────────────────────┘
```

---

## 📁 Project Structure

### Backend (\`backend/\`)
\`\`\`
backend/
├── src/
│   ├── db/                    # Database
│   │   ├── pool.ts
│   │   ├── init.ts
│   │   └── migrations/
│   ├── routes/                # API routes
│   ├── services/              # Business logic
│   │   ├── lessons.ts         # Lessons (PostgreSQL)
│   │   ├── chat.ts            # AI chat (OpenAI)
│   │   ├── elevenlabs.ts      # TTS (ElevenLabs)
│   │   ├── whisper.ts         # Speech-to-text (OpenAI)
│   │   └── romaji.ts          # JP -> romaji conversion
│   ├── server.ts              # Main Express server
│   └── data/                  # JSON data (runtime)
│       ├── furigana-cache.json
│       └── backups/
├── scripts/                   # One-time scripts
│   ├── one-time/              # Migrations, fixes
│   └── test-*.ts              # Tests
└── data/                      # Data files (runtime)
    ├── furigana-cache.json
    ├── all-lessons-detailed.json
    └── backups/
\`\`\`

### Frontend (\`frontend/src/\`)
\`\`\`
frontend/src/
├── components/                     # React components
│   ├── RepeatMode.tsx              # Repeat After Me mode
│   ├── JapanesePhrase.tsx          # Display JP + furigana + romaji
│   ├── FuriganaText.tsx            # Text with furigana
│   ├── RomajiText.tsx              # Romaji
│   └── VoiceRecorder.tsx           # Voice recording
├── hooks/                          # Custom React hooks
│   ├── useFurigana.ts              # Fetch furigana from API
│   ├── useAudioPlayer.ts           # Audio playback
│   └── usePronunciationCheck.ts    # Pronunciation check
├── test/                           # Tests (Vitest)
│   ├── components/
│   ├── hooks/
│   └── utils/
├── App.tsx                         # Main application
├── LessonMode.tsx                  # Lesson mode
├── VoiceRecorder.tsx               # Recording (root level)
└── translations.ts                 # Translations
\`\`\`

---

## 🔑 Key Information

### Authentication
**Type:** Simple header-based password check (not session-based)

**How it works:**
1. Password stored in \`localStorage\` on frontend (\`speech_practice_password\`)
2. Sent with every API request in \`X-Password\` header
3. Backend checks against \`ACCESS_PASSWORD\` env var (default: \`default123\`)

**Note:** This is simpler than session-based auth (no cookies, no sessions). Password is verified on every request.

**Security considerations:**
- Password is sent with every request (use HTTPS only)
- No session expiration (password persists until cleared from localStorage)
- Good enough for personal use, not for multi-user scenarios

### Where are lessons stored?
- ✅ **PRODUCTION**: All 27 lessons in PostgreSQL (available via API)
- ✅ **LOCAL**: Data from PostgreSQL (no JSON files in src/data/)

### How does deployment work?
1. **Frontend** deployed to GitHub Pages (static files)
2. **Backend** running locally on your machine
3. **Cloudflare Tunnel** creates public URL to local backend
4. **Frontend** connects to backend through this tunnel

### Frontend Deployment
**DO NOT use \`npm run deploy\` or \`gh-pages\`!**

Correct process:
1. Make code changes
2. \`git add -A\`
3. \`git commit -m "description of changes"\`
4. \`git push origin main\`
5. GitHub Actions automatically builds and deploys

---

## 🧪 Tests

### Backend Tests
\`\`\`bash
cd backend
npx tsx scripts/test-voice-recorder-logic.ts
npx tsx scripts/test-repeat-mode-loading.ts
\`\`\`

### Frontend Tests
\`\`\`bash
cd frontend
npm test              # Vitest (unit tests)
npm run build         # TypeScript check
\`\`\`

### Pre-push Hook
All tests run automatically before every push:
- VoiceRecorder logic tests
- Repeat Mode loading tests
- Frontend unit tests (Vitest)
- Backend build
- Frontend build

---

## 📋 Data Structure

### Vocabulary (PostgreSQL)
\`\`\`json
{
  "jp": "パソコン",
  "reading": "ぱそこん",
  "romaji": "pasokon",
  "en": "PC (personal computer)",
  "type": "noun",
  "furigana": null
}
\`\`\`

### Fields:
| Field | Description | Example |
|-------|-------------|---------|
| \`jp\` | Japanese (kanji/katakana/hiragana) | \`パソコン\` |
| \`reading\` | Kanji reading (without okurigana!) | \`ぱそこん\` |
| \`romaji\` | Romaji (automatically generated) | \`pasokon\` |
| \`en\` | English translation | \`PC\` |
| \`type\` | Grammar type | \`noun\`, \`verb\`, \`i-adjective\`, \`na-adjective\`, \`expression\` |
| \`furigana\` | HTML with ruby tags (optional) | \`<ruby>...\` |

### Grammar (PostgreSQL)
\`\`\`json
{
  "pattern": "〜てもいいです",
  "explanation": "Asking for permission",
  "romaji": "temo ii desu",
  "examples": [
    {
      "jp": "写真を撮ってもいいですか",
      "en": "May I take a photo?",
      "furigana": "<ruby>写<rt>しゃ</rt></ruby>..."
    }
  ]
}
\`\`\`

---

## 🛠️ Commands

### Local Development
\`\`\`bash
# Terminal 1 - Backend
cd ~/Projects/speech-practice/backend
npm run dev

# Terminal 2 - Cloudflare Tunnel (for public access)
cloudflared tunnel run speech-practice

# Frontend is on GitHub Pages (no need to run locally)
\`\`\`

### Useful Scripts
\`\`\`bash
# Backend
cd backend
npx tsx scripts/scan-lessons.ts      # Scan lessons
npx tsx scripts/dump-lesson.ts 2025-10-01  # Export lesson
npm run db:init                       # Database initialization

# Frontend
cd frontend
npm test                              # Run tests
npm run build                         # Check TypeScript
\`\`\`

---

## 📊 Data Status (2026-02-26)

| Location | Lesson count | Status |
|----------|--------------|--------|
| PostgreSQL (production) | 27 | ✅ Complete |
| Obsidian Vault | 27 | ✅ Documentation |

---

## ✅ Completed (2026-02-26)

- [x] Backend refactoring: extracted romaji.ts
- [x] Frontend refactoring: extracted components and hooks
- [x] Added tests (Vitest for frontend)
- [x] Fix: okurigana in furigana (好き → す, not すき)
- [x] Fix: particle pronunciation (は → wa, not ha)
- [x] Fix: loading states in RepeatMode
- [x] Pre-push hook with tests
- [x] File organization: runtime vs scripts

---

## 🔧 TODO

- [ ] Add more tests (frontend hooks, components)
- [ ] Add E2E tests (Playwright/Cypress)
- [ ] Automate database backup

---

## 👥 Repository Permissions

### Current Setup
- **Owner:** \`vileen\` (GitHub)
- **Default branch:** \`main\`
- **Branch protection:** None (can push directly)

### Collaboration
Currently only owner can push directly to \`main\`. For collaboration with other developers:

1. **Fork workflow** (for external contributors)
2. **Branch workflow** (for trusted collaborators)
   - Add collaborators in GitHub repo settings
   - Recommended: Enable branch protection for \`main\`
   - Require PR + review before merge

---

## 🔄 Auto-Restart Backend on PR Merge

### Goal
Automatic backend restart after PR is merged to \`main\` - enables collaboration without manual restart.

### TODO: Implementation

#### Option A: GitHub Actions + Webhook
\`\`\`yaml
# .github/workflows/restart-backend.yml
name: Restart Backend on Merge

on:
  push:
    branches: [main]

jobs:
  notify-restart:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger backend restart
        run: |
          curl -X POST ${{ secrets.BACKEND_RESTART_WEBHOOK }} \
            -H "Authorization: Bearer ${{ secrets.RESTART_TOKEN }}" \
            -d '{"action": "restart", "commit": "${{ github.sha }}"}'
\`\`\`

**Requires:**
- Webhook endpoint on backend (e.g. \`/webhook/restart\`)
- Token authentication
- PM2/systemd handler for restart

#### Option B: Watchdog on server
\`\`\`bash
# Script on local server
cd ~/Projects/speech-practice
while true; do
  git fetch origin
  LOCAL=$(git rev-parse main)
  REMOTE=$(git rev-parse origin/main)
  
  if [ "$LOCAL" != "$REMOTE" ]; then
    git pull origin main
    pm2 restart speech-practice-backend
  fi
  
  sleep 60
done
\`\`\`

#### Option C: GitHub Actions + SSH (if server is public)
\`\`\`yaml
- name: Deploy and restart
  uses: appleboy/ssh-action@v1.0.0
  with:
    host: ${{ secrets.SSH_HOST }}
    username: ${{ secrets.SSH_USER }}
    key: ${{ secrets.SSH_KEY }}
    script: |
      cd ~/Projects/speech-practice
      git pull origin main
      pm2 restart backend
\`\`\`

**Note:** Option C requires public IP or Tailscale for the server.

### Security
- **DO NOT commit:** SSH keys, passwords, tokens to repo
- **Use:** GitHub Secrets (\`${{ secrets.XXX }}\`)
- **Webhook token:** Randomly generated, stored outside repo
