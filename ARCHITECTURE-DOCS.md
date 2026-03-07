# Speech Practice App - Dokumentacja Architektury

## Data utworzenia: 2026-02-25
## Ostatnia aktualizacja: 2026-03-05

---

## 🏗️ Architektura Systemu

```
┌─────────────────────────────────────────────────────────────────┐
│                         UŻYTKOWNIK                             │
└──────────────┬──────────────────────────────────┬───────────────┘
               │                                  │
               ▼                                  ▼
┌──────────────────────────┐      ┌──────────────────────────────┐
│   FRONTEND (GitHub Pages) │      │   BACKEND (Twoja Maszyna)    │
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

## 📁 Struktura Projektu

### Backend (`backend/`)
```
backend/
├── src/
│   ├── db/                    # Baza danych
│   │   ├── pool.ts
│   │   ├── init.ts
│   │   └── migrations/
│   ├── routes/                # API routes
│   ├── services/              # Logika biznesowa
│   │   ├── lessons.ts         # Lekcje (PostgreSQL)
│   │   ├── chat.ts            # AI chat (OpenAI)
│   │   ├── elevenlabs.ts      # TTS (ElevenLabs)
│   │   ├── whisper.ts         # Speech-to-text (OpenAI)
│   │   └── romaji.ts          # Konwersja JP -> romaji
│   ├── server.ts              # Główny serwer Express
│   └── data/                  # Dane JSON (runtime)
│       ├── furigana-cache.json
│       └── backups/
├── scripts/                   # Skrypty jednorazowe
│   ├── one-time/              # Migracje, fixy
│   └── test-*.ts              # Testy
└── data/                      # Pliki danych (runtime)
    ├── furigana-cache.json
    ├── all-lessons-detailed.json
    └── backups/
```

### Frontend (`frontend/src/`)
```
frontend/src/
├── components/                # React komponenty
│   ├── RepeatMode.tsx         # Tryb Repeat After Me
│   ├── JapanesePhrase.tsx     # Wyświetlanie JP + furigana + romaji
│   ├── FuriganaText.tsx       # Tekst z furigana
│   ├── RomajiText.tsx         # Romaji
│   └── VoiceRecorder.tsx      # Nagrywanie głosu
├── hooks/                     # Custom React hooks
│   ├── useFurigana.ts         # Fetch furigana z API
│   ├── useAudioPlayer.ts      # Odtwarzanie audio
│   └── usePronunciationCheck.ts  # Sprawdzanie wymowy
├── test/                      # Testy (Vitest)
│   ├── components/
│   ├── hooks/
│   └── utils/
├── App.tsx                    # Główna aplikacja
├── LessonMode.tsx             # Tryb lekcji
├── VoiceRecorder.tsx          # Nagrywanie (root level)
└── translations.ts            # Tłumaczenia
```

---

## 🔑 Kluczowe Informacje

### Authentication
**Type:** Simple header-based password check (not session-based)

**How it works:**
1. Password stored in `localStorage` on frontend (`speech_practice_password`)
2. Sent with every API request in `X-Password` header
3. Backend checks against `ACCESS_PASSWORD` env var (default: `default123`)

**Note:** This is simpler than session-based auth (no cookies, no sessions). Password is verified on every request.

**Security considerations:**
- Password is sent with every request (use HTTPS only)
- No session expiration (password persists until cleared from localStorage)
- Good enough for personal use, not for multi-user scenarios

### Gdzie są przechowywane lekcje?
- ✅ **PRODUKCJA**: Wszystkie 27 lekcji w PostgreSQL (dostępne przez API)
- ✅ **LOKALNIE**: Dane z PostgreSQL (nie ma JSONów w src/data/)

### Jak działa deployment?
1. **Frontend** deployowany na GitHub Pages (statyczne pliki)
2. **Backend** uruchomiony lokalnie na Twojej maszynie
3. **Cloudflare Tunnel** tworzy publiczny URL do lokalnego backendu
4. **Frontend** łączy się z backendem przez ten tunnel

### Deployment Frontend
**NIE używaj `npm run deploy` ani `gh-pages`!**

Poprawny proces:
1. Zrób zmiany w kodzie
2. `git add -A`
3. `git commit -m "opis zmian"`
4. `git push origin main`
5. GitHub Actions automatycznie zbuduje i wdroży

---

## 🧪 Testy

### Backend Tests
```bash
cd backend
npx tsx scripts/test-voice-recorder-logic.ts
npx tsx scripts/test-repeat-mode-loading.ts
```

### Frontend Tests
```bash
cd frontend
npm test              # Vitest (unit tests)
npm run build         # TypeScript check
```

### Pre-push Hook
Wszystkie testy uruchamiają się automatycznie przed każdym push:
- VoiceRecorder logic tests
- Repeat Mode loading tests
- Frontend unit tests (Vitest)
- Backend build
- Frontend build

---

## 📋 Struktura Danych

### Vocabulary (PostgreSQL)
```json
{
  "jp": "パソコン",
  "reading": "ぱそこん",
  "romaji": "pasokon",
  "en": "PC (personal computer)",
  "type": "noun",
  "furigana": null
}
```

### Pola:
| Pole | Opis | Przykład |
|------|------|----------|
| `jp` | Japoński (kanji/katakana/hiragana) | `パソコン` |
| `reading` | Czytanie kanji (bez okurigana!) | `ぱそこん` |
| `romaji` | Romaji (generowane automatycznie) | `pasokon` |
| `en` | Angielskie tłumaczenie | `PC` |
| `type` | Typ gramatyczny | `noun`, `verb`, `i-adjective`, `na-adjective`, `expression` |
| `furigana` | HTML z ruby tags (opcjonalne) | `<ruby>...` |

### Grammar (PostgreSQL)
```json
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
```

---

## 🛠️ Komendy

### Uruchomienie lokalne
```bash
# Terminal 1 - Backend
cd ~/Projects/speech-practice/backend
npm run dev

