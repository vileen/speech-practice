# Speech Practice App - Dokumentacja Architektury

## Data utworzenia: 2026-02-25
## Ostatnia aktualizacja: 2026-02-26

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
