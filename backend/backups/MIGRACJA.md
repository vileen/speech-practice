# 📦 Migracja Bazy Danych — Speech Practice

> **Data dumpu:** *brak w repo — dodaj własny dump*  
> **Lokalizacja:** `backend/backups/`

---

## 🗂️ Zawartość Bazy

| Tabela | Opis | Wiersze (szac.) |
|--------|------|-----------------|
| `grammar_patterns` | Patterny gramatyczne (permission, prohibition, particles, adjectives...) | ~27 |
| `grammar_exercises` | Ćwiczenia do patternów | ~50+ |
| `grammar_attempts` | Historia prób użytkownika | zależy od aktywności |
| `user_grammar_progress` | Postęp SRS (streak, ease factor, next review) | zależy od aktywności |
| `kanji` | Znaki kanji z lekcji (68 szt.) | 68 |
| `user_kanji_progress` | Postęp nauki kanji | zależy od aktywności |
| `lessons` | Lekcje do Lesson Mode | 26 |
| `sessions` | Sesje rozmów AI | historia |
| `messages` | Wiadomości w sesjach | historia |
| `user_recordings` | Nagrania użytkownika | historia |
| `furigana_cache` | Cache furigana (pre-computed) | ~400+ |

---

## 💾 Tworzenie Dumpu (Eksport)

```bash
# Eksport pełnej bazy
pg_dump postgresql://localhost:5432/speech_practice > backend/backups/speech_practice_$(date +%Y-%m-%d).sql

# Lub ze skompresowaniem
pg_dump postgresql://localhost:5432/speech_practice | gzip > backend/backups/speech_practice_$(date +%Y-%m-%d).sql.gz
```

---

## 🚀 Instrukcja Migracji

### Krok 1: Wymagania na nowym urządzeniu

```bash
# 1. PostgreSQL (via Homebrew)
brew install postgresql
brew services start postgresql

# 2. Utwórz bazę danych
createdb speech_practice

# 3. Sprawdź czy działa
psql postgresql://localhost:5432/speech_practice -c "SELECT 1;"
```

### Krok 2: Przywrócenie bazy z dumpu

```bash
# Upewnij się, że masz dump w katalogu projektu
ls backend/backups/speech_practice_YYYY-MM-DD.sql

# Przywróć bazę
export PATH="/opt/homebrew/opt/libpq/bin:$PATH"
psql postgresql://localhost:5432/speech_practice < backend/backups/speech_practice_YYYY-MM-DD.sql
```

### Krok 3: Weryfikacja

```bash
# Sprawdź czy wszystkie tabele są obecne
psql postgresql://localhost:5432/speech_practice -c "\dt"

# Sprawdź liczbę patternów
psql postgresql://localhost:5432/speech_practice -c "SELECT COUNT(*) FROM grammar_patterns;"

# Sprawdź liczbę kanji
psql postgresql://localhost:5432/speech_practice -c "SELECT COUNT(*) FROM kanji;"
```

---

## 📋 Co Będzie Potrzebne na Nowym Urządzeniu

### 1. Środowisko

| Komponent | Wersja | Instalacja |
|-----------|--------|------------|
| Node.js | 18+ | `brew install node` |
| PostgreSQL | 14+ | `brew install postgresql` |
| Git | - | `brew install git` |

### 2. Zmienne Środowiskowe (`.env.local`)

```bash
# backend/.env.local
PORT=3001
NODE_ENV=development
ELEVENLABS_API_KEY=sk_xxx      # ← własny klucz
OPENAI_API_KEY=sk-xxx          # ← własny klucz
DATABASE_URL=postgresql://localhost:5432/speech_practice
ACCESS_PASSWORD=xxx            # ← własne hasło
AUDIO_STORAGE_PATH=./audio_recordings
ALLOWED_ORIGINS=http://localhost:5173

# frontend/.env.local
VITE_API_URL=                  # ← puste dla local dev
```

### 3. Usługi Zewnętrzne (wymagają konta)

| Usługa | Do czego potrzebna | Koszt |
|--------|-------------------|-------|
| **OpenAI** | Whisper (speech-to-text), ChatGPT | Pay-as-you-go |
| **ElevenLabs** | Text-to-speech (japoński) | Free tier: 10k chars/mo |
| **Cloudflare Tunnel** (opcjonalnie) | Publiczny URL dla backendu | Free |

### 4. Pliki Projektu

```bash
# Sklonuj repo
git clone https://github.com/vileen/speech-practice.git
cd speech-practice

# Backend
cd backend
npm install
cp .env.example .env.local
# ← edytuj .env.local

# Frontend
cd ../frontend
npm install
cp .env.example .env.local
# ← edytuj .env.local (zazwyczaj pusty dla local)
```

---

## 🔧 Rozwiązywanie Problemów

### Problem: `psql: command not found`

```bash
# Dodaj do ~/.zshrc:
export PATH="/opt/homebrew/opt/libpq/bin:$PATH"
```

### Problem: `database "speech_practice" does not exist`

```bash
createdb speech_practice
```

### Problem: `permission denied`

```bash
# Sprawdź czy PostgreSQL działa
brew services list | grep postgresql

# Jeśli nie:
brew services start postgresql
```

---

## 📊 Dump vs Świeża Instalacja

| Opcja | Kiedy użyć | Dane |
|-------|-----------|------|
| **Pełny dump** | Przenoszenie z innego urządzenia | Wszystko: patterny, kanji, postęp, historia |
| **Seed scripts** | Nowa instalacja bez historii | Tylko: patterny, kanji, ćwiczenia |
| **Od zera** | Totalny reset | Nic — wszystko przez UI |

---

## 📝 Uwagi

- **Postęp użytkownika** (SRS data) jest zachowany w dumpie
- **Furigana cache** jest zachowana — nie trzeba generować ponownie
- **Historia sesji i nagrań** jest zachowana (ale można też zacząć od nowa)
- **Hasło dostępu** do aplikacji jest w `.env.local`, nie w bazie
- **Dumpi nie są commitowane do repo** — dodaj `.sql` do `.gitignore` lub przechowuj osobno

*Ostatnia aktualizacja: 2026-03-22*