# Terminal 2 - Cloudflare Tunnel (do publicznego dostępu)
cloudflared tunnel run speech-practice

# Frontend jest na GitHub Pages (nie trzeba uruchamiać lokalnie)
```

### Skrypty przydatne
```bash
# Backend
cd backend
npx tsx scripts/scan-lessons.ts      # Skanowanie lekcji
npx tsx scripts/dump-lesson.ts 2025-10-01  # Eksport lekcji
npm run db:init                       # Inicjalizacja bazy

# Frontend
cd frontend
npm test                              # Uruchom testy
npm run build                         # Sprawdź TypeScript
```

---

## 📊 Stan Danych (2026-02-26)

| Lokalizacja | Liczba lekcji | Status |
|-------------|---------------|--------|
| PostgreSQL (produkcja) | 27 | ✅ Kompletne |
| Obsidian Vault | 27 | ✅ Dokumentacja |

---

## ✅ Zrobione (2026-02-26)

- [x] Refactoring backend: wydzielenie romaji.ts
- [x] Refactoring frontend: wydzielenie komponentów i hooków
- [x] Dodanie testów (Vitest dla frontendu)
- [x] Fix: okurigana w furigana (好き → す, nie すき)
- [x] Fix: particle pronunciation (は → wa, nie ha)
- [x] Fix: loading states w RepeatMode
- [x] Pre-push hook z testami
- [x] Organizacja plików: runtime vs skrypty

---

## 🔧 TODO

- [ ] Dodać więcej testów (frontend hooks, komponenty)
- [ ] Dodać testy E2E (Playwright/Cypress)
- [ ] Zautomatyzować backup bazy danych

---

## 👥 Uprawnienia Repozytorium

### Obecny Setup
- **Właściciel:** `vileen` (GitHub)
- **Branch domyślny:** `main`
- **Branch protection:** Brak (można pushować bezpośrednio)

### Kolaboracja
Obecnie tylko właściciel może pushować bezpośrednio na `main`. Dla kolaboracji z innymi deweloperami:

1. **Fork workflow** (dla zewnętrznych kontrybutorów)
2. **Branch workflow** (dla trusted collaboratorów)
   - Dodaj collaboratorów w GitHub repo settings
   - Zalecane: Włączyć branch protection dla `main`
   - Wymagać PR + review przed mergem

---

## 🔄 Auto-Restart Backendu na PR Merge

### Cel
Automatyczny restart backendu po zmergowaniu PR do `main` - umożliwia kolaborację bez manualnego restartu.

### TODO: Implementacja

#### Opcja A: GitHub Actions + Webhook
```yaml
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
```

**Wymaga:**
- Endpoint webhook na backendzie (np. `/webhook/restart`)
- Autentykacja tokenem
- Handler PM2/systemd do restartu

#### Opcja B: Watchdog na serwerze
```bash
# Skrypt na serwerze lokalnym
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
```

#### Opcja C: GitHub Actions + SSH (jeśli serwer publiczny)
```yaml
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
```

**Uwaga:** Opcja C wymaga publicznego IP lub Tailscale dla serwera.

### Bezpieczeństwo
- **NIE commitować:** SSH keys, hasła, tokeny do repo
- **Używać:** GitHub Secrets (`${{ secrets.XXX }}`)
- **Webhook token:** Generowany losowo, przechowywany poza repo
