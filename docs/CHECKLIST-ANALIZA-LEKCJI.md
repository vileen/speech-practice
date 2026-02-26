# CHECKLISTA ANALIZY LEKCJI JAPOŃSKICH

## Instrukcja użycia
Gdy użytkownik mówi "wrzucam nową lekcję do analizy" → szukaj nowego pliku video w `~/Movies/`

---

## 1. TRANSKRYPCJA VIDEO
- [ ] Wygenerować transkrypcję audio (Whisper/ElevenLabs)
- [ ] Rozpoznać japońskie słowa (kanji/kana)
- [ ] Rozpoznać polskie tłumaczenia
- [ ] Zapisać transkrypcję w: `Skills/Japanese/Transcriptions/Lesson-YYYY-MM-DD-Transcription.md`
- [ ] Format transkrypcji: sekcje z czasem ([00:00]), wypowiedzi oznaczone > i **[czas]**
- [ ] Wzorzec: `Lesson-2026-02-19-Transcription.md`

---

## 2. SŁOWNICTWO (Vocabulary)
Każde słowo powinno mieć:
- [ ] `jp` - zapis japoński (kanji/katakana/hiragana)
- [ ] `reading` - tylko czytanie kanji (bez okurigana!)
  - ❌ Źle: 好き → "すき" 
  - ✅ Dobrze: 好き → "す"
- [ ] `romaji` - generowane automatycznie
- [ ] `en` - angielskie tłumaczenie
- [ ] `type` - typ: noun/verb/i-adjective/na-adjective/expression

### Sprawdzić:
- [ ] Czy nie ma polskich słów w polu `en`?
- [ ] Czy nie ma placeholderów (XXX, TODO)?
- [ ] Czy `reading` jest skrócone poprawnie?

---

## 3. GRAMATYKA (Grammar)
Każdy wzorzec powinien mieć:
- [ ] `pattern` - wzorzec japoński (np. 〜てもいいです)
- [ ] `romaji` - romaji wzorca
- [ ] `explanation` - wyjaśnienie po angielsku
- [ ] `examples` - przykłady użycia

### Sprawdzić:
- [ ] Czy gramatyka PASUJE DO TYTUŁU LEKCJI?
  - ❌ Źle: Lekcja "Comparisons" ma tylko 〜は/〜が
  - ✅ Dobrze: Lekcja "TE-form" ma 〜てもいいですか
- [ ] Czy przykłady używają słownictwa z lekcji?
- [ ] Czy `furigana` w przykładach jest poprawne?

---

## 4. PRACTICE PHRASES (Frazy do ćwiczeń)
- [ ] Czy lista nie jest pusta? (`[]`)
- [ ] Czy frazy używają słownictwa z lekcji?
- [ ] Czy frazy używają gramatyki z lekcji?
- [ ] Czy `furigana` jest poprawne (tylko kanji w `<rt>`)?

---

## 5. DATA QUALITY
- [ ] Czy format JSON jest poprawny?
- [ ] Czy nie ma duplikatów w słownictwie?
- [ ] Czy wszystkie pola wymagane są obecne?
- [ ] Czy `furigana` nie zawiera okurigana w `<rt>`?

---

## Format JSON Lekcji

```json
{
  "id": "2026-02-25",
  "date": "2026-02-25",
  "title": "Temat lekcji",
  "topics": ["topic1", "topic2"],
  "vocabulary": [
    {
      "jp": "好き",
      "reading": "す",
      "romaji": "suki",
      "en": "like",
      "type": "na-adjective"
    }
  ],
  "grammar": [
    {
      "pattern": "〜てもいいです",
      "romaji": "temo ii desu",
      "explanation": "Asking for permission",
      "examples": [
        {
          "jp": "写真を撮ってもいいですか",
          "en": "May I take a photo?",
          "furigana": "<ruby>写<rt>しゃ</rt></ruby>..."
        }
      ]
    }
  ],
  "practice_phrases": [
    {
      "jp": "すみません、写真を撮ってもいいですか",
      "en": "Excuse me, may I take a photo?",
      "furigana": "..."
    }
  ]
}
```

---

## 6. NOTATKA W OBSIDIAN (po analizie) ⚠️ WAŻNE!

**LOKALIZACJA VAULT:** `~/Library/Mobile Documents/iCloud~md~obsidian/Documents/Main/`

