# Speech Practice App - Dokumentacja Architektury

## Data utworzenia: 2026-02-25

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
│  /speech-practice/       │      │  https://eds-grow-delivered  │
│                          │      │  -spending.trycloudflare.com │
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
                                    └──────────────────────────┘
```

---

## 📁 Lokalizacja Plików

### Projekt Lokalny
```
~/Projects/speech-practice/
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   ├── pool.ts              # Konfiguracja połączenia PG
│   │   │   ├── schema.sql           # Struktura tabel
│   │   │   └── migrations/          # Migracje bazy
│   │   ├── services/
│   │   │   └── lessons.ts           # Logika lekcji (PostgreSQL)
│   │   └── data/
│   │       └── lessons/
│   │           └── 2026-02-23.json  # TYLKO 1 lekcja lokalnie!
│   ├── scripts/                     # Skrypty naprawcze
│   │   ├── scan-lessons.ts          # Skanowanie bazy
│   │   ├── dump-lesson.ts           # Eksport lekcji
│   │   └── fix-*.ts                 # Skrypty naprawcze
│   └── .env.local                   # Konfiguracja lokalna
├── frontend/
│   ├── .env.production              # VITE_API_URL=tunnel CF
│   └── src/
├── docs/                            # GitHub Pages build
└── README.md
```

### Baza Danych PostgreSQL

**Połączenie lokalne:**
```
DATABASE_URL=postgresql://localhost:5432/speech_practice
```

**Tabele:**
| Tabela | Opis |
|--------|------|
| `lessons` | 27 lekcji (vocabulary, grammar, practice_phrases) |
| `sessions` | Sesje użytkowników |
| `messages` | Historia wiadomości |
| `user_recordings` | Nagrania użytkowników |
| `furigana_cache` | Cache furigana (zmniejsza API calls) |

---

## 🔑 Kluczowe Informacje

### Gdzie są przechowywane lekcje?
- ✅ **PRODUKCJA**: Wszystkie 27 lekcji w PostgreSQL (dostępne przez API)
- ⚠️ **LOKALNIE**: Tylko 1 lekcja (2026-02-23.json) - reszta wymaga importu

### Jak działa deployment?
1. **Frontend** deployowany na GitHub Pages (statyczne pliki)
2. **Backend** uruchomiony lokalnie na Twojej maszynie
3. **Cloudflare Tunnel** tworzy publiczny URL do lokalnego backendu
4. **Frontend** łączy się z backendem przez ten tunnel

### Dlaczego aplikacja działa "wszędzie"?
Ponieważ frontend jest na GitHub Pages (dostępny globalnie), a backend jest na Twoim komputerze z Cloudflare Tunnel (też dostępny globalnie).

### Deployment Frontend (WAŻNE!)
**NIE używaj `npm run deploy` ani `gh-pages`!**

Poprawny proces deploymentu:
1. Zrób zmiany w kodzie
2. `git add -A`
3. `git commit -m "opis zmian"`
4. `git push origin main`
5. GitHub Actions automatycznie zbuduje i wdroży zmiany na GitHub Pages

Konfiguracja GitHub Actions: `.github/workflows/deploy-frontend.yml`

---

## 📋 Struktura Danych Vocabulary

### Format JSON w Bazie Danych
```json
{
  "jp": "パソコン",
  "reading": "ぱそこん",
  "romaji": "pasokon",
  "en": "PC (personal computer)",
  "type": "noun"
}
```

### Pola:
| Pole | Opis | Przykład |
|------|------|----------|
| `jp` | Japoński (kanji/katakana/hiragana) | `パソコン` |
| `reading` | Hiragana/furigana | `ぱそこん` |
| `romaji` | Romaji (latinka) | `pasokon` |
| `en` | Angielskie tłumaczenie | `PC (personal computer)` |
| `type` | Typ gramatyczny | `noun`, `verb`, `i-adjective`, `na-adjective`, `expression` |

### Wyświetlanie w Kartach (Frontend)
Karty słownictwa wyświetlają 3 wiersze:
1. **Japoński** (`jp`) - duża czcionka
2. **Romaji** (`romaji`) - kursywa, szary kolor
3. **Angielskie tłumaczenie** (`en`)

Pliki do edycji:
- `frontend/src/LessonMode.tsx` - logika wyświetlania
- `frontend/src/LessonMode.css` - stylowanie kart

---

## 🛠️ Komendy

### Uruchomienie lokalne
```bash
# Terminal 1 - Backend
cd ~/Projects/speech-practice/backend
npm run dev

# Terminal 2 - Frontend
cd ~/Projects/speech-practice/frontend
npm run dev

# Terminal 3 - Cloudflare Tunnel (do publicznego dostępu)
cloudflared tunnel run speech-practice
```

### Skrypty przydatne
```bash
# Skanowanie lekcji w bazie
cd backend
npx tsx scripts/scan-lessons.ts

# Eksport lekcji do JSON
npx tsx scripts/dump-lesson.ts 2025-10-01

# Inicjalizacja bazy
npm run db:init
```

---

## 📊 Stan Danych (2026-02-25)

| Lokalizacja | Liczba lekcji | Status |
|-------------|---------------|--------|
| PostgreSQL (produkcja) | 27 | ✅ Kompletne |
| JSON w `backend/src/data/lessons/` | 1 | ⚠️ Tylko 2026-02-23 |
| Markdown w Obsidian | 27 | ✅ Kopie zapasowe |

---

## ⚠️ Uwagi i Problemy Znane

1. **Furigana API** (`https://trunk-sticks-connect-currency.trycloudflare.com/api/furigana`) zwraca 500 - wymaga naprawy
2. **Lokalna baza PostgreSQL** nie jest uruchomiona (brak `psql` i `pg_isready`)
3. **Brak backupu** bazy PostgreSQL w formacie JSON/SQL

---

## 🔧 TODO (Zalecane)

- [ ] Dokończyć poprawę vocabulary dla pozostałych 13 lekcji (2025-10-01 do 2025-11-03)
- [ ] Sprawdzić i poprawić grammar dla wszystkich lekcji
- [ ] Sprawdzić i poprawić practice_phrases dla wszystkich lekcji
- [ ] Uruchomić lokalnie PostgreSQL
- [ ] Wyeksportować wszystkie lekcje z produkcji do JSON (backup)
- [ ] Zautomatyzować backup bazy danych

---

## ✅ Zrobione (2026-02-25)

- [x] Naprawiono endpoint furigana (brakowało definicji FALLBACK_READINGS)
- [x] Zaktualizowano 13 lekcji (vocabulary skrócone do 6-14 słów, poprawiony format)
- [x] Dodano wyświetlanie romaji w kartach słownictwa
- [x] Uporządkowano strukturę plików w Obsidian
- [x] Utworzono dokumentację architektury