- [ ] Utworzyć notatkę w: `Skills/Japanese/Japanese Lessons/`
- [ ] **NAZWA PLIKU:** `Lesson-YYYY-MM-DD---Tytuł-z-myślnikami.md` ⬅️ FORMAT!
  - ❌ Źle: `2026-02-25 - Tytuł lekcji.md`
  - ❌ Źle: `Lesson-2026-02-25 - Tytuł.md`  
  - ✅ Dobrze: `Lesson-2026-02-25---Internet-Hotel-Days-of-the-Week.md`
- [ ] Użyć template: `~/clawd/TEMPLATE-LEKCJI.md`
- [ ] Wypełnić sekcję "Notatki z lekcji" (~100-200 linii)
  - [ ] **Kluczowe momenty** - 8-10 najważniejszych fragmentów z czasem [MM:SS]
  - [ ] Link do pełnej transkrypcji: `[[Lesson-YYYY-MM-DD-Transcription]]`
- [ ] **Fun Moments** - wyciągnąć z transkrypcji dowcipy, śmieszne momenty
- [ ] **Pełna transkrypcja** w OSOBNYM pliku: `Transcriptions/Lesson-YYYY-MM-DD-Transcription.md`
  - [ ] Timestampy co 30-60 sekund
  - [ ] Podział na sekcje tematyczne
- [ ] Dodać własne przykłady do sekcji "Moje przykłady"
- [ ] Dodać wnioski i spostrzeżenia
- [ ] Sprawdzić czy formatowanie Markdown jest poprawne
- [ ] Dodać linki do poprzedniej/następnej lekcji
- [ ] Dodać link do transkrypcji: `[[Lesson-YYYY-MM-DD-Transcription]]`
- [ ] **ZWERYFIKOWAĆ** że notatka jest w iCloud (nie w ~/Documents!)

### Struktura notatki:
```
~/Library/Mobile Documents/iCloud~md~obsidian/Documents/Main/
└── Skills/Japanese/Japanese Lessons/
    └── Lesson-YYYY-MM-DD---Tytuł-z-myślnikami.md
```

**⚠️ PRZYPOMNIENIE:** 
- Vault jest w iCloud, nie w ~/Documents/ObsidianVault/!
- Nazwa pliku MUSI mieć format: `Lesson-YYYY-MM-DD---Tytuł.md` (trzy myślniki!)
- Sprawdź istniejące pliki jako wzorzec!

---

## 7. DODANIE LEKCJI DO APLIKACJI (PostgreSQL)

### Krok 1: Przygotować JSON lekcji
- [ ] Utworzyć plik JSON z kompletną lekcją
- [ ] Zweryfikować strukturę (vocabulary, grammar, practice_phrases)
- [ ] Sprawdzić czy wszystkie required pola są obecne

### Krok 2: Wstawić do bazy danych
```bash
cd ~/Projects/speech-practice/backend
# Użyć skryptu lub INSERT SQL
```

### Krok 3: Zweryfikować w aplikacji
- [ ] Otworzyć Lesson Mode w aplikacji
- [ ] Sprawdzić czy lekcja się wyświetla
- [ ] Sprawdzić czy vocabulary się wczytuje
- [ ] Sprawdzić czy grammar się wczytuje
- [ ] Sprawdzić czy practice phrases działają
- [ ] Sprawdzić czy furigana się generuje poprawnie

### Krok 4: Testy
- [ ] Sprawdzić czy Chat z lekcją działa
- [ ] Sprawdzić czy Practice Mode działa
- [ ] Sprawdzić czy TTS działa (OpenAI dla JP)

---

## TODO Przed Zapisaniem
- [ ] Zweryfikować wszystkie pola
- [ ] Sprawdzić poprawność furigana
- [ ] Upewnić się że nie ma polskich słów w tłumaczeniach EN
- [ ] Wygenerować Anki cards z lekcji
- [ ] Utworzyć notatkę w Obsidian
- [ ] Zaktualizować INDEX.md w Obsidian
- [ ] Zaktualizować Japanese Lessons/INDEX.md
- [ ] Dodać lekcję do aplikacji (PostgreSQL) ⬅️ TO JEST WAŻNE!

---

## Lokalizacja Plików
- **Video**: `~/Movies/YYYY-MM-DD HH-MM-SS.mov`
- **Transkrypcje**: `~/Movies/Transcriptions/`
- **Wyniki analizy**: `~/clawd/` lub Obsidian Vault
